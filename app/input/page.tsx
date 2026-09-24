"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { extractTextFromPdf } from "@/lib/pdfExtractor";
import StepIndicator from "@/components/StepIndicator";
import { clearAllResumeData, notifyStorageChange } from "@/lib/storage";

const SAMPLE_PROFILE = `Alex Morgan
alex.morgan@email.com | +1 (555) 019-2834 | San Francisco, CA | linkedin.com/in/alexmorgan

Summary:
Results-oriented Software Engineer with 4+ years of hands-on experience designing, developing, and maintaining high-performance web applications and distributed backend microservices.

Experience:
- Senior Software Engineer at Apex Cloud Solutions (2022 - Present)
  Architected high-throughput REST APIs handling 5M+ daily requests with 99.98% uptime.
  Optimized PostgreSQL queries, cutting p95 response latencies by 42%.
  Mentored junior software engineers on clean code, unit testing, and CI/CD pipelines.

- Software Developer at TechPulse Labs (2021 - 2022)
  Developed responsive web interfaces using Next.js, React, and Tailwind CSS.
  Built automated test suites achieving over 90% test coverage.

Education:
- B.S. in Computer Science, University of California Berkeley (2018 - 2022)

Skills:
TypeScript, React, Next.js, Node.js, Python, PostgreSQL, Docker, AWS, Git, REST APIs`;

type InputMethod = "manual" | "upload" | "github" | "linkedin";

interface GitHubUser {
  login: string;
  name: string;
  bio: string;
  location: string;
  blog: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  language: string;
  topics: string[];
  stargazers_count: number;
  fork: boolean;
  updated_at: string;
}

