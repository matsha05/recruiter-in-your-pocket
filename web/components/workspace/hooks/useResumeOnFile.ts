"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A resume kept on file for posting reads (Nov 11, 2026). A saved report doesn't keep the resume, so a posting
 * read from one asked for the resume again every time. A pass holder can now choose to keep the resume on file;
 * the next posting read from a report written on that resume fills it in, and they only paste the posting.
 *
 * It is opt-in, stored in the account's saved resume (the same record Settings manages), and removed with one
 * click here. The server decides whether the resume on file is the one a report was written on; a revised
 * resume doesn't match, and the person adds it as before.
 */
export type ResumeOnFileState =
  | { status: "none" }
  /** The resume on file was filled in for this posting read. */
  | { status: "loaded"; filename: string | null; text: string }
  /** The person just chose to keep the resume in the field. */
  | { status: "kept"; text: string }
  | { status: "saving" }
  | { status: "removed" }
  | { status: "error"; message: string };

export function useResumeOnFile(input: {
  /** A posting read from a saved report that still needs its resume; null otherwise. */
  reportId: string | null;
  enabled: boolean;
  onLoaded: (text: string, filename: string | null) => void;
}) {
  const [state, setState] = useState<ResumeOnFileState>({ status: "none" });
  const asked = useRef<string | null>(null);
  const { reportId, enabled, onLoaded } = input;

  useEffect(() => {
    if (!enabled || !reportId || asked.current === reportId) return;
    asked.current = reportId;
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`/api/user/default-resume?includeText=1&forReport=${encodeURIComponent(reportId)}`, { signal: controller.signal });
        if (!response.ok) return;
        const body = await response.json();
        const data = body?.data;
        if (!data?.hasResume || data.matchesReport !== true || typeof data.resumeText !== "string" || !data.resumeText.trim()) return;
        onLoaded(data.resumeText, typeof data.resumeFilename === "string" ? data.resumeFilename : null);
        setState({ status: "loaded", filename: typeof data.resumeFilename === "string" ? data.resumeFilename : null, text: data.resumeText });
      } catch {
        // No resume on file is the ordinary case; the person adds theirs as before.
      }
    })();
    return () => controller.abort();
  }, [enabled, reportId, onLoaded]);

  const keep = useCallback(async (resumeText: string, filename: string | null) => {
    setState({ status: "saving" });
    try {
      const response = await fetch("/api/user/default-resume", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resumeText, filename: filename ?? undefined, purpose: "posting_reads" }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.success) {
        setState({ status: "error", message: typeof body?.error === "string" ? body.error : "We couldn't keep your resume on file. Try again." });
        return;
      }
      setState({ status: "kept", text: resumeText });
    } catch {
      setState({ status: "error", message: "We couldn't keep your resume on file. Try again." });
    }
  }, []);

  const remove = useCallback(async () => {
    try {
      const response = await fetch("/api/user/default-resume", { method: "DELETE" });
      if (!response.ok) {
        setState({ status: "error", message: "We couldn't remove your resume from file. Try again." });
        return;
      }
      setState({ status: "removed" });
    } catch {
      setState({ status: "error", message: "We couldn't remove your resume from file. Try again." });
    }
  }, []);

  const reset = useCallback(() => {
    asked.current = null;
    setState({ status: "none" });
  }, []);

  return { state, keep, remove, reset };
}

/** What the input shows for the resume now in the field: "loaded" and "kept" hold only for that exact text. */
export function resumeOnFileStateFor(state: ResumeOnFileState, resumeText: string): ResumeOnFileState {
  if ((state.status === "loaded" || state.status === "kept") && state.text !== resumeText) return { status: "none" };
  return state;
}
