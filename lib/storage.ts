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
