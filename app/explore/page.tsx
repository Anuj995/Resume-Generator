"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RESUME_TEMPLATES, DEFAULT_TEMPLATE_ID, ResumeTemplate } from "@/data/templateData";
import { getShowcaseData } from "@/data/templateSamples";
import { ResumeData } from "@/types/resume";
import ResumePreview from "@/components/ResumePreview";
import { notifyStorageChange } from "@/lib/storage";

export default function ExploreTemplatesPage() {
  const router = useRouter();

  // Selected template state — default to classic or previously selected
  const [activeTemplateId, setActiveTemplateId] = useState<string>(DEFAULT_TEMPLATE_ID);
  const [userResumeData, setUserResumeData] = useState<ResumeData | null>(null);
  const [viewMode, setViewMode] = useState<"sample" | "user">("sample");

  // Read saved template preference or draft resume on initial mount
  useEffect(() => {
    try {
      const savedTpl = localStorage.getItem("resume_template");
      if (savedTpl && RESUME_TEMPLATES.some((t) => t.id === savedTpl)) {
        setActiveTemplateId(savedTpl);
      }

      const savedData = localStorage.getItem("resume_data");
      const rawText = (localStorage.getItem("resume_raw_text") || "").trim();
      if (rawText.length >= 25 && savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed && (parsed.personalInfo?.fullName || parsed.skills?.length > 0)) {
          setUserResumeData(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Find active template metadata
  const activeTemplate: ResumeTemplate =
    RESUME_TEMPLATES.find((t) => t.id === activeTemplateId) || RESUME_TEMPLATES[0];

  // Template button click handler: updates active state and local storage immediately
  const handleTemplateClick = (templateId: string) => {
    setActiveTemplateId(templateId);
    try {
      localStorage.setItem("resume_template", templateId);
      notifyStorageChange();
    } catch {
      // ignore
    }
  };

  // Determine which resume data to display in the live preview
  // By default, displays the tailored showcase profile for that specific template!
  const currentResumeData: ResumeData =
    viewMode === "user" && userResumeData
      ? { ...userResumeData, templateId: activeTemplate.id }
      : getShowcaseData(activeTemplate.id);

  // User action to proceed with the selected template
  const handleUseTemplate = () => {
    try {
      localStorage.setItem("resume_template", activeTemplate.id);
      notifyStorageChange();

      if (userResumeData) {
        const saved = localStorage.getItem("resume_data");
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.templateId = activeTemplate.id;
          localStorage.setItem("resume_data", JSON.stringify(parsed));
        }
        router.push("/editor");
      } else {
        router.push("/input?new=true");
      }
    } catch {
      router.push("/input?new=true");
    }
  };

  return (
    <div className="py-6 sm:py-8 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 mb-3 shadow-2xs">
          <span>✓ 100% Single-Column ATS Standards</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore ATS Templates
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1.5 max-w-xl mx-auto">
          Click any template below to view its formatting, typography, and tailored sample content.
        </p>
      </div>

      {/* 5 Template Switcher Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-6">
        {RESUME_TEMPLATES.map((tmpl) => {
          const isSelected = tmpl.id === activeTemplateId;
          return (
            <button
              key={tmpl.id}
              type="button"
              id={`template-btn-${tmpl.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleTemplateClick(tmpl.id);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none border ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-blue-400"
                  : "bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50 shadow-2xs"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: tmpl.accentColor }}
              />
              <span>{tmpl.name}</span>
              <span
                className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {tmpl.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Template Information Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: activeTemplate.accentColor }}
            />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              {activeTemplate.name}
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {activeTemplate.badge}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            {activeTemplate.description}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
            <span className="text-xs font-semibold text-slate-700">Best for:</span>
            <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-medium">
              {activeTemplate.bestFor}
            </span>
          </div>
        </div>

        <button
          type="button"
          id="btn-use-template"
          onClick={handleUseTemplate}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-sm hover:shadow transition-all cursor-pointer flex-shrink-0"
        >
          <span>{userResumeData ? "Apply to My Resume" : `Use ${activeTemplate.name}`}</span>
          <span>&rarr;</span>
        </button>
      </div>

      {/* Live Resume Preview Container */}
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 sm:p-6 shadow-inner mb-8">
        {/* Top bar with status and sample toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold text-slate-700 ml-1">
              Template Preview: {activeTemplate.name}
            </span>
          </div>

          {/* If user has saved draft, show toggle to compare */}
          {userResumeData && (
            <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("sample")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  viewMode === "sample"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Template Showcase
              </button>
              <button
                type="button"
                onClick={() => setViewMode("user")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  viewMode === "user"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                My Resume Draft
              </button>
            </div>
          )}
        </div>

        {/* The Live Resume Sheet */}
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
          <ResumePreview
            key={activeTemplate.id}
            data={currentResumeData}
            templateId={activeTemplate.id}
          />
        </div>
      </div>
    </div>
  );
}
