import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { ResumeData } from "@/types/resume";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const GENERATE_SYSTEM_PROMPT = `You are an expert ATS resume strategist and career coach.
Your job is to tailor and organize a candidate's resume for a specific target role and optional job description.

CRITICAL ANTI-HALLUCINATION RULES:
1. The user's provided data is the absolute source of truth.
2. You must NEVER invent:
   - Companies or employers
   - Degrees or colleges
   - Years of experience
   - New skills the candidate does not have
   - Job titles or roles
   - Certifications or awards
   - Fake metrics or numbers (e.g. do not invent "scaled to 100,000 users" if not in original)
3. You CAN:
   - Rewrite and polish grammar and clarity
   - Use strong past-tense action verbs (e.g., "Developed", "Spearheaded", "Engineered")
   - Generate a concise 2-3 line professional summary highlighting the candidate's actual relevant skills
   - Prioritize and reorder existing skills so that the most relevant ones appear first
   - Structure experience and project descriptions into clean, concise bullet points
4. If a candidate has no experience in a skill mentioned in the job description, DO NOT add that skill. Only highlight skills they already possess.`;

export async function POST(req: NextRequest) {
  try {
    const { resumeData, targetRole, jobDescription } = await req.json();

    if (!resumeData) {
      return NextResponse.json({ error: "No resume data provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ resumeData });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: GENERATE_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const userPrompt = `Target Job Role: ${targetRole || "Software Professional"}
${jobDescription ? `Target Job Description:\n${jobDescription.slice(0, 3000)}\n` : ""}

Candidate Data:
${JSON.stringify(resumeData, null, 2)}

TASK:
1. Generate a tailored 2-3 line "summary" focusing strictly on the candidate's real skills and experience relevant to "${targetRole}".
2. Reorder the existing "skills" (and "categorizedSkills") so that skills relevant to the target role/job description come first. Do NOT add new unlisted skills.
3. Polish each experience item's "description" into concise, action-driven bullet points (joined by newline) preserving existing facts.
4. Polish each project's "description" into concise bullet points (joined by newline) preserving existing facts.

Return the complete updated resume JSON adhering to the exact same structure as the candidate data input:
{
  "personalInfo": { ... },
  "targetRole": string,
  "summary": string,
  "education": [ ... ],
  "experience": [ ... ],
  "projects": [ ... ],
  "skills": string[],
  "categorizedSkills": {
    "languages": string[],
    "frameworks": string[],
    "tools": string[],
    "databases": string[]
  },
  "certifications": [ ... ],
  "achievements": [ ... ],
  "hackathons": [ ... ],
  "courses": [ ... ]
}

Return ONLY valid JSON.`;

    const result = await model.generateContent(userPrompt);
    const text = result.response.text();

    try {
      const generatedData: ResumeData = JSON.parse(text);

      // Ensure personalInfo and education aren't dropped
      const finalResumeData: ResumeData = {
        ...resumeData,
        ...generatedData,
        personalInfo: {
          ...resumeData.personalInfo,
          ...(generatedData.personalInfo || {}),
        },
        targetRole: targetRole || resumeData.targetRole || "",
        jobDescription: jobDescription || resumeData.jobDescription || "",
        education: generatedData.education?.length ? generatedData.education : resumeData.education,
        experience: generatedData.experience?.length ? generatedData.experience : resumeData.experience,
        projects: generatedData.projects?.length ? generatedData.projects : resumeData.projects,
        skills: generatedData.skills?.length ? generatedData.skills : resumeData.skills,
        categorizedSkills: generatedData.categorizedSkills || resumeData.categorizedSkills,
        certifications: generatedData.certifications || resumeData.certifications,
        achievements: generatedData.achievements || resumeData.achievements,
      };

      return NextResponse.json({ resumeData: finalResumeData });
    } catch (parseErr) {
      console.error("Failed to parse generated resume JSON:", text);
      return NextResponse.json({ resumeData });
    }
  } catch (err: unknown) {
    console.error("Resume generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
