import React from "react";
import { ResumeData } from "@/types/resume";

interface ResumePreviewProps {
  data: ResumeData;
}

export default function ResumePreview({ data }: ResumePreviewProps) {
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

  return (
    <div
      id="resume-preview-document"
      className="bg-white text-gray-900 p-8 border border-gray-300 rounded shadow-sm max-w-2xl mx-auto font-sans text-left print:border-none print:shadow-none print:p-0"
      style={{ minHeight: "842px" }}
    >
      {/* Header Section */}
      <div className="border-b-2 border-gray-800 pb-3 mb-4 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-900">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        {targetRole && (
          <p className="text-sm font-semibold text-blue-700 tracking-wide mt-0.5">
            {targetRole}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-600 mt-2">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>&bull; {personalInfo.phone}</span>}
          {personalInfo.location && <span>&bull; {personalInfo.location}</span>}
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-1.5">
            Professional Summary
          </h2>
          <p className="text-xs text-gray-700 leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-1.5">
            Technical Skills
          </h2>
          <div className="flex flex-wrap gap-1.5 text-xs text-gray-800">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-1.5">
            Experience
          </h2>
          <div className="space-y-2">
            {experience.map((exp, i) => (
              <div key={exp.id || i} className="text-xs">
                <div className="flex justify-between font-semibold text-gray-800">
                  <span>{exp.title} &bull; {exp.company}</span>
                  <span className="text-gray-500 font-normal">{exp.duration}</span>
                </div>
                {exp.description && (
                  <p className="text-gray-600 mt-0.5">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-1.5">
            Projects
          </h2>
          <div className="space-y-2">
            {projects.map((proj, i) => (
              <div key={proj.id || i} className="text-xs">
                <div className="font-semibold text-gray-800">{proj.title}</div>
                <p className="text-gray-600 mt-0.5">{proj.description}</p>
                {proj.technologies && (
                  <p className="text-blue-700 text-[11px] mt-0.5">
                    Technologies: {proj.technologies}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-1.5">
            Education
          </h2>
          <div className="space-y-1.5">
            {education.map((edu, i) => (
              <div key={edu.id || i} className="flex justify-between text-xs">
                <div>
                  <span className="font-semibold text-gray-800">{edu.degree}</span>
                  <span className="text-gray-600"> &bull; {edu.institution}</span>
                </div>
                <span className="text-gray-500">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-1.5">
            Certifications
          </h2>
          <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
            {certifications.map((cert, i) => (
              <li key={cert.id || i}>
                {cert.name} {cert.issuer && <span className="text-gray-500">({cert.issuer})</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <section className="mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-1.5">
            Achievements
          </h2>
          <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
            {achievements.map((ach, i) => (
              <li key={ach.id || i}>{ach.description}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
