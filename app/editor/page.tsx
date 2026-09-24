"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ResumeData, Education, Experience, Project, Certification, Achievement } from "@/types/resume";
import { extractResumeData } from "@/lib/resumeParser";
import { RESUME_TEMPLATES, DEFAULT_TEMPLATE_ID } from "@/data/templateData";
import ResumePreview from "@/components/ResumePreview";
import { enhanceAll, EnhanceField } from "@/lib/useAIEnhance";
import StepIndicator from "@/components/StepIndicator";
import { clearAllResumeData } from "@/lib/storage";

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
    <div className="mt-2.5 rounded-xl border border-violet-200/90 bg-gradient-to-br from-violet-50/70 to-purple-50/40 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600">
        <span className="text-white text-xs font-bold tracking-tight">✨ AI Bullet Enhancement</span>
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

      <div className="p-3.5 space-y-3">
        {loading && (
          <div className="space-y-2 py-1">
            <div className="h-3 bg-violet-100 rounded-lg animate-pulse w-full" />
            <div className="h-3 bg-violet-100 rounded-lg animate-pulse w-4/5" />
            <p className="text-[11px] text-violet-600 font-medium italic mt-2">Optimizing bullet for ATS keywords…</p>
          </div>
        )}

        {error && (
          <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={onDiscard} className="text-xs text-rose-700 font-bold hover:underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {enhanced && !loading && (
          <>
            {/* Side-by-side diff */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white rounded-xl p-2.5 border border-slate-200">
                <p className="font-bold text-slate-400 mb-1 text-[10px] uppercase tracking-wider">Original</p>
                <p className="text-slate-500 leading-relaxed line-through decoration-rose-300">
                  {original}
                </p>
              </div>
              <div className="bg-white rounded-xl p-2.5 border border-violet-200">
                <p className="font-bold text-violet-700 mb-1 text-[10px] uppercase tracking-wider">Enhanced ✨</p>
                <p className="text-slate-900 leading-relaxed font-medium">
                  {enhanced}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={onDiscard}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
              >
                ✕ Discard
              </button>
              <button
                type="button"
                onClick={() => onAccept(enhanced)}
                className="text-xs px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold hover:opacity-95 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
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
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
        loading
          ? "bg-violet-100 text-violet-400 cursor-wait"
          : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.97] text-white shadow-2xs"
      }`}
    >
      {loading ? (
        <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
      ) : (
        <span>✨</span>
      )}
      <span>{loading ? "Enhancing…" : "AI Enhance"}</span>
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
  const router = useRouter();

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

  // Load resume data on mount with prerequisite checks
  useEffect(() => {
    const rawResumeText = (localStorage.getItem("resume_raw_text") || "").trim();
    if (!rawResumeText || rawResumeText.length < 25) {
      router.replace("/input?error=missing_info");
      return;
    }

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

    const savedRole = (localStorage.getItem("resume_target_role") || "").trim();
    if (!savedRole) {
      router.replace("/role");
      return;
    }

    // Missing structured resume data - redirect to review & organize step
    router.replace("/organize");
  }, [router]);

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
    setEnhanceAllStatus("Enhancing all fields with AI…");

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
    <div className="py-4 sm:py-6 max-w-6xl mx-auto">
      <StepIndicator currentStep={4} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Resume Editor
            </h1>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
              Live Preview
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Target Job Role:{" "}
            <span className="font-semibold text-blue-700 bg-blue-50/70 border border-blue-200/60 px-2 py-0.5 rounded-md">{resumeData.targetRole}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Enhance All Button */}
          <button
            type="button"
            onClick={handleEnhanceAll}
            disabled={enhancingAll}
            className={`relative overflow-hidden text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              enhancingAll
                ? "bg-violet-100 text-violet-400 cursor-wait"
                : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.98] text-white shadow-xs"
            }`}
          >
            {enhancingAll && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
            {enhancingAll ? "✨ Enhancing All…" : "✨ Enhance All with AI"}
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm("Start a new resume? This will clear all current resume progress.")) {
                clearAllResumeData();
                router.push("/input?new=true");
              }
            }}
            className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-rose-600 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50/50 transition-all cursor-pointer whitespace-nowrap"
            title="Clear all cached resume data and start fresh"
          >
            New Resume
          </button>

          <Link
            href="/preview"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-4.5 py-2.5 rounded-xl shadow-xs transition-all whitespace-nowrap"
          >
            <span>Preview &amp; Export</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Enhance All Status Banner */}
      {enhanceAllStatus && (
        <div
          className={`mb-5 text-xs sm:text-sm px-4 py-3 rounded-2xl font-medium flex items-center gap-2 shadow-2xs ${
            enhanceAllStatus.startsWith("✅")
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : enhanceAllStatus.startsWith("⚠️")
              ? "bg-rose-50 text-rose-800 border border-rose-200"
              : "bg-violet-50 text-violet-800 border border-violet-200"
          }`}
        >
          {!enhanceAllStatus.startsWith("✅") && !enhanceAllStatus.startsWith("⚠️") && (
            <span className="animate-spin text-sm">✨</span>
          )}
          <span>{enhanceAllStatus}</span>
        </div>
      )}

      {/* Two Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: Editing Form */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="glass-panel weightless-card rounded-2xl p-5 sm:p-6 border border-slate-200/90">
            <h2 className="text-base font-bold text-slate-900 mb-3.5 pb-2.5 border-b border-slate-100 flex items-center gap-2">
              <span className="text-base">👤</span>
              <span>Personal Information</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 text-xs text-slate-900 bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Role / Subtitle</label>
                <input
                  type="text"
                  value={resumeData.targetRole}
                  onChange={(e) => saveToStorage({ ...resumeData, targetRole: e.target.value })}
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 text-xs text-slate-900 bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={resumeData.personalInfo.email}
                  onChange={(e) => updatePersonalInfo("email", e.target.value)}
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 text-xs text-slate-900 bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Phone</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 text-xs text-slate-900 bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Location</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.location}
                  onChange={(e) => updatePersonalInfo("location", e.target.value)}
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 text-xs text-slate-900 bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">LinkedIn</label>
                <input
                  type="text"
                  placeholder="linkedin.com/in/username"
                  value={resumeData.personalInfo.linkedin || ""}
                  onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 text-xs text-slate-900 bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">GitHub</label>
                <input
                  type="text"
                  placeholder="github.com/username"
                  value={resumeData.personalInfo.github || ""}
                  onChange={(e) => updatePersonalInfo("github", e.target.value)}
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 text-xs text-slate-900 bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Portfolio</label>
                <input
                  type="text"
                  placeholder="yourportfolio.dev"
                  value={resumeData.personalInfo.portfolio || ""}
                  onChange={(e) => updatePersonalInfo("portfolio", e.target.value)}
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 text-xs text-slate-900 bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="glass-panel weightless-card rounded-2xl p-5 sm:p-6 border border-slate-200/90">
            <div className="flex items-center justify-between mb-2.5 border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>📝</span>
                <span>Professional Summary</span>
              </h2>
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
              className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs text-slate-900 focus:outline-none leading-relaxed"
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
          <div className="glass-panel weightless-card rounded-2xl p-5 sm:p-6 border border-slate-200/90">
            <h2 className="text-base font-bold text-slate-900 mb-1 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <span>⚡</span>
              <span>Skills (comma separated)</span>
            </h2>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => handleSkillsChange(e.target.value)}
              placeholder="e.g. React, Next.js, TypeScript, Git"
              className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none mt-2"
            />
          </div>

          {/* Experience Section */}
          <div className="glass-panel weightless-card rounded-2xl p-5 sm:p-6 border border-slate-200/90">
            <div className="flex justify-between items-center mb-3.5 border-b border-slate-100 pb-2.5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>💼</span>
                <span>Experience</span>
              </h2>
              <button
                type="button"
                onClick={addExperience}
                className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                + Add Experience
              </button>
            </div>
            {resumeData.experience.map((exp, idx) => {
              const key = `exp-${idx}`;
              const fState = fieldEnhance[key] || emptyField;
              return (
                <div key={exp.id || idx} className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl mb-3.5 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Position #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
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
                      className="border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs bg-white text-slate-900 focus:outline-none"
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
                      className="border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs bg-white text-slate-900 focus:outline-none"
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
                    className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs bg-white text-slate-900 focus:outline-none"
                  />
                  {/* Description + Enhance */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-500 font-semibold">Description (Bullets)</span>
                      <SparkleButton
                        onClick={() => enhanceExpDescription(idx)}
                        loading={fState.loading}
                      />
                    </div>
                    <textarea
                      rows={3}
                      value={exp.description}
                      placeholder="Responsibilities and key contributions (one per line)"
                      onChange={(e) => {
                        const updated = [...resumeData.experience];
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        saveToStorage({ ...resumeData, experience: updated });
                      }}
                      className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none leading-relaxed"
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
          <div className="glass-panel weightless-card rounded-2xl p-5 sm:p-6 border border-slate-200/90">
            <div className="flex justify-between items-center mb-3.5 border-b border-slate-100 pb-2.5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>🚀</span>
                <span>Projects</span>
              </h2>
              <button
                type="button"
                onClick={addProject}
                className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                + Add Project
              </button>
            </div>
            {resumeData.projects.map((proj, idx) => {
              const key = `proj-${idx}`;
              const fState = fieldEnhance[key] || emptyField;
              return (
                <div key={proj.id || idx} className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl mb-3.5 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Project #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeProject(idx)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
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
                    className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs bg-white text-slate-900 focus:outline-none"
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
                    className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs bg-white text-slate-900 focus:outline-none"
                  />
                  {/* Description + Enhance */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-500 font-semibold">Description</span>
                      <SparkleButton
                        onClick={() => enhanceProjDescription(idx)}
                        loading={fState.loading}
                      />
                    </div>
                    <textarea
                      rows={3}
                      value={proj.description}
                      placeholder="Project description and metrics"
                      onChange={(e) => {
                        const updated = [...resumeData.projects];
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        saveToStorage({ ...resumeData, projects: updated });
                      }}
                      className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none leading-relaxed"
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
          <div className="glass-panel weightless-card rounded-2xl p-5 sm:p-6 border border-slate-200/90">
            <div className="flex justify-between items-center mb-3.5 border-b border-slate-100 pb-2.5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>🎓</span>
                <span>Education</span>
              </h2>
              <button
                type="button"
                onClick={addEducation}
                className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                + Add Education
              </button>
            </div>
            {resumeData.education.map((edu, idx) => (
              <div key={edu.id || idx} className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl mb-3 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Education #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeEducation(idx)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
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
                    className="border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs bg-white text-slate-900 focus:outline-none"
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
                    className="border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs bg-white text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={edu.year}
                    placeholder="Year (e.g. 2021 - 2025)"
                    onChange={(e) => {
                      const updated = [...resumeData.education];
                      updated[idx] = { ...updated[idx], year: e.target.value };
                      saveToStorage({ ...resumeData, education: updated });
                    }}
                    className="border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs bg-white text-slate-900 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={edu.cgpa || ""}
                    placeholder="CGPA (e.g. 8.2/10)"
                    onChange={(e) => {
                      const updated = [...resumeData.education];
                      updated[idx] = { ...updated[idx], cgpa: e.target.value };
                      saveToStorage({ ...resumeData, education: updated });
                    }}
                    className="border border-slate-200 focus:border-blue-500 rounded-xl p-2 text-xs bg-white text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Certifications & Achievements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Certifications */}
            <div className="glass-panel weightless-card rounded-2xl p-4 sm:p-5 border border-slate-200/90">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1">
                  <span>📜</span>
                  <span>Certifications</span>
                </h2>
                <button
                  type="button"
                  onClick={addCertification}
                  className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs"
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
                    className="flex-1 border border-slate-200 focus:border-blue-500 rounded-xl p-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeCertification(idx)}
                    className="text-rose-600 text-sm font-bold px-1.5 hover:text-rose-800 cursor-pointer"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div className="glass-panel weightless-card rounded-2xl p-4 sm:p-5 border border-slate-200/90">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1">
                  <span>🏆</span>
                  <span>Achievements</span>
                </h2>
                <button
                  type="button"
                  onClick={addAchievement}
                  className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs"
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
                    className="flex-1 border border-slate-200 focus:border-blue-500 rounded-xl p-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeAchievement(idx)}
                    className="text-rose-600 text-sm font-bold px-1.5 hover:text-rose-800 cursor-pointer"
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
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 mb-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Template:{" "}
                  <span className="text-blue-600 font-semibold">
                    {RESUME_TEMPLATES.find((t) => t.id === templateId)?.name}
                  </span>
                </span>
              </div>
              <Link
                href="/explore"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline flex items-center gap-1"
              >
                Browse All Templates
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
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
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium truncate transition-all text-center cursor-pointer ${
                    templateId === tpl.id
                      ? "bg-blue-600 text-white shadow-sm font-semibold ring-2 ring-blue-500/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900"
                  }`}
                >
                  {tpl.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-2 px-1 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Live Resume Preview
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Auto-updates as you type</span>
          </div>
          <div className="bg-slate-100/70 p-2 sm:p-4 rounded-2xl border border-slate-200/80 shadow-inner flex justify-center">
            <ResumePreview data={resumeData} templateId={templateId} />
          </div>
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
