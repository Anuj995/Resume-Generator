"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ResumeData, Experience, Project, Education, Certification, Achievement, Hackathon, Course } from "@/types/resume";
import { extractResumeData } from "@/lib/resumeParser";
import StepIndicator from "@/components/StepIndicator";
import { clearAllResumeData, computeTailoredHash, notifyStorageChange } from "@/lib/storage";

export default function OrganizePage() {
  const router = useRouter();

  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAlreadyTailored, setIsAlreadyTailored] = useState(false);

  // Enforce prerequisites: user must have entered info in Step 1 and selected role in Step 2
  useEffect(() => {
    const rawResumeText = (localStorage.getItem("resume_raw_text") || "").trim();
    if (!rawResumeText || rawResumeText.length < 25) {
      router.replace("/input?error=missing_info");
      return;
    }

    const savedRole = (localStorage.getItem("resume_target_role") || "").trim();
    if (!savedRole) {
      router.replace("/role");
      return;
    }

    const savedJd = localStorage.getItem("resume_job_description") || "";
    setTargetRole(savedRole);
    setJobDescription(savedJd);

    const tailoredFlag = localStorage.getItem("resume_tailored") === "true";
    setIsAlreadyTailored(tailoredFlag);

    const savedData = localStorage.getItem("resume_data");
    if (savedData) {
      try {
        const parsed: ResumeData = JSON.parse(savedData);
        setResumeData(parsed);
        return;
      } catch (e) {
        console.error("Failed to parse saved resume data", e);
      }
    }

    // Fallback only if raw text is actually provided
    const savedFileName = localStorage.getItem("resume_file_name") || "";
    const fallback = extractResumeData(rawResumeText, savedRole, savedFileName);
    fallback.targetRole = savedRole;
    setResumeData(fallback);
  }, [router]);

  // Save changes and navigate to Resume Editor
  const handleContinueToResume = async (forceTailor = false) => {
    if (!resumeData) return;

    const isTailored = localStorage.getItem("resume_tailored") === "true";

    // If AI tailoring has already been performed and user didn't explicitly request re-tailoring:
    // Instantly save edits and navigate to editor with ZERO API calls or token usage!
    if (isTailored && !forceTailor) {
      localStorage.setItem("resume_data", JSON.stringify(resumeData));
      notifyStorageChange();
      router.push("/editor");
      return;
    }

    const roleForTailoring = targetRole || resumeData.targetRole || "";
    const jdForTailoring = jobDescription || resumeData.jobDescription || "";

    setIsGenerating(true);

    try {
      // Call /api/generate for role & JD alignment
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData,
          targetRole: roleForTailoring,
          jobDescription: jdForTailoring,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.resumeData) {
          localStorage.setItem("resume_data", JSON.stringify(data.resumeData));
          localStorage.setItem("resume_tailored", "true");
          setIsAlreadyTailored(true);
          notifyStorageChange();
          router.push("/editor");
          return;
        }
      }
    } catch (err) {
      console.error("AI generation refinement error:", err);
    } finally {
      setIsGenerating(false);
    }

    // Fallback: save current edits and push
    localStorage.setItem("resume_data", JSON.stringify(resumeData));
    localStorage.setItem("resume_tailored", "true");
    setIsAlreadyTailored(true);
    notifyStorageChange();
    router.push("/editor");
  };

  // ── Handlers for Personal Info ──
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

  // ── Handlers for Skills ──
  const updateFlatSkills = (commaSeparated: string) => {
    if (!resumeData) return;
    const list = commaSeparated
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setResumeData({
      ...resumeData,
      skills: list,
    });
  };

  const updateCategorizedSkills = (cat: "languages" | "frameworks" | "tools" | "databases", commaSeparated: string) => {
    if (!resumeData) return;
    const list = commaSeparated
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setResumeData({
      ...resumeData,
      categorizedSkills: {
        ...(resumeData.categorizedSkills || {}),
        [cat]: list,
      },
    });
  };

  // ── Handlers for Education ──
  const updateEducation = (index: number, field: keyof Education, value: string) => {
    if (!resumeData) return;
    const updated = [...resumeData.education];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, education: updated });
  };

  const addEducation = () => {
    if (!resumeData) return;
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      degree: "B.Tech in Computer Science",
      institution: "College / University Name",
      year: "2022 - 2026",
      cgpa: "",
    };
    setResumeData({ ...resumeData, education: [...resumeData.education, newEdu] });
  };

  const removeEducation = (index: number) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter((_, i) => i !== index),
    });
  };

  // ── Handlers for Experience ──
  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    if (!resumeData) return;
    const updated = [...resumeData.experience];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, experience: updated });
  };

  const addExperience = () => {
    if (!resumeData) return;
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      title: "Job Title",
      company: "Company Name, Location",
      duration: "Duration (e.g. May 2025 – Present)",
      description: "• Implemented key features\n• Improved system performance",
    };
    setResumeData({ ...resumeData, experience: [...resumeData.experience, newExp] });
  };

  const removeExperience = (index: number) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter((_, i) => i !== index),
    });
  };

  // ── Handlers for Projects ──
  const updateProject = (index: number, field: keyof Project, value: string) => {
    if (!resumeData) return;
    const updated = [...resumeData.projects];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, projects: updated });
  };

  const addProject = () => {
    if (!resumeData) return;
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: "Project Name",
      technologies: "Technologies (e.g. React, Node.js, SQL)",
      description: "• Built responsive application\n• Added features and functionality",
    };
    setResumeData({ ...resumeData, projects: [...resumeData.projects, newProj] });
  };

  const removeProject = (index: number) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter((_, i) => i !== index),
    });
  };

  // ── Handlers for Certifications ──
  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    if (!resumeData) return;
    const updated = [...resumeData.certifications];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, certifications: updated });
  };

  const addCertification = () => {
    if (!resumeData) return;
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: "Certification Name",
      issuer: "Issuing Organization",
      year: "2025",
    };
    setResumeData({ ...resumeData, certifications: [...resumeData.certifications, newCert] });
  };

  const removeCertification = (index: number) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      certifications: resumeData.certifications.filter((_, i) => i !== index),
    });
  };

  // ── Handlers for Achievements ──
  const updateAchievement = (index: number, value: string) => {
    if (!resumeData) return;
    const updated = [...resumeData.achievements];
    updated[index] = { ...updated[index], description: value };
    setResumeData({ ...resumeData, achievements: updated });
  };

  const addAchievement = () => {
    if (!resumeData) return;
    const newAch: Achievement = {
      id: `ach-${Date.now()}`,
      description: "Secured top position or notable recognition.",
    };
    setResumeData({ ...resumeData, achievements: [...resumeData.achievements, newAch] });
  };

  const removeAchievement = (index: number) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      achievements: resumeData.achievements.filter((_, i) => i !== index),
    });
  };

  // ── Handlers for Hackathons ──
  const updateHackathon = (index: number, field: keyof Hackathon, value: string) => {
    if (!resumeData) return;
    const updated = [...(resumeData.hackathons || [])];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, hackathons: updated });
  };

  const addHackathon = () => {
    if (!resumeData) return;
    const newHack: Hackathon = {
      id: `hack-${Date.now()}`,
      title: "Hackathon Name",
      description: "Built a functional prototype and presented to judges.",
    };
    setResumeData({ ...resumeData, hackathons: [...(resumeData.hackathons || []), newHack] });
  };

  const removeHackathon = (index: number) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      hackathons: (resumeData.hackathons || []).filter((_, i) => i !== index),
    });
  };

  if (!resumeData) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-slate-500 font-medium">
        Loading extracted information...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6">
      <StepIndicator currentStep={3} />

      {/* Page Heading */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Review Your Information
          </h1>
          <p className="text-slate-600 text-sm mt-1 leading-relaxed">
            Review and correct the facts extracted by AI before generating your ATS resume. You remain in complete control.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Start a new resume? This will clear all current extracted data.")) {
                clearAllResumeData();
                router.push("/input?new=true");
              }
            }}
            className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-rose-600 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50/50 transition-all cursor-pointer whitespace-nowrap"
            title="Clear all cached data and start fresh"
          >
            New Resume
          </button>

          {isAlreadyTailored && !isGenerating && (
            <button
              type="button"
              onClick={() => handleContinueToResume(true)}
              className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              title="Re-run AI tailoring if you made major changes"
            >
              ✨ Re-tailor
            </button>
          )}

          <button
            onClick={() => handleContinueToResume(false)}
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-5 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Tailoring with AI...</span>
              </>
            ) : (
              <>
                <span>{isAlreadyTailored ? "Continue to Editor" : "Continue to Resume"}</span>
                <span>&rarr;</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* =========================================================================
            1. PERSONAL INFORMATION
            ========================================================================= */}
        <div className="glass-panel weightless-card rounded-2xl p-5 sm:p-6 border border-slate-200/90">
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="text-base">👤</span>
            <span>Personal Information</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={resumeData.personalInfo?.fullName || ""}
                onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs bg-white text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Target Job Title</label>
              <input
                type="text"
                value={targetRole || resumeData.targetRole || ""}
                onChange={(e) => {
                  setTargetRole(e.target.value);
                  setResumeData({ ...resumeData, targetRole: e.target.value });
                }}
                className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs bg-white text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={resumeData.personalInfo?.email || ""}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
                className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs bg-white text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={resumeData.personalInfo?.phone || ""}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs bg-white text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Location (City, State / Country)</label>
              <input
                type="text"
                value={resumeData.personalInfo?.location || ""}
                onChange={(e) => updatePersonalInfo("location", e.target.value)}
                className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs bg-white text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">LinkedIn Profile (URL or handle)</label>
              <input
                type="text"
                placeholder="linkedin.com/in/username"
                value={resumeData.personalInfo?.linkedin || ""}
                onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs bg-white text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">GitHub Profile (URL or handle)</label>
              <input
                type="text"
                placeholder="github.com/username"
                value={resumeData.personalInfo?.github || ""}
                onChange={(e) => updatePersonalInfo("github", e.target.value)}
                className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs bg-white text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Portfolio / Website</label>
              <input
                type="text"
                placeholder="yourportfolio.dev"
                value={resumeData.personalInfo?.portfolio || ""}
                onChange={(e) => updatePersonalInfo("portfolio", e.target.value)}
                className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs bg-white text-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. PROFESSIONAL SUMMARY
            ========================================================================= */}
        <div className="glass-panel weightless-card rounded-2xl p-5 sm:p-6 border border-slate-200/90">
          <h2 className="text-base font-bold text-slate-900 mb-2 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="text-base">📝</span>
            <span>Professional Summary</span>
          </h2>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            A 2–3 line summary highlighting your relevant skills for {targetRole || "your role"}.
          </p>
          <textarea
            rows={3}
            value={resumeData.summary || ""}
            onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
            placeholder="Results-oriented developer with hands-on experience in React, JavaScript, and building web applications..."
            className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3.5 text-xs text-slate-900 leading-relaxed focus:outline-none"
          />
        </div>

        {/* =========================================================================
            3. TECHNICAL SKILLS
            ========================================================================= */}
        <div className="glass-panel weightless-card rounded-2xl p-5 sm:p-6 border border-slate-200/90">
          <h2 className="text-base font-bold text-slate-900 mb-2 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="text-base">⚡</span>
            <span>Technical Skills</span>
          </h2>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Group your skills into standard text categories (comma-separated). No skill bars or percentage ratings are used in ATS resumes.
          </p>
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Languages (e.g. Python, JavaScript, Java, SQL)</label>
              <input
                type="text"
                value={resumeData.categorizedSkills?.languages?.join(", ") || ""}
                onChange={(e) => updateCategorizedSkills("languages", e.target.value)}
                placeholder="Python, JavaScript, TypeScript, C++, SQL"
                className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 focus:outline-none text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Web &amp; Frameworks (e.g. React, Next.js, Node.js, Express)</label>
              <input
                type="text"
                value={resumeData.categorizedSkills?.frameworks?.join(", ") || ""}
                onChange={(e) => updateCategorizedSkills("frameworks", e.target.value)}
                placeholder="React.js, Next.js, Node.js, Tailwind CSS, HTML5, CSS3"
                className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 focus:outline-none text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Databases (e.g. MySQL, PostgreSQL, MongoDB)</label>
              <input
                type="text"
                value={resumeData.categorizedSkills?.databases?.join(", ") || ""}
                onChange={(e) => updateCategorizedSkills("databases", e.target.value)}
                placeholder="PostgreSQL, MySQL, MongoDB, Firebase"
                className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 focus:outline-none text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Tools &amp; Platforms (e.g. Git, GitHub, VS Code, Docker, Figma)</label>
              <input
                type="text"
                value={resumeData.categorizedSkills?.tools?.join(", ") || ""}
                onChange={(e) => updateCategorizedSkills("tools", e.target.value)}
                placeholder="Git, GitHub, Docker, VS Code, Postman, Linux"
                className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 focus:outline-none text-slate-900"
              />
            </div>
            <div className="pt-2">
              <label className="block font-semibold text-slate-700 mb-1.5">All Skills (Flat List Backup)</label>
              <input
                type="text"
                value={resumeData.skills?.join(", ") || ""}
                onChange={(e) => updateFlatSkills(e.target.value)}
                placeholder="Python, React, SQL, Git..."
                className="w-full border border-slate-200 rounded-xl p-2.5 focus:border-blue-500 focus:outline-none text-slate-600 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. WORK EXPERIENCE
            ========================================================================= */}
        <div className="glass-panel weightless-card rounded-2xl p-5 sm:p-6 border border-slate-200/90">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="text-base">💼</span>
              <span>Work Experience</span>
            </h2>
            <button
              type="button"
              onClick={addExperience}
              className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              + Add Experience
            </button>
          </div>
          <div className="space-y-4">
            {resumeData.experience.map((exp, index) => (
              <div key={exp.id || index} className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Experience #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateExperience(index, "title", e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 focus:outline-none text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Company &amp; Location</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, "company", e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 focus:outline-none text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Duration</label>
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => updateExperience(index, "duration", e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 focus:outline-none text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Responsibilities &amp; Achievements (one bullet per line)</label>
                  <textarea
                    rows={3}
                    value={exp.description}
                    onChange={(e) => updateExperience(index, "description", e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-3 focus:outline-none leading-relaxed text-slate-900"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            5. PROJECTS
            ========================================================================= */}
        <div className="glass-panel weightless-card rounded-2xl p-5 sm:p-6 border border-slate-200/90">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="text-base">🚀</span>
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
          <div className="space-y-4">
            {resumeData.projects.map((proj, index) => (
              <div key={proj.id || index} className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Project #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Project Name</label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => updateProject(index, "title", e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 focus:outline-none text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Technologies Used</label>
                    <input
                      type="text"
                      value={proj.technologies || ""}
                      onChange={(e) => updateProject(index, "technologies", e.target.value)}
                      placeholder="React, JavaScript, HTML, CSS"
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 focus:outline-none text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Description (what you implemented, key results)</label>
                  <textarea
                    rows={3}
                    value={proj.description}
                    onChange={(e) => updateProject(index, "description", e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-3 focus:outline-none leading-relaxed text-slate-900"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            6. EDUCATION
            ========================================================================= */}
        <div className="glass-panel weightless-card rounded-2xl p-5 sm:p-6 border border-slate-200/90">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="text-base">🎓</span>
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
          <div className="space-y-4">
            {resumeData.education.map((edu, index) => (
              <div key={edu.id || index} className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Education #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Degree / Course</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, "degree", e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 focus:outline-none text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">College / University Name</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, "institution", e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 focus:outline-none text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Graduation Year / Range</label>
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => updateEducation(index, "year", e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 focus:outline-none text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">CGPA / Percentage (Optional)</label>
                    <input
                      type="text"
                      placeholder="8.2/10 or 85%"
                      value={edu.cgpa || ""}
                      onChange={(e) => updateEducation(index, "cgpa", e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 focus:outline-none text-slate-900"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            7. CERTIFICATIONS & ACHIEVEMENTS
            ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Certifications */}
          <div className="glass-panel weightless-card rounded-2xl p-5 sm:p-6 border border-slate-200/90">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
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
            <div className="space-y-3">
              {resumeData.certifications.map((cert, index) => (
                <div key={cert.id || index} className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">#{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-rose-600 text-xs font-semibold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Certification Name"
                    value={cert.name}
                    onChange={(e) => updateCertification(index, "name", e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2 text-slate-900 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Issuer (e.g. Coursera)"
                      value={cert.issuer || ""}
                      onChange={(e) => updateCertification(index, "issuer", e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2 text-slate-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Year (e.g. 2025)"
                      value={cert.year || ""}
                      onChange={(e) => updateCertification(index, "year", e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2 text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="glass-panel weightless-card rounded-2xl p-5 sm:p-6 border border-slate-200/90">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
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
            <div className="space-y-3">
              {resumeData.achievements.map((ach, index) => (
                <div key={ach.id || index} className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">#{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      className="text-rose-600 text-xs font-semibold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={ach.description}
                    onChange={(e) => updateAchievement(index, e.target.value)}
                    placeholder="Secured 2nd place in coding competition..."
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2 text-slate-900 focus:outline-none leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================================
            8. OPTIONAL SECTIONS: HACKATHONS
            ========================================================================= */}
        <div className="glass-panel weightless-card rounded-2xl p-5 sm:p-6 border border-slate-200/90">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>💡</span>
                <span>Hackathons &amp; Competitions (Optional)</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Only rendered on the resume if you add entries here.</p>
            </div>
            <button
              type="button"
              onClick={addHackathon}
              className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              + Add Hackathon
            </button>
          </div>
          <div className="space-y-3">
            {(resumeData.hackathons || []).map((h, index) => (
              <div key={h.id || index} className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    placeholder="Hackathon Title (e.g. Smart India Hackathon)"
                    value={h.title}
                    onChange={(e) => updateHackathon(index, "title", e.target.value)}
                    className="w-2/3 bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2 font-semibold text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeHackathon(index)}
                    className="text-rose-600 text-xs font-semibold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={h.description}
                  onChange={(e) => updateHackathon(index, "description", e.target.value)}
                  placeholder="Built prototype, finished in Top 10..."
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2 text-slate-900 focus:outline-none leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-200">
          <Link
            href="/role"
            className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            <span>&larr;</span>
            <span>Back to Target Role</span>
          </Link>

          <div className="flex items-center gap-3">
            {isAlreadyTailored && !isGenerating && (
              <button
                type="button"
                onClick={() => handleContinueToResume(true)}
                className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer shadow-2xs"
                title="Re-run AI tailoring if you made major changes"
              >
                ✨ Re-tailor with AI
              </button>
            )}

            <button
              onClick={() => handleContinueToResume(false)}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-xs cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Tailoring with AI...</span>
                </>
              ) : (
                <>
                  <span>{isAlreadyTailored ? "Continue to Editor" : "Continue to Resume"}</span>
                  <span>&rarr;</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
