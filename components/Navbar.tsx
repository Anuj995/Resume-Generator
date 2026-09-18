"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

  const navItems = [
    { href: "/", label: "Home", key: "home" as const },
    { href: "/explore", label: "Templates", key: "explore" as const },
    { href: "/input", label: "Enter Info", key: "input" as const },
    { href: "/role", label: "Select Role", key: "role" as const },
    { href: "/editor", label: "Editor", key: "editor" as const },
    { href: "/preview", label: "Preview", key: "preview" as const },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    if (path === "/explore") return pathname.startsWith("/explore") || pathname.startsWith("/templates");
    return pathname.startsWith(path);
  };

  const handleLockedClick = (e: React.MouseEvent, label: string, key: string) => {
    e.preventDefault();

    const rawText = (typeof window !== "undefined" ? localStorage.getItem("resume_raw_text") || "" : "").trim();
    const role = (typeof window !== "undefined" ? localStorage.getItem("resume_target_role") || "" : "").trim();

    let msg = `Step locked: Please complete previous steps first before opening ${label}.`;

    if (key === "role") {
      msg = `Cannot open Select Role: Please enter your resume details or upload a file in "Enter Info" first (min. 25 characters).`;
    } else if (key === "templates") {
      if (rawText.length < 25) {
        msg = `Cannot open Templates: Please enter your resume details in "Enter Info" first.`;
      } else if (!role) {
        msg = `Cannot open Templates: Please choose your Target Role in "Select Role" first.`;
      }
    } else if (key === "editor" || key === "preview") {
      if (rawText.length < 25) {
        msg = `Cannot open ${label}: Please enter your resume details in "Enter Info" first.`;
      } else if (!role) {
        msg = `Cannot open ${label}: Please complete Target Role selection first.`;
      } else {
        msg = `Cannot open ${label}: Please review your structured details in "Review Info" first.`;
      }
    }

    setBlockedMessage(msg);
    setTimeout(() => {
      setBlockedMessage((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  return (
    <>
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 transition-all print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:shadow-sm group-hover:scale-105 transition-all">
              <svg
                className="w-4 h-4"
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
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                ResumeGen
              </span>
            </div>
          </Link>

          {/* Quick Links */}
          <div className="flex items-center gap-1.5">
            <nav className="flex items-center space-x-1 text-sm font-medium">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const unlocked =
                  item.key === "home" ||
                  unlockedState[item.key as keyof typeof unlockedState];

                if (!unlocked) {
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={(e) => handleLockedClick(e, item.label, item.key)}
                      className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm text-slate-400 hover:text-slate-500 hover:bg-slate-50 flex items-center gap-1 cursor-not-allowed select-none transition-colors"
                      title={`Step locked: Please fill in current info first before opening ${item.label}`}
                    >
                      <span>{item.label}</span>
                      <svg
                        className="w-3 h-3 text-slate-400 opacity-60"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg transition-colors text-xs sm:text-sm ${
                      active
                        ? "bg-blue-50 text-blue-700 font-semibold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={handleNewResume}
              className="ml-1 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-2xs cursor-pointer"
              title="Wipe cache and start a fresh resume"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">New Resume</span>
            </button>
          </div>
        </div>
      </header>

      {/* Warning Alert Banner when attempting to skip ahead */}
      {blockedMessage && (
        <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-2.5 text-center flex items-center justify-between gap-2 shadow-sm sticky top-[57px] z-40 animate-fadeIn">
          <div className="flex items-center gap-2 mx-auto">
            <span className="text-sm">🔒</span>
            <span>{blockedMessage}</span>
          </div>
          <button
            onClick={() => setBlockedMessage(null)}
            className="text-amber-100 hover:text-white font-bold px-2 py-0.5 rounded cursor-pointer"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
