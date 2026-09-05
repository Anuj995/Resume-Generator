import { ResumeData } from "@/types/resume";
import { JOB_ROLES } from "@/data/roles";

/**
 * Simple beginner-friendly parser that extracts structured sections
 * from raw user text and target role.
 * Designed to be modular so an AI API can replace this later.
 */
export function extractResumeData(rawText: string, targetRole: string): ResumeData {
  const text = rawText || "";
  const lowerText = text.toLowerCase();

  // Find target role configuration keywords if available
  const matchedRole = JOB_ROLES.find((r) => r.name === targetRole);
  const roleKeywords = matchedRole ? matchedRole.keywords : [];

  // 1. Extract Skills (find mentioned known keywords or common tech skills in user text)
  const commonSkills = [
    "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
    "Python", "Java", "SQL", "MongoDB", "Express", "Tailwind CSS", "Git",
    "Figma", "Excel", "Power BI", "Statistics", "Agile", "Scrum", "Jira"
  ];

  const detectedSkills: string[] = [];
  // Prioritize role keywords first
  roleKeywords.forEach((kw) => {
    if (lowerText.includes(kw.toLowerCase()) && !detectedSkills.includes(kw)) {
      detectedSkills.push(kw);
    }
  });
  // Check remaining common skills
  commonSkills.forEach((skill) => {
    if (lowerText.includes(skill.toLowerCase()) && !detectedSkills.includes(skill)) {
      detectedSkills.push(skill);
    }
  });

  // If none detected from list, provide whatever the user may have typed or empty list
  const skills = detectedSkills;

  // 2. Extract Experience (look for keywords like intern, developer, work, experience)
  const experience = [];
  if (lowerText.includes("intern")) {
    experience.push({
      id: "exp-1",
      title: "Software Development Intern",
      company: "Tech Solutions",
      duration: "3 Months",
      description: "Contributed to frontend features, collaborated with team members, and fixed UI bugs.",
    });
  }

  // 3. Extract Projects (look for keywords like website, project, portfolio, hackathon)
  const projects = [];
  if (lowerText.includes("website") || lowerText.includes("portfolio")) {
    projects.push({
      id: "proj-1",
      title: "Portfolio & Web Applications",
      description: "Developed responsive web pages and deployed interactive user interfaces.",
      technologies: skills.slice(0, 3).join(", ") || "HTML, CSS, JavaScript",
    });
  }
  if (lowerText.includes("hackathon")) {
    projects.push({
      id: "proj-2",
      title: "Hackathon Project",
      description: "Collaborated in a time-constrained environment to design and build a functional web solution.",
      technologies: skills.slice(0, 2).join(", ") || "React, Tailwind CSS",
    });
  }

  // 4. Extract Certifications (look for course, certification, certificate)
  const certifications = [];
  if (lowerText.includes("react course") || lowerText.includes("react")) {
    certifications.push({
      id: "cert-1",
      name: "React Development Course",
      issuer: "Online Learning Platform",
    });
  }
  if (lowerText.includes("python certification") || lowerText.includes("python")) {
    certifications.push({
      id: "cert-2",
      name: "Python Certification",
      issuer: "Authorized Provider",
    });
  }

  // 5. Extract Achievements
  const achievements = [];
  if (lowerText.includes("hackathon") || lowerText.includes("participated")) {
    achievements.push({
      id: "ach-1",
      description: "Participated in hackathons and built collaborative projects under tight deadlines.",
    });
  }

  // 6. Default Education
  const education = [
    {
      id: "edu-1",
      degree: "Bachelor of Technology / Computer Science",
      institution: "University / College",
      year: "2021 - 2025",
    },
  ];

  // 7. Summary
  const summary = targetRole
    ? `Motivated aspiring ${targetRole} with hands-on experience in building projects and developing modern applications. Eager to contribute technical skills in a collaborative team.`
    : "Enthusiastic developer with a passion for software development and learning new technologies.";

  return {
    personalInfo: {
      fullName: "Your Name",
      email: "your.name@example.com",
      phone: "+91 9876543210",
      location: "City, Country",
    },
    targetRole: targetRole || "Software Developer",
    rawText: text,
    summary,
    education,
    experience,
    projects,
    skills,
    certifications,
    achievements,
  };
}
