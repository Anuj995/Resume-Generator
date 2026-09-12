import { useState, useCallback } from "react";

export type EnhanceField = "summary" | "experience" | "project" | "achievement";

interface EnhanceState {
  loading: boolean;
  enhanced: string | null;
  error: string | null;
}

const initialState: EnhanceState = {
  loading: false,
  enhanced: null,
  error: null,
};

/**
 * Hook for a single field's enhance state + trigger.
 */
export function useAIEnhance(targetRole: string) {
  const [state, setState] = useState<EnhanceState>(initialState);

  const enhance = useCallback(
    async (field: EnhanceField, content: string): Promise<string | null> => {
      if (!content.trim()) return null;

      setState({ loading: true, enhanced: null, error: null });

      try {
        const res = await fetch("/api/enhance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field, content, targetRole }),
        });

        const data = await res.json();

        if (!res.ok) {
          setState({ loading: false, enhanced: null, error: data.error || "Enhancement failed" });
          return null;
        }

        setState({ loading: false, enhanced: data.enhanced, error: null });
        return data.enhanced;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Network error";
        setState({ loading: false, enhanced: null, error: message });
        return null;
      }
    },
    [targetRole]
  );

  const reset = useCallback(() => setState(initialState), []);

  return { ...state, enhance, reset };
}

/**
 * Enhance multiple fields concurrently (for "Enhance All").
 */
export async function enhanceAll(
  fields: { field: EnhanceField; content: string }[],
  targetRole: string
): Promise<(string | null)[]> {
  const results = await Promise.allSettled(
    fields.map(({ field, content }) =>
      fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, content, targetRole }),
      }).then((r) => r.json())
    )
  );

  return results.map((r) =>
    r.status === "fulfilled" && r.value?.enhanced ? r.value.enhanced : null
  );
}
