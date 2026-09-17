import React from "react";
import { ResumeData } from "@/types/resume";

interface ResumePreviewProps {
  data: ResumeData;
  templateId?: string;
}

export default function ResumePreview({ data, templateId }: ResumePreviewProps) {
  const {
    personalInfo,
    targetRole,
    summary,
    education,
    experience,
    projects,
    skills,
    categorizedSkills,
    certifications,
    achievements,
    hackathons,
    courses,
    volunteerExperience,
    publications,
  } = data;

  // Split description text by newlines or sentences for ATS clean bullet points
  const formatBulletPoints = (text: string) => {
    if (!text) return [];
    const lines = text
      .split(/\n+/)
      .map((line) => line.trim().replace(/^[-•*Ó‡R\d+.)]\s*/, ""))
      .filter((line) => line.length > 0);
    return lines.length > 0 ? lines : [text.trim()];
  };

  // Helpers: skip items whose content is empty or still a default placeholder
  const PLACEHOLDER_PATTERNS = [
    /^new role \/ position$/i,
    /^company name$/i,
    /^duration$/i,
    /^brief description/i,
    /^new project$/i,
    /^project description/i,
    /^technologies used$/i,
    /^degree \/ diploma$/i,
    /^college \/ university name$/i,
    /^graduation year$/i,
    /^certification name$/i,
    /^issuing organization$/i,
    /^describe your award/i,
    /^achievement details$/i,
  ];

  const isPlaceholder = (val?: string) =>
    !val || !val.trim() || PLACEHOLDER_PATTERNS.some((re) => re.test(val.trim()));

  const filteredExperience = (experience || []).filter(
    (e) => !isPlaceholder(e.title) || !isPlaceholder(e.company) || !isPlaceholder(e.description)
  );
  const filteredProjects = (projects || []).filter(
    (p) => !isPlaceholder(p.title) || !isPlaceholder(p.description)
  );
  const filteredEducation = (education || []).filter(
    (e) => !isPlaceholder(e.degree) || !isPlaceholder(e.institution)
  );
  const filteredCertifications = (certifications || []).filter((c) => !isPlaceholder(c.name));
  const filteredAchievements = (achievements || []).filter((a) => !isPlaceholder(a.description));
  const filteredHackathons = (hackathons || []).filter((h) => !isPlaceholder(h.title) || !isPlaceholder(h.description));
  const filteredCourses = (courses || []).filter((c) => !isPlaceholder(c.name));
  const filteredVolunteer = (volunteerExperience || []).filter((v) => !isPlaceholder(v));
  const filteredPublications = (publications || []).filter((p) => !isPlaceholder(p));

  // Build Contact Line 1: Phone | Email | Location
  const contactLine1 = [personalInfo?.phone, personalInfo?.email, personalInfo?.location]
    .filter((item) => item && item.trim().length > 0)
    .join(" | ");

  // Build Contact Line 2: LinkedIn | GitHub | Portfolio
  const cleanLink = (val?: string) => {
    if (!val) return "";
    return val.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  };

  const contactLine2 = [
    cleanLink(personalInfo?.linkedin),
    cleanLink(personalInfo?.github),
    cleanLink(personalInfo?.portfolio),
  ]
    .filter((item) => item.length > 0)
    .join(" | ");

  // Technical Skills Categorization
  const hasCategorized =
    categorizedSkills &&
    (categorizedSkills.languages?.length ||
      categorizedSkills.frameworks?.length ||
      categorizedSkills.tools?.length ||
      categorizedSkills.databases?.length);

  const flatSkillsList = (skills || []).filter((s) => s && s.trim().length > 0);

  // Styling variant - pure ATS, clean Docs typography
  const isSerif = templateId === "classic" || templateId === "executive";
  const fontFamilyClass = isSerif ? "font-serif" : "font-sans";

  return (
    <div
      id="resume-preview-document"
      className={`bg-white text-black p-8 sm:p-10 border border-gray-200 rounded-lg shadow-sm max-w-[800px] mx-auto text-left leading-relaxed ${fontFamilyClass} print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none`}
      style={{
        minHeight: "1056px",
        color: "#111827",
        backgroundColor: "#ffffff",
      }}
    >
      {/* =========================================================================
          1. HEADER (Centered, Single Column, No Icons, No Graphics)
          ========================================================================= */}
      <header className="border-b border-gray-300 pb-3 mb-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight uppercase text-black">
          {personalInfo?.fullName || "Your Full Name"}
        </h1>

        {targetRole && (
          <p className="text-sm font-semibold text-gray-800 mt-1">
            {targetRole}
          </p>
        )}

        {contactLine1 && (
          <p className="text-xs text-gray-700 mt-1.5 font-normal tracking-wide">
            {contactLine1}
          </p>
        )}

        {contactLine2 && (
          <p className="text-xs text-gray-700 mt-0.5 font-normal tracking-wide">
            {contactLine2}
          </p>
        )}
      </header>

      {/* =========================================================================
          2. PROFESSIONAL SUMMARY (2-3 lines, role-targeted)
          ========================================================================= */}
      {summary && summary.trim().length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-1.5">
            Professional Summary
          </h2>
          <p className="text-xs text-gray-800 leading-relaxed text-justify">
            {summary.trim()}
          </p>
        </section>
      )}

      {/* =========================================================================
          3. EDUCATION (Standard ATS format)
          ========================================================================= */}
      {filteredEducation && filteredEducation.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-2">
            Education
          </h2>
          <div className="space-y-2">
            {filteredEducation.map((edu, i) => (
              <div key={edu.id || i} className="text-xs">
                <div className="flex justify-between items-baseline font-bold text-black">
                  <span>{edu.degree}</span>
                  {edu.year && (
                    <span className="font-normal text-gray-600 text-[11px]">{edu.year}</span>
                  )}
                </div>
                <div className="text-gray-800 flex justify-between items-baseline mt-0.5">
                  <span>{edu.institution}</span>
                  {edu.cgpa && (
                    <span className="text-gray-600 text-[11px]">CGPA: {edu.cgpa}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          4. TECHNICAL SKILLS (Text-based categories, NO bars or ratings)
          ========================================================================= */}
      {((hasCategorized) || flatSkillsList.length > 0) && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-1.5">
            Technical Skills
          </h2>
          <div className="text-xs text-gray-800 space-y-1">
            {hasCategorized ? (
              <>
                {categorizedSkills?.languages && categorizedSkills.languages.length > 0 && (
                  <p>
                    <span className="font-bold text-black">Languages: </span>
                    {categorizedSkills.languages.join(", ")}
                  </p>
                )}
                {categorizedSkills?.frameworks && categorizedSkills.frameworks.length > 0 && (
                  <p>
                    <span className="font-bold text-black">Web &amp; Frameworks: </span>
                    {categorizedSkills.frameworks.join(", ")}
                  </p>
                )}
                {categorizedSkills?.databases && categorizedSkills.databases.length > 0 && (
                  <p>
                    <span className="font-bold text-black">Databases: </span>
                    {categorizedSkills.databases.join(", ")}
                  </p>
                )}
                {categorizedSkills?.tools && categorizedSkills.tools.length > 0 && (
                  <p>
                    <span className="font-bold text-black">Tools &amp; Platforms: </span>
                    {categorizedSkills.tools.join(", ")}
                  </p>
                )}
              </>
            ) : (
              <p>
                <span className="font-bold text-black">Core Competencies: </span>
                {flatSkillsList.join(", ")}
              </p>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          5. WORK EXPERIENCE (Reverse chronological, bullet points)
          ========================================================================= */}
      {filteredExperience && filteredExperience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-2">
            Work Experience
          </h2>
          <div className="space-y-3">
            {filteredExperience.map((exp, i) => (
              <div key={exp.id || i} className="text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-black">{exp.title}</span>
                  {exp.duration && (
                    <span className="text-gray-600 font-normal text-[11px]">{exp.duration}</span>
                  )}
                </div>
                {exp.company && (
                  <div className="font-medium text-gray-800 mb-1">{exp.company}</div>
                )}
                {exp.description && (
                  <ul className="list-disc list-outside ml-4 text-gray-800 space-y-1 leading-relaxed">
                    {formatBulletPoints(exp.description).map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          6. PROJECTS (Name, Technologies, Bullet points)
          ========================================================================= */}
      {filteredProjects && filteredProjects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-2">
            Projects
          </h2>
          <div className="space-y-3">
            {filteredProjects.map((proj, i) => (
              <div key={proj.id || i} className="text-xs">
                <div className="font-bold text-black">
                  {proj.title}
                </div>
                {proj.technologies && (
                  <div className="text-gray-700 italic text-[11px] mb-1">
                    {proj.technologies}
                  </div>
                )}
                {proj.description && (
                  <ul className="list-disc list-outside ml-4 text-gray-800 space-y-1 leading-relaxed">
                    {formatBulletPoints(proj.description).map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          7. CERTIFICATIONS (Format: Name — Issuer | Year)
          ========================================================================= */}
      {filteredCertifications && filteredCertifications.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-1.5">
            Certifications
          </h2>
          <ul className="text-xs text-gray-800 space-y-1">
            {filteredCertifications.map((cert, i) => (
              <li key={cert.id || i} className="list-none">
                <span className="font-medium text-black">{cert.name}</span>
                {cert.issuer && <span> — {cert.issuer}</span>}
                {cert.year && <span> | {cert.year}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* =========================================================================
          8. ACHIEVEMENTS (Normal bullet points)
          ========================================================================= */}
      {filteredAchievements && filteredAchievements.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-1.5">
            Achievements
          </h2>
          <ul className="list-disc list-outside ml-4 text-xs text-gray-800 space-y-1 leading-relaxed">
            {filteredAchievements.map((ach, i) => (
              <li key={ach.id || i}>{ach.description}</li>
            ))}
          </ul>
        </section>
      )}

      {/* =========================================================================
          9. OPTIONAL SECTIONS (Only rendered if user has entries)
          ========================================================================= */}
      {filteredHackathons.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-1.5">
            Hackathons &amp; Competitions
          </h2>
          <ul className="list-disc list-outside ml-4 text-xs text-gray-800 space-y-1 leading-relaxed">
            {filteredHackathons.map((h, i) => (
              <li key={h.id || i}>
                <span className="font-bold text-black">{h.title}</span>
                {h.description && <span>: {h.description}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {filteredCourses.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-1.5">
            Courses &amp; Training
          </h2>
          <ul className="list-disc list-outside ml-4 text-xs text-gray-800 space-y-1 leading-relaxed">
            {filteredCourses.map((c, i) => (
              <li key={c.id || i}>
                <span className="font-medium text-black">{c.name}</span>
                {c.institution && <span> — {c.institution}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {filteredVolunteer.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-1.5">
            Volunteer Experience
          </h2>
          <ul className="list-disc list-outside ml-4 text-xs text-gray-800 space-y-1 leading-relaxed">
            {filteredVolunteer.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </section>
      )}

      {filteredPublications.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-1.5">
            Publications
          </h2>
          <ul className="list-disc list-outside ml-4 text-xs text-gray-800 space-y-1 leading-relaxed">
            {filteredPublications.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
