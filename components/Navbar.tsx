"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { clearAllResumeData, isStepUnlocked } from "@/lib/storage";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [unlockedState, setUnlockedState] = useState({
    input: true,
    explore: true,
    role: false,
    editor: false,
    preview: false,
  });

  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [shakingKey, setShakingKey] = useState<string | null>(null);

  const checkUnlocked = useCallback(() => {
    if (typeof window === "undefined") return;
    setUnlockedState({
      input: true,
      explore: true,
      role: isStepUnlocked("role"),
      editor: isStepUnlocked("editor"),
      preview: isStepUnlocked("preview"),
    });
  }, []);

  useEffect(() => {
    checkUnlocked();
    window.addEventListener("storage", checkUnlocked);
    window.addEventListener("resume_storage_update", checkUnlocked);
    return () => {
      window.removeEventListener("storage", checkUnlocked);
      window.removeEventListener("resume_storage_update", checkUnlocked);
    };
  }, [pathname, checkUnlocked]);

  const handleNewResume = () => {
    clearAllResumeData();
    router.push("/input?new=true");
  };

  const navItems = useMemo(
    () => [
      { href: "/", label: "Home", key: "home" as const },
      { href: "/explore", label: "Templates", key: "explore" as const },
      { href: "/input", label: "Enter Info", key: "input" as const },
      { href: "/role", label: "Select Role", key: "role" as const },
      { href: "/editor", label: "Editor", key: "editor" as const },
      { href: "/preview", label: "Preview", key: "preview" as const },
    ],
    []
  );

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    if (path === "/explore") return pathname.startsWith("/explore") || pathname.startsWith("/templates");
    return pathname.startsWith(path);
  };

  // Micro progress percentage based on current funnel stage
  const progressPercent = useMemo(() => {
    if (pathname.startsWith("/preview")) return 100;
    if (pathname.startsWith("/editor")) return 80;
    if (pathname.startsWith("/organize") || pathname.startsWith("/role")) return 60;
    if (pathname.startsWith("/input")) return 40;
    if (pathname.startsWith("/explore") || pathname.startsWith("/templates")) return 25;
    return 12;
  }, [pathname]);

  const handleLockedClick = (e: React.MouseEvent, label: string, key: string) => {
    e.preventDefault();

    // Trigger subtle shake animation on the locked button
    setShakingKey(key);
    setTimeout(() => setShakingKey(null), 500);

    const rawText = (typeof window !== "undefined" ? localStorage.getItem("resume_raw_text") || "" : "").trim();
    const role = (typeof window !== "undefined" ? localStorage.getItem("resume_target_role") || "" : "").trim();

    let msg = `Step locked: Please complete previous steps first before opening ${label}.`;

    if (key === "role") {
      msg = `Cannot open Select Role: Please enter your resume details or upload a file in "Enter Info" first.`;
    } else if (key === "editor" || key === "preview") {
      if (rawText.length < 25) {
        msg = `Cannot open ${label}: Please enter your resume details in "Enter Info" first.`;
      } else if (!role) {
        msg = `Cannot open ${label}: Please select your target role in "Select Role" first.`;
      } else {
        msg = `Cannot open ${label}: Please review your details before proceeding.`;
      }
    }

    setBlockedMessage(msg);
    setTimeout(() => {
      setBlockedMessage((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  return (
    <>
      {/* Floating Island Glassmorphic Header */}
      <header className="sticky top-2 sm:top-3 z-40 px-3 sm:px-6 transition-all print:hidden">
        <div className="max-w-5xl mx-auto relative">
          <nav className="relative flex items-center justify-between px-3.5 sm:px-5 py-2 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/60">
            {/* Top Shimmer Horizon Line */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent pointer-events-none" />

            {/* Brand Logo with 3D Spring Hover */}
            <Link href="/" className="flex items-center gap-2.5 group select-none">
              <motion.div
                whileHover={{ scale: 1.08, rotate: -2 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25"
              >
                <div className="absolute inset-0 rounded-xl bg-blue-400/30 blur-xs -z-10 group-hover:bg-blue-400/50 transition-colors" />
                <svg
                  className="w-4 h-4 transition-transform group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </motion.div>

              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  ResumeGen
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-blue-700 bg-blue-50/90 border border-blue-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  ATS
                </span>
              </div>
            </Link>

            {/* Middle Nav Items with Sliding Animated Pill */}
            <div className="flex items-center gap-1">
              <div className="flex items-center space-x-0.5 sm:space-x-1 text-xs sm:text-sm font-medium">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  const unlocked =
                    item.key === "home" ||
                    unlockedState[item.key as keyof typeof unlockedState];
                  const isShaking = shakingKey === item.key;

                  if (!unlocked) {
                    return (
                      <motion.button
                        key={item.href}
                        type="button"
                        animate={isShaking ? { x: [-3, 3, -3, 3, 0] } : {}}
                        transition={{ duration: 0.35 }}
                        onClick={(e) => handleLockedClick(e, item.label, item.key)}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm text-slate-400 hover:text-slate-500 hover:bg-slate-100/60 flex items-center gap-1 cursor-not-allowed select-none transition-colors"
                        title={`Step locked: Complete previous steps before opening ${item.label}`}
                      >
                        <span className="hidden md:inline">{item.label}</span>
                        <span className="md:hidden">{item.label.split(" ")[0]}</span>
                        <svg
                          className="w-3 h-3 text-slate-400 opacity-60 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.button>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm transition-colors ${
                        active
                          ? "text-blue-700 font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                      }`}
                    >
                      {/* Fluid Sliding Active Pill Background Indicator */}
                      {active && (
                        <motion.span
                          layoutId="nav-active-indicator"
                          className="absolute inset-0 bg-blue-50/90 border border-blue-200/90 rounded-xl shadow-xs -z-10"
                          transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        />
                      )}
                      <span className="hidden md:inline">{item.label}</span>
                      <span className="md:hidden">{item.label.split(" ")[0]}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Action Button: New Resume with Shimmer Effect */}
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={handleNewResume}
                className="relative group overflow-hidden ml-1 sm:ml-2 inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white shadow-sm shadow-blue-500/25 hover:shadow-md hover:shadow-blue-500/35 transition-all cursor-pointer select-none"
                title="Wipe cache and start a fresh resume"
              >
                {/* Micro Sheen Sweep */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform ease-out pointer-events-none" />
                <svg
                  className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Resume</span>
              </motion.button>
            </div>

            {/* Bottom Subtle Journey Progress Track */}
            <div className="absolute -bottom-px left-6 right-6 h-[2px] bg-slate-100/80 rounded-full overflow-hidden pointer-events-none">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full"
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </nav>
        </div>
      </header>

      {/* Floating Animated Warning Toast when clicking locked steps */}
      <AnimatePresence>
        {blockedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-medium shadow-2xl backdrop-blur-xl border border-slate-700 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-sm">🔒</span>
              <span className="text-slate-100">{blockedMessage}</span>
            </div>
            <button
              onClick={() => setBlockedMessage(null)}
              className="text-slate-400 hover:text-white font-bold px-1.5 py-0.5 rounded cursor-pointer"
              title="Dismiss"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
