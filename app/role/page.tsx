"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { JOB_ROLES } from "@/data/roles";

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
    setErrorMessage("");

    // In future task, this will navigate to /organize. For now, alert or redirect to /organize
    router.push("/organize");
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      {/* Page Heading */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Select Your Target Job Role
      </h1>

      {/* Role explanation */}
      <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
        The selected role will be used to highlight the most relevant skills, projects and experience.
      </p>

      {/* Role Selection Form */}
      <form onSubmit={handleContinue} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <label htmlFor="roleSelect" className="block text-sm font-medium text-gray-700 mb-2">
          Target Job Role
        </label>

        {/* Dropdown */}
        <select
          id="roleSelect"
          value={selectedRole}
          onChange={(e) => {
            setSelectedRole(e.target.value);
            if (errorMessage) setErrorMessage("");
          }}
          className="w-full border border-gray-300 rounded-md p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        >
          <option value="">-- Choose a Role --</option>
          {JOB_ROLES.map((role) => (
            <option key={role.name} value={role.name}>
              {role.name}
            </option>
          ))}
        </select>

        {/* Role Highlights / Keywords preview (simple helper) */}
        {selectedRole && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800">
            <strong>Key Focus Areas:</strong>{" "}
            {JOB_ROLES.find((r) => r.name === selectedRole)?.keywords.join(", ")}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <p className="mt-3 text-sm text-red-600 font-medium">
            {errorMessage}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <Link
            href="/input"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            &larr; Back to Input
          </Link>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md text-sm transition-colors"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
