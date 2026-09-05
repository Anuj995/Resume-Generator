"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ResumeData, Education, Experience, Project, Certification, Achievement } from "@/types/resume";
import { extractResumeData } from "@/lib/resumeParser";
import ResumePreview from "@/components/ResumePreview";

export default function EditorPage() {
  const router = useRouter();

  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [skillsInput, setSkillsInput] = useState("");

  // Load resume data on mount
  useEffect(() => {
    const savedData = localStorage.getItem("resume_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setResumeData(parsed);
        setSkillsInput(parsed.skills ? parsed.skills.join(", ") : "");
        return;
      } catch (e) {
        console.error("Error loading resume data", e);
      }
    }

    // Fallback if not yet organized
    const savedText = localStorage.getItem("resume_raw_text") || "";
    const savedRole = localStorage.getItem("resume_target_role") || "";
    const generated = extractResumeData(savedText, savedRole);
    setResumeData(generated);
    setSkillsInput(generated.skills.join(", "));
  }, []);

  // Save changes to localStorage whenever resumeData changes
  const saveToStorage = (updated: ResumeData) => {
    setResumeData(updated);
    localStorage.setItem("resume_data", JSON.stringify(updated));
  };

  // Helper functions to edit fields
  const updatePersonalInfo = (field: string, value: string) => {
    if (!resumeData) return;
    const updated = {
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value,
      },
    };
    saveToStorage(updated);
  };

  const handleSkillsChange = (val: string) => {
    setSkillsInput(val);
    if (!resumeData) return;
    const skillList = val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const updated = { ...resumeData, skills: skillList };
    saveToStorage(updated);
  };

  // Add & Remove items helpers
  const addExperience = () => {
    if (!resumeData) return;
    const newExp: Experience = {
      id: Date.now().toString(),
      title: "New Role / Position",
      company: "Company Name",
      duration: "Duration",
      description: "Brief description of responsibilities and achievements.",
    };
    saveToStorage({
      ...resumeData,
      experience: [...resumeData.experience, newExp],
    });
  };

  const removeExperience = (index: number) => {
    if (!resumeData) return;
    const updatedExp = [...resumeData.experience];
    updatedExp.splice(index, 1);
    saveToStorage({ ...resumeData, experience: updatedExp });
  };

  const addProject = () => {
    if (!resumeData) return;
    const newProj: Project = {
      id: Date.now().toString(),
      title: "New Project",
      description: "Project description and key outcomes.",
      technologies: "Technologies used",
    };
    saveToStorage({ ...resumeData, projects: [...resumeData.projects, newProj] });
  };

  const removeProject = (index: number) => {
    if (!resumeData) return;
    const updatedProj = [...resumeData.projects];
    updatedProj.splice(index, 1);
    saveToStorage({ ...resumeData, projects: updatedProj });
  };

  const addEducation = () => {
    if (!resumeData) return;
    const newEdu: Education = {
      id: Date.now().toString(),
      degree: "Degree / Diploma",
      institution: "College / University Name",
      year: "Graduation Year",
    };
    saveToStorage({ ...resumeData, education: [...resumeData.education, newEdu] });
  };

  const removeEducation = (index: number) => {
    if (!resumeData) return;
    const updatedEdu = [...resumeData.education];
    updatedEdu.splice(index, 1);
    saveToStorage({ ...resumeData, education: updatedEdu });
  };

  const addCertification = () => {
    if (!resumeData) return;
    const newCert: Certification = {
      id: Date.now().toString(),
      name: "Certification Name",
      issuer: "Issuing Organization",
    };
    saveToStorage({
      ...resumeData,
      certifications: [...resumeData.certifications, newCert],
    });
  };

  const removeCertification = (index: number) => {
    if (!resumeData) return;
    const updatedCert = [...resumeData.certifications];
    updatedCert.splice(index, 1);
    saveToStorage({ ...resumeData, certifications: updatedCert });
  };

  const addAchievement = () => {
    if (!resumeData) return;
    const newAch: Achievement = {
      id: Date.now().toString(),
      description: "Describe your award, contest, or hackathon achievement.",
    };
    saveToStorage({
      ...resumeData,
      achievements: [...resumeData.achievements, newAch],
    });
  };

  const removeAchievement = (index: number) => {
    if (!resumeData) return;
    const updatedAch = [...resumeData.achievements];
    updatedAch.splice(index, 1);
    saveToStorage({ ...resumeData, achievements: updatedAch });
  };

  if (!resumeData) {
    return (
      <div className="py-12 text-center text-gray-500">
        Loading resume editor...
      </div>
    );
  }

  return (
    <div className="py-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Edit Your Resume
          </h1>
          <p className="text-sm text-gray-600">
            Target Job Role: <span className="font-semibold text-blue-600">{resumeData.targetRole}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/organize"
            className="text-sm border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded-md font-medium text-gray-700"
          >
            &larr; Back to Organize
          </Link>
          <Link
            href="/preview"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors"
          >
            Preview Resume &rarr;
          </Link>
        </div>
      </div>

      {/* Two Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: Editing Form */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-3 border-b pb-1.5">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Target Role / Subtitle</label>
                <input
                  type="text"
                  value={resumeData.targetRole}
                  onChange={(e) => {
                    const updated = { ...resumeData, targetRole: e.target.value };
                    saveToStorage(updated);
                  }}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={resumeData.personalInfo.email}
                  onChange={(e) => updatePersonalInfo("email", e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Phone</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-700 block mb-1">Location</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.location}
                  onChange={(e) => updatePersonalInfo("location", e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-2 border-b pb-1.5">
              Professional Summary
            </h2>
            <textarea
              rows={3}
              value={resumeData.summary}
              onChange={(e) => {
                const updated = { ...resumeData, summary: e.target.value };
                saveToStorage(updated);
              }}
              className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
            />
          </div>

          {/* Skills */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-1 border-b pb-1.5">
              Skills (comma separated)
            </h2>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => handleSkillsChange(e.target.value)}
              placeholder="e.g. React, Next.js, TypeScript, Git"
              className="w-full border border-gray-300 rounded p-2 text-sm mt-2"
            />
          </div>

          {/* Experience Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3 border-b pb-1.5">
              <h2 className="text-base font-bold text-gray-900">Experience</h2>
              <button
                type="button"
                onClick={addExperience}
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold px-2.5 py-1 rounded"
              >
                + Add Experience
              </button>
            </div>
            {resumeData.experience.map((exp, idx) => (
              <div key={exp.id || idx} className="p-3 bg-gray-50 border border-gray-200 rounded mb-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500">Position #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeExperience(idx)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={exp.title}
                    placeholder="Job Title"
                    onChange={(e) => {
                      const updated = [...resumeData.experience];
                      updated[idx].title = e.target.value;
                      saveToStorage({ ...resumeData, experience: updated });
                    }}
                    className="border rounded p-1.5 text-xs bg-white"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    placeholder="Company"
                    onChange={(e) => {
                      const updated = [...resumeData.experience];
                      updated[idx].company = e.target.value;
                      saveToStorage({ ...resumeData, experience: updated });
                    }}
                    className="border rounded p-1.5 text-xs bg-white"
                  />
                </div>
                <input
                  type="text"
                  value={exp.duration}
                  placeholder="Duration (e.g. June 2024 - Aug 2024)"
                  onChange={(e) => {
                    const updated = [...resumeData.experience];
                    updated[idx].duration = e.target.value;
                    saveToStorage({ ...resumeData, experience: updated });
                  }}
                  className="w-full border rounded p-1.5 text-xs bg-white"
                />
                <textarea
                  rows={2}
                  value={exp.description}
                  placeholder="Responsibilities and key contributions"
                  onChange={(e) => {
                    const updated = [...resumeData.experience];
                    updated[idx].description = e.target.value;
                    saveToStorage({ ...resumeData, experience: updated });
                  }}
                  className="w-full border rounded p-1.5 text-xs bg-white"
                />
              </div>
            ))}
          </div>

          {/* Projects Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3 border-b pb-1.5">
              <h2 className="text-base font-bold text-gray-900">Projects</h2>
              <button
                type="button"
                onClick={addProject}
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold px-2.5 py-1 rounded"
              >
                + Add Project
              </button>
            </div>
            {resumeData.projects.map((proj, idx) => (
              <div key={proj.id || idx} className="p-3 bg-gray-50 border border-gray-200 rounded mb-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500">Project #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeProject(idx)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  value={proj.title}
                  placeholder="Project Title"
                  onChange={(e) => {
                    const updated = [...resumeData.projects];
                    updated[idx].title = e.target.value;
                    saveToStorage({ ...resumeData, projects: updated });
                  }}
                  className="w-full border rounded p-1.5 text-xs bg-white"
                />
                <input
                  type="text"
                  value={proj.technologies || ""}
                  placeholder="Technologies (e.g. React, Tailwind CSS)"
                  onChange={(e) => {
                    const updated = [...resumeData.projects];
                    updated[idx].technologies = e.target.value;
                    saveToStorage({ ...resumeData, projects: updated });
                  }}
                  className="w-full border rounded p-1.5 text-xs bg-white"
                />
                <textarea
                  rows={2}
                  value={proj.description}
                  placeholder="Project description"
                  onChange={(e) => {
                    const updated = [...resumeData.projects];
                    updated[idx].description = e.target.value;
                    saveToStorage({ ...resumeData, projects: updated });
                  }}
                  className="w-full border rounded p-1.5 text-xs bg-white"
                />
              </div>
            ))}
          </div>

          {/* Education Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3 border-b pb-1.5">
              <h2 className="text-base font-bold text-gray-900">Education</h2>
              <button
                type="button"
                onClick={addEducation}
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold px-2.5 py-1 rounded"
              >
                + Add Education
              </button>
            </div>
            {resumeData.education.map((edu, idx) => (
              <div key={edu.id || idx} className="p-3 bg-gray-50 border border-gray-200 rounded mb-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500">Education #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeEducation(idx)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={edu.degree}
                    placeholder="Degree"
                    onChange={(e) => {
                      const updated = [...resumeData.education];
                      updated[idx].degree = e.target.value;
                      saveToStorage({ ...resumeData, education: updated });
                    }}
                    className="border rounded p-1.5 text-xs bg-white"
                  />
                  <input
                    type="text"
                    value={edu.institution}
                    placeholder="Institution / College"
                    onChange={(e) => {
                      const updated = [...resumeData.education];
                      updated[idx].institution = e.target.value;
                      saveToStorage({ ...resumeData, education: updated });
                    }}
                    className="border rounded p-1.5 text-xs bg-white"
                  />
                </div>
                <input
                  type="text"
                  value={edu.year}
                  placeholder="Year (e.g. 2021 - 2025)"
                  onChange={(e) => {
                    const updated = [...resumeData.education];
                    updated[idx].year = e.target.value;
                    saveToStorage({ ...resumeData, education: updated });
                  }}
                  className="w-full border rounded p-1.5 text-xs bg-white"
                />
              </div>
            ))}
          </div>

          {/* Certifications & Achievements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Certifications */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2 border-b pb-1">
                <h2 className="text-sm font-bold text-gray-900">Certifications</h2>
                <button
                  type="button"
                  onClick={addCertification}
                  className="text-[11px] text-blue-600 font-semibold"
                >
                  + Add
                </button>
              </div>
              {resumeData.certifications.map((cert, idx) => (
                <div key={cert.id || idx} className="flex items-center gap-1.5 mb-2">
                  <input
                    type="text"
                    value={cert.name}
                    placeholder="Certification Name"
                    onChange={(e) => {
                      const updated = [...resumeData.certifications];
                      updated[idx].name = e.target.value;
                      saveToStorage({ ...resumeData, certifications: updated });
                    }}
                    className="flex-1 border rounded p-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeCertification(idx)}
                    className="text-red-600 text-xs px-1"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2 border-b pb-1">
                <h2 className="text-sm font-bold text-gray-900">Achievements</h2>
                <button
                  type="button"
                  onClick={addAchievement}
                  className="text-[11px] text-blue-600 font-semibold"
                >
                  + Add
                </button>
              </div>
              {resumeData.achievements.map((ach, idx) => (
                <div key={ach.id || idx} className="flex items-center gap-1.5 mb-2">
                  <input
                    type="text"
                    value={ach.description}
                    placeholder="Achievement details"
                    onChange={(e) => {
                      const updated = [...resumeData.achievements];
                      updated[idx].description = e.target.value;
                      saveToStorage({ ...resumeData, achievements: updated });
                    }}
                    className="flex-1 border rounded p-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeAchievement(idx)}
                    className="text-red-600 text-xs px-1"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Resume Preview */}
        <div className="lg:sticky lg:top-20">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Live Resume Preview
            </span>
            <span className="text-[11px] text-gray-400">Updates as you edit</span>
          </div>
          <ResumePreview data={resumeData} />
        </div>
      </div>
    </div>
  );
}
