import { ResumeData, Experience, Project, Certification, Achievement, Education } from "@/types/resume";
import { JOB_ROLES } from "@/data/roles";

/**
 * Universal Intelligent Resume Parser
 * Handles single-column and multi-column resumes across technical, administrative, creative, and business domains.
 */

// ==========================================
// 1. EXTRACT EMAIL (Global Scan)
// ==========================================
export function extractEmail(text: string): string {
  if (!text) return "";

  // 1. Check for mailto: link
  const mailtoMatch = text.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  if (mailtoMatch) {
    return mailtoMatch[1].trim();
  }

  // 2. Standard email pattern anywhere in document
  const standardRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/i;
  const match = text.match(standardRegex);
  if (match) {
    return match[0].trim();
  }

  // 3. Loose pattern for PDFs with whitespace
  const looseRegex = /[a-zA-Z0-9._%+-]+\s*@\s*[a-zA-Z0-9.-]+\s*\.\s*[a-zA-Z]{2,}/i;
  const looseMatch = text.match(looseRegex);
  if (looseMatch) {
    return looseMatch[0].replace(/\s+/g, "").trim();
  }

  return "";
}

// ==========================================
// 2. EXTRACT PHONE NUMBER (Global Scan)
// ==========================================
export function extractPhone(text: string): string {
  if (!text) return "";

  // 1. Check tel: link
  const telMatch = text.match(/tel:([+\d\s\-()]+)/i);
  if (telMatch) {
    const clean = telMatch[1].trim();
    if (clean.replace(/\D/g, "").length >= 7) return clean;
  }

  // 2. Formats like (123) 456-7895 or (123) 456-7890 or (123)456-7890
  const parensMatch = text.match(/\(?\d{3}\)?\s*[-.]?\s*\d{3}\s*[-.]?\s*\d{4}\b/);
  if (parensMatch) {
    const clean = parensMatch[0].trim();
    if (clean.replace(/\D/g, "").length === 10) {
      return clean;
    }
  }

  // 3. International with country code: +91-6006226089, +1-123-456-7890, +44 20 7946 0958
  const intlMatch = text.match(/(?:\+|Ó\s*\+|☎\s*\+|📞\s*\+)\d{1,3}[-.\s]?(?:\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{4,5}\b/);
  if (intlMatch) {
    const clean = intlMatch[0].trim().replace(/^[^\d+]+/, "").replace(/[^\d]+$/, "");
    const digits = clean.replace(/\D/g, "");
    if (digits.length >= 10 && digits.length <= 15) {
      const isYearRange = /^(?:19|20)\d{2}(?:19|20)\d{2}$/.test(digits);
      if (!isYearRange) return clean;
    }
  }

  // 4. 10-digit standard mobile: 6006226089, 9876543210
  const tenDigitMatch = text.match(/\b[6-9]\d{9}\b/);
  if (tenDigitMatch) {
    return `+91-${tenDigitMatch[0]}`;
  }

  return "";
}

// ==========================================
// 3. EXTRACT LOCATION
// ==========================================
export function extractLocation(text: string): string {
  if (!text) return "";
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Look for full street/city/state/zip: e.g. "1938 W Augusta Blvd, Chicago, IL 60622"
  const fullAddressMatch = text.match(/\b\d{1,5}\s+[A-Za-z0-9\s.,]+,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5}\b/i);
  if (fullAddressMatch) {
    return fullAddressMatch[0].trim();
  }

  // 2. Look for City, State Zip: "Chicago, IL 60622" or "Boston, MA 02108"
  const cityStateZip = text.match(/\b[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5}\b/);
  if (cityStateZip) {
    return cityStateZip[0].trim();
  }

  // 3. Look in lines for "City, State" or "City, Country"
  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const line = lines[i];
    if (
      line.includes(",") &&
      !line.includes("@") &&
      !line.includes("http") &&
      !line.includes("www.") &&
      !line.match(/\b(?:University|College|School|Bachelor|Master|Present|Sep|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Oct|Nov|Dec)\b/i) &&
      line.length >= 4 &&
      line.length <= 50
    ) {
      const clean = line.replace(/^[•\-\*Ó‡R\s\W]+/, "").replace(/[•\-\*Ó‡R\s\W]+$/, "").trim();
      if (clean.split(",").length === 2 || clean.split(",").length === 3) {
        return clean;
      }
    }
  }

  return "";
}

