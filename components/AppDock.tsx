"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MagneticDock, type DockItemData } from "@/components/ui/magnetic-dock";
import { isStepUnlocked } from "@/lib/storage";

export default function AppDock() {
  const pathname = usePathname();
  const router = useRouter();

  const [unlockedState, setUnlockedState] = useState({
    input: true,
    explore: true,
    role: false,
    editor: false,
    preview: false,
  });

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

  const dockItems: DockItemData[] = [
    {
      id: "home",
      label: "Home",
      isActive: pathname === "/",
      icon: (
        <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      onClick: () => router.push("/"),
    },
    {
      id: "templates",
      label: "Templates",
      isActive: pathname.startsWith("/explore") || pathname.startsWith("/templates"),
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      onClick: () => router.push("/explore"),
    },
    {
      id: "input",
      label: "Enter Info",
      isActive: pathname.startsWith("/input"),
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: () => router.push("/input"),
    },
    {
      id: "role",
      label: unlockedState.role ? "Select Role" : "Role (Locked)",
      isActive: pathname.startsWith("/role"),
      icon: (
        <svg className={`w-5 h-5 ${unlockedState.role ? "text-purple-600" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => {
        if (unlockedState.role) router.push("/role");
        else router.push("/input");
      },
    },
    {
      id: "editor",
      label: unlockedState.editor ? "Resume Editor" : "Editor (Locked)",
      isActive: pathname.startsWith("/editor") || pathname.startsWith("/organize"),
      icon: (
        <svg className={`w-5 h-5 ${unlockedState.editor ? "text-amber-600" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      onClick: () => {
        if (unlockedState.editor) router.push("/editor");
        else router.push("/input");
      },
    },
    {
      id: "preview",
      label: unlockedState.preview ? "Preview & Export" : "Preview (Locked)",
      isActive: pathname.startsWith("/preview"),
      icon: (
        <svg className={`w-5 h-5 ${unlockedState.preview ? "text-emerald-600" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      onClick: () => {
        if (unlockedState.preview) router.push("/preview");
        else router.push("/input");
      },
    },
  ];

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 print:hidden pointer-events-auto">
      <MagneticDock
        items={dockItems}
        iconSize={44}
        maxScale={1.35}
        magneticDistance={110}
        showLabels={true}
        variant="glass"
        className="glass-panel-elevated shadow-2xl border-white/80"
      />
    </div>
  );
}
