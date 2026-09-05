"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ResumeData } from "@/types/resume";
import { extractResumeData } from "@/lib/resumeParser";

export default function OrganizePage() {
  const router = useRouter();

  const [rawText, setRawText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  // Load raw input and target role from localStorage
  useEffect(() => {
    const savedText = localStorage.getItem("resume_raw_text") || "";
    const savedRole = localStorage.getItem("resume_target_role") || "";
    const savedResumeData = localStorage.getItem("resume_data");

    setRawText(savedText);
    setTargetRole(savedRole);

    if (savedResumeData) {
      try {
        setResumeData(JSON.parse(savedResumeData));
        return;
      } catch (e) {
        console.error("Failed to parse saved resume data", e);
      }
    }

    // Extract structured data from raw text and role
    const structured = extractResumeData(savedText, savedRole);
    setResumeData(structured);
  }, []);

  // Save changes and navigate to Resume Editor
  const handleGenerateResume = () => {
    if (resumeData) {
      localStorage.setItem("resume_data", JSON.stringify(resumeData));
    }
    router.push("/editor");
  };

  if (!resumeData) {
    return (
      <div className="py-12 text-center text-gray-500">
        Loading organized information...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Page Heading */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Organized Information
      </h1>
      <p className="text-gray-600 mb-6 text-sm sm:text-base">
        Here is how your information has been structured for the target role:{" "}
        <span className="font-semibold text-blue-600">{targetRole || "Not specified"}</span>.
      </p>

      {/* Structured Sections Cards */}
      <div className="space-y-4 mb-8">
        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 border-b border-gray-100 pb-2">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <label className="text-xs text-gray-500 block">Full Name</label>
              <input
                type="text"
                value={resumeData.personalInfo.fullName}
                onChange={(e) =>
                  setResumeData({
                    ...resumeData,
                    personalInfo: { ...resumeData.personalInfo, fullName: e.target.value },
                  })
                }
                className="w-full border border-gray-300 rounded p-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Email</label>
              <input
                type="email"
                value={resumeData.personalInfo.email}
                onChange={(e) =>
                  setResumeData({
                    ...resumeData,
                    personalInfo: { ...resumeData.personalInfo, email: e.target.value },
                  })
                }
                className="w-full border border-gray-300 rounded p-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Phone</label>
              <input
                type="text"
                value={resumeData.personalInfo.phone}
                onChange={(e) =>
                  setResumeData({
                    ...resumeData,
                    personalInfo: { ...resumeData.personalInfo, phone: e.target.value },
                  })
                }
                className="w-full border border-gray-300 rounded p-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Location</label>
              <input
                type="text"
                value={resumeData.personalInfo.location}
                onChange={(e) =>
                  setResumeData({
                    ...resumeData,
                    personalInfo: { ...resumeData.personalInfo, location: e.target.value },
                  })
                }
                className="w-full border border-gray-300 rounded p-1.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2 border-b border-gray-100 pb-2">
            Professional Summary
          </h2>
          <textarea
            rows={3}
            value={resumeData.summary}
            onChange={(e) =>
              setResumeData({ ...resumeData, summary: e.target.value })
            }
            className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
          />
        </div>

        {/* Skills */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2 border-b border-gray-100 pb-2">
            Skills Extracted
          </h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {resumeData.skills.length > 0 ? (
              resumeData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-50 border border-blue-200 text-blue-800 px-2.5 py-1 rounded text-xs font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500 italic">No specific skills auto-detected. You can add them in the editor.</span>
            )}
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2 border-b border-gray-100 pb-2">
            Experience
          </h2>
          {resumeData.experience.length > 0 ? (
            resumeData.experience.map((exp, index) => (
              <div key={exp.id || index} className="mb-2 text-sm">
                <p className="font-semibold text-gray-800">{exp.title} - {exp.company}</p>
                <p className="text-xs text-gray-500">{exp.duration}</p>
                <p className="text-xs text-gray-600 mt-1">{exp.description}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 italic">No previous experience mentioned.</p>
          )}
        </div>

        {/* Projects */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2 border-b border-gray-100 pb-2">
            Projects
          </h2>
          {resumeData.projects.length > 0 ? (
            resumeData.projects.map((proj, index) => (
              <div key={proj.id || index} className="mb-2 text-sm">
                <p className="font-semibold text-gray-800">{proj.title}</p>
                <p className="text-xs text-gray-600">{proj.description}</p>
                {proj.technologies && (
                  <p className="text-xs text-blue-600 mt-0.5">Tech: {proj.technologies}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 italic">No projects extracted.</p>
          )}
        </div>

        {/* Certifications & Achievements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2 border-b border-gray-100 pb-2">
              Certifications
            </h2>
            {resumeData.certifications.length > 0 ? (
              resumeData.certifications.map((cert, index) => (
                <div key={cert.id || index} className="text-xs text-gray-700 mb-1">
                  &bull; {cert.name} {cert.issuer && `(${cert.issuer})`}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">No certifications extracted.</p>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2 border-b border-gray-100 pb-2">
              Achievements
            </h2>
            {resumeData.achievements.length > 0 ? (
              resumeData.achievements.map((ach, index) => (
                <div key={ach.id || index} className="text-xs text-gray-700 mb-1">
                  &bull; {ach.description}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">No achievements extracted.</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation & Action Buttons */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <Link
          href="/role"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          &larr; Back to Role Selection
        </Link>
        <button
          onClick={handleGenerateResume}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-md text-sm transition-colors shadow-sm"
        >
          Generate Resume
        </button>
      </div>
    </div>
  );
}
