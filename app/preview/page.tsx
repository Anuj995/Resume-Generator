"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ResumeData } from "@/types/resume";
import { extractResumeData } from "@/lib/resumeParser";
import { RESUME_TEMPLATES, DEFAULT_TEMPLATE_ID } from "@/data/templateData";
import ResumePreview from "@/components/ResumePreview";
import { downloadAsWord } from "@/lib/wordExport";

import StepIndicator from "@/components/StepIndicator";

export default function PreviewPage() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [templateId, setTemplateId] = useState<string>(DEFAULT_TEMPLATE_ID);
  const [wordLoading, setWordLoading] = useState(false);

  useEffect(() => {
    const savedTemplate = localStorage.getItem("resume_template") || DEFAULT_TEMPLATE_ID;
    setTemplateId(savedTemplate);

    const savedData = localStorage.getItem("resume_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setResumeData(parsed);
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
    const parsed = extractResumeData(savedText, savedRole);
    parsed.templateId = savedTemplate;
    setResumeData(parsed);
  }, []);

  const handleTemplateChange = (newTemplateId: string) => {
    setTemplateId(newTemplateId);
    localStorage.setItem("resume_template", newTemplateId);
    if (resumeData) {
      const updated = { ...resumeData, templateId: newTemplateId };
      setResumeData(updated);
      localStorage.setItem("resume_data", JSON.stringify(updated));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWordDownload = async () => {
    if (!resumeData) return;
    setWordLoading(true);
    try {
      await downloadAsWord(resumeData);
    } catch (err) {
      console.error("Word export failed:", err);
    } finally {
      setWordLoading(false);
    }
  };

  if (!resumeData) {
    return (
      <div className="py-12 text-center text-slate-500 font-medium">
        Loading resume preview...
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 max-w-4xl mx-auto">
      <StepIndicator currentStep={5} />

      {/* Top Action Controls (hidden when printing) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl shadow-2xs print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Resume Preview &amp; Export
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              100% ATS Safe
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review layout, switch templates, and export directly as PDF or Word document.
          </p>
        </div>

        {/* Template Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Template Select Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <label htmlFor="preview-template-select" className="text-xs font-bold text-slate-600">
              Template:
            </label>
            <select
              id="preview-template-select"
              value={templateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
            >
              {RESUME_TEMPLATES.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} ({tpl.badge})
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/editor"
            className="text-xs sm:text-sm border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl font-semibold text-slate-700 transition-colors flex items-center gap-1"
          >
            <span>&larr;</span>
            <span>Edit Resume</span>
          </Link>

          <button
            onClick={handleWordDownload}
            disabled={wordLoading}
            className="text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {wordLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            )}
            <span>{wordLoading ? "Generating..." : "Download Word"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Resume Document Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
        <ResumePreview data={resumeData} templateId={templateId} />
      </div>
    </div>
  );
}
