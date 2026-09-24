"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function Hero3DPreview() {
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for normalized cursor coordinates (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for natural weightless feel
  const springConfig = { damping: 25, stiffness: 220, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Transform coordinates into subtle 3D rotational tilt
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Normalize coordinates: 0 is center
    mouseX.set(clientX / width - 0.5);
    mouseY.set(clientY / height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="relative py-4 my-2 max-w-2xl mx-auto perspective-1000 select-none">
      {/* Floating Accent Badge: Top-Left */}
      <motion.div
        animate={{ y: [-4, 6, -4], rotate: [-1, 1.5, -1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-3 -left-3 sm:-left-8 z-30 hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl px-3.5 py-1.5 rounded-2xl text-xs font-semibold text-slate-800 pointer-events-none"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        <span>100% Single-Column ATS</span>
      </motion.div>

      {/* Floating Accent Badge: Bottom-Right */}
      <motion.div
        animate={{ y: [6, -4, 6], rotate: [1, -1.5, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -bottom-3 -right-3 sm:-right-8 z-30 hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md border border-blue-200/90 shadow-xl px-3.5 py-1.5 rounded-2xl text-xs font-semibold text-blue-700 pointer-events-none"
      >
        <span>⚡</span>
        <span>AI Role-Targeted Bullets</span>
      </motion.div>

      {/* 3D Interactive Card Container */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.35 } }}
        className="relative glass-panel-elevated rounded-3xl p-6 sm:p-7 text-left border border-white/95 bg-white/90 shadow-2xl cursor-pointer overflow-hidden group"
      >
        {/* Dynamic Interactive Sheen Highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-blue-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Mockup Window Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-400" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-mono text-slate-400 ml-1.5 font-medium">
              alex_morgan_resume.pdf
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              ATS Score: 98/100
            </span>
            <Link
              href="/explore"
              className="text-[11px] text-blue-600 font-semibold hover:underline hidden sm:inline"
            >
              Change Template &rarr;
            </Link>
          </div>
        </div>

        {/* Realistic ATS Resume Visual Hierarchy Preview */}
        <div className="space-y-3 font-sans">
          {/* Header block */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-2 border-b border-slate-200">
            <div>
              <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                Alex Morgan
              </h4>
              <p className="text-xs font-semibold text-blue-700">
                Software Engineer &bull; Full-Stack &amp; Cloud Systems
              </p>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              San Francisco, CA &bull; alex@example.com &bull; github.com/alex
            </div>
          </div>

          {/* Professional Summary */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-0.5 mb-1.5">
              Professional Summary
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Results-driven software engineer with 3+ years experience building scalable web services, microservices, and distributed cloud applications with Next.js, Node.js, and PostgreSQL.
            </p>
          </div>

          {/* Technical Skills */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-0.5 mb-1.5">
              Technical Skills
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              <div>
                <span className="font-semibold text-slate-800">Languages: </span>
                <span className="text-slate-600">TypeScript, Python, JavaScript, SQL, Go</span>
              </div>
              <div>
                <span className="font-semibold text-slate-800">Frameworks: </span>
                <span className="text-slate-600">React, Next.js, Node.js, Express, Tailwind</span>
              </div>
            </div>
          </div>

          {/* Experience snippet */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-0.5 mb-1.5">
              Work Experience
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Apex Cloud Solutions &bull; Software Engineer</span>
              <span className="text-[11px] font-normal text-slate-500">2023 – Present</span>
            </div>
            <ul className="text-[11px] text-slate-600 mt-1 space-y-0.5 list-disc list-inside">
              <li>Architected high-throughput REST APIs handling 5M+ daily requests.</li>
              <li>Reduced API response latency by 35% using Redis caching and optimized queries.</li>
            </ul>
          </div>
        </div>

        {/* Hover Hint */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Interactive 3D Preview (Move cursor to tilt)
          </span>
          <span className="font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
            Try with your resume &rarr;
          </span>
        </div>
      </motion.div>
    </div>
  );
}
