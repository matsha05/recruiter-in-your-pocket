"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPendingLineAnswers, stageLineAnswers, subscribePendingLineAnswers, type LineAnswersPatch, type PendingLineAnswers } from "@/lib/reports/line-answers";

type Persist = (patch: LineAnswersPatch) => boolean | void | Promise<boolean | void>;
type SaveState = "idle" | "saving" | "kept" | "failed";

/** Debounce edits, keep each card's writes in order, and acknowledge only its latest change. */
export function useLineAnswerSave(persist: Persist | undefined, initiallyKept: boolean, restored?: {
  reportId: string;
  fixIndex: number;
  draft: PendingLineAnswers | null;
}) {
  const [state, setState] = useState<SaveState>(restored?.draft?.state ?? (initiallyKept ? "kept" : "idle"));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<(() => Promise<void>) | null>(null);
  const latest = useRef<LineAnswersPatch | null>(restored?.draft?.patch ?? null);
  const deferred = useRef<LineAnswersPatch | null>(null);
  const revision = useRef(0);
  const mounted = useRef(true);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const flush = useCallback(() => {
    clearTimer();
    const save = pending.current;
    pending.current = null;
    if (save) void save();
  }, [clearTimer]);

  const schedule = useCallback((patch: LineAnswersPatch, delay = 1500) => {
    if (!mounted.current) return;
    latest.current = patch;
    if (!persist) {
      deferred.current = patch;
      return;
    }
    deferred.current = null;
    clearTimer();
    const version = ++revision.current;
    setState("saving");
    const staged = restored ? stageLineAnswers(restored.reportId, patch) : null;
    // Capture this report's callback with the edit. The shared writer keeps the card's
    // requests in order even when navigation replaces this component with another copy.
    pending.current = async () => {
      // Confirmed deletion/signout or a newer edit can discard this debounce before it sends.
      if (restored && (!staged || getPendingLineAnswers(restored.reportId, restored.fixIndex) !== staged)) return;
      let ok = false;
      try {
        ok = (await persist(patch)) !== false;
      } catch {
        // The current edit remains available for an explicit retry.
      }
      if (mounted.current && version === revision.current) setState(ok ? "kept" : "failed");
    };
    timer.current = setTimeout(flush, delay);
  }, [clearTimer, flush, persist, restored]);

  const retry = useCallback(() => {
    if (latest.current) schedule(latest.current, 0);
  }, [schedule]);

  // Reopening a report restores its unfinished edit. Follow that original request until
  // the reader edits again; an older completion must never acknowledge a newer debounce.
  useEffect(() => {
    if (!restored) return;
    const { reportId, fixIndex, draft } = restored;
    const update = (reason: "changed" | "saved" | "discarded") => {
      if (reason === "discarded") {
        clearTimer();
        pending.current = null;
        latest.current = null;
        revision.current += 1;
        setState("idle");
        return;
      }
      if (!draft || latest.current !== draft.patch) return;
      const pendingDraft = getPendingLineAnswers(reportId, fixIndex);
      setState(pendingDraft?.state ?? "kept");
    };
    const unsubscribe = subscribePendingLineAnswers(reportId, fixIndex, update);
    // A response may have arrived between rendering the restored edit and subscribing.
    const check = setTimeout(() => update("changed"), 0);
    return () => { clearTimeout(check); unsubscribe(); };
  }, [clearTimer, restored]);

  // A report can be edited before it has an account row. Keep those edits when that same
  // report is saved in place and receives its persistence callback.
  useEffect(() => {
    if (!persist || !deferred.current) return;
    const patch = deferred.current;
    const start = setTimeout(() => {
      if (deferred.current === patch) schedule(patch, 0);
    }, 0);
    return () => clearTimeout(start);
  }, [persist, schedule]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // Client navigation must dispatch the latest unsent edit, including a clear.
      // A sent or failed task is no longer pending, so leaving never silently retries it.
      flush();
    };
  }, [flush]);

  return { state, schedule, retry };
}
