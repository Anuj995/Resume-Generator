"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { JOB_ROLES } from "@/data/roles";
import StepIndicator from "@/components/StepIndicator";

export default function RolePage() {
  const router = useRouter();

  // State for selected job role
  const [selectedRole, setSelectedRole] = useState("");
  // State for validation error message
  const [errorMessage, setErrorMessage] = useState("");

  // Load existing selection from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem("resume_target_role");
    if (savedRole) {
      setSelectedRole(savedRole);
    }
  }, []);

  // Handle form submission to continue
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that a role is selected
    if (!selectedRole) {
      setErrorMessage("Please select a job role.");
      return;
    }

    // Save to localStorage
    localStorage.setItem("resume_target_role", selectedRole);
    localStorage.removeItem("resume_data");
    setErrorMessage("");

    // Navigate to /templates
    router.push("/templates");
  };

  const activeRoleData = JOB_ROLES.find((r) => r.name === selectedRole);

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6">
      <StepIndicator currentStep={2} />

      {/* Page Heading */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Select Your Target Role
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-1.5 leading-relaxed">
          Our system and Gemini AI will prioritize bullet points, keywords, and skills aligned with this position.
        </p>
      </div>

      {/* Role Selection Form Card */}
      <form onSubmit={handleContinue} className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
        {/* Quick select chips */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Popular Roles (Click to select)
          </label>
          <div className="flex flex-wrap gap-2">
            {JOB_ROLES.map((role) => {
              const isSelected = selectedRole === role.name;
              return (
                <button
                  key={role.name}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.name);
                    if (errorMessage) setErrorMessage("");
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 border-blue-600 text-white shadow-2xs"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900"
                  }`}
                >
                  {role.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dropdown */}
        <div className="mb-4">
          <label htmlFor="roleSelect" className="block text-sm font-bold text-slate-900 mb-2">
            Selected Job Title
          </label>
          <div className="relative">
            <select
              id="roleSelect"
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              className="w-full appearance-none border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl p-3 pr-10 text-sm bg-white text-slate-900 font-medium cursor-pointer focus:outline-none"
            >
              <option value="">-- Choose a Role or pick above --</option>
              {JOB_ROLES.map((role) => (
                <option key={role.name} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Role Highlights / Keywords preview */}
        {activeRoleData && (
          <div className="mt-4 p-4 bg-blue-50/70 border border-blue-100 rounded-xl text-xs">
            <div className="font-bold text-blue-950 mb-2 flex items-center gap-1.5">
              <span>🎯</span>
              <span>ATS Keyword Focus for {activeRoleData.name}:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeRoleData.keywords.map((kw) => (
                <span
                  key={kw}
                  className="bg-white text-blue-800 border border-blue-200/80 px-2 py-0.5 rounded-md font-medium text-[11px] shadow-2xs"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 text-xs text-rose-700 bg-rose-50 border border-rose-200/80 rounded-lg p-2.5 flex items-center gap-1.5 font-medium">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
          <Link
            href="/input"
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            &larr; Back to Information
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-xs cursor-pointer"
          >
            <span>Next: Choose Template</span>
            <span>&rarr;</span>
          </button>
        </div>
      </form>
    </div>
  );
}
