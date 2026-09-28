import { ResumeData } from "@/types/resume";
import { simpleHash } from "./storage";

export interface AtsCategoryBreakdown {
  keywords: number;
  impact: number;
  brevity: number;
  structure: number;
}

export interface AtsQuickFix {
  section: string;
  issue: string;
  fix: string;
}

export interface AtsLocalSignals {
  wordCount: number;
  hasEmail: boolean;
  hasPhone: boolean;
  hasLinkedIn: boolean;
  hasLocation: boolean;
  hasSummary: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  hasSkills: boolean;
  metricCount: number;
  actionVerbCount: number;
  bulletCount: number;
  estimatedPages: number;
  detectedVerbs: string[];
}

export interface AtsRatingResult {
  score: number;
  verdict: "ATS Ready" | "Competitive Match" | "Needs Optimization" | "High Rejection Risk";
  breakdown: AtsCategoryBreakdown;
  strengths: string[];
  criticalIssues: string[];
  missingKeywords: string[];
  quickFixes: AtsQuickFix[];
  localSignals?: AtsLocalSignals;
  tokensUsedEstimate?: number;
  isCached?: boolean;
}

const COMMON_ACTION_VERBS = [
  "accelerated", "achieved", "administered", "analyzed", "architected",
  "automated", "benchmark", "benchmarked", "built", "centralized",
  "championed", "collaborated", "configured", "constructed", "coordinated",
  "decreased", "delivered", "deployed", "designed", "developed",
  "directed", "doubled", "drove", "eliminated", "enabled",
  "engineered", "enhanced", "established", "executed", "expanded",
  "expedited", "fabricated", "formulated", "founded", "generated",
  "guided", "headed", "implemented", "improved", "increased",
  "initiated", "instituted", "integrated", "introduced", "invented",
  "launched", "led", "managed", "maximized", "mentored",
  "migrated", "minimized", "modernized", "negotiated", "optimized",
  "orchestrated", "organized", "overhauled", "oversaw", "partnered",
  "pioneered", "planned", "produced", "programmed", "promoted",
  "reduced", "refactored", "resolved", "restructured", "revamped",
  "scaled", "simplified", "solved", "spearheaded", "standardized",
  "streamlined", "structured", "supervised", "surpassed", "synthesized",
  "trained", "transformed", "unified", "upgraded", "validated"
];

/**
 * Strips whitespace, nulls, and formatting boilerplate to construct a dense,
 * token-minimized plain-text representation of a resume.
 */
