import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { extractResumeData as fallbackExtract } from "@/lib/resumeParser";
import { ResumeData } from "@/types/resume";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const EXTRACTION_SYSTEM_PROMPT = `You are a resume information extraction system.
Extract information ONLY from the provided user content.
Organize the information into the provided JSON structure.
Do not invent facts.
Do not infer qualifications that are not explicitly supported.
Do not create companies, degrees, skills, projects, certifications, achievements, dates or numbers.
If information is missing, return an empty value.
Preserve the user's original facts.
The purpose is to convert unstructured resume information into structured resume data.`;

export async function POST(req: NextRequest) {
  try {
    const { rawText, targetRole, fileName } = await req.json();

    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      return NextResponse.json({ error: "No resume text provided" }, { status: 400 });
    }

    // Fallback if API key is not configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not configured, using local heuristic extraction");
      const localData = fallbackExtract(rawText, targetRole || "", fileName);
      return NextResponse.json({ resumeData: localData, source: "local" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: EXTRACTION_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const userPrompt = `Extract the resume information from the following user content into exact JSON:
Target Role (if specified): ${targetRole || "Not specified"}

JSON Schema to follow:
{
  "personalInfo": {
    "name": string (full name),
    "email": string,
    "phone": string,
    "location": string,
    "linkedin": string (username or URL),
    "github": string (username or URL),
    "portfolio": string (portfolio or personal website URL)
  },
  "summary": string (existing summary or brief career statement present in the text, otherwise empty string),
  "education": [
    {
      "degree": string,
      "institution": string,
      "year": string,
      "cgpa": string (or percentage if mentioned)
    }
  ],
  "experience": [
    {
      "title": string,
      "company": string,
      "duration": string,
      "description": string (bullet points or sentences joined by newline)
    }
  ],
  "projects": [
    {
      "title": string,
      "technologies": string (e.g. "React, Node.js, SQL"),
      "description": string (bullet points or sentences joined by newline)
    }
  ],
  "skills": {
    "languages": string[],
    "frameworks": string[],
    "tools": string[],
    "databases": string[]
  },
  "certifications": [
    {
      "name": string,
      "issuer": string,
      "year": string
    }
  ],
  "achievements": [
    {
      "description": string
    }
  ],
  "hackathons": [
    {
      "title": string,
      "description": string
    }
  ],
  "courses": [
    {
      "name": string,
      "institution": string
    }
  ]
}

--- USER RESUME CONTENT ---
${rawText.slice(0, 15000)}
--- END USER CONTENT ---

Return ONLY valid JSON matching the schema above.`;

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();

    let parsedJson: any;
    try {
      parsedJson = JSON.parse(responseText);
    } catch (e) {
      console.error("Gemini JSON parse failed, text was:", responseText);
      const localData = fallbackExtract(rawText, targetRole || "", fileName);
      return NextResponse.json({ resumeData: localData, source: "local_fallback" });
    }

    // Flatten skills to array of strings for broad compatibility
    const categorized = parsedJson.skills || {};
    const flatSkills: string[] = Array.from(
      new Set([
        ...(Array.isArray(categorized.languages) ? categorized.languages : []),
        ...(Array.isArray(categorized.frameworks) ? categorized.frameworks : []),
        ...(Array.isArray(categorized.tools) ? categorized.tools : []),
        ...(Array.isArray(categorized.databases) ? categorized.databases : []),
      ])
    ).filter(Boolean);

    // Normalize education IDs
    const education = (Array.isArray(parsedJson.education) ? parsedJson.education : []).map(
      (edu: any, idx: number) => ({
        id: `edu-${idx + 1}`,
        degree: edu.degree || "",
        institution: edu.institution || "",
        year: edu.year || "",
        cgpa: edu.cgpa || "",
      })
    );

    // Normalize experience IDs
    const experience = (Array.isArray(parsedJson.experience) ? parsedJson.experience : []).map(
      (exp: any, idx: number) => ({
        id: `exp-${idx + 1}`,
        title: exp.title || "",
        company: exp.company || "",
        duration: exp.duration || "",
        description: exp.description || "",
      })
    );

    // Normalize projects IDs
    const projects = (Array.isArray(parsedJson.projects) ? parsedJson.projects : []).map(
      (proj: any, idx: number) => ({
        id: `proj-${idx + 1}`,
        title: proj.title || "",
        technologies: proj.technologies || "",
        description: proj.description || "",
      })
    );

    // Normalize certifications IDs
    const certifications = (
      Array.isArray(parsedJson.certifications) ? parsedJson.certifications : []
    ).map((cert: any, idx: number) => ({
      id: `cert-${idx + 1}`,
      name: cert.name || "",
      issuer: cert.issuer || "",
      year: cert.year || "",
    }));

    // Normalize achievements IDs
    const achievements = (
      Array.isArray(parsedJson.achievements) ? parsedJson.achievements : []
    ).map((ach: any, idx: number) => ({
      id: `ach-${idx + 1}`,
      description: ach.description || (typeof ach === "string" ? ach : ""),
    }));

    // Normalize hackathons
    const hackathons = (Array.isArray(parsedJson.hackathons) ? parsedJson.hackathons : []).map(
      (h: any, idx: number) => ({
        id: `hack-${idx + 1}`,
        title: h.title || "",
        description: h.description || (typeof h === "string" ? h : ""),
      })
    );

    // Normalize courses
    const courses = (Array.isArray(parsedJson.courses) ? parsedJson.courses : []).map(
      (c: any, idx: number) => ({
        id: `course-${idx + 1}`,
        name: c.name || (typeof c === "string" ? c : ""),
        institution: c.institution || "",
      })
    );

    const personalInfo = parsedJson.personalInfo || {};

    const normalizedResumeData: ResumeData = {
      personalInfo: {
        fullName: personalInfo.name || personalInfo.fullName || "",
        email: personalInfo.email || "",
        phone: personalInfo.phone || "",
        location: personalInfo.location || "",
        linkedin: personalInfo.linkedin || "",
        github: personalInfo.github || "",
        portfolio: personalInfo.portfolio || "",
      },
      targetRole: targetRole || "",
      rawText: rawText,
      summary: parsedJson.summary || "",
      education: education.length > 0 ? education : [{ id: "edu-1", degree: "", institution: "", year: "" }],
      experience: experience.length > 0 ? experience : [{ id: "exp-1", title: targetRole || "", company: "", duration: "", description: "" }],
      projects: projects.length > 0 ? projects : [{ id: "proj-1", title: "", technologies: "", description: "" }],
      skills: flatSkills,
      categorizedSkills: {
        languages: Array.isArray(categorized.languages) ? categorized.languages : [],
        frameworks: Array.isArray(categorized.frameworks) ? categorized.frameworks : [],
        tools: Array.isArray(categorized.tools) ? categorized.tools : [],
        databases: Array.isArray(categorized.databases) ? categorized.databases : [],
      },
      certifications,
      achievements,
      hackathons: hackathons.length > 0 ? hackathons : undefined,
      courses: courses.length > 0 ? courses : undefined,
    };

    return NextResponse.json({ resumeData: normalizedResumeData, source: "gemini" });
  } catch (err: unknown) {
    console.error("Gemini extraction error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Extraction failed" },
      { status: 500 }
    );
  }
}
