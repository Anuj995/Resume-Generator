import Link from "next/link";

export default function HomePage() {
  return (
    <div className="py-8 sm:py-14 px-2 max-w-4xl mx-auto text-center">
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 mb-6 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
        <span>ATS-Optimized &bull; AI-Powered Resume Builder</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
        Build a Clean, Job-Ready <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          ATS Resume in Minutes
        </span>
      </h1>

      {/* Subheading */}
      <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
        Upload your existing resume or paste your career notes. Select your target role to generate a formatted, recruiter-ready resume with Gemini AI bullet optimization.
      </p>

      {/* Main Action Buttons */}
      <div className="mb-14 flex flex-col sm:flex-row justify-center items-center gap-3">
        <Link
          href="/input"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-xs hover:shadow transition-all text-sm sm:text-base cursor-pointer"
        >
          <span>Start Creating Resume</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
        <Link
          href="/templates"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold px-5 py-3 rounded-xl shadow-2xs transition-all text-sm sm:text-base cursor-pointer"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span>Explore ATS Templates</span>
        </Link>
      </div>

      {/* Quick Trust Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14 text-left">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold text-xs flex-shrink-0">
            ✓
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">ATS Compatible</div>
            <div className="text-[11px] text-slate-500">Single-column hierarchy</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
            ✨
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">AI Enhancement</div>
            <div className="text-[11px] text-slate-500">Gemini-refined bullets</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
            📄
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">PDF &amp; Word Export</div>
            <div className="text-[11px] text-slate-500">Instant application ready</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 font-bold text-xs flex-shrink-0">
            🔒
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Privacy First</div>
            <div className="text-[11px] text-slate-500">Saved in your browser</div>
          </div>
        </div>
      </div>

      {/* Step Process Section */}
      <div className="border-t border-slate-200/80 pt-10 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Simple 4-step workflow from raw profile to a tailored resume.
            </p>
          </div>
          <Link
            href="/input"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 mt-2 sm:mt-0 flex items-center gap-1"
          >
            Get started now &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-2xs hover:border-blue-200 hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  Step 01
                </span>
                <span className="text-base">📁</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Enter Details</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload your previous PDF resume or paste raw work history and skills.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-2xs hover:border-blue-200 hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  Step 02
                </span>
                <span className="text-base">🎯</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Select Role</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pick your target job title to automatically match industry keywords.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-2xs hover:border-blue-200 hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  Step 03
                </span>
                <span className="text-base">📑</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Choose Template</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select from 5 recruiter-tested, single-column ATS layouts.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-2xs hover:border-blue-200 hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  Step 04
                </span>
                <span className="text-base">🚀</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Edit &amp; Export</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tune with Gemini AI, live preview, and download clean PDF or Word file.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
