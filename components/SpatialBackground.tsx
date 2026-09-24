"use client";

import React from "react";
import Background3DCanvas from "@/components/Background3DCanvas";

export default function SpatialBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-30 overflow-hidden select-none print:hidden"
    >
      {/* 1. Interactive 3D Perspective Particle Canvas with Mouse Parallax */}
      <Background3DCanvas />

      {/* 2. Subtle Fine Grid Pattern with Radial Fade Out */}
      <div className="absolute inset-0 antigravity-lines-grid opacity-50" />

      {/* 3. Modern Dot Matrix with Top Center Density */}
      <div className="absolute inset-0 antigravity-dot-grid opacity-70" />

      {/* 4. Primary Top Ambient Spotlight Beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.18),rgba(99,102,241,0.12),rgba(14,165,233,0.06),transparent_70%)] blur-2xl" />

      {/* 5. Weightless Floating Aurora Orbs (Z-axis Spatial Depth) */}
      {/* Cyan-Blue Orb (Top-Left) */}
      <div className="absolute -top-16 -left-32 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-cyan-300/25 via-blue-400/20 to-transparent blur-[110px] animate-orb-1" />

      {/* Violet-Indigo Orb (Top-Right) */}
      <div className="absolute top-20 -right-36 w-[580px] h-[580px] rounded-full bg-gradient-to-bl from-indigo-400/25 via-purple-300/20 to-transparent blur-[120px] animate-orb-2" />

      {/* Emerald Accent Glow (Mid-Left Floating) */}
      <div className="absolute top-[480px] -left-48 w-[420px] h-[420px] rounded-full bg-gradient-to-r from-emerald-300/15 via-teal-200/10 to-transparent blur-[100px] animate-float-slow" />

      {/* Warm Sky Accent Glow (Lower-Right) */}
      <div className="absolute top-[650px] -right-32 w-[460px] h-[460px] rounded-full bg-gradient-to-l from-blue-300/15 via-indigo-200/10 to-transparent blur-[110px] animate-float-medium" />

      {/* 6. CSS 3D Floating Geometric Objects */}
      {/* 3D Wireframe Glass Cube (Top-Right Background) */}
      <div className="absolute top-28 right-12 lg:right-28 perspective-1000 hidden md:block opacity-45">
        <div className="w-20 h-20 relative animate-3d-cube">
          {/* Front Face */}
          <div className="absolute inset-0 border border-blue-400/60 bg-blue-500/5 backdrop-blur-[2px] rounded-lg [transform:translateZ(40px)] shadow-[inset_0_0_15px_rgba(59,130,246,0.15)]" />
          {/* Back Face */}
          <div className="absolute inset-0 border border-indigo-400/60 bg-indigo-500/5 backdrop-blur-[2px] rounded-lg [transform:rotateY(180deg)_translateZ(40px)] shadow-[inset_0_0_15px_rgba(99,102,241,0.15)]" />
          {/* Right Face */}
          <div className="absolute inset-0 border border-cyan-400/60 bg-cyan-500/5 backdrop-blur-[2px] rounded-lg [transform:rotateY(90deg)_translateZ(40px)] shadow-[inset_0_0_15px_rgba(6,182,212,0.15)]" />
          {/* Left Face */}
          <div className="absolute inset-0 border border-purple-400/60 bg-purple-500/5 backdrop-blur-[2px] rounded-lg [transform:rotateY(-90deg)_translateZ(40px)] shadow-[inset_0_0_15px_rgba(168,85,247,0.15)]" />
          {/* Top Face */}
          <div className="absolute inset-0 border border-blue-300/60 bg-blue-400/5 backdrop-blur-[2px] rounded-lg [transform:rotateX(90deg)_translateZ(40px)] shadow-[inset_0_0_15px_rgba(59,130,246,0.15)]" />
          {/* Bottom Face */}
          <div className="absolute inset-0 border border-indigo-300/60 bg-indigo-400/5 backdrop-blur-[2px] rounded-lg [transform:rotateX(-90deg)_translateZ(40px)] shadow-[inset_0_0_15px_rgba(99,102,241,0.15)]" />
        </div>
      </div>

      {/* 3D Floating Orbital Gyroscope Ring (Mid-Left Background) */}
      <div className="absolute top-[420px] left-8 lg:left-24 perspective-1000 hidden md:block opacity-35">
        <div className="w-28 h-28 relative animate-3d-ring">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-400/50 [transform:rotateX(65deg)]" />
          <div className="absolute inset-2 rounded-full border border-cyan-400/40 [transform:rotateY(45deg)]" />
          <div className="absolute inset-4 rounded-full border border-purple-400/35 [transform:rotateX(-45deg)]" />
        </div>
      </div>

      {/* 7. Sleek Top Horizon Light Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
    </div>
  );
}
