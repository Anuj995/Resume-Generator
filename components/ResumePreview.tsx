import React from "react";
import { ResumeData } from "@/types/resume";

interface ResumePreviewProps {
  data: ResumeData;
  templateId?: string;
}

export default function ResumePreview({ data, templateId }: ResumePreviewProps) {
  const activeTemplate = templateId || data.templateId || "classic";

  const {
    personalInfo,
    targetRole,
    summary,
    education,
    experience,
    projects,
    skills,
    certifications,
    achievements,
  } = data;

  // Split description text by newlines or sentences for ATS clean bullet points
  const formatBulletPoints = (text: string) => {
    if (!text) return [];
    // If text already has newlines or dashes, split by newline
    const lines = text
      .split(/\n+/)
      .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
      .filter((line) => line.length > 0);
    return lines.length > 0 ? lines : [text];
  };

  // ── Helpers: skip items whose content is empty or still a default placeholder ──
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

  const isPlaceholder = (val: string) =>
    !val || !val.trim() || PLACEHOLDER_PATTERNS.some((re) => re.test(val.trim()));

  const filteredExperience = experience.filter(
    (e) => !isPlaceholder(e.title) || !isPlaceholder(e.company) || !isPlaceholder(e.description)
  );
  const filteredProjects = projects.filter(
    (p) => !isPlaceholder(p.title) || !isPlaceholder(p.description)
  );
  const filteredEducation = education.filter(
    (e) => !isPlaceholder(e.degree) || !isPlaceholder(e.institution)
  );
  const filteredCertifications = certifications.filter((c) => !isPlaceholder(c.name));
  const filteredAchievements = achievements.filter((a) => !isPlaceholder(a.description));
  const filteredSkills = skills.filter((s) => s && s.trim().length > 0);

  /* ==========================================================================
     TEMPLATE 1: CLASSIC ATS (Traditional, Centered, Timeless)
     ========================================================================== */
  if (activeTemplate === "classic") {
    return (
      <div
        id="resume-preview-document"
        className="bg-white text-gray-900 p-8 border border-gray-300 rounded shadow-sm max-w-2xl mx-auto font-serif text-left print:border-none print:shadow-none print:p-0 leading-normal"
        style={{ minHeight: "842px" }}
      >
        {/* Header Section */}
        <header className="border-b-2 border-gray-900 pb-3 mb-4 text-center">
          <h1 className="text-2xl font-bold tracking-wider uppercase text-gray-900">
            {personalInfo.fullName || "Your Full Name"}
          </h1>
          {targetRole && (
            <p className="text-sm font-semibold text-gray-700 tracking-wide mt-1">
              {targetRole}
            </p>
          )}
          <div className="flex flex-wrap justify-center items-center gap-2 text-xs text-gray-600 mt-2 font-sans">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>&bull; {personalInfo.phone}</span>}
            {personalInfo.location && <span>&bull; {personalInfo.location}</span>}
          </div>
        </header>

        {/* Professional Summary */}
        {summary && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-1 mb-1.5 font-sans">
              Professional Summary
            </h2>
            <p className="text-xs text-gray-800 leading-relaxed">{summary}</p>
          </section>
        )}

        {/* Skills */}
        {filteredSkills && filteredSkills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-1 mb-1.5 font-sans">
              Technical Skills
            </h2>
            <p className="text-xs text-gray-800 leading-relaxed font-sans">
              <strong>Core Competencies:</strong> {filteredSkills.join(", ")}
            </p>
          </section>
        )}

        {/* Experience */}
        {filteredExperience && filteredExperience.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-1 mb-1.5 font-sans">
              Work Experience
            </h2>
            <div className="space-y-3">
              {filteredExperience.map((exp, i) => (
                <div key={exp.id || i} className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-gray-900">
                    <span>
                      {exp.title} &mdash; <span className="font-semibold text-gray-800">{exp.company}</span>
                    </span>
                    <span className="text-gray-600 font-normal text-[11px] font-sans">{exp.duration}</span>
                  </div>
                  {exp.description && (
                    <ul className="list-disc list-outside ml-4 mt-1 text-gray-700 space-y-0.5 leading-relaxed">
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

        {/* Projects */}
        {filteredProjects && filteredProjects.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-1 mb-1.5 font-sans">
              Key Projects
            </h2>
            <div className="space-y-3">
              {filteredProjects.map((proj, i) => (
                <div key={proj.id || i} className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-gray-900">
                    <span>{proj.title}</span>
                    {proj.technologies && (
                      <span className="text-[11px] font-sans font-normal text-gray-600">
                        [{proj.technologies}]
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <ul className="list-disc list-outside ml-4 mt-1 text-gray-700 space-y-0.5 leading-relaxed">
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

        {/* Education */}
        {filteredEducation && filteredEducation.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-1 mb-1.5 font-sans">
              Education
            </h2>
            <div className="space-y-1.5">
              {filteredEducation.map((edu, i) => (
                <div key={edu.id || i} className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-gray-900">{edu.degree}</span>
                    <span className="text-gray-700">, {edu.institution}</span>
                  </div>
                  <span className="text-gray-600 text-[11px] font-sans">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {filteredCertifications && filteredCertifications.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-1 mb-1.5 font-sans">
              Certifications
            </h2>
            <ul className="list-disc list-outside ml-4 text-xs text-gray-700 space-y-0.5">
              {filteredCertifications.map((cert, i) => (
                <li key={cert.id || i}>
                  <span className="font-semibold text-gray-900">{cert.name}</span>
                  {cert.issuer && <span className="text-gray-600"> &mdash; {cert.issuer}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Achievements */}
        {filteredAchievements && filteredAchievements.length > 0 && (
          <section className="mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-1 mb-1.5 font-sans">
              Honors & Achievements
            </h2>
            <ul className="list-disc list-outside ml-4 text-xs text-gray-700 space-y-0.5">
              {filteredAchievements.map((ach, i) => (
                <li key={ach.id || i}>{ach.description}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  /* ==========================================================================
     TEMPLATE 2: MODERN TECH (Clean, Left-Aligned, Blue Accent)
     ========================================================================== */
  if (activeTemplate === "modern") {
    return (
      <div
        id="resume-preview-document"
        className="bg-white text-gray-900 p-8 border border-gray-300 rounded shadow-sm max-w-2xl mx-auto font-sans text-left print:border-none print:shadow-none print:p-0"
        style={{ minHeight: "842px" }}
      >
        {/* Modern Header */}
        <header className="border-b-2 border-blue-600 pb-4 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              {personalInfo.fullName || "Your Full Name"}
            </h1>
            {targetRole && (
              <span className="inline-block self-start sm:self-auto text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                {targetRole}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mt-2">
            {personalInfo.email && <span className="font-medium">{personalInfo.email}</span>}
            {personalInfo.phone && <span>&bull; {personalInfo.phone}</span>}
            {personalInfo.location && <span>&bull; {personalInfo.location}</span>}
          </div>
        </header>

        {/* Professional Summary */}
        {summary && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-800 border-b border-gray-200 pb-1 mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Professional Summary
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed pl-3.5">{summary}</p>
          </section>
        )}

        {/* Skills */}
        {filteredSkills && filteredSkills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-800 border-b border-gray-200 pb-1 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Technical Skills
            </h2>
            <div className="flex flex-wrap gap-1.5 pl-3.5">
              {filteredSkills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-blue-50 border border-blue-200 text-blue-900 font-medium px-2 py-0.5 rounded text-[11px]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {filteredExperience && filteredExperience.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-800 border-b border-gray-200 pb-1 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Work Experience
            </h2>
            <div className="space-y-3 pl-3.5">
              {filteredExperience.map((exp, i) => (
                <div key={exp.id || i} className="text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-gray-900 text-sm">
                      {exp.title}
                    </span>
                    <span className="text-gray-500 font-medium text-[11px]">{exp.duration}</span>
                  </div>
                  <div className="text-blue-700 font-semibold text-xs mb-1">
                    {exp.company}
                  </div>
                  {exp.description && (
                    <ul className="list-disc list-outside ml-3.5 text-gray-600 space-y-0.5 leading-relaxed">
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

        {/* Projects */}
        {filteredProjects && filteredProjects.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-800 border-b border-gray-200 pb-1 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Projects & Engineering Work
            </h2>
            <div className="space-y-3 pl-3.5">
              {filteredProjects.map((proj, i) => (
                <div key={proj.id || i} className="text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-gray-900">{proj.title}</span>
                  </div>
                  {proj.technologies && (
                    <div className="text-blue-600 font-medium text-[11px] my-0.5">
                      Stack: {proj.technologies}
                    </div>
                  )}
                  {proj.description && (
                    <ul className="list-disc list-outside ml-3.5 text-gray-600 space-y-0.5 leading-relaxed">
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

        {/* Education */}
        {filteredEducation && filteredEducation.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-800 border-b border-gray-200 pb-1 mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Education
            </h2>
            <div className="space-y-1.5 pl-3.5">
              {filteredEducation.map((edu, i) => (
                <div key={edu.id || i} className="flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900">{edu.degree}</span>
                    <span className="text-gray-600"> &bull; {edu.institution}</span>
                  </div>
                  <span className="text-gray-500 text-[11px]">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {filteredCertifications && filteredCertifications.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-800 border-b border-gray-200 pb-1 mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Certifications
            </h2>
            <ul className="list-disc list-outside ml-7 text-xs text-gray-700 space-y-0.5">
              {filteredCertifications.map((cert, i) => (
                <li key={cert.id || i}>
                  <span className="font-medium text-gray-900">{cert.name}</span>
                  {cert.issuer && <span className="text-gray-500"> ({cert.issuer})</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Achievements */}
        {filteredAchievements && filteredAchievements.length > 0 && (
          <section className="mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-800 border-b border-gray-200 pb-1 mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Achievements
            </h2>
            <ul className="list-disc list-outside ml-7 text-xs text-gray-700 space-y-0.5">
              {filteredAchievements.map((ach, i) => (
                <li key={ach.id || i}>{ach.description}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  /* ==========================================================================
     TEMPLATE 3: CORPORATE EXECUTIVE (Teal Accent, Bold Structure)
     ========================================================================== */
  if (activeTemplate === "professional") {
    return (
      <div
        id="resume-preview-document"
        className="bg-white text-gray-900 p-8 border border-gray-300 rounded shadow-sm max-w-2xl mx-auto font-sans text-left print:border-none print:shadow-none print:p-0"
        style={{ minHeight: "842px" }}
      >
        {/* Executive Header */}
        <header className="border-b border-teal-800 pb-3 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wide text-teal-950">
                {personalInfo.fullName || "Your Full Name"}
              </h1>
              {targetRole && (
                <p className="text-sm font-semibold text-teal-700 tracking-wider uppercase mt-0.5">
                  {targetRole}
                </p>
              )}
            </div>
            <div className="text-right text-xs text-gray-600 mt-2 sm:mt-0 space-y-0.5 font-medium">
              {personalInfo.email && <div>{personalInfo.email}</div>}
              <div className="flex sm:justify-end gap-2 text-gray-500">
                {personalInfo.phone && <span>{personalInfo.phone}</span>}
                {personalInfo.phone && personalInfo.location && <span>|</span>}
                {personalInfo.location && <span>{personalInfo.location}</span>}
              </div>
            </div>
          </div>
        </header>

        {/* Professional Summary */}
        {summary && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-900 bg-teal-50 px-2 py-1 border-l-4 border-teal-700 mb-2">
              Executive Profile
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed px-1">{summary}</p>
          </section>
        )}

        {/* Skills */}
        {filteredSkills && filteredSkills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-900 bg-teal-50 px-2 py-1 border-l-4 border-teal-700 mb-2">
              Core Competencies & Skills
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs px-1 text-gray-800">
              {filteredSkills.map((skill, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-teal-700 font-bold">&rsaquo;</span>
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {filteredExperience && filteredExperience.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-900 bg-teal-50 px-2 py-1 border-l-4 border-teal-700 mb-2">
              Professional Experience
            </h2>
            <div className="space-y-3 px-1">
              {filteredExperience.map((exp, i) => (
                <div key={exp.id || i} className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-gray-900">
                    <span className="text-sm text-teal-950">{exp.title}</span>
                    <span className="text-gray-500 font-normal text-[11px]">{exp.duration}</span>
                  </div>
                  <div className="font-semibold text-gray-700 text-xs mb-1">
                    {exp.company}
                  </div>
                  {exp.description && (
                    <ul className="list-disc list-outside ml-4 text-gray-600 space-y-0.5 leading-relaxed">
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

        {/* Projects */}
        {filteredProjects && filteredProjects.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-900 bg-teal-50 px-2 py-1 border-l-4 border-teal-700 mb-2">
              Key Initiatives & Projects
            </h2>
            <div className="space-y-3 px-1">
              {filteredProjects.map((proj, i) => (
                <div key={proj.id || i} className="text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-gray-900">{proj.title}</span>
                    {proj.technologies && (
                      <span className="text-teal-700 text-[11px] font-medium">
                        {proj.technologies}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <ul className="list-disc list-outside ml-4 mt-1 text-gray-600 space-y-0.5 leading-relaxed">
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

        {/* Education */}
        {filteredEducation && filteredEducation.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-900 bg-teal-50 px-2 py-1 border-l-4 border-teal-700 mb-2">
              Education & Credentials
            </h2>
            <div className="space-y-1.5 px-1">
              {filteredEducation.map((edu, i) => (
                <div key={edu.id || i} className="flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900">{edu.degree}</span>
                    <span className="text-gray-600"> &bull; {edu.institution}</span>
                  </div>
                  <span className="text-gray-500 text-[11px]">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications & Achievements */}
        {(filteredCertifications?.length > 0 || filteredAchievements?.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {filteredCertifications && filteredCertifications.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-teal-900 bg-teal-50 px-2 py-1 border-l-4 border-teal-700 mb-2">
                  Certifications
                </h2>
                <ul className="list-disc list-outside ml-4 text-xs text-gray-700 space-y-0.5">
                  {filteredCertifications.map((cert, i) => (
                    <li key={cert.id || i}>
                      <span className="font-medium">{cert.name}</span>
                      {cert.issuer && <span className="text-gray-500"> ({cert.issuer})</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {filteredAchievements && filteredAchievements.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-teal-900 bg-teal-50 px-2 py-1 border-l-4 border-teal-700 mb-2">
                  Achievements
                </h2>
                <ul className="list-disc list-outside ml-4 text-xs text-gray-700 space-y-0.5">
                  {filteredAchievements.map((ach, i) => (
                    <li key={ach.id || i}>{ach.description}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ==========================================================================
     TEMPLATE 4: TECHNICAL DENSE (High Density, Indigo Accent, Compact)
     ========================================================================== */
  if (activeTemplate === "compact") {
    return (
      <div
        id="resume-preview-document"
        className="bg-white text-gray-900 p-6 border border-gray-300 rounded shadow-sm max-w-2xl mx-auto font-sans text-left print:border-none print:shadow-none print:p-0 leading-snug"
        style={{ minHeight: "842px" }}
      >
        {/* Compact Header */}
        <header className="border-b border-indigo-200 pb-2.5 mb-3 flex flex-col sm:flex-row sm:items-baseline justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              {personalInfo.fullName || "Your Full Name"}
            </h1>
            {targetRole && (
              <p className="text-xs font-bold text-indigo-700 mt-0.5">
                {targetRole}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-gray-600 mt-1 sm:mt-0 font-mono">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>| {personalInfo.phone}</span>}
            {personalInfo.location && <span>| {personalInfo.location}</span>}
          </div>
        </header>

        {/* Summary */}
        {summary && (
          <section className="mb-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-0.5 mb-1 font-mono">
              // Summary
            </h2>
            <p className="text-xs text-gray-700 leading-tight">{summary}</p>
          </section>
        )}

        {/* Skills */}
        {filteredSkills && filteredSkills.length > 0 && (
          <section className="mb-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-0.5 mb-1 font-mono">
              // Technical Stack
            </h2>
            <div className="text-xs text-gray-800 leading-normal">
              {filteredSkills.map((skill, i) => (
                <span
                  key={i}
                  className="inline-block bg-indigo-50 text-indigo-900 border border-indigo-100 px-1.5 py-0.2 rounded mr-1 mb-1 text-[11px] font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {filteredExperience && filteredExperience.length > 0 && (
          <section className="mb-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-0.5 mb-1.5 font-mono">
              // Experience
            </h2>
            <div className="space-y-2.5">
              {filteredExperience.map((exp, i) => (
                <div key={exp.id || i} className="text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-gray-900">
                      {exp.title} &middot; <span className="text-indigo-800 font-semibold">{exp.company}</span>
                    </span>
                    <span className="text-gray-500 text-[11px] font-mono">{exp.duration}</span>
                  </div>
                  {exp.description && (
                    <ul className="list-disc list-outside ml-4 mt-0.5 text-gray-600 space-y-0.5 leading-snug">
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

        {/* Projects */}
        {filteredProjects && filteredProjects.length > 0 && (
          <section className="mb-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-0.5 mb-1.5 font-mono">
              // Projects
            </h2>
            <div className="space-y-2">
              {filteredProjects.map((proj, i) => (
                <div key={proj.id || i} className="text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-gray-900">{proj.title}</span>
                    {proj.technologies && (
                      <span className="text-[10px] text-indigo-600 font-mono">
                        Tech: {proj.technologies}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <ul className="list-disc list-outside ml-4 mt-0.5 text-gray-600 space-y-0.5 leading-snug">
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

        {/* Education */}
        {filteredEducation && filteredEducation.length > 0 && (
          <section className="mb-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-0.5 mb-1 font-mono">
              // Education
            </h2>
            <div className="space-y-1">
              {filteredEducation.map((edu, i) => (
                <div key={edu.id || i} className="flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900">{edu.degree}</span>
                    <span className="text-gray-600">, {edu.institution}</span>
                  </div>
                  <span className="text-gray-500 text-[11px] font-mono">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications & Achievements */}
        {(filteredCertifications?.length > 0 || filteredAchievements?.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredCertifications && filteredCertifications.length > 0 && (
              <section>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-0.5 mb-1 font-mono">
                  // Certifications
                </h2>
                <ul className="list-disc list-outside ml-4 text-[11px] text-gray-700 space-y-0.5">
                  {filteredCertifications.map((cert, i) => (
                    <li key={cert.id || i}>
                      {cert.name} {cert.issuer && <span className="text-gray-500">({cert.issuer})</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {filteredAchievements && filteredAchievements.length > 0 && (
              <section>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-0.5 mb-1 font-mono">
                  // Achievements
                </h2>
                <ul className="list-disc list-outside ml-4 text-[11px] text-gray-700 space-y-0.5">
                  {filteredAchievements.map((ach, i) => (
                    <li key={ach.id || i}>{ach.description}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ==========================================================================
     TEMPLATE 5: MINIMALIST CLEAN (Understated, Ample Whitespace)
     ========================================================================== */
  return (
    <div
      id="resume-preview-document"
      className="bg-white text-gray-900 p-8 border border-gray-200 rounded shadow-sm max-w-2xl mx-auto font-sans text-left print:border-none print:shadow-none print:p-0 leading-relaxed"
      style={{ minHeight: "842px" }}
    >
      {/* Clean Minimal Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-light tracking-tight text-gray-900">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        {targetRole && (
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mt-1">
            {targetRole}
          </p>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>/ {personalInfo.phone}</span>}
          {personalInfo.location && <span>/ {personalInfo.location}</span>}
        </div>
      </header>

      {/* Professional Summary */}
      {summary && (
        <section className="mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
            Profile
          </h2>
          <p className="text-xs text-gray-700 leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Skills */}
      {filteredSkills && filteredSkills.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
            Skills & Expertise
          </h2>
          <p className="text-xs text-gray-800 leading-relaxed">
            {filteredSkills.join("  &bull;  ")}
          </p>
        </section>
      )}

      {/* Experience */}
      {filteredExperience && filteredExperience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Experience
          </h2>
          <div className="space-y-3">
            {filteredExperience.map((exp, i) => (
              <div key={exp.id || i} className="text-xs">
                <div className="flex justify-between items-baseline font-medium text-gray-900">
                  <span>
                    <span className="font-semibold">{exp.title}</span>, {exp.company}
                  </span>
                  <span className="text-gray-400 font-normal text-[11px]">{exp.duration}</span>
                </div>
                {exp.description && (
                  <ul className="list-disc list-outside ml-4 mt-1 text-gray-600 space-y-0.5 leading-relaxed">
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

      {/* Projects */}
      {filteredProjects && filteredProjects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Projects
          </h2>
          <div className="space-y-3">
            {filteredProjects.map((proj, i) => (
              <div key={proj.id || i} className="text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-gray-900">{proj.title}</span>
                  {proj.technologies && (
                    <span className="text-gray-400 text-[11px]">
                      {proj.technologies}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <ul className="list-disc list-outside ml-4 mt-1 text-gray-600 space-y-0.5 leading-relaxed">
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

      {/* Education */}
      {filteredEducation && filteredEducation.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
            Education
          </h2>
          <div className="space-y-1.5">
            {filteredEducation.map((edu, i) => (
              <div key={edu.id || i} className="flex justify-between text-xs">
                <div>
                  <span className="font-semibold text-gray-900">{edu.degree}</span>
                  <span className="text-gray-500">, {edu.institution}</span>
                </div>
                <span className="text-gray-400 text-[11px]">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {filteredCertifications && filteredCertifications.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
            Certifications
          </h2>
          <ul className="list-disc list-outside ml-4 text-xs text-gray-600 space-y-0.5">
            {filteredCertifications.map((cert, i) => (
              <li key={cert.id || i}>
                <span className="font-medium text-gray-800">{cert.name}</span>
                {cert.issuer && <span className="text-gray-400"> ({cert.issuer})</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Achievements */}
      {filteredAchievements && filteredAchievements.length > 0 && (
        <section className="mb-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
            Achievements
          </h2>
          <ul className="list-disc list-outside ml-4 text-xs text-gray-600 space-y-0.5">
            {filteredAchievements.map((ach, i) => (
              <li key={ach.id || i}>{ach.description}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
