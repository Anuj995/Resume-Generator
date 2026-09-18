"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAllResumeData } from "@/lib/storage";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNewResume = () => {
    clearAllResumeData();
    router.push("/input?new=true");
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/input", label: "Enter Info" },
    { href: "/role", label: "Select Role" },
    { href: "/templates", label: "Templates" },
    { href: "/editor", label: "Editor" },
    { href: "/preview", label: "Preview" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
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
  );
}
