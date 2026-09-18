export const RESUME_STORAGE_KEYS = [
  "resume_raw_text",
  "resume_file_name",
  "resume_data",
  "resume_target_role",
  "resume_job_description",
  "resume_template",
  "resume_extracted",
  "resume_tailored",
  "resume_extract_hash",
  "resume_tailored_hash",
] as const;

export type ResumeStorageKey = (typeof RESUME_STORAGE_KEYS)[number];

/**
 * Emits a custom browser event to notify all components (like the Navbar)
 * that resume cache/state has been updated.
 */
export function notifyStorageChange(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new Event("resume_storage_update"));
  } catch {
    // ignore
  }
}

/**
 * Completely purges all cached resume data and previous state from browser storage.
 */
export function clearAllResumeData(): void {
  if (typeof window === "undefined") return;
  RESUME_STORAGE_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
  notifyStorageChange();
}

/**
 * Checks if there is any existing resume draft data stored in cache.
 */
export function hasResumeCache(): boolean {
  if (typeof window === "undefined") return false;
  return RESUME_STORAGE_KEYS.some((key) => {
    try {
      const val = localStorage.getItem(key);
      return Boolean(val && val.trim());
    } catch {
      return false;
    }
  });
}

/**
 * Validates whether a specific step/route is unlocked and ready to visit based on completed inputs.
 */
export function isStepUnlocked(step: "home" | "input" | "explore" | "role" | "templates" | "editor" | "preview" | "organize"): boolean {
  if (typeof window === "undefined") return false;
  if (step === "home" || step === "input" || step === "explore") return true;

  const rawText = (localStorage.getItem("resume_raw_text") || "").trim();
  const hasValidInput = rawText.length >= 25;
  if (!hasValidInput) return false;

  if (step === "role") {
    return true;
  }

  const role = (localStorage.getItem("resume_target_role") || "").trim();
  const hasRole = Boolean(role);
  if (!hasRole) return false;

  if (step === "organize" || step === "templates") {
    return true;
  }

  const hasData = Boolean(localStorage.getItem("resume_data"));
  if (step === "editor" || step === "preview") {
    return hasData;
  }

  return false;
}

/**
 * Fast 32-bit string hash function for comparing payload states without heavy overhead.
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

/**
 * Generates a unique fingerprint for raw input and role to avoid redundant extraction API calls.
 */
export function computeExtractHash(rawText: string, targetRole: string, fileName = ""): string {
  return simpleHash(`${rawText.trim()}:::${targetRole.trim().toLowerCase()}:::${fileName.trim()}`);
}

/**
 * Generates a unique fingerprint for structured resume data and job description to avoid redundant tailoring API calls.
 */
export function computeTailoredHash(resumeData: unknown, targetRole: string, jobDescription = ""): string {
  return simpleHash(`${JSON.stringify(resumeData)}:::${targetRole.trim().toLowerCase()}:::${jobDescription.trim()}`);
}
