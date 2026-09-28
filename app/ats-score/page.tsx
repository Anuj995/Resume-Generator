"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  Target,
  ChevronDown,
  ChevronUp,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  Search,
  ExternalLink,
} from "lucide-react";

import { extractTextFromPdf } from "@/lib/pdfExtractor";
import {
  compactResumeText,
  compactJobDescription,
  analyzeLocalSignals,
  computeAtsFingerprint,
  AtsRatingResult,
  AtsLocalSignals,
} from "@/lib/atsScorer";
import { ResumeData } from "@/types/resume";

const SAMPLE_TECH_RESUME = `Alex Rivera
alex.rivera@email.com | +1 (555) 234-5678 | San Francisco, CA | linkedin.com/in/alexrivera-tech

Professional Summary
Performance-driven Senior Software Engineer with 5+ years of experience architecting high-scale distributed systems and cloud infrastructure. Proven track record of improving latency by 35% and boosting developer productivity across cross-functional engineering teams.

Technical Skills
Languages: TypeScript, JavaScript, Python, Go, SQL
Frameworks: React, Next.js, Node.js, Express, Tailwind CSS
Infrastructure & Tools: AWS (ECS, S3, Lambda), Docker, Kubernetes, PostgreSQL, Redis, GraphQL, Git, CI/CD

Work Experience
Senior Full-Stack Engineer | CloudScale Inc. (2022 - Present)
- Architected and deployed microservices handling 12M+ monthly active requests with 99.99% system uptime.
- Optimized database indexing and Redis caching layer, reducing p95 API query latency by 42%.
- Spearheaded the migration of monolithic frontend to Next.js, slashing page load times by 2.4 seconds.
- Mentored 6 junior engineers on distributed tracing, automated unit testing, and clean architecture principles.

Software Engineer | NexaTech Systems (2020 - 2022)
- Engineered responsive client-facing dashboards using React and TypeScript for 85,000+ enterprise customers.
- Automated end-to-end testing pipelines using GitHub Actions, increasing test coverage from 64% to 91%.
- Reduced server compute costs by $18,000 annually through containerized resource optimization.

Education
Bachelor of Science in Computer Science | University of California, Berkeley (2016 - 2020)
GPA: 3.8 / 4.0 | Dean's Honor Roll

Certifications & Awards
- AWS Certified Solutions Architect - Associate
- 1st Place - Silicon Valley Cloud Hackathon 2023`;

const QUICK_ROLES = [
  "Full Stack Engineer",
  "Frontend Developer",
  "Backend Engineer",
  "DevOps / Cloud Engineer",
  "Data Scientist / AI",
  "Product Manager",
];

