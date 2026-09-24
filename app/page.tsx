"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { clearAllResumeData } from "@/lib/storage";
import Hero3DPreview from "@/components/Hero3DPreview";

// Framer Motion animation variants for domino staggered entrances
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function HomePage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="py-8 sm:py-14 px-2 max-w-4xl mx-auto text-center"
    >
      {/* Top Badge (Weightless Float) */}
      <motion.div variants={itemVariants} className="inline-block">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-blue-700 border border-blue-200/80 mb-6 sm:mb-8 shadow-xs animate-float-slow cursor-default">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
          <span>ATS-Optimized &bull; Student &amp; Internship AI Resume Builder</span>
        </div>
      </motion.div>

      {/* Main Heading */}
      <motion.h1
        variants={itemVariants}
        className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5"
      >
        Build a Clean, Job-Ready <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
          ATS Resume in Minutes
        </span>
      </motion.h1>

      {/* Subheading */}
      <motion.p
        variants={itemVariants}
        className="text-base sm:text-lg text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed"
      >
        Upload your previous resume or paste your career notes. Target any job role with tailored AI bullets, single-column ATS layouts, and instant PDF/Word export.
      </motion.p>

      {/* Main Action Buttons */}
      <motion.div
        variants={itemVariants}
        className="mb-10 sm:mb-12 flex flex-col sm:flex-row justify-center items-center gap-3.5"
      >
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/input?new=true"
            onClick={() => clearAllResumeData()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all text-sm sm:text-base cursor-pointer"
          >
            <span>Start Creating Resume</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/explore"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/90 backdrop-blur-md hover:bg-white border border-slate-200/90 hover:border-slate-300 text-slate-700 font-semibold px-6 py-3.5 rounded-xl shadow-xs hover:shadow-md transition-all text-sm sm:text-base cursor-pointer"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>Explore ATS Templates</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* 3D Interactive Spatial Mockup Preview */}
      <motion.div variants={itemVariants}>
        <Hero3DPreview />
      </motion.div>

      {/* Quick Trust Highlights (Domino Staggered Entrance) */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-14 text-left"
      >
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          className="weightless-card glass-panel rounded-2xl p-4 flex items-start gap-3 cursor-default"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">
            ✓
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">100% ATS Safe</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">Single-column hierarchy</div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          className="weightless-card glass-panel rounded-2xl p-4 flex items-start gap-3 cursor-default"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
            ✨
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">AI Optimization</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">Role-targeted bullets</div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          className="weightless-card glass-panel rounded-2xl p-4 flex items-start gap-3 cursor-default"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
            📄
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">PDF &amp; Word Export</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">Selectable vector text</div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          className="weightless-card glass-panel rounded-2xl p-4 flex items-start gap-3 cursor-default"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">
            🔒
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Privacy First</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">Client-side saved</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Step Process Section */}
      <motion.div
        variants={itemVariants}
        className="border-t border-slate-200/80 pt-12 text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Simple 4-Step Process
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Go from raw notes or an old PDF to a polished, recruiter-ready resume.
            </p>
          </div>
          <Link
            href="/input?new=true"
            onClick={() => clearAllResumeData()}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>Start now</span>
            <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            className="weightless-card glass-panel p-5 rounded-2xl flex flex-col justify-between cursor-default"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Step 01
                </span>
                <span className="text-lg">📁</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Enter Details</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload your previous PDF resume or paste raw work history, skills, and projects.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            className="weightless-card glass-panel p-5 rounded-2xl flex flex-col justify-between cursor-default"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Step 02
                </span>
                <span className="text-lg">🎯</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Role &amp; Job Description</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose your target job title and optionally attach a job description or screenshot for ATS keyword matching.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            className="weightless-card glass-panel p-5 rounded-2xl flex flex-col justify-between cursor-default"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Step 03
                </span>
                <span className="text-lg">🔍</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Review Extraction</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect structured facts, tweak education and categorized skills before building your resume.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            className="weightless-card glass-panel p-5 rounded-2xl flex flex-col justify-between cursor-default"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Step 04
                </span>
                <span className="text-lg">🚀</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Edit &amp; Export</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Live side-by-side editing with AI bullet enhancement, ATS formatting, and one-click PDF download.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