export function compactResumeText(source: string | ResumeData): string {
  if (!source) return "";

  if (typeof source === "string") {
    return source
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  // If structured ResumeData, pack into a clean, minimal text representation
  const lines: string[] = [];

  const { personalInfo, summary, experience, projects, skills, categorizedSkills, education, certifications } = source;

  if (personalInfo) {
    const contactParts = [
      personalInfo.fullName,
      personalInfo.location,
      personalInfo.email,
      personalInfo.phone,
      personalInfo.linkedin,
    ].filter(Boolean);
    if (contactParts.length) lines.push(`Contact: ${contactParts.join(" | ")}`);
  }

  if (summary) {
    lines.push(`Summary: ${summary.trim()}`);
  }

  if (experience && experience.length > 0) {
    lines.push("Experience:");
    experience.forEach((exp) => {
      const header = [exp.title, exp.company, exp.duration].filter(Boolean).join(" - ");
      if (header) lines.push(`* ${header}`);
      if (exp.description) {
        lines.push(`  ${exp.description.replace(/\n+/g, " ").trim()}`);
      }
    });
  }

  if (projects && projects.length > 0) {
    lines.push("Projects:");
    projects.forEach((proj) => {
      lines.push(`* ${proj.title}${proj.technologies ? ` (${proj.technologies})` : ""}: ${proj.description.replace(/\n+/g, " ").trim()}`);
    });
  }

  // Combine flat and categorized skills without duplicates
  const allSkills = new Set<string>(skills || []);
  if (categorizedSkills) {
    Object.values(categorizedSkills).forEach((group) => {
      if (Array.isArray(group)) {
        group.forEach((s) => allSkills.add(s));
      }
    });
  }
  if (allSkills.size > 0) {
    lines.push(`Skills: ${Array.from(allSkills).join(", ")}`);
  }

  if (education && education.length > 0) {
    lines.push("Education:");
    education.forEach((edu) => {
      lines.push(`* ${edu.degree} - ${edu.institution} (${edu.year || ""})`);
    });
  }

  if (certifications && certifications.length > 0) {
    lines.push(`Certifications: ${certifications.map((c) => c.name).join(", ")}`);
  }

  return lines.join("\n");
}

/**
 * Truncates and compresses job descriptions to extract high-value requirements,
 * avoiding unnecessary token consumption from corporate boilerplates and legal disclaimers.
 */
export function compactJobDescription(jd: string): string {
  if (!jd) return "";
  let clean = jd
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/Equal Opportunity Employer[\s\S]*$/i, "")
    .replace(/We are an equal opportunity[\s\S]*$/i, "")
    .replace(/About Us[\s\S]*?(?=Requirements|Qualifications|What you'll do|Responsibilities|$)/i, "")
    .trim();

  // Limit to 1,000 characters (approx 200 tokens)
  if (clean.length > 1000) {
    clean = clean.slice(0, 1000) + "...";
  }
  return clean;
}

/**
 * Deterministic client-side heuristic audit (0 tokens used).
 * Evaluates core structural hygiene, contact signals, and metric density.
 */
export function analyzeLocalSignals(text: string): AtsLocalSignals {
  const normalized = text.toLowerCase();

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(text);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasLinkedIn = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i.test(text);
  const hasLocation = /\b(remote|[A-Z][a-z]+,\s*[A-Z]{2}|india|usa|united states|uk|canada|germany)\b/i.test(text);

  const hasSummary = /(summary|about me|professional summary|profile|objective)/i.test(normalized);
  const hasExperience = /(experience|work history|employment|internship|roles)/i.test(normalized);
  const hasEducation = /(education|academic|degree|university|college|b\.tech|b\.s|b\.e|m\.s)/i.test(normalized);
  const hasSkills = /(skills|technologies|proficiencies|tech stack|core competencies)/i.test(normalized);

  // Measure quantified impact (%, $, numbers, metrics)
  const metricMatches = text.match(/(\d+(\.\d+)?%|\$\d+[\d,]*|\b\d+x\b|\b\d+\s*(\+|k|m|million|users|clients|requests|ms|seconds|hours)\b)/gi) || [];
  const metricCount = metricMatches.length;

  // Measure action verbs
  const detectedVerbs: string[] = [];
  COMMON_ACTION_VERBS.forEach((verb) => {
    const regex = new RegExp(`\\b${verb}\\b`, "i");
    if (regex.test(normalized)) {
      detectedVerbs.push(verb);
    }
  });

  // Count bullet points
  const bulletMatches = text.match(/^[ \t]*[•\-\*]/gm) || [];
  const bulletCount = bulletMatches.length;

  // Estimated pages (approx 450 words per single page)
  const estimatedPages = Math.max(1, Math.round((words / 450) * 10) / 10);

  return {
    wordCount: words,
    hasEmail,
    hasPhone,
    hasLinkedIn,
    hasLocation,
    hasSummary,
    hasExperience,
    hasEducation,
    hasSkills,
    metricCount,
    actionVerbCount: detectedVerbs.length,
    bulletCount,
    estimatedPages,
    detectedVerbs: detectedVerbs.slice(0, 10),
  };
}

/**
 * Computes a fast cache fingerprint to prevent redundant API queries.
 */
export function computeAtsFingerprint(resumeText: string, targetRole: string, jd: string): string {
  const sample = `${resumeText.slice(0, 500)}_${resumeText.length}::${(targetRole || "").trim().toLowerCase()}::${(jd || "").slice(0, 200)}`;
  return `ats_cache_${simpleHash(sample)}`;
}

/**
 * High-fidelity fallback heuristic scorer if offline or without API key
 */
export function generateLocalAtsRating(text: string, role: string, jd: string): AtsRatingResult {
  const signals = analyzeLocalSignals(text);

  let score = 50;

  // Structure points (up to 25)
  let structureScore = 60;
  if (signals.hasEmail) structureScore += 8;
  if (signals.hasPhone) structureScore += 8;
  if (signals.hasLinkedIn) structureScore += 6;
  if (signals.hasEducation) structureScore += 6;
  if (signals.hasExperience) structureScore += 6;
  if (signals.hasSkills) structureScore += 6;
  structureScore = Math.min(95, structureScore);

  // Impact points (metrics and action verbs)
  let impactScore = 55;
  impactScore += Math.min(30, signals.metricCount * 5);
  impactScore += Math.min(15, signals.actionVerbCount * 2);
  impactScore = Math.min(96, impactScore);

  // Brevity points
  let brevityScore = 80;
  if (signals.wordCount >= 300 && signals.wordCount <= 750) {
    brevityScore = 92;
  } else if (signals.wordCount < 200) {
    brevityScore = 55;
  } else if (signals.wordCount > 1000) {
    brevityScore = 68;
  }

  // Skills points
  let skillsScore = 70;
  if (signals.hasSkills) skillsScore += 15;
  if (role) skillsScore += 8;
  skillsScore = Math.min(95, skillsScore);

  // Weighted overall score
  score = Math.round(structureScore * 0.25 + impactScore * 0.35 + brevityScore * 0.2 + skillsScore * 0.2);

  let verdict: AtsRatingResult["verdict"] = "Competitive Match";
  if (score >= 85) verdict = "ATS Ready";
  else if (score >= 70) verdict = "Competitive Match";
  else if (score >= 50) verdict = "Needs Optimization";
  else verdict = "High Rejection Risk";

  const strengths: string[] = [];
  if (signals.hasEmail && signals.hasPhone) strengths.push("Clean, parseable contact metadata");
  if (signals.metricCount >= 3) strengths.push(`Strong quantifiable impact detected (${signals.metricCount}+ metrics)`);
  if (signals.actionVerbCount >= 5) strengths.push(`Solid active voice usage with ${signals.actionVerbCount}+ action verbs`);
  if (signals.hasSkills) strengths.push("Dedicated skills section present for keyword extraction");
  if (strengths.length === 0) strengths.push("Foundational resume structure detected");

  const criticalIssues: string[] = [];
  if (!signals.hasEmail || !signals.hasPhone) criticalIssues.push("Missing direct email or phone contact details");
  if (signals.metricCount < 2) criticalIssues.push("Low metric density: Recruiters filter out bullets lacking numbers/percentages");
  if (!signals.hasSkills) criticalIssues.push("No explicit Skills header: ATS parsers may fail to index tech competencies");
  if (signals.wordCount < 200) criticalIssues.push("Resume is too brief (< 200 words) to pass keyword density thresholds");

  const quickFixes: AtsQuickFix[] = [];
  if (signals.metricCount < 3) {
    quickFixes.push({
      section: "Experience",
      issue: "Lack of measurable outcomes",
      fix: "Append metrics to 2 bullet points (e.g. 'boosted performance by 30%', 'serving 10k users').",
    });
  }
  if (!signals.hasLinkedIn) {
    quickFixes.push({
      section: "Contact",
      issue: "No professional portfolio or LinkedIn URL",
      fix: "Add your customized LinkedIn profile link in the header.",
    });
  }
  if (signals.actionVerbCount < 4) {
    quickFixes.push({
      section: "Work History",
      issue: "Passive phrasing detected",
      fix: "Begin every bullet with power verbs like 'Architected', 'Spearheaded', 'Engineered'.",
    });
  }

  return {
    score,
    verdict,
    breakdown: {
      keywords: skillsScore,
      impact: impactScore,
      brevity: brevityScore,
      structure: structureScore,
    },
    strengths: strengths.slice(0, 3),
    criticalIssues: criticalIssues.slice(0, 3),
    missingKeywords: role ? [`${role} Core Skills`, "System Architecture", "Performance Optimization"] : ["Industry Standards", "Core Competencies"],
    quickFixes,
    localSignals: signals,
    tokensUsedEstimate: 0,
  };
}
