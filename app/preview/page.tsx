"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ResumeData } from "@/types/resume";
import { extractResumeData } from "@/lib/resumeParser";
import ResumePreview from "@/components/ResumePreview";

export default function PreviewPage() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("resume_data");
    if (savedData) {
      try {
        setResumeData(JSON.parse(savedData));
        return;
      } catch (e) {
        console.error("Error loading resume data", e);
      }
    }

    const savedText = localStorage.getItem("resume_raw_text") || "";
    const savedRole = localStorage.getItem("resume_target_role") || "";
    setResumeData(extractResumeData(savedText, savedRole));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!resumeData) {
    return (
      <div className="py-12 text-center text-gray-500">
        Loading resume preview...
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      {/* Top Action Controls (hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white border border-gray-200 p-4 rounded-lg shadow-sm print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Resume Preview
          </h1>
          <p className="text-xs text-gray-600">
            Review your generated resume and download as PDF.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/editor"
            className="text-sm border border-gray-300 bg-white hover:bg-gray-50 px-3.5 py-2 rounded-md font-medium text-gray-700"
          >
            &larr; Edit Resume
          </Link>
          <button
            onClick={handlePrint}
            className="text-sm bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Resume Document Content */}
      <div className="bg-white rounded shadow-sm">
        <ResumePreview data={resumeData} />
      </div>
    </div>
  );
}
