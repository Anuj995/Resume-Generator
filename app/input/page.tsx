"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function InputPage() {
  const router = useRouter();

  // State for user input text
  const [inputText, setInputText] = useState("");
  // State for validation error message
  const [errorMessage, setErrorMessage] = useState("");
  // State for uploaded file name display
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Load existing input from localStorage on component mount
  useEffect(() => {
    const savedText = localStorage.getItem("resume_raw_text");
    if (savedText) {
      setInputText(savedText);
    }
  }, []);

  // Handle form submission to continue to next screen
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that textarea is not empty
    if (!inputText.trim()) {
      setErrorMessage("Please enter your information first.");
      return;
    }

    // Save to localStorage so it persists across pages
    localStorage.setItem("resume_raw_text", inputText.trim());
    setErrorMessage("");

    // Navigate to role selection page
    router.push("/role");
  };

  // Basic mock handler for file upload input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      // Basic sample text hint for demonstration in beginner project
      if (!inputText) {
        setInputText(
          `Uploaded from ${file.name}: I worked as a software development intern, completed a React course, built three web projects, and have a Python certification.`
        );
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Page Heading */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Enter Your Information
      </h1>
      <p className="text-gray-600 mb-6 text-sm sm:text-base">
        Paste your achievements, skills, education, projects, and work experience below.
      </p>

      {/* Main Input Form */}
      <form onSubmit={handleContinue} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <label htmlFor="rawInfo" className="block text-sm font-medium text-gray-700 mb-2">
          Your Career & Project Details
        </label>
        
        <textarea
          id="rawInfo"
          rows={7}
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            if (errorMessage) setErrorMessage("");
          }}
          placeholder={`Example:\nI completed a React course, built three websites, participated in two hackathons, worked as a software development intern, created a portfolio website and have a Python certification.`}
          className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />

        {/* Validation Error Message */}
        {errorMessage && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errorMessage}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            &larr; Back to Home
          </Link>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md text-sm transition-colors"
          >
            Continue
          </button>
        </div>
      </form>

      {/* Upload Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Already have a resume?
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Upload your existing resume file (.pdf, .docx) to help fill in information.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="cursor-pointer inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-md transition-colors">
            <span>Upload Resume</span>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {uploadedFileName && (
            <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded">
              Selected: {uploadedFileName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