// ==========================================
// 4. EXTRACT FULL NAME
// ==========================================
export function extractFullName(text: string, uploadedFileName?: string): string {
  if (!text && !uploadedFileName) return "";

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const sectionHeaders = [
    "PROFESSIONAL EXPERIENCE", "WORK EXPERIENCE", "EXPERIENCE", "EMPLOYMENT",
    "EDUCATION", "ACADEMICS", "KEY SKILLS", "ADDITIONAL SKILLS", "SKILLS",
    "TECHNICAL SKILLS", "CONTACT", "PROFILE", "SUMMARY", "PERSONAL SUMMARY",
    "CAREER OBJECTIVE", "PROJECTS", "ACHIEVEMENTS", "EXTRACURRICULAR", "CERTIFICATIONS"
  ];

  // Look in the top 10 lines for candidate name
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];
    const upper = line.toUpperCase();

    // Skip section headers, contact info, numbers, URLs
    const isSection = sectionHeaders.some((h) => upper === h || upper.startsWith(h + " ") || upper.endsWith(" " + h));
    if (
      isSection ||
      line.includes("@") ||
      line.includes("http") ||
      line.includes("linkedin.com") ||
      line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/) ||
      line.match(/^\+?\d/) ||
      line.length < 2 ||
      line.length > 35
    ) {
      continue;
    }

    const cleanLine = line.replace(/^[•\-\*Ó‡R\s\W]+/, "").replace(/[•\-\*Ó‡R\s\W]+$/, "").trim();
    const words = cleanLine.split(/\s+/).filter(Boolean);

    // Name is 1 to 4 clean alphabetical words (e.g. "DENICE HARRIS", "Anuj Pandey")
    if (words.length >= 1 && words.length <= 4 && !cleanLine.includes(",") && !cleanLine.match(/\d/)) {
      return words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
  }

  return "";
}

// ==========================================
// 5. EXTRACT SUMMARY / PROFILE
// ==========================================
export function extractSummary(text: string, targetRole: string): string {
  if (!text) return "";

  // Look for headings: PROFILE, SUMMARY, PERSONAL SUMMARY, PROFESSIONAL SUMMARY, ABOUT ME, OBJECTIVE
  const summaryHeaderRegex = /(?:PROFILE|PERSONAL\s+SUMMARY|PROFESSIONAL\s+SUMMARY|CAREER\s+OBJECTIVE|SUMMARY|ABOUT\s+ME)\s*[:\-]?\s*/i;
  const match = text.match(summaryHeaderRegex);

  if (match && match.index !== undefined) {
    const startIndex = match.index + match[0].length;
    const remainingText = text.slice(startIndex);

    // Stop at the next section header
    const nextSectionRegex = /(?:\n\s*(?:EDUCATION|ACADEMICS|EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|WORK\s+EXPERIENCE|PROJECTS|KEY\s+SKILLS|ADDITIONAL\s+SKILLS|SKILLS|TECHNICAL\s+SKILLS|COURSEWORK|EXTRACURRICULAR|CERTIFICATIONS|ACHIEVEMENTS|CONTACT)\b)/i;
    const nextMatch = remainingText.match(nextSectionRegex);

    const summaryContent = nextMatch && nextMatch.index !== undefined
      ? remainingText.slice(0, nextMatch.index)
      : remainingText.slice(0, 600);

    const cleaned = summaryContent.replace(/\s+/g, " ").trim();
    if (cleaned.length > 20) {
      return cleaned;
    }
  }

  return targetRole
    ? `Dedicated professional with expertise and hands-on experience tailored for ${targetRole}. Eager to contribute skills and deliver impactful results.`
    : "";
}

