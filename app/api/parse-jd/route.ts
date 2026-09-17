import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { text, imageBase64, mimeType } = await req.json();

    if (!text && !imageBase64) {
      return NextResponse.json({ error: "No job description text or image provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        cleanDescription: text || "Job Description provided",
        roleTitle: "",
        keySkills: [],
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const promptText = `You are a career assistant analyzing a target job description.
Extract the core details into the following JSON schema:
{
  "roleTitle": string (the exact job title mentioned in the job description, or empty string if not found),
  "summary": string (a 2-3 sentence overview of what this role entails),
  "keyRequirements": string[] (list of top 5-8 requirements or qualifications mentioned),
  "requiredSkills": string[] (list of technical and professional skills mentioned in the job description, e.g. React, Python, SQL, Agile)
}
Return ONLY JSON matching this schema.`;

    let result;
    if (imageBase64) {
      // Process image screenshot with multimodal Gemini
      const imagePart = {
        inlineData: {
          data: imageBase64.replace(/^data:[^;]+;base64,/, ""),
          mimeType: mimeType || "image/png",
        },
      };
      result = await model.generateContent([imagePart, promptText]);
    } else {
      result = await model.generateContent(`${promptText}\n\n--- JOB DESCRIPTION ---\n${text}\n--- END JOB DESCRIPTION ---`);
    }

    const jsonText = result.response.text();
    const parsed = JSON.parse(jsonText);

    return NextResponse.json({
      roleTitle: parsed.roleTitle || "",
      summary: parsed.summary || "",
      keyRequirements: parsed.keyRequirements || [],
      requiredSkills: parsed.requiredSkills || [],
      cleanDescription: text || parsed.summary || "",
    });
  } catch (err: unknown) {
    console.error("Parse JD error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to parse job description" },
      { status: 500 }
    );
  }
}
