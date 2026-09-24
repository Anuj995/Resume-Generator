"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { JOB_ROLES } from "@/data/roles";
import StepIndicator from "@/components/StepIndicator";
import { extractTextFromPdf } from "@/lib/pdfExtractor";
import { computeExtractHash, notifyStorageChange } from "@/lib/storage";

export default function RolePage() {
  const router = useRouter();

  // State for target job role / title
  const [targetRole, setTargetRole] = useState("");
  // State for job description
  const [jdText, setJdText] = useState("");
  const [jdFileName, setJdFileName] = useState("");
  const [isParsingJd, setIsParsingJd] = useState(false);
  const [jdKeywords, setJdKeywords] = useState<string[]>([]);
  // State for extraction loading
  const [isExtracting, setIsExtracting] = useState(false);
  // State for validation error message
  const [errorMessage, setErrorMessage] = useState("");

  // Enforce prerequisite: user must have entered info in Step 1
  useEffect(() => {
    const rawResumeText = (localStorage.getItem("resume_raw_text") || "").trim();
    if (!rawResumeText || rawResumeText.length < 25) {
      router.replace("/input?error=missing_info");
      return;
    }

    const savedRole = localStorage.getItem("resume_target_role");
    if (savedRole) {
      setTargetRole(savedRole);
    }
    const savedJd = localStorage.getItem("resume_job_description");
    if (savedJd) {
      setJdText(savedJd);
    }
  }, [router]);

  const activeRoleData = JOB_ROLES.find(
    (r) => r.name.toLowerCase() === targetRole.trim().toLowerCase()
  );

  // Handle JD File Upload (PDF, Word, or Image Screenshot)
  const handleJdFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingJd(true);
    setJdFileName(file.name);
    setErrorMessage("");

    try {
      const fileNameLower = file.name.toLowerCase();

      if (fileNameLower.endsWith(".pdf")) {
        const text = await extractTextFromPdf(file);
        setJdText(text);
        // Call parse-jd to get clean keywords
        const res = await fetch("/api/parse-jd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.roleTitle && !targetRole) {
            setTargetRole(data.roleTitle);
          }
          if (data.requiredSkills) {
            setJdKeywords(data.requiredSkills);
          }
        }
      } else if (fileNameLower.match(/\.(png|jpe?g|webp)$/)) {
        // Read image screenshot as base64 for Gemini Vision
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          const res = await fetch("/api/parse-jd", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: base64,
              mimeType: file.type || "image/png",
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setJdText(data.cleanDescription || data.summary || "");
            if (data.roleTitle && !targetRole) {
              setTargetRole(data.roleTitle);
            }
            if (data.requiredSkills) {
              setJdKeywords(data.requiredSkills);
            }
          }
          setIsParsingJd(false);
        };
        reader.readAsDataURL(file);
        return; // reader callback completes it
      } else {
        // Plain text or other text document
        const text = await file.text();
        setJdText(text);
      }
    } catch (err) {
      console.error("Failed to parse JD file:", err);
      setErrorMessage("Could not parse file. You can also paste the job description text directly.");
    } finally {
      setIsParsingJd(false);
    }
  };

  // Handle form submission to extract resume with Gemini and continue to Review
  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    const roleToUse = targetRole.trim();

    if (!roleToUse) {
      setErrorMessage("Please select or enter a target job title.");
      return;
    }

    const rawResumeText = (localStorage.getItem("resume_raw_text") || "").trim();
    if (!rawResumeText || rawResumeText.length < 25) {
      setErrorMessage("No valid resume information found. Please return to Step 1 to enter your details.");
      return;
    }

    // Save target role and JD to localStorage
    localStorage.setItem("resume_target_role", roleToUse);
    if (jdText.trim()) {
      localStorage.setItem("resume_job_description", jdText.trim());
    } else {
      localStorage.removeItem("resume_job_description");
    }

    // Check if AI structuring has already been done for this session/input
    const fileName = localStorage.getItem("resume_file_name") || "";
    const extractHash = computeExtractHash(rawResumeText, roleToUse, fileName);
    const existingHash = localStorage.getItem("resume_extract_hash");
    const isAlreadyExtracted = localStorage.getItem("resume_extracted") === "true";
    const savedData = localStorage.getItem("resume_data");

    if ((isAlreadyExtracted || existingHash === extractHash) && savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed && (parsed.personalInfo?.fullName || parsed.skills?.length > 0)) {
          const prevRole = localStorage.getItem("resume_target_role");
          const prevJd = localStorage.getItem("resume_job_description") || "";
          if (prevRole !== roleToUse || prevJd !== jdText.trim()) {
            // Role or JD changed, re-tailoring will be needed on review page
            localStorage.removeItem("resume_tailored");
          }
          parsed.targetRole = roleToUse;
          if (jdText.trim()) {
            parsed.jobDescription = jdText.trim();
          }
          localStorage.setItem("resume_data", JSON.stringify(parsed));
          notifyStorageChange();
          router.push("/organize");
          return;
        }
      } catch {
        // proceed to API call if parse fails
      }
    }

    setIsExtracting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: rawResumeText,
          targetRole: roleToUse,
          fileName,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to extract resume data");
      }

      const { resumeData } = await res.json();

      // Ensure targetRole and jobDescription are saved
      resumeData.targetRole = roleToUse;
      if (jdText.trim()) {
        resumeData.jobDescription = jdText.trim();
      }

      localStorage.setItem("resume_data", JSON.stringify(resumeData));
      localStorage.setItem("resume_extracted", "true");
      localStorage.setItem("resume_extract_hash", extractHash);
      notifyStorageChange();

      // Navigate to Review Your Information page
      router.push("/organize");
    } catch (err: unknown) {
      console.error("Resume extraction failed:", err);
      // Even if network fails, route to organize where local parser fallback handles it
      notifyStorageChange();
      router.push("/organize");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6">
      <StepIndicator currentStep={2} />

      {/* Page Heading */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Target Role &amp; Job Description
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-1.5 leading-relaxed">
          Specify the role you are applying for. Optionally add a job description (text or screenshot) for AI to tailor your resume.
        </p>
      </div>

      {/* Role Selection Form Card */}
      <form onSubmit={handleContinue} className="glass-panel-elevated rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/90 space-y-7">
        {/* Unified Target Job Title / Role Input */}
        <div>
          <label htmlFor="targetRoleInput" className="block text-sm font-bold text-slate-900 mb-1.5">
            Target Job Title / Role <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Type your desired title below, or click any popular suggestion to autofill it.
          </p>

          <div className="relative">
            <input
              id="targetRoleInput"
              type="text"
              placeholder="e.g. Frontend Developer, Data Analyst, Cloud Engineer, Product Designer..."
              value={targetRole}
              onChange={(e) => {
                const val = e.target.value;
                setTargetRole(val);
                if (errorMessage) setErrorMessage("");
                if (!val.trim()) {
                  localStorage.removeItem("resume_target_role");
                  notifyStorageChange();
                }
              }}
              className="w-full border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl p-3.5 text-sm bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none"
            />
            {targetRole && (
              <button
                type="button"
                onClick={() => {
                  setTargetRole("");
                  localStorage.removeItem("resume_target_role");
                  notifyStorageChange();
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick-fill suggestion chips */}
          <div className="mt-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
              Quick Suggestions (Click to fill):
            </span>
            <div className="flex flex-wrap gap-2">
              {JOB_ROLES.map((role) => {
                const isSelected = targetRole.trim().toLowerCase() === role.name.toLowerCase();
                return (
                  <button
                    key={role.name}
                    type="button"
                    onClick={() => {
                      setTargetRole(role.name);
                      if (errorMessage) setErrorMessage("");
                    }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white shadow-xs font-bold"
                        : "bg-slate-50 hover:bg-slate-100/90 border-slate-200 text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    {role.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Role Keywords preview */}
        {activeRoleData && (
          <div className="p-4 bg-blue-50/80 border border-blue-100 rounded-2xl text-xs shadow-2xs">
            <div className="font-bold text-blue-950 mb-2 flex items-center gap-1.5">
              <span className="text-sm">🎯</span>
              <span>Key ATS Focus Keywords for {activeRoleData.name}:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeRoleData.keywords.map((kw) => (
                <span
                  key={kw}
                  className="bg-white text-blue-800 border border-blue-200/80 px-2.5 py-0.5 rounded-full font-semibold text-[11px] shadow-2xs"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── JOB DESCRIPTION SECTION (OPTIONAL) ── */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm font-bold text-slate-900">
                Job Description (Optional)
              </span>
              <span className="ml-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                AI Tailoring
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-3.5 leading-relaxed">
            Paste the job posting text, or upload a PDF, Word document, or screenshot (PNG/JPG). AI will align your existing skills and experience with its exact ATS keywords.
          </p>

          {/* Upload Job Description File / Screenshot */}
          <div className="mb-3.5">
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-4 bg-slate-50/50 hover:bg-blue-50/20 transition-all cursor-pointer text-xs font-semibold text-slate-600">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>{jdFileName ? `Attached: ${jdFileName}` : "Upload JD (PDF, Word, or Screenshot Image)"}</span>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp"
                onChange={handleJdFileUpload}
                className="hidden"
              />
            </label>
            {isParsingJd && (
              <p className="text-[11px] text-blue-600 animate-pulse mt-2 font-medium">
                Parsing job description with AI...
              </p>
            )}
          </div>

          {/* Textarea for Job Description text */}
          <textarea
            rows={4}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Or paste the job description text here (requirements, responsibilities, skills)..."
            className="w-full border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl p-3.5 text-xs bg-slate-50/40 text-slate-900 leading-relaxed placeholder:text-slate-400 focus:outline-none"
          />

          {/* Detected JD Keywords */}
          {jdKeywords.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] font-bold text-slate-500">Detected Requirements:</span>
              {jdKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200/80 rounded-2xl p-3 flex items-center gap-2 font-medium">
            <span className="text-sm">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-100">
          <Link
            href="/input"
            className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            <span>&larr;</span>
            <span>Back to Information</span>
          </Link>
          <button
            type="submit"
            disabled={isExtracting}
            className={`inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-xs cursor-pointer ${
              isExtracting ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isExtracting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Structuring with AI...</span>
              </>
            ) : (
              <>
                <span>Continue to Review</span>
                <span>&rarr;</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
