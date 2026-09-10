"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RESUME_TEMPLATES, DEFAULT_TEMPLATE_ID, ResumeTemplate } from "@/data/templateData";
import { ResumeData } from "@/types/resume";
import ResumePreview from "@/components/ResumePreview";

// Mock sample data for users who haven't inputted their resume yet
const SAMPLE_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: "Alex Morgan",
    email: "alex.morgan@email.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
  },
  targetRole: "Senior Software Engineer",
  rawText: "",
  summary: "Results-driven Software Engineer with 4+ years of experience designing scalable web services, microservices, and distributed cloud applications. Proven track record of improving latency by 35% and mentoring junior developers.",
  education: [
    {
      id: "edu-1",
      degree: "B.S. in Computer Science",
      institution: "University of California, Berkeley",
      year: "2018 - 2022",
    },
  ],
  experience: [
    {
      id: "exp-1",
      title: "Software Engineer",
      company: "Apex Cloud Solutions",
      duration: "2022 - Present",
      description: "Architected high-throughput REST APIs handling 5M+ daily requests.\nOptimized PostgreSQL query latency by 40% through indexing and caching.\nLed migration of monolithic service into modular Docker containers.",
    },
    {
      id: "exp-2",
      title: "Junior Developer",
      company: "TechPulse Labs",
      duration: "2021 - 2022",
      description: "Built reactive user interfaces using Next.js, React, and Tailwind CSS.\nImplemented end-to-end automated testing suites with 90%+ code coverage.",
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "Distributed Task Queue",
      description: "Open-source asynchronous task worker using Go and Redis with automatic retry and rate-limiting features.",
      technologies: "Go, Redis, Docker, Prometheus",
    },
  ],
  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Python",
    "PostgreSQL",
    "Docker",
    "AWS",
    "RESTful APIs",
    "Git",
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
    },
  ],
  achievements: [
    {
      id: "ach-1",
      description: "First Place Winner - Silicon Valley Hackathon 2023 (500+ participants)",
    },
  ],
};

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string>(DEFAULT_TEMPLATE_ID);
  const [userResumeData, setUserResumeData] = useState<ResumeData | null>(null);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [previewMode, setPreviewMode] = useState<"card" | "full">("card");

  useEffect(() => {
    // Check localStorage for previously selected template
    const savedTemplate = localStorage.getItem("resume_template");
    if (savedTemplate && RESUME_TEMPLATES.some((t) => t.id === savedTemplate)) {
      setSelectedTemplate(savedTemplate);
    }

    // Check if user already has data filled
    const savedData = localStorage.getItem("resume_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setUserResumeData(parsed);
        setHasExistingData(true);
        if (parsed.templateId) {
          setSelectedTemplate(parsed.templateId);
        }
      } catch (e) {
        console.error("Error reading saved data", e);
      }
    }
  }, []);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplate(id);
    localStorage.setItem("resume_template", id);

    // If user already has resume_data in localStorage, update the templateId there too
    if (userResumeData) {
      const updated = { ...userResumeData, templateId: id };
      setUserResumeData(updated);
      localStorage.setItem("resume_data", JSON.stringify(updated));
    }
  };

  const handleContinue = () => {
    localStorage.setItem("resume_template", selectedTemplate);

    if (userResumeData) {
      const updated = { ...userResumeData, templateId: selectedTemplate };
      localStorage.setItem("resume_data", JSON.stringify(updated));
      router.push("/editor");
    } else {
      router.push("/organize");
    }
  };

  // Preview data: user's own data if available, else high quality sample data
  const activePreviewData = userResumeData || SAMPLE_RESUME_DATA;

  return (
    <div className="py-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 mb-3">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          100% ATS Friendly & Parser-Verified
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          Choose Your Resume Template
        </h1>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Every template below is strictly designed to pass Applicant Tracking Systems (ATS).
          Single-column flow, standard semantic headings, and zero unparseable graphics.
        </p>

        {/* ATS Checklist pills */}
        <div className="flex flex-wrap justify-center items-center gap-2 mt-4 text-xs text-gray-600">
          <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-2xs font-medium">
            Single-Column Linear Structure
          </span>
          <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-2xs font-medium">
            Standard Heading Hierarchy
          </span>
          <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-2xs font-medium">
            Clean Machine-Readable Fonts
          </span>
          <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-2xs font-medium">
            PDF Print Ready
          </span>
        </div>
      </div>

      {/* View Mode Toggle & Quick Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
        <div className="text-left">
          <div className="text-sm font-bold text-gray-900">
            Selected: <span className="text-blue-600">{RESUME_TEMPLATES.find((t) => t.id === selectedTemplate)?.name}</span>
          </div>
          <p className="text-xs text-gray-500">
            {hasExistingData ? "Showing your customized resume data" : "Showing sample data (your data will be applied automatically)"}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Toggle Full Preview vs Grid */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs font-medium">
            <button
              onClick={() => setPreviewMode("card")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                previewMode === "card"
                  ? "bg-white text-gray-900 shadow-xs font-semibold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Templates Grid
            </button>
            <button
              onClick={() => setPreviewMode("full")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                previewMode === "full"
                  ? "bg-white text-blue-600 shadow-xs font-semibold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Full Live Preview
            </button>
          </div>

          <button
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span>{hasExistingData ? "Apply to Editor" : "Continue"}</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {previewMode === "card" ? (
        /* TEMPLATE CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {RESUME_TEMPLATES.map((tpl) => {
            const isSelected = selectedTemplate === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl.id)}
                className={`group cursor-pointer bg-white rounded-xl border-2 transition-all duration-200 flex flex-col overflow-hidden relative ${
                  isSelected
                    ? "border-blue-600 shadow-md ring-2 ring-blue-100"
                    : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                }`}
              >
                {/* Active Checkmark Pill */}
                {isSelected && (
                  <div className="absolute top-3 right-3 z-10 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    Selected
                  </div>
                )}

                {/* Simulated Realistic Thumbnail Preview */}
                <div className="bg-gray-100 border-b border-gray-200 p-4 h-56 overflow-hidden relative flex justify-center items-start group-hover:bg-gray-50 transition-colors">
                  <div className="w-full max-w-[280px] bg-white rounded shadow-xs p-3.5 text-left border border-gray-200 select-none pointer-events-none transform scale-[0.88] origin-top">
                    {/* Simulated Header */}
                    {tpl.id === "classic" && (
                      <div className="text-center border-b border-gray-800 pb-1.5 mb-2">
                        <div className="h-3 bg-gray-900 rounded-xs w-32 mx-auto mb-1"></div>
                        <div className="h-2 bg-gray-400 rounded-xs w-20 mx-auto mb-1"></div>
                        <div className="h-1.5 bg-gray-300 rounded-xs w-44 mx-auto"></div>
                      </div>
                    )}
                    {tpl.id === "modern" && (
                      <div className="border-b-2 border-blue-600 pb-1.5 mb-2 flex justify-between items-baseline">
                        <div>
                          <div className="h-3 bg-gray-900 rounded-xs w-28 mb-1"></div>
                          <div className="h-1.5 bg-gray-400 rounded-xs w-36"></div>
                        </div>
                        <div className="h-2.5 bg-blue-100 text-blue-700 rounded px-1 w-14"></div>
                      </div>
                    )}
                    {tpl.id === "professional" && (
                      <div className="border-b border-teal-800 pb-1.5 mb-2 flex justify-between items-end">
                        <div>
                          <div className="h-3 bg-teal-950 rounded-xs w-32 mb-1"></div>
                          <div className="h-2 bg-teal-700 rounded-xs w-24"></div>
                        </div>
                        <div className="h-1.5 bg-gray-400 rounded-xs w-20"></div>
                      </div>
                    )}
                    {tpl.id === "compact" && (
                      <div className="border-b border-indigo-200 pb-1 mb-2 flex justify-between">
                        <div>
                          <div className="h-2.5 bg-gray-900 rounded-xs w-24 mb-0.5"></div>
                          <div className="h-1.5 bg-indigo-600 rounded-xs w-16"></div>
                        </div>
                        <div className="h-1.5 bg-gray-400 rounded-xs w-28"></div>
                      </div>
                    )}
                    {tpl.id === "clean" && (
                      <div className="mb-2 pb-1.5 border-b border-gray-100">
                        <div className="h-3 bg-gray-800 rounded-xs w-32 mb-1"></div>
                        <div className="h-1.5 bg-gray-400 rounded-xs w-20 mb-1"></div>
                        <div className="h-1 bg-gray-200 rounded-xs w-full"></div>
                      </div>
                    )}

                    {/* Simulated Body Sections */}
                    <div className="space-y-2">
                      <div>
                        <div className={`h-1.5 rounded-xs w-16 mb-1 ${
                          tpl.id === "modern" ? "bg-blue-600" :
                          tpl.id === "professional" ? "bg-teal-700" :
                          tpl.id === "compact" ? "bg-indigo-600" : "bg-gray-700"
                        }`}></div>
                        <div className="space-y-0.5">
                          <div className="h-1 bg-gray-200 rounded-xs w-full"></div>
                          <div className="h-1 bg-gray-200 rounded-xs w-5/6"></div>
                        </div>
                      </div>

                      <div>
                        <div className={`h-1.5 rounded-xs w-20 mb-1 ${
                          tpl.id === "modern" ? "bg-blue-600" :
                          tpl.id === "professional" ? "bg-teal-700" :
                          tpl.id === "compact" ? "bg-indigo-600" : "bg-gray-700"
                        }`}></div>
                        <div className="flex gap-1 mb-1">
                          <div className="h-2 bg-gray-100 border border-gray-200 rounded px-1 w-10"></div>
                          <div className="h-2 bg-gray-100 border border-gray-200 rounded px-1 w-12"></div>
                          <div className="h-2 bg-gray-100 border border-gray-200 rounded px-1 w-8"></div>
                        </div>
                      </div>

                      <div>
                        <div className={`h-1.5 rounded-xs w-24 mb-1 ${
                          tpl.id === "modern" ? "bg-blue-600" :
                          tpl.id === "professional" ? "bg-teal-700" :
                          tpl.id === "compact" ? "bg-indigo-600" : "bg-gray-700"
                        }`}></div>
                        <div className="flex justify-between items-center mb-0.5">
                          <div className="h-1.5 bg-gray-800 rounded-xs w-28"></div>
                          <div className="h-1 bg-gray-400 rounded-xs w-10"></div>
                        </div>
                        <div className="h-1 bg-gray-200 rounded-xs w-4/5"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors">
                        {tpl.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {tpl.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                      {tpl.description}
                    </p>

                    {/* Best for tag */}
                    <div className="text-xs bg-gray-50 border border-gray-100 rounded-md p-2 mb-3">
                      <span className="font-semibold text-gray-700 block mb-0.5">Recommended For:</span>
                      <span className="text-gray-600">{tpl.bestFor}</span>
                    </div>

                    {/* Bullet features */}
                    <ul className="text-xs text-gray-500 space-y-1 mb-4">
                      {tpl.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Selection Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTemplate(tpl.id);
                    }}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {isSelected ? "Active Template" : "Select Template"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* FULL LIVE PREVIEW MODE */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10 items-start">
          {/* Sidebar Template Selector */}
          <div className="lg:col-span-1 space-y-2 bg-white p-4 border border-gray-200 rounded-xl shadow-xs">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Select Template
            </h3>
            {RESUME_TEMPLATES.map((tpl) => {
              const isSelected = selectedTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-xs ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 shadow-xs"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-gray-900">{tpl.name}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <p className="text-gray-500 text-[11px] line-clamp-1">{tpl.badge}</p>
                </button>
              );
            })}
          </div>

          {/* Large Live Resume Preview Sheet */}
          <div className="lg:col-span-3 bg-gray-100 p-4 sm:p-6 rounded-xl border border-gray-200">
            <ResumePreview data={activePreviewData} templateId={selectedTemplate} />
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-4">
        <Link
          href="/role"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          &larr; Back to Role Selection
        </Link>
        <button
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm shadow-xs transition-colors"
        >
          {hasExistingData ? "Apply & Open Editor" : "Continue to Organize"} &rarr;
        </button>
      </div>
    </div>
  );
}
