"use client";

/* eslint-disable react/no-unknown-property */
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree, ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-namespace */
declare module "react" {
    namespace JSX {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface IntrinsicElements extends ThreeElements { }
    }
}
/* eslint-enable @typescript-eslint/no-namespace */

// --- Shader Code ---
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
    
    // Very calm, smooth continuous ambient wave flow
    float t = uTime * 0.35;
    
    // Gentle rolling harmonic waves
    float wave1 = sin((uv.x + uv.y) * 2.5 - t * 0.4) * 0.22;
    float wave2 = cos((uv.x * 1.8 - uv.y * 1.8) + t * 0.3) * 0.14;
    float wave3 = sin(uv.x * 3.0 - t * 0.25) * 0.08;
    
    // Soft flowing organic noise
    vec2 flowUv = uv * 1.8 + vec2(t * 0.06, t * 0.04);
    float noise = snoise(flowUv) * 0.22;
    
    // Very gentle traveling wave progression across the diagonal
    float travelingAxis = (uv.x + uv.y) * 0.7 - t * 0.16;
    float waveField = travelingAxis + wave1 + wave2 + wave3 + noise;
    
    // Seamless rolling sine wave between 0.0 and 1.0
    float flow = sin(waveField * 3.14159) * 0.5 + 0.5;
    
    // Interpolate colors based on flowing wave
    vec3 deepBlue = uColor1;
    vec3 paleBlue = uColor2;
    vec3 softBlue = mix(deepBlue, paleBlue, 0.35);
    vec3 lightBlue = mix(deepBlue, paleBlue, 0.70);
    
    // Distinct stepped geometric color bands
    vec3 color;
    if (flow < 0.28) {
        color = deepBlue;
    } else if (flow < 0.52) {
        color = softBlue;
    } else if (flow < 0.76) {
        color = lightBlue;
    } else {
        color = paleBlue;
    }
    
    // Bayer dithered transition boundaries
    float dither = bayerDither4x4(coord);
    float threshold = fract(flow * 4.0);
    
    if (flow < 0.28 && threshold > dither * 0.5) {
        color = softBlue;
    } else if (flow >= 0.28 && flow < 0.52 && threshold > dither * 0.5) {
        color = lightBlue;
    } else if (flow >= 0.52 && flow < 0.76 && threshold > dither * 0.5) {
        color = paleBlue;
    }
    
    // Soft ambient vignette
    float vignette = smoothstep(1.3, 0.3, length(uv - 0.5));
    color = mix(color, color * 0.94, (1.0 - vignette) * 0.25);
    
    gl_FragColor = vec4(color, 0.92);
}
`;

const HERO_GEOMETRIC_FALLBACK_COLOR_1 = "#3B82F6";
const HERO_GEOMETRIC_FALLBACK_COLOR_2 = "#F0F9FF";
const HEX_COLOR_REGEX = /^#?[0-9a-fA-F]{6}$/;

function sanitizeHexColor(value: string, fallback: string) {
    const trimmed = value.trim();
    if (!HEX_COLOR_REGEX.test(trimmed)) return fallback;
    return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

const GradientPlane = ({
    color1,
    color2,
    speed = 0.5
}: {
    color1: string;
    color2: string;
    speed?: number
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { viewport } = useThree();

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(1000, 1000) },
            uColor1: { value: new THREE.Color(HERO_GEOMETRIC_FALLBACK_COLOR_1) },
            uColor2: { value: new THREE.Color(HERO_GEOMETRIC_FALLBACK_COLOR_2) },
        }),
        []
    );

    useFrame((state, delta) => {
        const dt = delta > 0 && delta < 0.1 ? delta : 0.016;
        const newTime = uniforms.uTime.value + dt * speed;
        uniforms.uTime.value = newTime;
        uniforms.uResolution.value.set(state.size.width, state.size.height);

        const col1 = sanitizeHexColor(color1, HERO_GEOMETRIC_FALLBACK_COLOR_1);
        const col2 = sanitizeHexColor(color2, HERO_GEOMETRIC_FALLBACK_COLOR_2);
        uniforms.uColor1.value.set(col1);
        uniforms.uColor2.value.set(col2);

        // Crucial: Update material uniforms directly in case Three.js cloned the uniforms object
        if (materialRef.current?.uniforms) {
            if (materialRef.current.uniforms.uTime) {
                materialRef.current.uniforms.uTime.value = newTime;
            }
            if (materialRef.current.uniforms.uResolution) {
                materialRef.current.uniforms.uResolution.value.set(state.size.width, state.size.height);
            }
            if (materialRef.current.uniforms.uColor1) {
                materialRef.current.uniforms.uColor1.value.set(col1);
            }
            if (materialRef.current.uniforms.uColor2) {
                materialRef.current.uniforms.uColor2.value.set(col2);
            }
        }

        // Sub-pixel rotation to guarantee Three.js re-renders the mesh each frame
        if (meshRef.current) {
            meshRef.current.rotation.z = Math.sin(newTime * 0.1) * 0.0001;
        }
    });

    return (
        <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                ref={materialRef}
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

// --- Main Component ---

interface HeroGeometricProps extends React.ComponentPropsWithoutRef<"div"> {
    title1?: string;
    title2?: string;
    description?: string;
    color1?: string;
    color2?: string;
    speed?: number;
    children?: React.ReactNode;
}

const HERO_HEADLINE_CLASS =
    "pb-[0.08em] text-[12cqi] md:text-[8cqi] lg:text-[6cqi] leading-[0.96] tracking-tighter font-bold text-zinc-900";

export default function HeroGeometric({
    title1,
    title2,
    description,
    color1 = "#3B82F6", // Default soft blue
    color2 = "#F0F9FF", // Default pale blue
    speed = 1,
    className,
    children,
    ...props
}: HeroGeometricProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div
            className={cn("relative w-full min-h-screen flex flex-col items-center overflow-hidden bg-white text-black", className)}
            style={{
                containerType: "size",
                ...props.style
            }}
            {...props}
        >
            {/* Background Shader */}
            {mounted && (
                <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                    <Canvas
                        frameloop="always"
                        camera={{ position: [0, 0, 1] }}
                        dpr={[1, 1]}
                        gl={{
                            antialias: false,
                            alpha: true,
                        }}
                    >
                        <GradientPlane color1={color1} color2={color2} speed={speed} />
                    </Canvas>
                </div>
            )}

            {children}

            {/* Content */}
            {(title1 || title2 || description) && (
                <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center pt-8 pb-8 md:pt-20 md:pb-20">
                    <div className="w-full max-w-[1200px] px-6 flex flex-col items-center">
                        {/* Headline */}
                        <div className="flex flex-col items-center text-center gap-2 md:gap-4 mb-8 md:mb-12">
                            {title1 && (
                                <div className="overflow-hidden">
                                    <motion.h1
                                        initial={{ y: "100%", opacity: 0 }}
                                        animate={{ y: "0%", opacity: 1 }}
                                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                                        className={HERO_HEADLINE_CLASS}
                                    >
                                        {title1}
                                    </motion.h1>
                                </div>
                            )}
                            {title2 && (
                                <div className="overflow-hidden">
                                    <motion.h1
                                        initial={{ y: "100%", opacity: 0 }}
                                        animate={{ y: "0%", opacity: 1 }}
                                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
                                        className={HERO_HEADLINE_CLASS}
                                    >
                                        {title2}
                                    </motion.h1>
                                </div>
                            )}
                        </div>

                        {/* Subheadline */}
                        {description && (
                            <div className="max-w-[480px] text-center mb-8">
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                                    className="text-lg md:text-[1.35rem] leading-relaxed text-neutral-600 font-normal"
                                >
                                    {description}
                                </motion.p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
