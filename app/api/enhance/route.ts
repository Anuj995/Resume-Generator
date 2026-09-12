import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are an expert resume writer and career coach. Your job is to enhance resume content to be more professional, impactful, and ATS-friendly.

Guidelines:
- Use strong action verbs (e.g., "Architected", "Spearheaded", "Optimized", "Delivered")
- Quantify achievements where possible (add realistic estimates like "reducing load time by ~30%")
- Be concise but impactful — every word must earn its place
- Keep the same factual information — do NOT invent new facts, companies, or roles
- Match the tone and style appropriate for the target role
- For bullet points, start each with a strong action verb
- For summaries, write in a compelling, third-person-free first-person style
- Output ONLY the enhanced text, no explanations or preamble`;

function buildPrompt(field: string, content: string, targetRole: string): string {
  const fieldDescriptions: Record<string, string> = {
    summary: "professional summary / about section",
    experience: "work experience description / bullet points",
    project: "project description",
    achievement: "achievement description",
  };

  const desc = fieldDescriptions[field] || "resume content";

  return `Target Role: ${targetRole || "Software Engineer"}

Enhance the following ${desc} to be more professional and impactful for a ${targetRole || "tech"} role:

---
${content}
---

Return ONLY the enhanced text. Do not add any intro like "Here is the enhanced version:" — just the improved content.`;
}

export async function POST(req: NextRequest) {
  try {
    const { field, content, targetRole } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Add it to .env.local" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const prompt = buildPrompt(field, content, targetRole);
    const result = await model.generateContent(prompt);
    const enhanced = result.response.text().trim();

    return NextResponse.json({ enhanced });
  } catch (err: unknown) {
    console.error("AI enhance error:", err);
    const message = err instanceof Error ? err.message : "AI enhancement failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
