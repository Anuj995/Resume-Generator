import { NextRequest, NextResponse } from "next/server";
import {
  analyzeLocalSignals,
  compactJobDescription,
  generateLocalAtsRating,
  AtsRatingResult,
} from "@/lib/atsScorer";

const ATS_AUDITOR_SYSTEM = `You are an elite ATS (Applicant Tracking System) recruiter and parsing auditor.
Evaluate resumes objectively for parsing accuracy, impact quantification, keyword alignment, and brevity.
Be strict, realistic, and constructive.
Return ONLY valid, compact JSON matching the requested schema. No extra text or markdown formatting.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { resumeText, targetRole, jobDescription } = body;

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
    }

    const cleanResume = resumeText.trim();
    if (cleanResume.length < 25) {
      return NextResponse.json(
        { error: "Resume text is too brief to evaluate. Please provide at least 25 characters." },
        { status: 400 }
      );
    }

    // 1. Compute zero-token local heuristic audit immediately
    const localSignals = analyzeLocalSignals(cleanResume);

    // 2. Fallback to deterministic heuristic if API key is missing
    if (!process.env.GROQ_API_KEY) {
      const fallbackResult = generateLocalAtsRating(cleanResume, targetRole || "", jobDescription || "");
      return NextResponse.json({
        ...fallbackResult,
        tokensUsedEstimate: 0,
        mode: "local_heuristic",
      });
    }

    // 3. Compact inputs to minimize input tokens
    // Truncate resume text to high-signal 2,200 chars (~500 tokens)
    const sanitizedResume = cleanResume.length > 2200 ? cleanResume.slice(0, 2200) + "\n[...truncated for token optimization]" : cleanResume;
    // Compact job description to max 700 chars (~150 tokens)
    const sanitizedJD = compactJobDescription(jobDescription || "");
    const cleanRole = (targetRole || "").trim().slice(0, 80);

    const userPrompt = `TARGET ROLE: ${cleanRole || "General Industry Professional"}
${sanitizedJD ? `TARGET JD EXCERPT:\n${sanitizedJD}\n` : ""}
RESUME CONTENT:
${sanitizedResume}

Evaluate this resume for ATS pass rate and recruiter appeal.
Return exact JSON:
{
  "score": number, // 0 to 100 overall ATS score
  "verdict": "ATS Ready" | "Competitive Match" | "Needs Optimization" | "High Rejection Risk",
  "breakdown": {
    "keywords": number, // 0-100 keyword & skill matching
    "impact": number, // 0-100 metrics & achievements
    "brevity": number, // 0-100 concise bullet points
    "structure": number // 0-100 header & layout clarity
  },
  "strengths": string[], // max 3 concise bullet points
  "criticalIssues": string[], // max 3 critical ATS failure risks
  "missingKeywords": string[], // 4 to 6 critical missing skills/tools for this role
  "quickFixes": [ // exactly 3 quick, high-ROI edits
    { "section": string, "issue": string, "fix": string }
  ]
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: ATS_AUDITOR_SYSTEM },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const result = await response.json();
    const responseText = result.choices[0]?.message?.content || "{}";

    // Estimate input and output token count (from Groq usage stats if available)
    const totalTokensUsed = result.usage?.total_tokens || 0;

    try {
      const parsedData = JSON.parse(responseText);

      const ratingResult: AtsRatingResult = {
        score: Math.min(100, Math.max(0, Number(parsedData.score) || 70)),
        verdict: parsedData.verdict || (parsedData.score >= 85 ? "ATS Ready" : "Competitive Match"),
        breakdown: {
          keywords: Math.min(100, Math.max(0, Number(parsedData.breakdown?.keywords) || 75)),
          impact: Math.min(100, Math.max(0, Number(parsedData.breakdown?.impact) || 70)),
          brevity: Math.min(100, Math.max(0, Number(parsedData.breakdown?.brevity) || 80)),
          structure: Math.min(100, Math.max(0, Number(parsedData.breakdown?.structure) || 80)),
        },
        strengths: Array.isArray(parsedData.strengths) ? parsedData.strengths.slice(0, 3) : [],
        criticalIssues: Array.isArray(parsedData.criticalIssues) ? parsedData.criticalIssues.slice(0, 3) : [],
        missingKeywords: Array.isArray(parsedData.missingKeywords) ? parsedData.missingKeywords.slice(0, 8) : [],
        quickFixes: Array.isArray(parsedData.quickFixes)
          ? parsedData.quickFixes.slice(0, 3).map((f: any) => ({
              section: String(f.section || "General"),
              issue: String(f.issue || "Need clarification"),
              fix: String(f.fix || "Update bullet point with metrics"),
            }))
          : [],
        localSignals,
        tokensUsedEstimate: totalTokensUsed,
      };

      return NextResponse.json(ratingResult);
    } catch (parseError) {
      console.error("Failed to parse Gemini ATS score JSON:", responseText, parseError);
      // Fallback gracefully to local scoring
      const fallbackResult = generateLocalAtsRating(cleanResume, cleanRole, sanitizedJD);
      return NextResponse.json({
        ...fallbackResult,
        tokensUsedEstimate: totalTokensUsed,
        mode: "heuristic_fallback",
      });
    }
  } catch (err: unknown) {
    console.error("ATS rating route error:", err);
    const message = err instanceof Error ? err.message : "ATS rating failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
