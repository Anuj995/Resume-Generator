"use client";

import React, { useEffect, useRef } from "react";

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
}

export default function Background3DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Respect user's reduced motion settings
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking for 3D parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize between -1 and 1
      mouseX = (e.clientX / width) * 2 - 1;
      mouseY = (e.clientY / height) * 2 - 1;
      targetRotY = mouseX * 0.35; // rotate around Y axis based on mouse X
      targetRotX = -mouseY * 0.35; // rotate around X axis based on mouse Y
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize);

    // Generate 3D particles in a spherical volume
    const PARTICLE_COUNT = 48;
    const particles: Particle3D[] = [];
    const colors = [
      "rgba(59, 130, 246, ", // blue
      "rgba(99, 102, 241, ", // indigo
      "rgba(14, 165, 233, ", // sky
      "rgba(168, 85, 247, ", // purple
    ];

    const radius = Math.min(width, height) * 0.45;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Random spherical distribution
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * radius;

      particles.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta) * 0.7, // slight vertical compression
        z: r * Math.cos(phi),
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        vz: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 2 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const fov = 450; // Camera field of view / focal distance
    let globalAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth camera interpolation
      currentRotX += (targetRotX - currentRotX) * 0.04;
      currentRotY += (targetRotY - currentRotY) * 0.04;

      // Constant gentle cosmic drift
      globalAngle += 0.0018;

      const cosY = Math.cos(currentRotY + globalAngle);
      const sinY = Math.sin(currentRotY + globalAngle);
      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);

      const centerX = width * 0.5;
      const centerY = height * 0.38; // bias slightly towards top/hero

      // Projected point cache for connection lines
      const projectedPoints: { x: number; y: number; z: number; scale: number; alpha: number; color: string; size: number }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update positions with boundaries
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.x < -radius) p.vx *= -1;
        if (p.x > radius) p.vx *= -1;
        if (p.y < -radius * 0.7) p.vy *= -1;
        if (p.y > radius * 0.7) p.vy *= -1;
        if (p.z < -radius) p.vz *= -1;
        if (p.z > radius) p.vz *= -1;

        // 3D Rotation Matrix: Rotate around Y axis
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;

        // Rotate around X axis
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        // Perspective projection
        const depth = z2 + 650;
        if (depth > 50) {
          const scale = fov / depth;
          const projX = centerX + x1 * scale;
          const projY = centerY + y2 * scale;
          const alpha = Math.max(0.08, Math.min(0.65, (depth - 150) / 700));

          projectedPoints.push({
            x: projX,
            y: projY,
            z: z2,
            scale,
            alpha,
            color: p.color,
            size: p.size * scale,
          });
        }
      }

      // Draw 3D connection lines between nearby nodes
      ctx.lineWidth = 0.75;
      const maxDistance = 110;

      for (let i = 0; i < projectedPoints.length; i++) {
        const pt1 = projectedPoints[i];
        for (let j = i + 1; j < projectedPoints.length; j++) {
          const pt2 = projectedPoints[j];
          const dx = pt1.x - pt2.x;
          const dy = pt1.y - pt2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.16 * pt1.alpha * pt2.alpha * 2;
            ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(pt1.x, pt1.y);
            ctx.lineTo(pt2.x, pt2.y);
            ctx.stroke();
          }
        }
      }

      // Draw projected particle nodes with luminous depth glow
      for (let i = 0; i < projectedPoints.length; i++) {
        const pt = projectedPoints[i];
        const r = Math.max(0.8, pt.size);

        // Core node
        ctx.fillStyle = `${pt.color}${pt.alpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glowing halo on closer particles
        if (pt.alpha > 0.35) {
          ctx.fillStyle = `${pt.color}${pt.alpha * 0.25})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, r * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
    />
  );
}