export default function AtsScorePage() {
  const router = useRouter();

  // Input states
  const [activeTab, setActiveTab] = useState<"active" | "paste" | "upload">("active");
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showJdInput, setShowJdInput] = useState(false);

  // Upload state
  const [uploadFileName, setUploadFileName] = useState("");
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Stored active resume draft check
  const [activeResumeLoaded, setActiveResumeLoaded] = useState(false);
  const [activeResumeName, setActiveResumeName] = useState("");

  // Scoring states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [result, setResult] = useState<AtsRatingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [showDiagnosticDetails, setShowDiagnosticDetails] = useState(false);

  // Local real-time signals
  const localSignals = useMemo(() => {
    return analyzeLocalSignals(resumeText);
  }, [resumeText]);

  // Load existing active resume from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedRole = localStorage.getItem("resume_target_role") || "";
      if (storedRole) setTargetRole(storedRole);

      const storedJd = localStorage.getItem("resume_job_description") || "";
      if (storedJd) {
        setJobDescription(storedJd);
        setShowJdInput(true);
      }

      const storedData = localStorage.getItem("resume_data");
      const storedRaw = localStorage.getItem("resume_raw_text");

      if (storedData) {
        const parsed: ResumeData = JSON.parse(storedData);
        const name = parsed.personalInfo?.fullName || "Active Draft";
        setActiveResumeName(name);
        const compacted = compactResumeText(parsed);
        if (compacted.length >= 25) {
          setResumeText(compacted);
          setActiveResumeLoaded(true);
          return;
        }
      }

      if (storedRaw && storedRaw.trim().length >= 25) {
        setResumeText(storedRaw.trim());
        setActiveResumeLoaded(true);
        setActiveResumeName("Saved Raw Input");
      }
    } catch {
      // ignore
    }
  }, []);

  // Handle active resume reload button
  const handleLoadActiveDraft = () => {
    try {
      const storedData = localStorage.getItem("resume_data");
      const storedRaw = localStorage.getItem("resume_raw_text");

      if (storedData) {
        const parsed: ResumeData = JSON.parse(storedData);
        const compacted = compactResumeText(parsed);
        setResumeText(compacted);
        setActiveResumeLoaded(true);
        setActiveTab("active");
        setErrorMessage("");
        return;
      }

      if (storedRaw) {
        setResumeText(storedRaw.trim());
        setActiveResumeLoaded(true);
        setActiveTab("active");
        setErrorMessage("");
        return;
      }

      setErrorMessage("No active resume draft found in local storage. Try uploading or pasting your resume.");
    } catch {
      setErrorMessage("Failed to load saved resume draft.");
    }
  };

  // Load sample resume
  const handleLoadSample = () => {
    setResumeText(SAMPLE_TECH_RESUME);
    setTargetRole("Senior Full Stack Engineer");
    setActiveTab("paste");
    setErrorMessage("");
  };

  // Handle PDF file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    setUploadError("");
    setIsExtractingPdf(true);

    try {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const extracted = await extractTextFromPdf(file);
        if (!extracted || extracted.trim().length < 25) {
          throw new Error("Could not extract readable text from PDF. The file may be image-scanned. Try pasting text.");
        }
        setResumeText(extracted);
        setActiveTab("paste");
      } else if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        const text = await file.text();
        setResumeText(text);
        setActiveTab("paste");
      } else {
        throw new Error("Unsupported format. Please upload a .pdf or .txt file, or paste your text directly.");
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to parse file.");
    } finally {
      setIsExtractingPdf(false);
    }
  };

  // Run ATS rating
  const handleAnalyzeResume = async () => {
    const trimmed = resumeText.trim();
    if (!trimmed || trimmed.length < 30) {
      setErrorMessage("Please provide resume content with at least 30 characters before running the ATS audit.");
      return;
    }

    setErrorMessage("");
    setIsAnalyzing(true);
    setAnalysisStep("Checking token-optimized cache...");

    const cacheKey = computeAtsFingerprint(trimmed, targetRole, jobDescription);

    // 1. Check local client cache (0 tokens & 0ms latency)
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsedCached: AtsRatingResult = JSON.parse(cached);
        // Instant response from cache
        setTimeout(() => {
          setResult({ ...parsedCached, isCached: true });
          setIsAnalyzing(false);
          setAnalysisStep("");
        }, 300);
        return;
      }
    } catch {
      // cache read failed, proceed to fetch
    }

    setAnalysisStep("Evaluating keywords & ATS parsability...");

    try {
      const response = await fetch("/api/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: trimmed,
          targetRole: targetRole.trim(),
          jobDescription: jobDescription.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to analyze resume ATS score.");
      }

      const data: AtsRatingResult = await response.json();
      setResult(data);

      // Save to client cache
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch {
        // storage quota edge case
      }
    } catch (err: any) {
      console.error("ATS analysis error:", err);
      setErrorMessage(err.message || "An error occurred while evaluating your resume.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  // Copy missing keyword
  const handleCopyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    setCopiedKeyword(keyword);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  // Copy full audit report
  const handleCopyFullReport = () => {
    if (!result) return;

    const report = `# ATS Resume Rating Report
Score: ${result.score}/100 (${result.verdict})
Target Role: ${targetRole || "General"}

## Category Breakdown
- Keywords & Match: ${result.breakdown.keywords}/100
- Quantified Impact: ${result.breakdown.impact}/100
- Brevity & Action Verbs: ${result.breakdown.brevity}/100
- Format & Parsing Structure: ${result.breakdown.structure}/100

## Key Strengths
${result.strengths.map((s) => `• ${s}`).join("\n")}

## Critical ATS Red Flags
${result.criticalIssues.map((i) => `⚠️ ${i}`).join("\n")}

## High-ROI Quick Fixes
${result.quickFixes.map((q) => `[${q.section}] ${q.issue} -> Fix: ${q.fix}`).join("\n\n")}

## Recommended Missing Keywords
${result.missingKeywords.join(", ")}
`;

    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // Color mapping based on score
  const getScoreColor = (score: number) => {
    if (score >= 85) return { stroke: "#10b981", bg: "bg-emerald-500", text: "text-emerald-700", ring: "ring-emerald-200" };
    if (score >= 70) return { stroke: "#3b82f6", bg: "bg-blue-600", text: "text-blue-700", ring: "ring-blue-200" };
    if (score >= 50) return { stroke: "#f59e0b", bg: "bg-amber-500", text: "text-amber-700", ring: "ring-amber-200" };
    return { stroke: "#ef4444", bg: "bg-rose-500", text: "text-rose-700", ring: "ring-rose-200" };
  };

  const scoreTheme = getScoreColor(result?.score ?? 0);

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-100/40 via-indigo-100/30 to-purple-100/30 blur-3xl rounded-full" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-50/40 blur-3xl rounded-full" />
      </div>

      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 shadow-xs mb-4"
        >
          <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
            ATS Score Auditor • Gemini Flash Engine
          </span>
          <span className="text-[10px] font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">
            AI Powered
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight"
        >
          Check Your <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">ATS Score</span> & Recruiter Match
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed"
        >
          Evaluate how applicant tracking systems screen your resume. Detect missing high-value keywords,
          quantified impact density, and receive actionable fixes tailored to your target job.
        </motion.p>
      </div>

      {/* Main Grid: Input Workspace & Live Score Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Panel (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 shadow-xl border border-white/90">
            {/* Tab Selection */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-200/70 pb-4">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("active");
                    handleLoadActiveDraft();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === "active"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Active Draft {activeResumeName ? `(${activeResumeName.split(" ")[0]})` : ""}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("paste")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === "paste"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Edit / Paste
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === "upload"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Upload PDF
                </button>
              </div>

              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Load Sample
              </button>
            </div>

            {/* Target Role & Job Description Inputs */}
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Job Title (Optional, Recommended)
                </label>
                <div className="relative">
                  <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Engineer, Product Manager"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>

                {/* Quick Role Suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {QUICK_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-lg border transition-all ${
                        targetRole === role
                          ? "bg-blue-50 text-blue-700 border-blue-300 font-semibold"
                          : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collapsible Job Description Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowJdInput(!showJdInput)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  {showJdInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>Target Job Description (JD) — For Keyword Gap Matching</span>
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                    Optional
                  </span>
                </button>

                {showJdInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2.5"
                  >
                    <textarea
                      rows={3}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job posting requirements or key qualifications here to audit keyword overlap..."
                      className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      💡 Text is automatically condensed to essential requirements to save API tokens.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Input Content Panes */}
            {activeTab === "upload" && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Upload Resume (.pdf or .txt)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {isExtractingPdf ? "Extracting resume text..." : "Click or drag your resume file here"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">PDF or TXT documents up to 10MB</p>
                    </div>
                  </div>
                </div>

                {uploadFileName && (
                  <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-slate-100 text-xs font-medium text-slate-700">
                    <span className="truncate">{uploadFileName}</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Parsed
                    </span>
                  </div>
                )}

                {uploadError && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Resume Text Editor / Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Resume Content For ATS Audit
                </label>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{localSignals.wordCount} words</span>
                  <span>•</span>
                  <span>{resumeText.length} chars</span>
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows={10}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste or type your resume content here (summary, experience, skills, education)..."
                  className="w-full p-4 font-mono text-xs leading-relaxed rounded-2xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-inner transition-all resize-y"
                />

                {/* Local Instant Signals Bar inside textarea footer */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Instant Pre-Audit:</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                      localSignals.hasEmail ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    Email {localSignals.hasEmail ? "✓" : "✗"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                      localSignals.hasPhone ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    Phone {localSignals.hasPhone ? "✓" : "✗"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                      localSignals.metricCount >= 3 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {localSignals.metricCount} Metrics
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                      localSignals.actionVerbCount >= 4 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {localSignals.actionVerbCount} Action Verbs
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Button & Optimization Meter */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero hallucination audit • Confidential &amp; private</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={isAnalyzing || resumeText.trim().length < 25}
                onClick={handleAnalyzeResume}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{analysisStep || "Auditing Resume..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Rate Resume ATS Score</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Column: Score Visualizer & Recommendations (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* If no result yet */}
          {!result && !isAnalyzing && (
            <div className="glass-panel rounded-3xl p-8 text-center border border-white/80 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 mx-auto shadow-inner">
                <Target className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Ready to Audit</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Click &ldquo;Rate Resume ATS Score&rdquo; to benchmark your resume against real recruiter applicant tracking filters.
                </p>
              </div>

              <div className="pt-2 text-left">
                <div className="p-3 rounded-2xl bg-white/70 border border-slate-200/70 text-xs">
                  <span className="font-bold text-slate-800 block">📊 Comprehensive ATS Analysis</span>
                  <span className="text-[11px] text-slate-500">Evaluates quantified metrics, action verbs, and keyword density</span>
                </div>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {isAnalyzing && (
            <div className="glass-panel-elevated rounded-3xl p-8 text-center space-y-6">
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping opacity-75" />
                <div className="w-24 h-24 rounded-full border-4 border-blue-600 border-t-transparent animate-spin flex items-center justify-center text-blue-600 font-bold text-sm">
                  ATS
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">Running Recruiter Scan</h4>
                <p className="text-xs text-slate-500 mt-1">{analysisStep || "Auditing parse tree and keyword vector..."}</p>
              </div>
            </div>
          )}

          {/* Results Visualizer Card */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Primary Score Ring Card */}
              <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 shadow-xl border border-white/95 relative overflow-hidden">
                {/* Micro Sheen */}
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Overall ATS Rating
                  </span>
                  {result.isCached ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-600" /> Instant Result
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
                      AI Verified
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 justify-center sm:justify-start">
                  {/* Circular SVG Gauge */}
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background track */}
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      {/* Animated score stroke */}
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke={scoreTheme.stroke}
                        strokeWidth="8"
                        strokeDasharray={264}
                        strokeDashoffset={264}
                        animate={{ strokeDashoffset: 264 - (264 * result.score) / 100 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black text-slate-900 leading-none">
                        {result.score}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 mt-0.5">/ 100</span>
                    </div>
                  </div>

                  {/* Verdict & Role Match Info */}
                  <div className="text-center sm:text-left space-y-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${scoreTheme.bg} text-white shadow-xs`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {result.verdict}
                    </span>
                    <h3 className="text-base font-bold text-slate-800">
                      {targetRole ? `Aligned for "${targetRole}"` : "General ATS Compatibility"}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {result.score >= 85
                        ? "Outstanding profile. Passes automated screening filters with strong keyword & metric density."
                        : result.score >= 70
                        ? "Good foundation. A few key metric tweaks and missing keywords will unlock top candidate rankings."
                        : "Substantial room for optimization. Address critical issues to avoid early ATS filtering."}
                    </p>
                  </div>
                </div>

                {/* Sub-Score Bars */}
                <div className="mt-6 space-y-3 pt-5 border-t border-slate-200/80">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">🎯 Quantified Impact & Metrics</span>
                      <span className="text-slate-900">{result.breakdown.impact}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.breakdown.impact}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-blue-600 rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">🔑 Keywords & Skill Density</span>
                      <span className="text-slate-900">{result.breakdown.keywords}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.breakdown.keywords}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="h-full bg-indigo-600 rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">📏 Brevity & Action Verb Strength</span>
                      <span className="text-slate-900">{result.breakdown.brevity}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.breakdown.brevity}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full bg-purple-600 rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">🏛️ ATS Structure & Layout Clarity</span>
                      <span className="text-slate-900">{result.breakdown.structure}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.breakdown.structure}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full bg-emerald-600 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Missing Keywords Box */}
              {result.missingKeywords && result.missingKeywords.length > 0 && (
                <div className="glass-panel rounded-3xl p-5 border border-white/80">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-blue-600" />
                      Missing High-Impact Keywords
                    </span>
                    <span className="text-[11px] text-slate-400">Click to copy</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((keyword) => (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => handleCopyKeyword(keyword)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-xl bg-blue-50/90 text-blue-800 border border-blue-200/80 hover:bg-blue-100/90 hover:border-blue-300 transition-all select-none"
                      >
                        {keyword}
                        {copiedKeyword === keyword ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-blue-400 opacity-60" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Red Flags */}
              <div className="grid grid-cols-1 gap-4">
                {/* Strengths */}
                {result.strengths && result.strengths.length > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Key ATS Strengths
                    </h4>
                    <ul className="space-y-1.5 text-xs text-emerald-900/90">
                      {result.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Critical Issues */}
                {result.criticalIssues && result.criticalIssues.length > 0 && (
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80">
                    <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Critical ATS Red Flags
                    </h4>
                    <ul className="space-y-1.5 text-xs text-rose-900/90">
                      {result.criticalIssues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Quick High-ROI Fixes */}
              {result.quickFixes && result.quickFixes.length > 0 && (
                <div className="glass-panel rounded-3xl p-5 border border-white/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    High-ROI Actionable Fixes
                  </h4>
                  <div className="space-y-2.5">
                    {result.quickFixes.map((fix, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-white/90 border border-slate-200/90 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{fix.section}</span>
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            Issue
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{fix.issue}</p>
                        <p className="text-blue-700 font-medium text-[11px] pt-1 border-t border-slate-100 flex items-start gap-1">
                          <span className="font-bold text-blue-900">Recommendation:</span> {fix.fix}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyFullReport}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReport ? "Report Copied!" : "Copy Audit Report"}</span>
                </button>

                <Link
                  href="/editor"
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <span>Apply Fixes in Editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