// ==========================================
// 6. EXTRACT SKILLS
// ==========================================
export function extractSkills(text: string): string[] {
  if (!text) return [];

  const detectedSkills: string[] = [];

  // Broad skill dictionary spanning Tech, Tools, Business, Office, and Design
  const dictionary = [
    // Office & Business & Management
    "Microsoft Office", "Microsoft Excel", "Google Workspace", "Slack", "HubSpot", "MailChimp",
    "Bookkeeping", "Spanish", "Typing", "Project Management", "Customer Service", "Scheduling",
    "Data Entry", "Presentation", "Accounting", "Billing", "QuickBooks", "Trello", "Asana", "Salesforce",
    // Design & Creative
    "Figma", "Adobe XD", "Photoshop", "Illustrator", "UI/UX Design", "Wireframing", "Prototyping",
    // Tech & Programming
    "Python", "Java", "C", "C++", "C#", "JavaScript", "TypeScript", "SQL", "MySQL", "PostgreSQL",
    "HTML", "HTML5", "CSS", "CSS3", "React", "ReactJS", "Next.js", "Vue", "Angular", "Node.js",
    "Express", "Django", "Flask", "Spring Boot", "Firebase", "MongoDB", "Tailwind CSS", "Bootstrap",
    "Git", "GitHub", "Linux", "VS Code", "Leaflet.js", "OpenStreetMap", "Machine Learning",
    "Data Structures & Algorithms", "Operating Systems", "Cloud Computing", "Database Management", "OOPS Concept", "Web Development"
  ];

  // 1. Scan dictionary against full text
  dictionary.forEach((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:\\b|[^a-zA-Z0-9])${escaped}(?:\\b|[^a-zA-Z0-9])`, "i");
    if (regex.test(text) && !detectedSkills.includes(skill)) {
      detectedSkills.push(skill);
    }
  });

  // 2. Scan section under KEY SKILLS / ADDITIONAL SKILLS / SKILLS directly
  const skillSectionMatch = text.match(/(?:KEY\s+SKILLS|ADDITIONAL\s+SKILLS|SKILLS|TECHNICAL\s+SKILLS)[\s\S]*?(?=(?:EDUCATION|PROFESSIONAL\s+EXPERIENCE|EXPERIENCE|PROFILE|CONTACT|PROJECTS|$))/gi);
  if (skillSectionMatch) {
    skillSectionMatch.forEach((sec) => {
      const lines = sec.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      lines.slice(1).forEach((line) => {
        // Split by comma, bullet, or spacing
        const tokens = line.split(/[,•|·\t]/).map((t) => t.trim()).filter((t) => t.length > 1 && t.length < 30);
        tokens.forEach((token) => {
          if (!detectedSkills.some((s) => s.toLowerCase() === token.toLowerCase()) && !/^(?:KEY\s+SKILLS|ADDITIONAL\s+SKILLS|SKILLS)/i.test(token)) {
            detectedSkills.push(token);
          }
        });
      });
    });
  }

  return detectedSkills;
}

// ==========================================
// ==========================================
// 7. EXTRACT EDUCATION
// ==========================================
export function extractEducation(text: string): Education[] {
  if (!text) return [{ id: "edu-1", degree: "", institution: "", year: "" }];

  const educationList: Education[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const eduStart = lines.findIndex((l) =>
    /^(?:EDUCATION|ACADEMICS|ACADEMIC\s+BACKGROUND|QUALIFICATIONS|EDUCATION\s+(?:&|AND)\s+TRAINING)\b/i.test(l)
  );

  const yearRegex =
    /(?:(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(?:19|20)\d{2}\s*[-–—to]+\s*(?:(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(?:19|20)\d{2}|Present|Current|Expected\s+(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(?:19|20)\d{2}))|\bExpected\s+(?:[A-Za-z]+\s+)?(?:19|20)\d{2}\b|\b(?:May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*(?:19|20)\d{2}\b|\b(?:19|20)\d{2}\b|\b(?:May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+20XX\b/i;

  const degreeRegex =
    /\b(?:Bachelor|Master|B\.?A\.?|B\.?E\.?|B\.?Tech|B\.?Sc|M\.?S\.?|M\.?Tech|Ph\.?D|Associate|Diploma|High\s+School|Senior\s+School|Certificate|Graduated|Degree)\b/i;

  const instRegex =
    /\b(?:University|College|Institute|School|Vidyalaya|Academy|Polytechnic|Campus)\b/i;

  if (eduStart !== -1) {
    const eduLines: string[] = [];
    for (let i = eduStart + 1; i < lines.length; i++) {
      const line = lines[i];
      if (
        /^(?:PROJECTS|KEY\s+SKILLS|ADDITIONAL\s+SKILLS|SKILLS|TECHNICAL\s+SKILLS|PROFESSIONAL\s+EXPERIENCE|EXPERIENCE|WORK\s+EXPERIENCE|PROFILE|CONTACT|COURSEWORK|EXTRACURRICULAR|CERTIFICATIONS|ACHIEVEMENTS|AWARDS)\b/i.test(
          line
        )
      ) {
        break;
      }
      eduLines.push(line);
    }

    let currentDegree = "";
    let currentInst = "";
    let currentYear = "";

    eduLines.forEach((line) => {
      const isDegree = degreeRegex.test(line);
      const isInst = instRegex.test(line);
      const yearMatch = line.match(yearRegex);

      // Single-line format check (e.g. "River Brook University - Chicago, IL | Bachelor of Arts | 2020")
      if (line.includes("|") || (line.includes(" - ") && isDegree && isInst)) {
        const parts = line.split(/[|•–—]/).map((p) => p.trim());
        let partDegree = "";
        let partInst = "";
        let partYear = "";

        parts.forEach((part) => {
          if (degreeRegex.test(part) && !partDegree) {
            partDegree = part;
          } else if (instRegex.test(part) && !partInst) {
            partInst = part;
          } else if (yearRegex.test(part) && !partYear) {
            const ym = part.match(yearRegex);
            partYear = ym ? ym[0].trim() : part;
          }
        });

        if (partInst || partDegree) {
          educationList.push({
            id: `edu-${educationList.length + 1}`,
            institution: partInst || partDegree,
            degree: partDegree || partInst || "Degree / Course",
            year: partYear || "",
          });
          return;
        }
      }

      if (isInst && !currentInst) {
        currentInst = line.replace(/\|.*$/, "").trim();
      }
      if (isDegree) {
        currentDegree = currentDegree ? `${currentDegree} - ${line}` : line;
      }
      if (yearMatch && !currentYear) {
        currentYear = yearMatch[0].trim();
      }

      if (currentInst && (currentDegree || currentYear)) {
        educationList.push({
          id: `edu-${educationList.length + 1}`,
          institution: currentInst,
          degree: currentDegree || "Degree / Course",
          year: currentYear || "",
        });
        currentInst = "";
        currentDegree = "";
        currentYear = "";
      }
    });

    if (currentInst || currentDegree) {
      educationList.push({
        id: `edu-${educationList.length + 1}`,
        institution: currentInst || currentDegree,
        degree: currentDegree || "Degree / Course",
        year: currentYear || "",
      });
    }
  }

  // Fallback: if no section detected or empty, scan document lines for institution or degree
  if (educationList.length === 0) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (instRegex.test(line) && !line.includes("@") && line.length < 100) {
        const yearMatch = line.match(yearRegex);
        educationList.push({
          id: `edu-${educationList.length + 1}`,
          institution: line.replace(yearRegex, "").replace(/[|•–—,-]+$/, "").trim(),
          degree: "Degree / Course",
          year: yearMatch ? yearMatch[0].trim() : "",
        });
        if (educationList.length >= 2) break;
      }
    }
  }

  if (educationList.length === 0) {
    educationList.push({
      id: "edu-1",
      degree: "",
      institution: "",
      year: "",
    });
  }

  return educationList;
}

// ==========================================
// 8. EXTRACT EXPERIENCE
// ==========================================
export function extractExperience(text: string, targetRole: string): Experience[] {
  if (!text) {
    return [{
      id: "exp-1",
      title: targetRole || "",
      company: "",
      duration: "",
      description: "",
    }];
  }

  const experienceList: Experience[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const expStart = lines.findIndex((l) =>
    /^(?:PROFESSIONAL\s+EXPERIENCE|WORK\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT(?:\s+HISTORY)?|WORK\s+HISTORY|RELEVANT\s+EXPERIENCE)\b/i.test(l)
  );

  const datePattern =
    /(?:(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(?:19|20)\d{2}\s*[-–—to]+\s*(?:(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(?:19|20)\d{2}|Present|Current|Ongoing|20XX))|\b(?:19|20)\d{2}\s*[-–—to]+\s*(?:19|20)\d{2}\b/i;

  const roleKeywords =
    /\b(?:Engineer|Developer|Manager|Assistant|Analyst|Consultant|Specialist|Director|Lead|Designer|Intern|Officer|Coordinator|Administrator|Secretary|Associate|Architect|Representative|Scientist|Programmer|Executive)\b/i;

  if (expStart !== -1) {
    let currentTitle = "";
    let currentCompany = "";
    let currentDuration = "";
    let currentBullets: string[] = [];

    const saveCurrentJob = () => {
      if (currentTitle || currentCompany) {
        experienceList.push({
          id: `exp-${experienceList.length + 1}`,
          title: currentTitle || targetRole || "Professional",
          company: currentCompany || "Company",
          duration: currentDuration || "",
          description: currentBullets.join(" ").trim(),
        });
        currentTitle = "";
        currentCompany = "";
        currentDuration = "";
        currentBullets = [];
      }
    };

    for (let i = expStart + 1; i < lines.length; i++) {
      const line = lines[i];

      // End of experience section check
      if (
        /^(?:EDUCATION|ACADEMICS|KEY\s+SKILLS|ADDITIONAL\s+SKILLS|SKILLS|TECHNICAL\s+SKILLS|PROFILE|CONTACT|PROJECTS|CERTIFICATIONS|ACHIEVEMENTS|AWARDS|EXTRACURRICULAR|PUBLICATIONS)\b/i.test(
          line
        )
      ) {
        break;
      }

      const isBullet = /^[•\-\*Ó‡R\d+.)]\s*/.test(line);
      const cleanLine = line.replace(/^[•\-\*Ó‡R\d+.)]\s*/, "").trim();

      if (isBullet) {
        currentBullets.push(cleanLine);
        continue;
      }

      const hasDate = datePattern.test(line);

      // Check for delimited single header line: "Title | Company | Date" or "Company | City | Date"
      if (line.includes("|") || line.includes(" – ") || line.includes(" - ")) {
        const parts = line.split(/[|•–]/).map((p) => p.trim());
        const partWithDate = parts.find((p) => datePattern.test(p));
        const nonDateParts = parts.filter((p) => !datePattern.test(p));

        if (partWithDate || nonDateParts.some((p) => roleKeywords.test(p))) {
          // If we already had a job accumulating descriptions, finalize it
          if (currentTitle && currentBullets.length > 0) {
            saveCurrentJob();
          }

          if (currentTitle && !currentCompany) {
            // This line provides company and date for the already identified title
            currentCompany = nonDateParts.join(", ");
            if (partWithDate) {
              const dm = partWithDate.match(datePattern);
              currentDuration = dm ? dm[0].trim() : partWithDate;
            }
            continue;
          }

          // New job header line
          const detectedTitle = nonDateParts.find((p) => roleKeywords.test(p)) || nonDateParts[0] || "";
          const detectedCompany = nonDateParts.find((p) => p !== detectedTitle) || nonDateParts[1] || "";

          currentTitle = detectedTitle;
          currentCompany = detectedCompany;
          if (partWithDate) {
            const dm = partWithDate.match(datePattern);
            currentDuration = dm ? dm[0].trim() : partWithDate;
          }
          continue;
        }
      }

      // Standalone date line
      if (hasDate && line.length < 50) {
        const dm = line.match(datePattern);
        currentDuration = dm ? dm[0].trim() : line;
        continue;
      }

      // Standalone Title or Company line
      if (line.length < 60 && !line.includes("@") && !line.endsWith(".")) {
        if (currentTitle && currentBullets.length > 0) {
          saveCurrentJob();
        }

        if (!currentTitle) {
          currentTitle = line;
        } else if (!currentCompany) {
          currentCompany = line;
        } else {
          // Could be an unbulleted description line or new title
          if (roleKeywords.test(line)) {
            saveCurrentJob();
            currentTitle = line;
          } else {
            currentBullets.push(line);
          }
        }
        continue;
      }

      // Normal text / paragraph description line
      currentBullets.push(line);
    }

    saveCurrentJob();
  }

  if (experienceList.length === 0) {
    experienceList.push({
      id: "exp-1",
      title: targetRole || "",
      company: "",
      duration: "",
      description: "",
    });
  }

  return experienceList;
}

// ==========================================
// 9. EXTRACT PROJECTS
// ==========================================
export function extractProjects(text: string): Project[] {
  if (!text) return [{ id: "proj-1", title: "", technologies: "", description: "" }];

  const projectsList: Project[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const projStart = lines.findIndex((l) =>
    /^(?:PROJECTS|ACADEMIC\s+PROJECTS|KEY\s+PROJECTS|PERSONAL\s+PROJECTS|TECHNICAL\s+PROJECTS)\b/i.test(l)
  );

  if (projStart !== -1) {
    let currentTitle = "";
    let currentTech = "";
    let currentBullets: string[] = [];

    const saveCurrentProject = () => {
      if (currentTitle) {
        projectsList.push({
          id: `proj-${projectsList.length + 1}`,
          title: currentTitle,
          technologies: currentTech,
          description: currentBullets.join(" ").trim(),
        });
        currentTitle = "";
        currentTech = "";
        currentBullets = [];
      }
    };

    for (let i = projStart + 1; i < lines.length; i++) {
      const line = lines[i];

      // End of section
      if (
        /^(?:EDUCATION|ACADEMICS|KEY\s+SKILLS|ADDITIONAL\s+SKILLS|SKILLS|TECHNICAL\s+SKILLS|PROFESSIONAL\s+EXPERIENCE|WORK\s+EXPERIENCE|EXPERIENCE|PROFILE|CONTACT|CERTIFICATIONS|ACHIEVEMENTS|AWARDS|EXTRACURRICULAR)\b/i.test(
          line
        )
      ) {
        break;
      }

      const isBullet = /^[•\-\*Ó‡R\d+.)]\s*/.test(line);
      const cleanLine = line.replace(/^[•\-\*Ó‡R\d+.)]\s*/, "").trim();

      if (isBullet) {
        currentBullets.push(cleanLine);
        continue;
      }

      // Check for tech stack line e.g. "Technologies: React, Node.js" or "Tech Stack: Python"
      const techPrefixMatch = line.match(/^(?:Technologies|Tech\s+Stack|Tools|Built\s+with|Stack)\s*:\s*(.+)$/i);
      if (techPrefixMatch) {
        currentTech = techPrefixMatch[1].trim();
        continue;
      }

      // Check for compound project line e.g. "Safe Safar | Leaflet.js, OpenStreetMap, JavaScript"
      if (line.includes("|") || line.includes(" — ") || line.includes(" – ")) {
        const parts = line.split(/[|—–]/).map((p) => p.trim());
        if (currentTitle && currentBullets.length > 0) {
          saveCurrentProject();
        }
        currentTitle = parts[0];
        currentTech = parts.slice(1).join(", ");
        continue;
      }

      // Short heading line -> new project title
      if (line.length < 60 && !line.endsWith(".") && !line.includes("@")) {
        if (currentTitle && currentBullets.length > 0) {
          saveCurrentProject();
        }
        currentTitle = line;
        continue;
      }

      // Unbulleted descriptive paragraph
      currentBullets.push(line);
    }

    saveCurrentProject();
  }

  if (projectsList.length === 0) {
    projectsList.push({
      id: "proj-1",
      title: "",
      technologies: "",
      description: "",
    });
  }

  return projectsList;
}

// ==========================================
// 10. EXTRACT ACHIEVEMENTS & CERTIFICATIONS
// ==========================================
export function extractAchievements(text: string): Achievement[] {
  if (!text) return [];
  const achievements: Achievement[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const achStart = lines.findIndex((l) =>
    /^(?:ACHIEVEMENTS|AWARDS|HONORS|HONORS\s+(?:&|AND)\s+AWARDS|AWARDS\s+(?:&|AND)\s+ACHIEVEMENTS|KEY\s+ACHIEVEMENTS|ACCOMPLISHMENTS|EXTRACURRICULAR(?:\s+ACTIVITIES)?)\b/i.test(
      l
    )
  );

  if (achStart !== -1) {
    for (let i = achStart + 1; i < lines.length; i++) {
      const line = lines[i];

      // End of section check
      if (
        /^(?:EDUCATION|ACADEMICS|KEY\s+SKILLS|ADDITIONAL\s+SKILLS|SKILLS|TECHNICAL\s+SKILLS|PROFESSIONAL\s+EXPERIENCE|WORK\s+EXPERIENCE|EXPERIENCE|PROFILE|CONTACT|PROJECTS|CERTIFICATIONS)\b/i.test(
          line
        )
      ) {
        break;
      }

      const cleanLine = line.replace(/^[•\-\*Ó‡R\d+.)]\s*/, "").trim();
      if (cleanLine.length > 10 && !cleanLine.includes("@") && !cleanLine.includes("linkedin.com")) {
        achievements.push({
          id: `ach-${achievements.length + 1}`,
          description: cleanLine,
        });
      }
    }
  }

  return achievements;
}

export function extractCertifications(text: string): Certification[] {
  if (!text) return [];
  const certifications: Certification[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const certStart = lines.findIndex((l) =>
    /^(?:CERTIFICATIONS|CERTIFICATES|LICENSES\s+(?:&|AND)\s+CERTIFICATIONS|CERTIFICATIONS\s+(?:&|AND)\s+LICENSES|TRAINING\s+(?:&|AND)\s+CERTIFICATIONS|COURSES)\b/i.test(
      l
    )
  );

  if (certStart !== -1) {
    for (let i = certStart + 1; i < lines.length; i++) {
      const line = lines[i];

      // End of section check
      if (
        /^(?:EDUCATION|ACADEMICS|KEY\s+SKILLS|ADDITIONAL\s+SKILLS|SKILLS|TECHNICAL\s+SKILLS|PROFESSIONAL\s+EXPERIENCE|WORK\s+EXPERIENCE|EXPERIENCE|PROFILE|CONTACT|PROJECTS|ACHIEVEMENTS|AWARDS|EXTRACURRICULAR)\b/i.test(
          line
        )
      ) {
        break;
      }

      const cleanLine = line.replace(/^[•\-\*Ó‡R\d+.)]\s*/, "").trim();
      if (cleanLine.length < 5 || cleanLine.includes("@")) continue;

      // Extract Name and Issuer using delimiters
      let name = cleanLine;
      let issuer = "";

      if (cleanLine.includes(" - ") || cleanLine.includes(" — ") || cleanLine.includes(" | ")) {
        const parts = cleanLine.split(/\s*[-—|]\s*/).filter(Boolean);
        name = parts[0] || cleanLine;
        issuer = parts.slice(1).join(" / ");
      } else {
        const byMatch = cleanLine.match(/^(.+?)\s+(?:by|from|issued\s+by)\s+(.+)$/i);
        if (byMatch) {
          name = byMatch[1].trim();
          issuer = byMatch[2].trim();
        }
      }

      certifications.push({
        id: `cert-${certifications.length + 1}`,
        name,
        issuer,
      });
    }
  }

  return certifications;
}

// ==========================================
// MAIN PARSER FUNCTION
// ==========================================
export function extractResumeData(
  rawText: string,
  targetRole: string,
  uploadedFileName?: string
): ResumeData {
  const text = rawText || "";

  const email = extractEmail(text);
  const phone = extractPhone(text);
  const location = extractLocation(text);
  const fullName = extractFullName(text, uploadedFileName);
  const summary = extractSummary(text, targetRole);
  const skills = extractSkills(text);
  const education = extractEducation(text);
  const experience = extractExperience(text, targetRole);
  const projects = extractProjects(text);
  const achievements = extractAchievements(text);
  const certifications = extractCertifications(text);

  return {
    personalInfo: {
      fullName,
      email,
      phone,
      location,
    },
    targetRole: targetRole || "",
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
