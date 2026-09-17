import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const VALID_FIELDS = ["summary", "experience", "project", "achievement"] as const;
type ValidField = (typeof VALID_FIELDS)[number];

interface RoleGuide {
  category: string;
  focusKeywords: string[];
  actionVerbs: string[];
  metricTypes: string[];
  guidance: string;
}

function getRoleGuide(role: string): RoleGuide {
  const r = (role || "").toLowerCase();

  if (/(data|machine learning|ai|deep learning|ml|nlp|analytics|scientist|bi engineer)/i.test(r)) {
    return {
      category: "Data Science & AI",
      focusKeywords: ["pipeline", "model accuracy", "latency", "inference", "feature engineering", "datasets", "A/B testing", "scalability"],
      actionVerbs: ["Trained", "Deployed", "Engineered", "Optimized", "Benchmarked", "Formulated", "Fine-tuned"],
      metricTypes: ["accuracy/F1 score improvements", "inference time reductions", "processing throughput", "cost savings on compute"],
      guidance: "Highlight statistical rigor, data pipelines, model deployment, and business outcomes of models.",
    };
  }

  if (/(software|developer|frontend|backend|fullstack|full-stack|full stack|devops|cloud|sre|systems|security|engineer|web)/i.test(r)) {
    return {
      category: "Software Engineering & Infrastructure",
      focusKeywords: ["scalability", "architecture", "microservices", "API", "performance", "CI/CD", "automated testing", "throughput"],
      actionVerbs: ["Architected", "Refactored", "Containerized", "Streamlined", "Engineered", "Decoupled", "Implemented"],
      metricTypes: ["latency reduction (e.g. ~35%)", "test coverage increase", "build time improvement", "uptime/availability", "request throughput"],
      guidance: "Emphasize architectural decisions, scale handled, code maintainability, and measurable system performance improvements.",
    };
  }

  if (/(product|design|ui|ux|graphic|creative|user experience|visual)/i.test(r)) {
    return {
      category: "Product & Design",
      focusKeywords: ["user research", "wireframing", "design system", "conversion rate", "usability testing", "prototyping", "stakeholder collaboration"],
      actionVerbs: ["Spearheaded", "Redesigned", "Conducted", "Iterated", "Conceptualized", "Synthesized", "Standardized"],
      metricTypes: ["task completion time reduction", "conversion rate uplift", "user satisfaction (CSAT/NPS)", "design component adoption"],
      guidance: "Highlight user-centric rationale, design system scale, research insights, and measurable business impact on user engagement.",
    };
  }

  if (/(marketing|sales|finance|account|operations|business|admin|hr|recruiter|manager|coordinator)/i.test(r)) {
    return {
      category: "Business, Operations & Management",
      focusKeywords: ["cross-functional leadership", "ROI", "workflow optimization", "stakeholder alignment", "cost reduction", "pipeline management", "compliance"],
      actionVerbs: ["Directed", "Negotiated", "Streamlined", "Generated", "Orchestrated", "Accelerated", "Restructured"],
      metricTypes: ["revenue growth", "cost reduction ($ or %)", "cycle time compression", "retention/churn improvement", "volume processed"],
      guidance: "Highlight leadership, operational efficiency gains, bottom-line or top-line business impact, and stakeholder coordination.",
    };
  }

  return {
    category: "General Professional",
    focusKeywords: ["efficiency", "collaboration", "quality", "problem-solving", "process improvement", "execution"],
    actionVerbs: ["Spearheaded", "Delivered", "Transformed", "Coordinated", "Enhanced", "Resolved"],
    metricTypes: ["time saved", "efficiency gained", "accuracy rate", "volume handled"],
    guidance: "Emphasize clear impact, problem-solving ability, quantifiable achievements, and concise professional communication.",
  };
}

const SYSTEM_PROMPT = `You are an elite resume strategist and ATS optimization expert. Your mission is to rewrite and elevate resume content to maximize recruiter interest, ATS keyword matching, and perceived seniority without inventing fictional credentials or false facts.

Core Writing Rules:
1. NEVER invent employers, job titles, education, or dates not mentioned in the original text.
2. If metrics are missing, use realistic, plausible estimation formats (e.g., "improving workflow efficiency by ~25%" or "serving 1,000+ active users") that logically fit the context.
3. Every bullet point MUST begin with a high-impact past-tense action verb (unless a present-day role requires present tense).
4. Remove fluff, passive voice ("was responsible for", "helped with"), and filler words.
5. Emphasize STAR (Situation, Task, Action, Result) structure in descriptions.
6. For professional summaries, use a concise, impactful narrative without first-person pronouns ("I", "my", "we").
7. Output ONLY the improved text directly. Never include conversational intros, backticks, or explanatory notes.`;

function buildPrompt(field: ValidField, content: string, targetRole: string): string {
  const roleGuide = getRoleGuide(targetRole);

  const fieldDescriptions: Record<ValidField, string> = {
    summary: "professional summary / about me section",
    experience: "work experience description / achievement bullet points",
    project: "project description and technical contributions",
    achievement: "notable award, hackathon, or achievement statement",
  };

  const fieldFormatInstructions: Record<ValidField, string> = {
    summary: "Deliver a punchy 2-4 sentence executive-ready summary. Highlight core expertise, key differentiators, and value brought to the target role.",
    experience: "Format as clean, concise bullet points (2 to 4 bullets). Each bullet must start with a distinct, impactful action verb and emphasize measurable impact.",
    project: "Highlight the objective, technical stack, architecture/challenges solved, and concrete outcomes in 2-3 concise bullets or a high-impact narrative.",
    achievement: "Produce a crisp 1-2 sentence statement that clearly explains what was achieved, the competitive context (e.g. rank, scale), and the value demonstrated.",
  };

  return `TARGET ROLE: ${targetRole || "Software Professional"} (Domain: ${roleGuide.category})
ROLE GUIDANCE: ${roleGuide.guidance}
PREFERRED ATS KEYWORDS & CONCEPTS: ${roleGuide.focusKeywords.join(", ")}
POWER VERBS TO CONSIDER: ${roleGuide.actionVerbs.join(", ")}
METRIC STYLES TO INCORPORATE: ${roleGuide.metricTypes.join(", ")}

TASK: Enhance the following ${fieldDescriptions[field]} for a candidate targeting this specific role.
FORMAT INSTRUCTIONS: ${fieldFormatInstructions[field]}

--- ORIGINAL TEXT ---
${content}
--- END ORIGINAL TEXT ---

Return ONLY the enhanced text. Do NOT add preamble like "Here is the revised version:".`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { field, content, targetRole } = body;

    // 1. Validate field
    if (!field || !VALID_FIELDS.includes(field as ValidField)) {
      return NextResponse.json(
        {
          error: `Invalid field "${field}". Must be one of: ${VALID_FIELDS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 2. Validate content edge cases
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "No content provided to enhance" }, { status: 400 });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length < 15) {
      return NextResponse.json(
        {
          error: "Content too short to enhance. Please enter at least 15 characters.",
        },
        { status: 400 }
      );
    }

    // Truncate excessively large input to protect model context
    const sanitizedContent = trimmedContent.length > 2000 ? trimmedContent.slice(0, 2000) : trimmedContent;

    // 3. Check API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Add it to .env.local" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    const prompt = buildPrompt(field as ValidField, sanitizedContent, targetRole || "");
    const result = await model.generateContent(prompt);
    const enhanced = result.response.text().trim();

    return NextResponse.json({ enhanced });
  } catch (err: unknown) {
    console.error("AI enhance error:", err);
    const message = err instanceof Error ? err.message : "AI enhancement failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

