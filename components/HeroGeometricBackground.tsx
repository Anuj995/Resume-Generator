"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-namespace */
declare module "react" {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends ThreeElements {}
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

// --- WebGL Geometric Shader Code ---
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor1;
uniform vec3 uColor2;
varying vec2 vUv;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float bayerDither4x4(vec2 uv) {
    int x = int(mod(uv.x, 4.0));
    int y = int(mod(uv.y, 4.0));
    
    int matrix[16];
    matrix[0] = 0; matrix[1] = 8; matrix[2] = 2; matrix[3] = 10;
    matrix[4] = 12; matrix[5] = 4; matrix[6] = 14; matrix[7] = 6;
    matrix[8] = 3; matrix[9] = 11; matrix[10] = 1; matrix[11] = 9;
    matrix[12] = 15; matrix[13] = 7; matrix[14] = 13; matrix[15] = 5;
    
    return float(matrix[y * 4 + x]) / 16.0;
}

void main() {
    vec2 uv = vUv;
    vec2 coord = gl_FragCoord.xy;
    
    float noise = snoise(uv * 1.4 + vec2(uTime * 0.04, uTime * 0.025)) * 0.22;
    float diagonal = (uv.x + uv.y) * 0.5;
    float gradient = diagonal * 1.15 + noise;
    
    vec3 deepBlue = uColor1;
    vec3 paleBlue = uColor2;
    vec3 softBlue = mix(deepBlue, paleBlue, 0.35);
    vec3 lightBlue = mix(deepBlue, paleBlue, 0.70);
    
    vec3 color;
    if (gradient < 0.3) {
        color = deepBlue;
    } else if (gradient < 0.55) {
        color = softBlue;
    } else if (gradient < 0.8) {
        color = lightBlue;
    } else {
        color = paleBlue;
    }
    
    float dither = bayerDither4x4(coord);
    float threshold = fract(gradient * 4.0);
    
    if (gradient < 0.3 && threshold > dither * 0.5) {
        color = softBlue;
    } else if (gradient >= 0.3 && gradient < 0.55 && threshold > dither * 0.5) {
        color = lightBlue;
    } else if (gradient >= 0.55 && gradient < 0.8 && threshold > dither * 0.5) {
        color = paleBlue;
    }
    
    vec2 cornerDist = vec2(uv.x, uv.y);
    float fadeMask = smoothstep(0.0, 0.22, length(cornerDist));
    color = mix(vec3(0.98, 0.99, 1.0), color, fadeMask);
    
    gl_FragColor = vec4(color, 0.45);
}
`;

const ShaderPlane = ({ color1, color2, speed = 0.8 }: { color1: string; color2: string; speed?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1000, 1000) },
      uColor1: { value: new THREE.Color(color1) },
      uColor2: { value: new THREE.Color(color2) },
    }),
    [color1, color2]
  );

  useFrame((state) => {
    const { clock, size } = state;
    uniforms.uTime.value = clock.getElapsedTime() * speed;
    uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh ref={meshRef} scale={[2, 2, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

// --- Kokonut UI ElegantShape Floating Geometric Primitive ---
function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-blue-500/[0.22]",
  borderRadius = 16,
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
  borderRadius?: number;
}) {
  return (
    <motion.div
      animate={{
        opacity: 1,
        y: 0,
        rotate,
      }}
      className={cn("absolute pointer-events-none select-none", className)}
      initial={{
        opacity: 0,
        y: -140,
        rotate: rotate - 12,
      }}
      transition={{
        duration: 2.2,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
    >
      <motion.div
        animate={{
          y: [0, 16, 0],
        }}
        className="relative"
        style={{
          width,
          height,
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div
          className={cn(
            "absolute inset-0",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px]",
            "ring-1 ring-blue-500/25 dark:ring-blue-400/20",
            "shadow-[0_4px_30px_-4px_rgba(59,130,246,0.18)]",
            "after:absolute after:inset-0",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.45),transparent_70%)]",
            "after:rounded-[inherit]"
          )}
          style={{ borderRadius }}
        />
      </motion.div>
    </motion.div>
  );
}

// --- Main HeroGeometricBackground Component ---
export default function HeroGeometricBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none print:hidden bg-slate-50/70"
    >
      {/* 1. Interactive Three.js WebGL Simplex Dither Shader (Mounted Client-Side) */}
      {mounted && (
        <div className="absolute inset-0 w-full h-full opacity-60">
          <Canvas
            camera={{ position: [0, 0, 1] }}
            dpr={[1, 1]}
            gl={{
              antialias: false,
              alpha: true,
              powerPreference: "low-power",
            }}
          >
            <ShaderPlane color1="#60A5FA" color2="#EFF6FF" speed={0.7} />
          </Canvas>
        </div>
      )}

      {/* 2. Delicate Geometric Technical Dot Matrix */}
      <div className="absolute inset-0 antigravity-dot-grid opacity-60" />

      {/* 3. Subtle Horizon Light Beam Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,rgba(59,130,246,0.14),rgba(99,102,241,0.09),transparent_70%)] blur-2xl" />

      {/* 4. Kokonut UI Floating Geometric Shapes Collection */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Tall angled rectangle - top left */}
        <ElegantShape
          borderRadius={24}
          className="top-[-8%] left-[-10%] sm:left-[-5%]"
          delay={0.2}
          gradient="from-indigo-500/[0.22]"
          height={480}
          rotate={-10}
          width={280}
        />

        {/* Wide pill rectangle - bottom right */}
        <ElegantShape
          borderRadius={22}
          className="right-[-12%] sm:right-[-6%] bottom-[-5%]"
          delay={0.4}
          gradient="from-blue-500/[0.22]"
          height={200}
          rotate={14}
          width={580}
        />

        {/* Diagonal rounded square - middle left */}
        <ElegantShape
          borderRadius={28}
          className="top-[38%] left-[-4%]"
          delay={0.3}
          gradient="from-violet-500/[0.20]"
          height={280}
          rotate={22}
          width={280}
        />

        {/* Horizontal geometric pill - top right */}
        <ElegantShape
          borderRadius={14}
          className="top-[8%] right-[8%]"
          delay={0.5}
          gradient="from-cyan-500/[0.22]"
          height={100}
          rotate={-18}
          width={260}
        />

        {/* Mid-right floating geometric slab */}
        <ElegantShape
          borderRadius={18}
          className="top-[48%] right-[-6%]"
          delay={0.6}
          gradient="from-emerald-500/[0.18]"
          height={140}
          rotate={32}
          width={380}
        />

        {/* Bottom-left floating accent pill */}
        <ElegantShape
          borderRadius={24}
          className="bottom-[8%] left-[16%]"
          delay={0.25}
          gradient="from-sky-500/[0.22]"
          height={160}
          rotate={-20}
          width={240}
        />
      </div>

      {/* 5. Smooth Horizon Top Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
    </div>
  );
}
