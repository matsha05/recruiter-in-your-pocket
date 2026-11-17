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
 *
 * An account keeps one resume on file, so keeping another replaces it (Nov 17, 2026). The offer used to say only
 * "Keep it on file", and on a live walk that click saved a different resume over the one kept there. The hook now
 * knows what is on file before the offer shows, and the offer says when keeping this one replaces it.
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

/**
 * What is on file, as far as this screen knows: the text, null for nothing on file, or undefined while it hasn't
 * been asked yet.
 */
export type OnFileText = string | null | undefined;

export function useResumeOnFile(input: {
  /** A posting read from a saved report that still needs its resume; null otherwise. */
  reportId: string | null;
  enabled: boolean;
  onLoaded: (text: string, filename: string | null) => void;
  /** The offer to keep a resume is about to show; ask what is on file if that isn't known yet. */
  offering?: boolean;
}) {
  const [state, setState] = useState<ResumeOnFileState>({ status: "none" });
  const [onFileText, setOnFileText] = useState<OnFileText>(undefined);
  const asked = useRef<string | null>(null);
  const askedOnFile = useRef(false);
  const { reportId, enabled, onLoaded, offering = false } = input;

  useEffect(() => {
    if (!enabled || !reportId || asked.current === reportId) return;
    asked.current = reportId;
    askedOnFile.current = true;
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`/api/user/default-resume?includeText=1&forReport=${encodeURIComponent(reportId)}`, { signal: controller.signal });
        if (!response.ok) return setOnFileText((current) => current === undefined ? null : current);
        const body = await response.json();
        const data = body?.data;
        setOnFileText(onFileTextOf(data));
        if (!data?.hasResume || data.matchesReport !== true || typeof data.resumeText !== "string" || !data.resumeText.trim()) return;
        onLoaded(data.resumeText, typeof data.resumeFilename === "string" ? data.resumeFilename : null);
        setState({ status: "loaded", filename: typeof data.resumeFilename === "string" ? data.resumeFilename : null, text: data.resumeText });
      } catch {
        // No resume on file is the ordinary case; the person adds theirs as before.
        if (!controller.signal.aborted) setOnFileText((current) => current === undefined ? null : current);
      }
    })();
    return () => controller.abort();
  }, [enabled, reportId, onLoaded]);

  // The offer can show without the fetch above: the resume was already in the field, so there was nothing to fill
  // in. Ask once what is on file, so the offer can say whether keeping this one replaces it.
  useEffect(() => {
    if (!enabled || !offering || onFileText !== undefined || askedOnFile.current) return;
    askedOnFile.current = true;
    void (async () => {
      try {
        const response = await fetch("/api/user/default-resume?includeText=1");
        const body = response.ok ? await response.json() : null;
        setOnFileText((current) => current === undefined ? onFileTextOf(body?.data) : current);
      } catch {
        // Unknown is shown as nothing on file: the offer reads as it did before.
        setOnFileText((current) => current === undefined ? null : current);
      }
    })();
  }, [enabled, offering, onFileText]);

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
      setOnFileText(resumeText);
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
      setOnFileText(null);
      setState({ status: "removed" });
    } catch {
      setState({ status: "error", message: "We couldn't remove your resume from file. Try again." });
    }
  }, []);

  const reset = useCallback(() => {
    asked.current = null;
    setState({ status: "none" });
  }, []);

  return { state, onFileText, keep, remove, reset };
}

function onFileTextOf(data: unknown): string | null {
  const record = data as { hasResume?: unknown; resumeText?: unknown } | null | undefined;
  return record?.hasResume === true && typeof record.resumeText === "string" && record.resumeText.trim() ? record.resumeText : null;
}

/** What the input shows for the resume now in the field: "loaded" and "kept" hold only for that exact text. */
export function resumeOnFileStateFor(state: ResumeOnFileState, resumeText: string): ResumeOnFileState {
  if ((state.status === "loaded" || state.status === "kept") && state.text !== resumeText) return { status: "none" };
  return state;
}

/**
 * Which offer the resume in the field gets: "keep" when nothing is on file, "replace" when a different resume is,
 * nothing when this one already is, and nothing while the screen is still asking (so the plain offer never shows
 * over a resume it would replace).
 */
export function keepOfferFor(onFileText: OnFileText, resumeText: string): "keep" | "replace" | null {
  if (onFileText === undefined) return null;
  if (onFileText === null) return "keep";
  const flat = (value: string) => value.replace(/\s+/gu, " ").trim();
  return flat(onFileText) === flat(resumeText) ? null : "replace";
}
