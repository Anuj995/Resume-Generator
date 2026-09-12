"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ResumeData, Education, Experience, Project, Certification, Achievement } from "@/types/resume";
import { extractResumeData } from "@/lib/resumeParser";
import { RESUME_TEMPLATES, DEFAULT_TEMPLATE_ID } from "@/data/templateData";
import ResumePreview from "@/components/ResumePreview";
import { enhanceAll, EnhanceField } from "@/lib/useAIEnhance";

// ─── Inline Enhance Panel ────────────────────────────────────────────────────

interface EnhancePanelProps {
  original: string;
  enhanced: string | null;
  loading: boolean;
  error: string | null;
  onAccept: (text: string) => void;
  onDiscard: () => void;
}

function EnhancePanel({ original, enhanced, loading, error, onAccept, onDiscard }: EnhancePanelProps) {
  if (!loading && !enhanced && !error) return null;

  return (
    <div className="mt-2 rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-purple-600">
        <span className="text-white text-xs font-semibold">✨ AI Enhancement</span>
        {loading && (
          <span className="ml-auto flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        )}
      </div>

      <div className="p-3 space-y-3">
        {loading && (
          <div className="space-y-2">
            <div className="h-3 bg-violet-100 rounded animate-pulse w-full" />
            <div className="h-3 bg-violet-100 rounded animate-pulse w-4/5" />
            <div className="h-3 bg-violet-100 rounded animate-pulse w-3/5" />
            <p className="text-[11px] text-violet-500 italic">Enhancing with Gemini AI…</p>
          </div>
        )}

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
            ⚠️ {error}
            <button onClick={onDiscard} className="ml-2 underline text-red-700 font-medium">
              Dismiss
            </button>
          </div>
        )}

        {enhanced && !loading && (
          <>
            {/* Side-by-side diff */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <p className="font-semibold text-gray-400 mb-1 uppercase tracking-wider">Original</p>
                <p className="text-gray-500 bg-white rounded p-2 border border-gray-200 leading-relaxed line-through decoration-red-300">
                  {original}
                </p>
              </div>
              <div>
                <p className="font-semibold text-violet-600 mb-1 uppercase tracking-wider">Enhanced ✨</p>
                <p className="text-gray-800 bg-white rounded p-2 border border-violet-200 leading-relaxed font-medium">
                  {enhanced}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={onDiscard}
                className="text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                ✕ Discard
              </button>
              <button
                onClick={() => onAccept(enhanced)}
                className="text-xs px-4 py-1.5 rounded bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                ✓ Accept
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sparkle Button ──────────────────────────────────────────────────────────

function SparkleButton({ onClick, loading, title = "Enhance with AI" }: { onClick: () => void; loading: boolean; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title={title}
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md transition-all ${
        loading
          ? "bg-violet-100 text-violet-400 cursor-wait"
          : "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:opacity-90 shadow-sm"
      }`}
    >
      {loading ? (
        <span className="animate-spin inline-block">✨</span>
      ) : (
        "✨"
      )}
      {loading ? "Enhancing…" : "Enhance"}
    </button>
  );
}

// ─── Field-level enhance state ────────────────────────────────────────────────

interface FieldEnhance {
  loading: boolean;
  enhanced: string | null;
  error: string | null;
}

const emptyField: FieldEnhance = { loading: false, enhanced: null, error: null };

// ─── Main Editor Page ─────────────────────────────────────────────────────────

export default function EditorPage() {

  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [skillsInput, setSkillsInput] = useState("");
  const [templateId, setTemplateId] = useState<string>(DEFAULT_TEMPLATE_ID);

  // Per-field enhance states
  const [summaryEnhance, setSummaryEnhance] = useState<FieldEnhance>(emptyField);
  // Key: `exp-{idx}` or `proj-{idx}`
  const [fieldEnhance, setFieldEnhance] = useState<Record<string, FieldEnhance>>({});

  // Global "Enhance All" state
  const [enhancingAll, setEnhancingAll] = useState(false);
  const [enhanceAllStatus, setEnhanceAllStatus] = useState<string | null>(null);

  // Load resume data on mount
  useEffect(() => {
    const savedTemplate = localStorage.getItem("resume_template") || DEFAULT_TEMPLATE_ID;
    setTemplateId(savedTemplate);

    const savedData = localStorage.getItem("resume_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setResumeData(parsed);
        setSkillsInput(parsed.skills ? parsed.skills.join(", ") : "");
        if (parsed.templateId) {
          setTemplateId(parsed.templateId);
        }
        return;
      } catch (e) {
        console.error("Error loading resume data", e);
      }
    }

    const savedText = localStorage.getItem("resume_raw_text") || "";
    const savedRole = localStorage.getItem("resume_target_role") || "";
    const savedFileName = localStorage.getItem("resume_file_name") || "";
    const generated = extractResumeData(savedText, savedRole, savedFileName);
    generated.templateId = savedTemplate;
    setResumeData(generated);
    setSkillsInput(generated.skills.join(", "));
  }, []);

  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    localStorage.setItem("resume_template", id);
    if (resumeData) {
      const updated = { ...resumeData, templateId: id };
      saveToStorage(updated);
    }
  };

  const saveToStorage = (updated: ResumeData) => {
    setResumeData(updated);
    localStorage.setItem("resume_data", JSON.stringify(updated));
  };

  const updatePersonalInfo = (field: string, value: string) => {
    if (!resumeData) return;
    saveToStorage({
      ...resumeData,
      personalInfo: { ...resumeData.personalInfo, [field]: value },
    });
  };

  const handleSkillsChange = (val: string) => {
    setSkillsInput(val);
    if (!resumeData) return;
    const skillList = val.split(",").map((s) => s.trim()).filter(Boolean);
    saveToStorage({ ...resumeData, skills: skillList });
  };

  // ── Add / Remove helpers ────────────────────────────────────────────────────

  const addExperience = () => {
    if (!resumeData) return;
    const newExp: Experience = {
      id: Date.now().toString(),
      title: "New Role / Position",
      company: "Company Name",
      duration: "Duration",
      description: "Brief description of responsibilities and achievements.",
    };
    saveToStorage({ ...resumeData, experience: [...resumeData.experience, newExp] });
  };

  const removeExperience = (index: number) => {
    if (!resumeData) return;
    const updated = [...resumeData.experience];
    updated.splice(index, 1);
    saveToStorage({ ...resumeData, experience: updated });
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
    const updated = [...resumeData.projects];
    updated.splice(index, 1);
    saveToStorage({ ...resumeData, projects: updated });
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
    const updated = [...resumeData.education];
    updated.splice(index, 1);
    saveToStorage({ ...resumeData, education: updated });
  };

  const addCertification = () => {
    if (!resumeData) return;
    const newCert: Certification = {
      id: Date.now().toString(),
      name: "Certification Name",
      issuer: "Issuing Organization",
    };
    saveToStorage({ ...resumeData, certifications: [...resumeData.certifications, newCert] });
  };

  const removeCertification = (index: number) => {
    if (!resumeData) return;
    const updated = [...resumeData.certifications];
    updated.splice(index, 1);
    saveToStorage({ ...resumeData, certifications: updated });
  };

  const addAchievement = () => {
    if (!resumeData) return;
    const newAch: Achievement = {
      id: Date.now().toString(),
      description: "Describe your award, contest, or hackathon achievement.",
    };
    saveToStorage({ ...resumeData, achievements: [...resumeData.achievements, newAch] });
  };

  const removeAchievement = (index: number) => {
    if (!resumeData) return;
    const updated = [...resumeData.achievements];
    updated.splice(index, 1);
    saveToStorage({ ...resumeData, achievements: updated });
  };

  // ── Per-field enhance helpers ───────────────────────────────────────────────

  const callEnhanceAPI = async (
    field: EnhanceField,
    content: string,
    targetRole: string
  ): Promise<{ enhanced: string | null; error: string | null }> => {
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, content, targetRole }),
      });
      const data = await res.json();
      if (!res.ok) return { enhanced: null, error: data.error || "Enhancement failed" };
      return { enhanced: data.enhanced, error: null };
    } catch (err) {
      return { enhanced: null, error: err instanceof Error ? err.message : "Network error" };
    }
  };

  const enhanceSummary = async () => {
    if (!resumeData) return;
    setSummaryEnhance({ loading: true, enhanced: null, error: null });
    const { enhanced, error } = await callEnhanceAPI("summary", resumeData.summary, resumeData.targetRole);
    setSummaryEnhance({ loading: false, enhanced, error });
  };

  const enhanceExpDescription = async (idx: number) => {
    if (!resumeData) return;
    const key = `exp-${idx}`;
    setFieldEnhance((prev) => ({ ...prev, [key]: { loading: true, enhanced: null, error: null } }));
    const { enhanced, error } = await callEnhanceAPI(
      "experience",
      resumeData.experience[idx].description,
      resumeData.targetRole
    );
    setFieldEnhance((prev) => ({ ...prev, [key]: { loading: false, enhanced, error } }));
  };

  const enhanceProjDescription = async (idx: number) => {
    if (!resumeData) return;
    const key = `proj-${idx}`;
    setFieldEnhance((prev) => ({ ...prev, [key]: { loading: true, enhanced: null, error: null } }));
    const { enhanced, error } = await callEnhanceAPI(
      "project",
      resumeData.projects[idx].description,
      resumeData.targetRole
    );
    setFieldEnhance((prev) => ({ ...prev, [key]: { loading: false, enhanced, error } }));
  };

  const clearFieldEnhance = (key: string) => {
    setFieldEnhance((prev) => ({ ...prev, [key]: emptyField }));
  };

  // ── Enhance All ─────────────────────────────────────────────────────────────

  const handleEnhanceAll = async () => {
    if (!resumeData) return;
    setEnhancingAll(true);
    setEnhanceAllStatus("Enhancing all fields with Gemini AI…");

    const fields: { field: EnhanceField; content: string }[] = [
      { field: "summary", content: resumeData.summary },
      ...resumeData.experience.map((e) => ({ field: "experience" as EnhanceField, content: e.description })),
      ...resumeData.projects.map((p) => ({ field: "project" as EnhanceField, content: p.description })),
    ];

    try {
      const results = await enhanceAll(fields, resumeData.targetRole);

      let updated = { ...resumeData };
      let ri = 0;

      // Summary
      if (results[ri]) updated = { ...updated, summary: results[ri] as string };
      ri++;

      // Experience
      const newExp = updated.experience.map((e, i) => ({
        ...e,
        description: results[ri + i] ?? e.description,
      }));
      ri += resumeData.experience.length;
      updated = { ...updated, experience: newExp };

      // Projects
      const newProj = updated.projects.map((p, i) => ({
        ...p,
        description: results[ri + i] ?? p.description,
      }));
      updated = { ...updated, projects: newProj };

      saveToStorage(updated);
      setEnhanceAllStatus("✅ All fields enhanced successfully!");
    } catch {
      setEnhanceAllStatus("⚠️ Some fields could not be enhanced. Check your API key.");
    } finally {
      setEnhancingAll(false);
      setTimeout(() => setEnhanceAllStatus(null), 4000);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

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
            Target Job Role:{" "}
            <span className="font-semibold text-blue-600">{resumeData.targetRole}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Enhance All Button */}
          <button
            type="button"
            onClick={handleEnhanceAll}
            disabled={enhancingAll}
            className={`relative overflow-hidden text-sm font-semibold px-4 py-2 rounded-md shadow-sm transition-all ${
              enhancingAll
                ? "bg-violet-100 text-violet-400 cursor-wait"
                : "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90"
            }`}
          >
            {enhancingAll && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
            {enhancingAll ? "✨ Enhancing All…" : "✨ Enhance All with AI"}
          </button>

          <Link
            href="/templates"
            className="text-sm border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded-md font-medium text-gray-700"
          >
            Change Template
          </Link>
          <Link
            href="/organize"
            className="text-sm border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded-md font-medium text-gray-700"
          >
            ← Back to Organize
          </Link>
          <Link
            href="/preview"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors"
          >
            Preview Resume →
          </Link>
        </div>
      </div>

      {/* Enhance All Status Banner */}
      {enhanceAllStatus && (
        <div
          className={`mb-4 text-sm px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 ${
            enhanceAllStatus.startsWith("✅")
              ? "bg-green-50 text-green-700 border border-green-200"
              : enhanceAllStatus.startsWith("⚠️")
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-violet-50 text-violet-700 border border-violet-200"
          }`}
        >
          {!enhanceAllStatus.startsWith("✅") && !enhanceAllStatus.startsWith("⚠️") && (
            <span className="animate-spin">✨</span>
          )}
          {enhanceAllStatus}
        </div>
      )}

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
                  onChange={(e) => saveToStorage({ ...resumeData, targetRole: e.target.value })}
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
            <div className="flex items-center justify-between mb-2 border-b pb-1.5">
              <h2 className="text-base font-bold text-gray-900">Professional Summary</h2>
              <SparkleButton
                onClick={enhanceSummary}
                loading={summaryEnhance.loading}
                title="Enhance your summary with AI"
              />
            </div>
            <textarea
              rows={3}
              value={resumeData.summary}
              onChange={(e) => saveToStorage({ ...resumeData, summary: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
            />
            <EnhancePanel
              original={resumeData.summary}
              enhanced={summaryEnhance.enhanced}
              loading={summaryEnhance.loading}
              error={summaryEnhance.error}
              onAccept={(text) => {
                saveToStorage({ ...resumeData, summary: text });
                setSummaryEnhance(emptyField);
              }}
              onDiscard={() => setSummaryEnhance(emptyField)}
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
            {resumeData.experience.map((exp, idx) => {
              const key = `exp-${idx}`;
              const fState = fieldEnhance[key] || emptyField;
              return (
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
                        updated[idx] = { ...updated[idx], title: e.target.value };
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
                        updated[idx] = { ...updated[idx], company: e.target.value };
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
                      updated[idx] = { ...updated[idx], duration: e.target.value };
                      saveToStorage({ ...resumeData, experience: updated });
                    }}
                    className="w-full border rounded p-1.5 text-xs bg-white"
                  />
                  {/* Description + Enhance */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-gray-500 font-medium">Description</span>
                      <SparkleButton
                        onClick={() => enhanceExpDescription(idx)}
                        loading={fState.loading}
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={exp.description}
                      placeholder="Responsibilities and key contributions"
                      onChange={(e) => {
                        const updated = [...resumeData.experience];
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        saveToStorage({ ...resumeData, experience: updated });
                      }}
                      className="w-full border rounded p-1.5 text-xs bg-white"
                    />
                    <EnhancePanel
                      original={exp.description}
                      enhanced={fState.enhanced}
                      loading={fState.loading}
                      error={fState.error}
                      onAccept={(text) => {
                        const updated = [...resumeData.experience];
                        updated[idx] = { ...updated[idx], description: text };
                        saveToStorage({ ...resumeData, experience: updated });
                        clearFieldEnhance(key);
                      }}
                      onDiscard={() => clearFieldEnhance(key)}
                    />
                  </div>
                </div>
              );
            })}
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
            {resumeData.projects.map((proj, idx) => {
              const key = `proj-${idx}`;
              const fState = fieldEnhance[key] || emptyField;
              return (
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
                      updated[idx] = { ...updated[idx], title: e.target.value };
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
                      updated[idx] = { ...updated[idx], technologies: e.target.value };
                      saveToStorage({ ...resumeData, projects: updated });
                    }}
                    className="w-full border rounded p-1.5 text-xs bg-white"
                  />
                  {/* Description + Enhance */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-gray-500 font-medium">Description</span>
                      <SparkleButton
                        onClick={() => enhanceProjDescription(idx)}
                        loading={fState.loading}
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={proj.description}
                      placeholder="Project description"
                      onChange={(e) => {
                        const updated = [...resumeData.projects];
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        saveToStorage({ ...resumeData, projects: updated });
                      }}
                      className="w-full border rounded p-1.5 text-xs bg-white"
                    />
                    <EnhancePanel
                      original={proj.description}
                      enhanced={fState.enhanced}
                      loading={fState.loading}
                      error={fState.error}
                      onAccept={(text) => {
                        const updated = [...resumeData.projects];
                        updated[idx] = { ...updated[idx], description: text };
                        saveToStorage({ ...resumeData, projects: updated });
                        clearFieldEnhance(key);
                      }}
                      onDiscard={() => clearFieldEnhance(key)}
                    />
                  </div>
                </div>
              );
            })}
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
                      updated[idx] = { ...updated[idx], degree: e.target.value };
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
                      updated[idx] = { ...updated[idx], institution: e.target.value };
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
                    updated[idx] = { ...updated[idx], year: e.target.value };
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
                      updated[idx] = { ...updated[idx], name: e.target.value };
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
                      updated[idx] = { ...updated[idx], description: e.target.value };
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
          {/* Template Quick Switcher Bar */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-xs font-bold text-gray-800">
                  Template:{" "}
                  <span className="text-blue-600 font-semibold">
                    {RESUME_TEMPLATES.find((t) => t.id === templateId)?.name}
                  </span>
                </span>
              </div>
              <Link
                href="/templates"
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                Browse All Templates →
              </Link>
            </div>

            {/* Quick Template Switch Buttons */}
            <div className="grid grid-cols-5 gap-1.5">
              {RESUME_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleTemplateChange(tpl.id)}
                  title={`${tpl.name} - ${tpl.description}`}
                  className={`py-1.5 px-1 rounded text-[11px] font-medium truncate transition-all text-center ${
                    templateId === tpl.id
                      ? "bg-blue-600 text-white shadow-xs font-semibold"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tpl.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Live Resume Preview
            </span>
            <span className="text-[11px] text-gray-400">Updates as you edit</span>
          </div>
          <ResumePreview data={resumeData} templateId={templateId} />
        </div>
      </div>

      {/* Shimmer animation style */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.2s infinite;
        }
      `}</style>
    </div>
  );
}
