"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { extractTextFromPdf } from "@/lib/pdfExtractor";

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
      const sizeStr = file.size < 1024 * 1024 
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      setUploadedFileSize(sizeStr);

      try {
        let extracted = "";
        if (file.name.toLowerCase().endsWith(".pdf")) {
          // Extract actual text from PDF
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

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Page Heading */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Enter Your Information
      </h1>
      <p className="text-gray-600 mb-6 text-sm sm:text-base">
        Paste your achievements, skills, education, projects, or upload an existing resume.
      </p>

      {/* Upload Section Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-gray-900">
            Upload Existing Resume
          </h2>
          <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded border border-blue-100">
            Fast Track
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Upload your resume file (.pdf, .docx, .txt) to automatically extract your experience and skills.
        </p>

        {!uploadedFileName ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-sm font-medium px-4 py-2.5 rounded-md transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Upload Resume File</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-xs text-gray-400">Supports PDF, DOCX, or TXT</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info Box */}
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-green-100 rounded-md flex items-center justify-center text-green-700 font-bold text-xs flex-shrink-0">
                  FILE
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-green-900 truncate">
                    {uploadedFileName}
                  </p>
                  {uploadedFileSize && (
                    <p className="text-xs text-green-700">{uploadedFileSize} &bull; Ready to submit</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 ml-2 flex-shrink-0"
              >
                Remove
              </button>
            </div>

            {/* Direct Submit Button for Uploaded Resume */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <p className="text-xs text-gray-500">
                Data extracted! You can edit it below or submit directly.
              </p>
              <button
                type="button"
                onClick={handleSubmitUploadedResume}
                disabled={isProcessingFile}
                className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-md text-sm transition-colors shadow-sm cursor-pointer"
              >
                <span>Submit Resume &amp; Continue</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative flex py-2 items-center mb-6">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
          Or Enter / Edit Details Manually
        </span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleContinue} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <label htmlFor="rawInfo" className="block text-sm font-medium text-gray-700 mb-2">
          Your Career &amp; Project Details
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
            Continue &rarr;
          </button>
        </div>
      </form>
    </div>
  );
}
