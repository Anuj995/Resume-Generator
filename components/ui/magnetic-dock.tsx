"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useReducedMotion, type MotionValue } from "framer-motion"
import { cn } from "@/lib/utils"

interface MagneticDockProps {
    /** Array of dock items */
    items: DockItemData[]
    /** Size of icons in pixels */
    iconSize?: number
    /** Maximum scale on hover */
    maxScale?: number
    /** Distance of magnetic effect in pixels */
    magneticDistance?: number
    /** Show labels on hover */
    showLabels?: boolean
    /** Dock position */
    position?: "bottom" | "top" | "left" | "right"
    /** Background style */
    variant?: "glass" | "solid" | "transparent"
    /** Custom class name */
    className?: string
}

interface DockItemData {
    /** Unique identifier */
    id: string
    /** Display label */
    label: string
    /** Icon component or image URL */
    icon: React.ReactNode
    /** Click handler */
    onClick?: () => void
    /** Whether item is active */
    isActive?: boolean
    /** Badge count */
    badge?: number
}

interface DockItemProps {
    item: DockItemData
    mouseX: MotionValue<number>
    iconSize: number
    maxScale: number
    magneticDistance: number
    showLabels: boolean
    isVertical: boolean
    reducedMotion: boolean
}

function DockItem({
    item,
    mouseX,
    iconSize,
    maxScale,
    magneticDistance,
    showLabels,
    isVertical,
    reducedMotion,
}: DockItemProps) {
    const ref = React.useRef<HTMLButtonElement>(null)
    const [isHovered, setIsHovered] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const showLabel = showLabels && (isHovered || isFocused)

    // Calculate distance from mouse to center of item
    const distance = useTransform(mouseX, (val: number) => {
        if (!ref.current) return magneticDistance + 1
        const rect = ref.current.getBoundingClientRect()
        const center = isVertical
            ? rect.top + rect.height / 2
            : rect.left + rect.width / 2
        return val - center
    })

    // Scale based on distance - closer = larger
    const scale = useTransform(distance, [-magneticDistance, 0, magneticDistance], [1, maxScale, 1])

    // Apply spring physics for smooth animation
    const springConfig = { damping: 20, stiffness: 300, mass: 0.5 }
    const smoothScale = useSpring(scale, springConfig)

    // Calculate the size based on scale
    const size = useTransform(smoothScale, (s) => s * iconSize)

    // Floating effect
    const y = useTransform(smoothScale, (s) => (s - 1) * -10)
    const smoothY = useSpring(y, springConfig)

    return (
        <motion.button
            ref={ref}
            type="button"
            tabIndex={0}
            aria-label={item.label}
            aria-current={item.isActive ? "page" : undefined}
            onClick={item.onClick}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "relative flex items-center justify-center cursor-pointer",
                "rounded-2xl transition-colors duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
                item.isActive && "bg-neutral-200/50 dark:bg-white/10"
            )}
            style={{
                width: reducedMotion ? iconSize : size,
                height: reducedMotion ? iconSize : size,
                y: reducedMotion || isVertical ? 0 : smoothY,
                x: reducedMotion || !isVertical ? 0 : smoothY,
            }}
            whileTap={reducedMotion ? undefined : { scale: 0.9 }}
        >
            {/* Icon Container */}
            <motion.div
                className={cn(
                    "relative w-full h-full rounded-2xl overflow-hidden",
                    "bg-gradient-to-b from-white to-neutral-50",
                    "backdrop-blur-sm",
                    "border border-neutral-200/90",
                    "shadow-lg shadow-black/5",
                    "flex items-center justify-center",
                    "transition-colors duration-200"
                )}
                style={{
                    boxShadow: isHovered
                        ? "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)"
                        : "0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
                }}
            >
                {/* Icon */}
                <div aria-hidden="true" className="w-[55%] h-[55%] flex items-center justify-center text-neutral-700">
                    {item.icon}
                </div>

                {/* Shine effect */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, transparent 50%, transparent 100%)",
                        opacity: isHovered ? 0.9 : 0.4,
                    }}
                />
            </motion.div>

            {/* Badge */}
            <AnimatePresence initial={false}>
                {item.badge !== undefined && item.badge > 0 && (
                    <motion.div
                        initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={reducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                        className={cn(
                            "absolute -top-1 -right-1",
                            "min-w-[20px] h-5 px-1.5",
                            "rounded-full",
                            "bg-blue-600",
                            "text-white text-xs font-semibold",
                            "flex items-center justify-center",
                            "border-2 border-white",
                            "shadow-lg"
                        )}
                    >
                        {item.badge > 99 ? "99+" : item.badge}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Indicator */}
            <AnimatePresence initial={false}>
                {item.isActive && (
                    <motion.div
                        initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={reducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                        className={cn(
                            "absolute -bottom-2",
                            "w-1.5 h-1.5 rounded-full",
                            "bg-blue-600"
                        )}
                    />
                )}
            </AnimatePresence>

            {/* Tooltip */}
            <AnimatePresence initial={false}>
                {showLabel && (
                    <motion.div
                        aria-hidden="true"
                        initial={reducedMotion ? false : { opacity: 0, y: 8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={cn(
                            "absolute -top-10 left-1/2 -translate-x-1/2",
                            "px-3 py-1.5 rounded-xl",
                            "bg-slate-900/90",
                            "backdrop-blur-md",
                            "text-white text-xs font-semibold whitespace-nowrap",
                            "border border-white/10",
                            "shadow-xl shadow-black/20",
                            "pointer-events-none z-50"
                        )}
                    >
                        {item.label}
                        {/* Tooltip arrow */}
                        <div
                            className={cn(
                                "absolute left-1/2 -translate-x-1/2 -bottom-1",
                                "w-2 h-2 rotate-45",
                                "bg-slate-900/90",
                                "border-r border-b border-white/10"
                            )}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hover glow */}
            <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                animate={{
                    boxShadow: isHovered
                        ? "0 0 30px rgba(59,130,246,0.2)"
                        : "0 0 0px rgba(59,130,246,0)",
                }}
                transition={{ duration: 0.3 }}
            />
        </motion.button>
    )
}

function MagneticDock({
    items,
    iconSize = 48,
    maxScale = 1.35,
    magneticDistance = 120,
    showLabels = true,
    position = "bottom",
    variant = "glass",
    className,
}: MagneticDockProps) {
    const mousePosition = useMotionValue(Infinity)
    const reducedMotion = useReducedMotion() ?? false
    const isVertical = position === "left" || position === "right"

    const handleMouseMove = React.useCallback(
        (e: React.MouseEvent) => {
            if (isVertical) {
                mousePosition.set(e.clientY)
            } else {
                mousePosition.set(e.clientX)
            }
        },
        [mousePosition, isVertical]
    )

    const handleMouseLeave = () => {
        mousePosition.set(Infinity)
    }

    const variantStyles = {
        glass: cn(
            "bg-white/85",
            "backdrop-blur-xl backdrop-saturate-150",
            "border border-slate-200/90"
        ),
        solid: cn(
            "bg-slate-100",
            "border border-slate-300"
        ),
        transparent: "bg-transparent border-0",
    }

    const positionStyles = {
        bottom: "flex-row",
        top: "flex-row",
        left: "flex-col",
        right: "flex-col",
    }

    return (
        <motion.div
            onMouseMove={reducedMotion ? undefined : handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "inline-flex items-end gap-2 p-2.5 rounded-3xl",
                variantStyles[variant],
                positionStyles[position],
                "shadow-2xl shadow-slate-900/10",
                className
            )}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            {items.map((item) => (
                <DockItem
                    key={item.id}
                    item={item}
                    mouseX={mousePosition}
                    iconSize={iconSize}
                    maxScale={maxScale}
                    magneticDistance={magneticDistance}
                    showLabels={showLabels}
                    isVertical={isVertical}
                    reducedMotion={reducedMotion}
                />
            ))}
        </motion.div>
    )
}

export {
    MagneticDock,
    type MagneticDockProps,
    type DockItemData,
}
