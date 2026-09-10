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
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  // Load raw input, target role, and uploaded resume name from localStorage
  useEffect(() => {
    const savedText = localStorage.getItem("resume_raw_text") || "";
    const savedRole = localStorage.getItem("resume_target_role") || "";
    const savedFileName = localStorage.getItem("resume_file_name") || "";

    setRawText(savedText);
    setTargetRole(savedRole);
    setUploadedFileName(savedFileName);

    // Always extract fresh structured data for the uploaded resume or input text
    const structured = extractResumeData(savedText, savedRole, savedFileName);
    setResumeData(structured);
  }, []);

  // Save changes and navigate to Resume Editor
  const handleGenerateResume = () => {
    if (resumeData) {
      localStorage.setItem("resume_data", JSON.stringify(resumeData));
    }
    router.push("/editor");
  };

  // Helper functions to update data fields in a beginner-friendly way
  const updatePersonalInfo = (field: string, value: string) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value,
      },
    });
  };

  const updateSkills = (skillsText: string) => {
    if (!resumeData) return;
    const list = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setResumeData({
      ...resumeData,
      skills: list,
    });
  };

  // Experience handlers
  const updateExperience = (index: number, field: string, value: string) => {
    if (!resumeData) return;
    const updated = [...resumeData.experience];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, experience: updated });
  };

  const addExperience = () => {
    if (!resumeData) return;
    const newExp = {
      id: `exp-${Date.now()}`,
      title: "Job Title",
      company: "Company Name",
      duration: "Duration",
      description: "Brief description of responsibilities and achievements.",
    };
    setResumeData({ ...resumeData, experience: [...resumeData.experience, newExp] });
  };

  const removeExperience = (index: number) => {
    if (!resumeData) return;
    const updated = resumeData.experience.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, experience: updated });
  };

  // Projects handlers
  const updateProject = (index: number, field: string, value: string) => {
    if (!resumeData) return;
    const updated = [...resumeData.projects];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, projects: updated });
  };

  const addProject = () => {
    if (!resumeData) return;
    const newProj = {
      id: `proj-${Date.now()}`,
      title: "Project Name",
      description: "Project details and key features.",
      technologies: "React, JavaScript, CSS",
    };
    setResumeData({ ...resumeData, projects: [...resumeData.projects, newProj] });
  };

  const removeProject = (index: number) => {
    if (!resumeData) return;
    const updated = resumeData.projects.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, projects: updated });
  };

  // Education handlers
  const updateEducation = (index: number, field: string, value: string) => {
    if (!resumeData) return;
    const updated = [...resumeData.education];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, education: updated });
  };

  const addEducation = () => {
    if (!resumeData) return;
    const newEdu = {
      id: `edu-${Date.now()}`,
      degree: "Degree / Course",
      institution: "College / University",
      year: "Year",
    };
    setResumeData({ ...resumeData, education: [...resumeData.education, newEdu] });
  };

  const removeEducation = (index: number) => {
    if (!resumeData) return;
    const updated = resumeData.education.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, education: updated });
  };

  // Certifications handlers
  const updateCertification = (index: number, field: string, value: string) => {
    if (!resumeData) return;
    const updated = [...resumeData.certifications];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, certifications: updated });
  };

  const addCertification = () => {
    if (!resumeData) return;
    const newCert = {
      id: `cert-${Date.now()}`,
      name: "Certification Name",
      issuer: "Issuing Organization",
    };
    setResumeData({ ...resumeData, certifications: [...resumeData.certifications, newCert] });
  };

  const removeCertification = (index: number) => {
    if (!resumeData) return;
    const updated = resumeData.certifications.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, certifications: updated });
  };

  // Achievements handlers
  const updateAchievement = (index: number, value: string) => {
    if (!resumeData) return;
    const updated = [...resumeData.achievements];
    updated[index] = { ...updated[index], description: value };
    setResumeData({ ...resumeData, achievements: updated });
  };

  const addAchievement = () => {
    if (!resumeData) return;
    const newAch = {
      id: `ach-${Date.now()}`,
      description: "Key achievement or milestone.",
    };
    setResumeData({ ...resumeData, achievements: [...resumeData.achievements, newAch] });
  };

  const removeAchievement = (index: number) => {
    if (!resumeData) return;
    const updated = resumeData.achievements.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, achievements: updated });
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
      <p className="text-gray-600 mb-4 text-sm sm:text-base">
        Review and customize the information extracted for{" "}
        <span className="font-semibold text-blue-600">{targetRole || "your selected role"}</span>.
      </p>

      {/* Uploaded Resume Notice Banner */}
      {uploadedFileName && (
        <div className="mb-6 flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm shadow-sm">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span className="font-semibold">Extracted from Resume:</span> {uploadedFileName}
            <p className="text-xs text-green-700 mt-0.5">
              All resume fields have been extracted into the editable forms below.
            </p>
          </div>
        </div>
      )}

      {/* Structured Sections Forms */}
      <div className="space-y-6 mb-8">
        {/* 1. Personal Information Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 border-b border-gray-100 pb-2">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={resumeData.personalInfo.fullName}
                onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter email address"
                value={resumeData.personalInfo.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Phone</label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={resumeData.personalInfo.phone}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Location</label>
              <input
                type="text"
                placeholder="Enter location (e.g. City, Country)"
                value={resumeData.personalInfo.location}
                onChange={(e) => updatePersonalInfo("location", e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Professional Summary Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2 border-b border-gray-100 pb-2">
            Professional Summary
          </h2>
          <textarea
            rows={3}
            value={resumeData.summary}
            onChange={(e) =>
              setResumeData({ ...resumeData, summary: e.target.value })
            }
            className="w-full border border-gray-300 rounded p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* 3. Skills Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2 border-b border-gray-100 pb-2">
            Skills (Comma separated)
          </h2>
          <input
            type="text"
            value={resumeData.skills.join(", ")}
            onChange={(e) => updateSkills(e.target.value)}
            placeholder="e.g. React, JavaScript, HTML, CSS, Git, Python"
            className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3"
          />
          <div className="flex flex-wrap gap-1.5">
            {resumeData.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-50 border border-blue-200 text-blue-800 px-2.5 py-0.5 rounded text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* 4. Experience Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              Work Experience
            </h2>
            <button
              type="button"
              onClick={addExperience}
              className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded font-medium cursor-pointer"
            >
              + Add Experience
            </button>
          </div>

          <div className="space-y-4">
            {resumeData.experience.map((exp, index) => (
              <div key={exp.id || index} className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700">Experience #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="text-xs text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={exp.title}
                    onChange={(e) => updateExperience(index, "title", e.target.value)}
                    className="border border-gray-300 rounded p-1.5 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, "company", e.target.value)}
                    className="border border-gray-300 rounded p-1.5 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g. 6 Months)"
                    value={exp.duration}
                    onChange={(e) => updateExperience(index, "duration", e.target.value)}
                    className="border border-gray-300 rounded p-1.5 text-xs bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Responsibilities & achievements..."
                  value={exp.description}
                  onChange={(e) => updateExperience(index, "description", e.target.value)}
                  className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 5. Projects Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              Projects
            </h2>
            <button
              type="button"
              onClick={addProject}
              className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded font-medium cursor-pointer"
            >
              + Add Project
            </button>
          </div>

          <div className="space-y-4">
            {resumeData.projects.map((proj, index) => (
              <div key={proj.id || index} className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700">Project #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="text-xs text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={proj.title}
                    onChange={(e) => updateProject(index, "title", e.target.value)}
                    className="border border-gray-300 rounded p-1.5 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Technologies (e.g. React, Next.js)"
                    value={proj.technologies || ""}
                    onChange={(e) => updateProject(index, "technologies", e.target.value)}
                    className="border border-gray-300 rounded p-1.5 text-xs bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Project details..."
                  value={proj.description}
                  onChange={(e) => updateProject(index, "description", e.target.value)}
                  className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 6. Education Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              Education
            </h2>
            <button
              type="button"
              onClick={addEducation}
              className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded font-medium cursor-pointer"
            >
              + Add Education
            </button>
          </div>

          <div className="space-y-3">
            {resumeData.education.map((edu, index) => (
              <div key={edu.id || index} className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700">Education #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-xs text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Degree / Course"
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, "degree", e.target.value)}
                    className="border border-gray-300 rounded p-1.5 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Institution / College"
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, "institution", e.target.value)}
                    className="border border-gray-300 rounded p-1.5 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Year (e.g. 2020 - 2024)"
                    value={edu.year}
                    onChange={(e) => updateEducation(index, "year", e.target.value)}
                    className="border border-gray-300 rounded p-1.5 text-xs bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Certifications & Achievements Forms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Certifications */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                Certifications
              </h2>
              <button
                type="button"
                onClick={addCertification}
                className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded font-medium cursor-pointer"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {resumeData.certifications.map((cert, index) => (
                <div key={cert.id || index} className="p-2 bg-gray-50 border border-gray-200 rounded flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Certificate Name"
                      value={cert.name}
                      onChange={(e) => updateCertification(index, "name", e.target.value)}
                      className="border border-gray-300 rounded p-1 text-xs bg-white w-full mr-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      &times;
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Issuer / Platform"
                    value={cert.issuer || ""}
                    onChange={(e) => updateCertification(index, "issuer", e.target.value)}
                    className="border border-gray-300 rounded p-1 text-xs bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                Achievements
              </h2>
              <button
                type="button"
                onClick={addAchievement}
                className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded font-medium cursor-pointer"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {resumeData.achievements.map((ach, index) => (
                <div key={ach.id || index} className="p-2 bg-gray-50 border border-gray-200 rounded flex items-center justify-between gap-2">
                  <input
                    type="text"
                    placeholder="Achievement details"
                    value={ach.description}
                    onChange={(e) => updateAchievement(index, e.target.value)}
                    className="border border-gray-300 rounded p-1 text-xs bg-white w-full"
                  />
                  <button
                    type="button"
                    onClick={() => removeAchievement(index)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Action Buttons */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <Link
          href="/templates"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          &larr; Back to Templates
        </Link>
        <button
          onClick={handleGenerateResume}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-md text-sm transition-colors shadow-sm cursor-pointer"
        >
          Generate Resume &rarr;
        </button>
      </div>
    </div>
  );
}
