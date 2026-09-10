export interface ResumeTemplate {
  id: string;
  name: string;
  badge: string;
  description: string;
  bestFor: string;
  accentColor: string;
  features: string[];
  fontFamily: string;
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "classic",
    name: "Classic ATS",
    badge: "Most Popular",
    description: "Traditional centered layout with elegant horizontal dividers. Universally recognized by all ATS parsers and hiring managers.",
    bestFor: "Finance, Banking, Law, Government & General Roles",
    accentColor: "#1f2937",
    features: [
      "Centered contact header",
      "Traditional uppercase section dividers",
      "Standard bullet formatting",
      "Maximized ATS compatibility"
    ],
    fontFamily: "font-serif"
  },
  {
    id: "modern",
    name: "Modern Tech",
    badge: "Top for Tech",
    description: "Clean left-aligned layout with crisp typography and subtle primary accents. High clarity for tech and startup applications.",
    bestFor: "Software Engineers, Product, Data & Tech Startups",
    accentColor: "#2563eb",
    features: [
      "Left-aligned header with highlighted role",
      "Badge-styled technical skills",
      "Clear company & duration hierarchy",
      "Clean modern sans-serif typography"
    ],
    fontFamily: "font-sans"
  },
  {
    id: "professional",
    name: "Corporate Executive",
    badge: "Executive",
    description: "Authoritative design featuring an accent border, strong title emphasis, and polished section headers for leadership roles.",
    bestFor: "Management, Consulting, Operations & Senior Roles",
    accentColor: "#0f766e",
    features: [
      "Structured two-tone section headers",
      "Enhanced role and impact visibility",
      "Crisp date and location alignment",
      "Distinguished executive aesthetic"
    ],
    fontFamily: "font-sans"
  },
  {
    id: "compact",
    name: "Technical Dense",
    badge: "High Density",
    description: "Optimized spacing to fit rich project history, extensive skill sets, and multiple experiences onto fewer pages.",
    bestFor: "Full-Stack Devs, DevOps, Researchers & Experienced Pros",
    accentColor: "#4338ca",
    features: [
      "Compact line-height and tight margins",
      "Dedicated tech-stack highlights",
      "High information per square inch",
      "Standard parseable tags"
    ],
    fontFamily: "font-sans"
  },
  {
    id: "clean",
    name: "Minimalist Clean",
    badge: "Clean & Simple",
    description: "Ultra-minimalist aesthetic emphasizing pure whitespace, subtle gray tones, and clean reading rhythm without visual clutter.",
    bestFor: "Design, Marketing, Communications & Early Career",
    accentColor: "#374151",
    features: [
      "Generous whitespace and breathing room",
      "Subtle low-contrast borders",
      "Understated modern typography",
      "Strict distraction-free linear flow"
    ],
    fontFamily: "font-sans"
  }
];

export const DEFAULT_TEMPLATE_ID = "classic";

export function getTemplateById(id: string): ResumeTemplate {
  return RESUME_TEMPLATES.find((t) => t.id === id) || RESUME_TEMPLATES[0];
}