export default function InputPage() {
  const router = useRouter();

  // Selected input method among the 4 options
  const [activeMethod, setActiveMethod] = useState<InputMethod>("manual");

  // State for manual input text
  const [inputText, setInputText] = useState("");
  // State for validation error message
  const [errorMessage, setErrorMessage] = useState("");

  // State for uploaded resume file details (Option 2)
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileSize, setUploadedFileSize] = useState("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // State for GitHub Profile (Option 3)
  const [githubQuery, setGithubQuery] = useState("");
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepoIds, setSelectedRepoIds] = useState<number[]>([]);

  // State for LinkedIn Profile (Option 4)
  const [linkedinTab, setLinkedinTab] = useState<"paste" | "upload">("paste");
  const [linkedinText, setLinkedinText] = useState("");
  const [linkedinFileName, setLinkedinFileName] = useState("");
  const [isProcessingLinkedinPdf, setIsProcessingLinkedinPdf] = useState(false);

  // State to track if previous cached draft was loaded
  const [hasExistingDraft, setHasExistingDraft] = useState(false);

  // Load existing input from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("new=true")) {
      const chosenTemplate = localStorage.getItem("resume_template");
      clearAllResumeData();
      if (chosenTemplate) {
        localStorage.setItem("resume_template", chosenTemplate);
        notifyStorageChange();
      }
      resetAllStates();
      router.replace("/input");
      return;
    }

    if (typeof window !== "undefined" && window.location.search.includes("missing_info")) {
      setErrorMessage("Please enter your resume information or upload a file first before proceeding.");
    }

    const savedText = localStorage.getItem("resume_raw_text");
    if (savedText && savedText.trim().length >= 25) {
      setInputText(savedText);
      setHasExistingDraft(true);
    }
    const savedFileName = localStorage.getItem("resume_file_name");
    if (savedFileName) {
      setUploadedFileName(savedFileName);
    }
  }, [router]);

  const resetAllStates = () => {
    setInputText("");
    setUploadedFileName("");
    setUploadedFileSize("");
    setErrorMessage("");
    setHasExistingDraft(false);
    setGithubQuery("");
    setGithubUser(null);
    setGithubRepos([]);
    setSelectedRepoIds([]);
    setLinkedinText("");
    setLinkedinFileName("");
  };

  const handleClearAll = () => {
    resetAllStates();
    clearAllResumeData();
  };

  // Helper to commit raw resume text and navigate to role selection
  const commitTextAndContinue = (textToSave: string, fileName?: string) => {
    const trimmed = textToSave.trim();
    if (!trimmed || trimmed.length < 25) {
      setErrorMessage("Please ensure your information contains readable text (at least 25 characters).");
      return;
    }

    const previousSavedText = (localStorage.getItem("resume_raw_text") || "").trim();
    if (previousSavedText !== trimmed) {
      localStorage.removeItem("resume_data");
      localStorage.removeItem("resume_extract_hash");
      localStorage.removeItem("resume_tailored_hash");
      localStorage.removeItem("resume_extracted");
      localStorage.removeItem("resume_tailored");
    }

    localStorage.setItem("resume_raw_text", trimmed);
    if (fileName) {
      localStorage.setItem("resume_file_name", fileName);
    }
    notifyStorageChange();
    setErrorMessage("");
    router.push("/role");
  };

  // ───────────────────────────────────────────────────────────────────────────
  // OPTION 1: Manual Enter Information
  // ───────────────────────────────────────────────────────────────────────────
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || inputText.trim().length < 25) {
      setErrorMessage("Please enter your actual resume information (minimum 25 characters).");
      return;
    }
    commitTextAndContinue(inputText, uploadedFileName || "Manual Entry");
  };

  const handleLoadSample = () => {
    clearAllResumeData();
    setInputText(SAMPLE_PROFILE);
    setUploadedFileName("");
    setUploadedFileSize("");
    setErrorMessage("");
    setHasExistingDraft(false);
    notifyStorageChange();
  };

  // ───────────────────────────────────────────────────────────────────────────
  // OPTION 2: Upload Resume (PDF / DOCX / TXT)
  // ───────────────────────────────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileLower = file.name.toLowerCase();
    const isSupported =
      fileLower.endsWith(".pdf") ||
      fileLower.endsWith(".docx") ||
      fileLower.endsWith(".doc") ||
      fileLower.endsWith(".txt") ||
      file.type.includes("text");

    if (!isSupported) {
      setErrorMessage("Please upload a PDF or DOCX file.");
      return;
    }

    clearAllResumeData();
    setHasExistingDraft(false);
    setIsProcessingFile(true);
    setUploadedFileName(file.name);
    setErrorMessage("");

    const sizeStr =
      file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    setUploadedFileSize(sizeStr);

    try {
      let extracted = "";
      if (fileLower.endsWith(".pdf")) {
        extracted = await extractTextFromPdf(file);
      } else {
        extracted = await file.text();
      }

      if (!extracted || extracted.trim().length < 25) {
        setErrorMessage("Could not read enough text from this file. Please verify the file or paste the text manually.");
        setIsProcessingFile(false);
        return;
      }

      setInputText(extracted);
      localStorage.setItem("resume_raw_text", extracted);
      localStorage.setItem("resume_file_name", file.name);
      notifyStorageChange();
    } catch (err) {
      console.error("Error reading file:", err);
      setErrorMessage("Failed to read file. Please upload a PDF or DOCX file, or paste your text manually.");
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleSubmitUploadedResume = () => {
    if (!inputText.trim() || inputText.trim().length < 25) {
      setErrorMessage("Please ensure your uploaded resume contains readable text (at least 25 characters).");
      return;
    }
    commitTextAndContinue(inputText, uploadedFileName || "Uploaded Resume");
  };

  const handleRemoveFile = () => {
    setUploadedFileName("");
    setUploadedFileSize("");
    setInputText("");
    setHasExistingDraft(false);
    clearAllResumeData();
  };

  // ───────────────────────────────────────────────────────────────────────────
  // OPTION 3: GitHub Profile
  // ───────────────────────────────────────────────────────────────────────────
  const extractUsernameFromGithubInput = (input: string): string => {
    let clean = input.trim();
    clean = clean.replace(/^https?:\/\/(www\.)?github\.com\//i, "");
    clean = clean.replace(/^github\.com\//i, "");
    clean = clean.replace(/^@/, "");
    clean = clean.split("/")[0].split("?")[0].split("#")[0];
    return clean.trim();
  };

  const handleFetchGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const username = extractUsernameFromGithubInput(githubQuery);
    if (!username) {
      setErrorMessage("Please enter your GitHub username or profile URL.");
      return;
    }

    setIsFetchingGithub(true);
    try {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Unable to fetch GitHub information. Please try again.");
        setIsFetchingGithub(false);
        return;
      }

      setGithubUser(data.user);
      setGithubRepos(data.repos || []);

      // By default, select the top 6 non-fork repositories with descriptions or languages
      const defaultSelected = (data.repos || [])
        .filter((r: GitHubRepo) => !r.fork)
        .slice(0, 6)
        .map((r: GitHubRepo) => r.id);

      setSelectedRepoIds(
        defaultSelected.length > 0
          ? defaultSelected
          : (data.repos || []).slice(0, 5).map((r: GitHubRepo) => r.id)
      );
    } catch (err) {
      console.error("Error fetching GitHub:", err);
      setErrorMessage("Unable to fetch GitHub information. Please try again.");
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const toggleRepoSelection = (repoId: number) => {
    setSelectedRepoIds((prev) =>
      prev.includes(repoId) ? prev.filter((id) => id !== repoId) : [...prev, repoId]
    );
  };

  const handleSelectAllRepos = () => {
    setSelectedRepoIds(githubRepos.map((r) => r.id));
  };

  const handleDeselectAllRepos = () => {
    setSelectedRepoIds([]);
  };

  const handleContinueWithGithub = () => {
    if (!githubUser) return;

    const chosenRepos = githubRepos.filter((r) => selectedRepoIds.includes(r.id));
    const allLanguages = Array.from(
      new Set(chosenRepos.map((r) => r.language).filter(Boolean))
    );

    // Format GitHub data cleanly into structured resume text
    let formatted = `Full Name: ${githubUser.name || githubUser.login}\n`;
    formatted += `GitHub Profile: ${githubUser.html_url}\n`;
    if (githubUser.location) formatted += `Location: ${githubUser.location}\n`;
    if (githubUser.blog) formatted += `Portfolio/Website: ${githubUser.blog}\n`;

    if (githubUser.bio) {
      formatted += `\nProfessional Summary:\n${githubUser.bio}\n`;
    }

    if (allLanguages.length > 0) {
      formatted += `\nTechnical Skills & Languages:\n${allLanguages.join(", ")}\n`;
    }

    if (chosenRepos.length > 0) {
      formatted += `\nFeatured Projects & Repositories:\n`;
      chosenRepos.forEach((repo) => {
        formatted += `- Project: ${repo.name}\n`;
        if (repo.description) {
          formatted += `  Description: ${repo.description}\n`;
        }
        if (repo.language) {
          formatted += `  Technologies: ${repo.language}`;
          if (repo.topics && repo.topics.length > 0) {
            formatted += `, ${repo.topics.join(", ")}`;
          }
          formatted += `\n`;
        }
        formatted += `  GitHub URL: ${repo.html_url}\n`;
      });
    }

    commitTextAndContinue(formatted, `GitHub: @${githubUser.login}`);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // OPTION 4: LinkedIn Profile (Paste Text or Upload PDF Export)
  // ───────────────────────────────────────────────────────────────────────────
  const handleLinkedinPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Please upload a PDF file containing your LinkedIn profile export.");
      return;
    }

    setIsProcessingLinkedinPdf(true);
    setLinkedinFileName(file.name);
    setErrorMessage("");

    try {
      const extracted = await extractTextFromPdf(file);
      if (!extracted || extracted.trim().length < 25) {
        setErrorMessage("Could not read text from this LinkedIn PDF. Please paste your profile text directly.");
        setIsProcessingLinkedinPdf(false);
        return;
      }
      setLinkedinText(extracted);
    } catch (err) {
      console.error("LinkedIn PDF Extraction error:", err);
      setErrorMessage("Failed to read LinkedIn PDF. Please paste your profile information directly.");
    } finally {
      setIsProcessingLinkedinPdf(false);
    }
  };

  const handleContinueWithLinkedin = () => {
    const trimmed = linkedinText.trim();
    if (!trimmed || trimmed.length < 25) {
      setErrorMessage("Please provide your LinkedIn information.");
      return;
    }
    commitTextAndContinue(trimmed, linkedinFileName || "LinkedIn Profile");
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-6">
      <StepIndicator currentStep={1} />

      {/* Main Page Heading */}
      <div className="text-center sm:text-left mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          How would you like to provide your information?
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-1.5 leading-relaxed">
          Choose any of the four options below to supply your career history and skills.
        </p>
      </div>

      {/* Existing Draft Alert Banner */}
      {hasExistingDraft && (
        <div className="mb-6 p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs text-amber-950 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📋</span>
            <span>
              <strong>Draft loaded from browser storage:</strong> You can continue editing below or wipe cache.
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearAll}
            className="font-bold text-rose-600 hover:text-rose-800 underline ml-2 cursor-pointer flex-shrink-0"
          >
            Clear Cache &amp; Start Fresh
          </button>
        </div>
      )}

      {/* Four Method Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Card 1: Enter Information */}
        <div
          onClick={() => {
            setActiveMethod("manual");
            setErrorMessage("");
          }}
          className={`cursor-pointer rounded-2xl p-5 select-none flex flex-col justify-between transition-all duration-300 ${
            activeMethod === "manual"
              ? "glass-panel-elevated ring-4 ring-blue-500/15 border-blue-600 bg-white/95 shadow-md -translate-y-1"
              : "glass-panel weightless-card hover:-translate-y-1 hover:border-slate-300"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100/60 border border-blue-200/60 flex items-center justify-center text-lg">
                ✍️
              </div>
              {activeMethod === "manual" ? (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                  Active
                </span>
              ) : (
                <span className="text-xs text-slate-400 group-hover:text-slate-600">&rarr;</span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Enter Information
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Paste your achievements, skills, education, and career experience.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className={`font-semibold ${activeMethod === "manual" ? "text-blue-700" : "text-slate-500"}`}>
              Manual Input
            </span>
            <span className={`font-medium ${activeMethod === "manual" ? "text-blue-600" : "text-slate-400"}`}>
              {activeMethod === "manual" ? "Editing below" : "Select"}
            </span>
          </div>
        </div>

        {/* Card 2: Upload Resume */}
        <div
          onClick={() => {
            setActiveMethod("upload");
            setErrorMessage("");
          }}
          className={`cursor-pointer rounded-2xl p-5 select-none flex flex-col justify-between transition-all duration-300 ${
            activeMethod === "upload"
              ? "glass-panel-elevated ring-4 ring-blue-500/15 border-blue-600 bg-white/95 shadow-md -translate-y-1"
              : "glass-panel weightless-card hover:-translate-y-1 hover:border-slate-300"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100/60 border border-emerald-200/60 flex items-center justify-center text-lg">
                📄
              </div>
              {activeMethod === "upload" ? (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                  Active
                </span>
              ) : (
                <span className="text-xs text-slate-400 group-hover:text-slate-600">&rarr;</span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Upload Resume
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload an existing PDF or DOCX resume to extract data automatically.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className={`font-semibold ${activeMethod === "upload" ? "text-blue-700" : "text-slate-500"}`}>
              PDF / DOCX
            </span>
            <span className={`font-medium ${activeMethod === "upload" ? "text-blue-600" : "text-slate-400"}`}>
              {activeMethod === "upload" ? "Editing below" : "Select"}
            </span>
          </div>
        </div>

        {/* Card 3: GitHub Profile */}
        <div
          onClick={() => {
            setActiveMethod("github");
            setErrorMessage("");
          }}
          className={`cursor-pointer rounded-2xl p-5 select-none flex flex-col justify-between transition-all duration-300 ${
            activeMethod === "github"
              ? "glass-panel-elevated ring-4 ring-blue-500/15 border-blue-600 bg-white/95 shadow-md -translate-y-1"
              : "glass-panel weightless-card hover:-translate-y-1 hover:border-slate-300"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-lg">
                🐙
              </div>
              {activeMethod === "github" ? (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                  Active
                </span>
              ) : (
                <span className="text-xs text-slate-400 group-hover:text-slate-600">&rarr;</span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              GitHub Profile
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Import public repositories, tech stacks, and open-source projects.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className={`font-semibold ${activeMethod === "github" ? "text-blue-700" : "text-slate-500"}`}>
              Public Repositories
            </span>
            <span className={`font-medium ${activeMethod === "github" ? "text-blue-600" : "text-slate-400"}`}>
              {activeMethod === "github" ? "Editing below" : "Select"}
            </span>
          </div>
        </div>

        {/* Card 4: LinkedIn Profile */}
        <div
          onClick={() => {
            setActiveMethod("linkedin");
            setErrorMessage("");
          }}
          className={`cursor-pointer rounded-2xl p-5 select-none flex flex-col justify-between transition-all duration-300 ${
            activeMethod === "linkedin"
              ? "glass-panel-elevated ring-4 ring-blue-500/15 border-blue-600 bg-white/95 shadow-md -translate-y-1"
              : "glass-panel weightless-card hover:-translate-y-1 hover:border-slate-300"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-lg">
                💼
              </div>
              {activeMethod === "linkedin" ? (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                  Active
                </span>
              ) : (
                <span className="text-xs text-slate-400 group-hover:text-slate-600">&rarr;</span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              LinkedIn Profile
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Use information from your LinkedIn profile via paste or PDF.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className={`font-semibold ${activeMethod === "linkedin" ? "text-blue-700" : "text-slate-500"}`}>
              Paste or PDF
            </span>
            <span className={`font-medium ${activeMethod === "linkedin" ? "text-blue-600" : "text-slate-400"}`}>
              {activeMethod === "linkedin" ? "Editing below" : "Select"}
            </span>
          </div>
        </div>
      </div>

      {/* Global Validation Error Message */}
      {errorMessage && (
        <div className="mb-6 text-xs text-rose-700 bg-rose-50 border border-rose-200/80 rounded-2xl p-3.5 flex items-center gap-2 font-medium shadow-2xs">
          <span className="text-sm">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ACTIVE METHOD 1: Enter Information Manually                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeMethod === "manual" && (
        <form onSubmit={handleManualSubmit} className="glass-panel-elevated rounded-2xl p-5 sm:p-6 shadow-md border border-slate-200/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <label htmlFor="rawInfo" className="block text-sm font-bold text-slate-900">
              Paste or Enter Your Information
            </label>
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              {inputText.trim() && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-slate-400 hover:text-rose-600 font-medium transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer shadow-2xs"
              >
                Load Sample Profile ✨
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-3.5 leading-relaxed">
            Paste your achievements, technical projects, work experience, education, and skills. AI will organize it into ATS structure.
          </p>

          <div className="relative">
            <textarea
              id="rawInfo"
              rows={9}
              value={inputText}
              onChange={(e) => {
                const val = e.target.value;
                setInputText(val);
                if (errorMessage) setErrorMessage("");
                if (val.trim().length < 25) {
                  localStorage.removeItem("resume_raw_text");
                  localStorage.removeItem("resume_data");
                  notifyStorageChange();
                }
              }}
              placeholder="e.g. Alex Morgan, Software Engineer intern. Built a React dashboard with 5k users, completed B.S. in Computer Science with 3.8 GPA, skilled in TypeScript, Python, and SQL..."
              className="w-full border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl p-4 text-sm text-slate-900 leading-relaxed placeholder:text-slate-400 focus:outline-none"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
              <span>Minimum 25 characters required</span>
              <span className={`font-mono font-medium ${inputText.trim().length >= 25 ? "text-emerald-600" : "text-slate-400"}`}>
                {inputText.trim().length >= 25 ? "✓ " : ""}{inputText.trim().length} chars
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
            >
              <span>&larr;</span>
              <span>Back to Home</span>
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-xs hover:shadow cursor-pointer"
            >
              <span>Continue to Select Role</span>
              <span>&rarr;</span>
            </button>
          </div>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ACTIVE METHOD 2: Upload Resume                                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeMethod === "upload" && (
        <div className="glass-panel-elevated rounded-2xl p-5 sm:p-6 shadow-md border border-slate-200/90">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-900">
              Upload Resume Document
            </h2>
            <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2.5 py-0.5 rounded-full border border-blue-200/70">
              PDF or DOCX
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Upload an existing PDF or DOCX resume to extract your career history automatically.
          </p>

          {!uploadedFileName ? (
            <label className="group cursor-pointer border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl p-8 sm:p-10 transition-all flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-105 transition-transform shadow-2xs">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                Click to browse or drop resume here
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Supports PDF, DOCX, or DOC (Max 10MB)
              </span>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-700 font-bold text-xs flex-shrink-0">
                    PDF
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-emerald-950 truncate">
                      {uploadedFileName}
                    </p>
                    <p className="text-xs text-emerald-700 font-medium">
                      {uploadedFileSize ? `${uploadedFileSize} • ` : ""}
                      {isProcessingFile ? "Extracting text..." : "Content extracted successfully"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer flex-shrink-0"
                >
                  Remove
                </button>
              </div>

              {/* Extracted text preview with edit ability */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Extracted Resume Text (Review or refine if needed):
                </label>
                <textarea
                  rows={7}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3.5 text-xs text-slate-800 font-mono leading-relaxed bg-slate-50/40"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Upload a different file
                </button>
                <button
                  type="button"
                  onClick={handleSubmitUploadedResume}
                  disabled={isProcessingFile}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-xs cursor-pointer"
                >
                  <span>Continue to Select Role</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ACTIVE METHOD 3: GitHub Profile                                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeMethod === "github" && (
        <div className="glass-panel-elevated rounded-2xl p-5 sm:p-6 shadow-md border border-slate-200/90">
          {!githubUser ? (
            <div>
              <div className="mb-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Import GitHub Profile
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Use public GitHub information (bio, public repositories, and languages) to build your technical resume. No password required.
                </p>
              </div>

              <form onSubmit={handleFetchGithub} className="space-y-4">
                <div>
                  <label htmlFor="githubInput" className="block text-xs font-bold text-slate-700 mb-1.5">
                    GitHub Username or Profile URL
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <input
                      id="githubInput"
                      type="text"
                      value={githubQuery}
                      onChange={(e) => {
                        setGithubQuery(e.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                      placeholder="Enter GitHub username (e.g. anuj123) or https://github.com/username"
                      className="flex-1 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isFetchingGithub}
                      className="bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                    >
                      {isFetchingGithub ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Fetching...</span>
                        </>
                      ) : (
                        <>
                          <span>Fetch Repos</span>
                          <span>&rarr;</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Example: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">anuj123</code> or <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">https://github.com/username</code>
                  </p>
                </div>
              </form>
            </div>
          ) : (
            /* GITHUB REVIEW SCREEN */
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    GitHub Information Found
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review your profile and select which repositories should be considered for your resume.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setGithubUser(null);
                    setGithubRepos([]);
                    setSelectedRepoIds([]);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Change User
                </button>
              </div>

              {/* User Bio Card */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {githubUser.name}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      @{githubUser.login}
                    </span>
                  </div>
                  {githubUser.bio && (
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {githubUser.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                    {githubUser.location && <span>📍 {githubUser.location}</span>}
                    {githubUser.blog && <span>🔗 {githubUser.blog}</span>}
                    <span>📦 {githubUser.public_repos} public repos</span>
                  </div>
                </div>

                <a
                  href={githubUser.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs flex-shrink-0"
                >
                  View on GitHub &rarr;
                </a>
              </div>

              {/* Repositories Selection List */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Select Repositories for Resume ({selectedRepoIds.length} of {githubRepos.length} selected):
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleSelectAllRepos}
                      className="text-blue-600 hover:underline cursor-pointer font-medium"
                    >
                      Select all
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllRepos}
                      className="text-slate-500 hover:underline cursor-pointer font-medium"
                    >
                      Deselect all
                    </button>
                  </div>
                </div>

                {githubRepos.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                    No public repositories found for this user.
                  </p>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1 border border-slate-200/80 rounded-2xl p-3 bg-slate-50/50">
                    {githubRepos.map((repo) => {
                      const isChecked = selectedRepoIds.includes(repo.id);
                      return (
                        <label
                          key={repo.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? "bg-white border-blue-500 shadow-2xs"
                              : "bg-white/70 border-slate-200 opacity-75 hover:opacity-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleRepoSelection(repo.id)}
                            className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {repo.name}
                              </span>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {repo.language && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                                    {repo.language}
                                  </span>
                                )}
                                {repo.stargazers_count > 0 && (
                                  <span className="text-[10px] text-amber-600 font-semibold">
                                    ★ {repo.stargazers_count}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {repo.description || "No description provided"}
                            </p>
                            <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
                              {repo.html_url}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setGithubUser(null);
                    setGithubRepos([]);
                    setSelectedRepoIds([]);
                  }}
                  className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={handleContinueWithGithub}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-xs cursor-pointer"
                >
                  <span>Continue to Select Role</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ACTIVE METHOD 4: LinkedIn Profile                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeMethod === "linkedin" && (
        <div className="glass-panel-elevated rounded-2xl p-5 sm:p-6 shadow-md border border-slate-200/90">
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Add LinkedIn Information
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              We do not scrape LinkedIn or ask for passwords. Choose either of the two simple methods below to provide your profile information:
            </p>
          </div>

          {/* Sub-tab selection between Paste and Upload PDF */}
          <div className="flex border-b border-slate-200/90 mb-5 gap-2">
            <button
              type="button"
              onClick={() => {
                setLinkedinTab("paste");
                setErrorMessage("");
              }}
              className={`pb-2.5 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                linkedinTab === "paste"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Method 1: Paste Profile Text
            </button>
            <button
              type="button"
              onClick={() => {
                setLinkedinTab("upload");
                setErrorMessage("");
              }}
              className={`pb-2.5 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                linkedinTab === "upload"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Method 2: Upload LinkedIn PDF
            </button>
          </div>

          {linkedinTab === "paste" ? (
            /* Method 1: Paste Text */
            <div className="space-y-3">
              <label htmlFor="linkedinTextInput" className="block text-xs font-semibold text-slate-700">
                Paste information from your LinkedIn profile here:
              </label>
              <p className="text-[11px] text-slate-400">
                Tip: Copy and paste your headline, About section, Experience, Education, and Skills directly from your LinkedIn profile.
              </p>
              <textarea
                id="linkedinTextInput"
                rows={9}
                value={linkedinText}
                onChange={(e) => {
                  setLinkedinText(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="Paste information from your LinkedIn profile here...

Example:
Alex Morgan
Senior Software Engineer at Apex Cloud Solutions
San Francisco, California, United States

About:
Results-driven engineer with 5 years of experience...

Experience:
Senior Software Engineer
Apex Cloud Solutions · Full-time
Jan 2022 - Present · 2 yrs 8 mos
- Built microservices in Go and Python...

Education:
University of California, Berkeley
Bachelor of Science - BS, Computer Science

Skills:
TypeScript · Next.js · Node.js · PostgreSQL"
                className="w-full border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl p-3.5 text-sm text-slate-900 leading-relaxed placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          ) : (
            /* Method 2: Upload PDF */
            <div className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900 shadow-2xs">
                <span className="font-bold">How to download your LinkedIn PDF:</span>
                <ol className="list-decimal list-inside mt-1.5 space-y-1 text-blue-800">
                  <li>Go to your LinkedIn profile in a browser.</li>
                  <li>Click the <strong>&quot;More&quot;</strong> button near your profile picture.</li>
                  <li>Select <strong>&quot;Save to PDF&quot;</strong> and upload the downloaded document below.</li>
                </ol>
              </div>

              {!linkedinFileName ? (
                <label className="group cursor-pointer border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 mb-2.5 group-hover:scale-105 transition-transform shadow-2xs">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    Upload LinkedIn Profile / Resume PDF
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Accepts official LinkedIn exported .pdf document
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleLinkedinPdfUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3.5 shadow-2xs">
                    <span className="text-xs font-bold text-emerald-950 truncate">
                      📄 {linkedinFileName}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setLinkedinFileName("");
                        setLinkedinText("");
                      }}
                      className="text-xs text-rose-600 hover:underline ml-2 font-semibold"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Editable preview of extracted LinkedIn text */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Extracted LinkedIn Content (Review or edit below):
                    </label>
                    <textarea
                      rows={7}
                      value={linkedinText}
                      onChange={(e) => setLinkedinText(e.target.value)}
                      className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3.5 text-xs text-slate-800 font-mono leading-relaxed bg-slate-50/40"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
            >
              <span>&larr;</span>
              <span>Back to Home</span>
            </Link>
            <button
              type="button"
              onClick={handleContinueWithLinkedin}
              disabled={isProcessingLinkedinPdf}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-xs cursor-pointer disabled:opacity-60"
            >
              <span>Continue to Select Role</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
