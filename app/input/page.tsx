"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { extractTextFromPdf } from "@/lib/pdfExtractor";
import StepIndicator from "@/components/StepIndicator";

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

export default function InputPage() {
  const router = useRouter();

  // State for user input text
  const [inputText, setInputText] = useState("");
  // State for validation error message
  const [errorMessage, setErrorMessage] = useState("");
  // State for uploaded file details
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileSize, setUploadedFileSize] = useState("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Load existing input from localStorage on component mount
  useEffect(() => {
    const savedText = localStorage.getItem("resume_raw_text");
    if (savedText) {
      setInputText(savedText);
    }
    const savedFileName = localStorage.getItem("resume_file_name");
    if (savedFileName) {
      setUploadedFileName(savedFileName);
    }
  }, []);

  // Handle form submission to continue to next screen
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that textarea is not empty
    if (!inputText.trim()) {
      setErrorMessage("Please enter your information or upload a resume first.");
      return;
    }

    // Save to localStorage so it persists across pages
    localStorage.setItem("resume_raw_text", inputText.trim());
    if (uploadedFileName) {
      localStorage.setItem("resume_file_name", uploadedFileName);
    } else {
      localStorage.removeItem("resume_file_name");
    }
    // Remove older cached resume_data so fresh info is extracted
    localStorage.removeItem("resume_data");
    setErrorMessage("");

    // Navigate to role selection page
    router.push("/role");
  };

  // Handler for file upload input with real PDF/text extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingFile(true);
      setUploadedFileName(file.name);
      localStorage.setItem("resume_file_name", file.name);
      localStorage.removeItem("resume_data");

      // Calculate file size in KB/MB
      const sizeStr =
        file.size < 1024 * 1024
          ? `${(file.size / 1024).toFixed(1)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      setUploadedFileSize(sizeStr);

      try {
        let extracted = "";
        if (file.name.toLowerCase().endsWith(".pdf")) {
          const pdfText = await extractTextFromPdf(file);
          extracted = pdfText || "";
          setInputText(extracted);
          localStorage.setItem("resume_raw_text", extracted);
        } else if (file.type.includes("text") || file.name.endsWith(".txt")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
              setInputText(content);
              localStorage.setItem("resume_raw_text", content);
            }
          };
          reader.readAsText(file);
        } else {
          const reader = new FileReader();
          reader.onload = (event) => {
            const content = (event.target?.result as string) || "";
            setInputText(content.slice(0, 3000));
            localStorage.setItem("resume_raw_text", content.slice(0, 3000));
          };
          reader.readAsText(file);
        }
      } catch (err) {
        console.error("Error reading file:", err);
      } finally {
        setIsProcessingFile(false);
      }

      setErrorMessage("");
    }
  };

  // Dedicated handler for submitting the uploaded resume
  const handleSubmitUploadedResume = () => {
    const textToSave = inputText.trim();
    if (textToSave) {
      localStorage.setItem("resume_raw_text", textToSave);
    }
    localStorage.setItem("resume_file_name", uploadedFileName);
    localStorage.removeItem("resume_data");
    router.push("/role");
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setUploadedFileName("");
    setUploadedFileSize("");
    localStorage.removeItem("resume_file_name");
    localStorage.removeItem("resume_data");
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_PROFILE);
    setUploadedFileName("");
    setErrorMessage("");
  };

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6">
      <StepIndicator currentStep={1} />

      {/* Page Heading */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Enter Your Information
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-1.5">
          Upload an existing resume or paste your experience, skills, and projects below.
        </p>
      </div>

      {/* Upload Section Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">
              Option 1: Upload Existing Resume
            </span>
            <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200/60">
              Fast Track
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Upload your resume file (.pdf, .docx, .txt) to automatically extract your career history.
        </p>

        {!uploadedFileName ? (
          <label className="group cursor-pointer border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/20 rounded-xl p-6 transition-all flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600 mb-2.5 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
              Click to browse or drop resume here
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Supports PDF, DOCX, or TXT (Max 10MB)
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-4">
            {/* File Info Box */}
            <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center text-emerald-700 font-bold text-xs flex-shrink-0">
                  FILE
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-emerald-950 truncate">
                    {uploadedFileName}
                  </p>
                  <p className="text-xs text-emerald-700">
                    {uploadedFileSize ? `${uploadedFileSize} • ` : ""}
                    {isProcessingFile ? "Extracting content..." : "Ready to proceed"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2.5 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Remove
              </button>
            </div>

            {/* Direct Submit Button for Uploaded Resume */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <p className="text-xs text-slate-500">
                {isProcessingFile
                  ? "Parsing document text..."
                  : "Content extracted! You can edit details below or continue directly."}
              </p>
              <button
                type="button"
                onClick={handleSubmitUploadedResume}
                disabled={isProcessingFile}
                className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-xs cursor-pointer"
              >
                <span>Continue to Target Role</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative flex py-2 items-center mb-6">
        <div className="flex-grow border-t border-slate-200/80"></div>
        <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Option 2: Enter or Edit Information Manually
        </span>
        <div className="flex-grow border-t border-slate-200/80"></div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleContinue} className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="rawInfo" className="block text-sm font-bold text-slate-900">
            Career, Education &amp; Project Details
          </label>
          <button
            type="button"
            onClick={handleLoadSample}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
          >
            Load Sample Profile
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Paste your bullet points, rough notes, or LinkedIn summary. Our parser will categorize your experience automatically.
        </p>

        <textarea
          id="rawInfo"
          rows={8}
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            if (errorMessage) setErrorMessage("");
          }}
          placeholder="Example:
I have 3 years of experience as a Full Stack Developer at Acme Corp. Built React/Node.js web apps, optimized SQL queries, and integrated AWS S3. Graduated with a B.S. in Computer Science in 2021. Skilled in TypeScript, React, Next.js, Node.js, Docker, and PostgreSQL."
          className="w-full border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl p-3.5 text-sm text-slate-900 leading-relaxed placeholder:text-slate-400 focus:outline-none"
        />

        {/* Validation Error Message */}
        {errorMessage && (
          <div className="mt-3 text-xs text-rose-700 bg-rose-50 border border-rose-200/80 rounded-lg p-2.5 flex items-center gap-1.5 font-medium">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
          <Link
            href="/"
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            &larr; Back to Home
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-xs cursor-pointer"
          >
            <span>Next: Target Role</span>
            <span>&rarr;</span>
          </button>
        </div>
      </form>
    </div>
  );
}
