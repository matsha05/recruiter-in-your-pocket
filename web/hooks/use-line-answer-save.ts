"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LineAnswersPatch } from "@/lib/reports/line-answers";

type Persist = (patch: LineAnswersPatch) => boolean | void | Promise<boolean | void>;
type SaveState = "idle" | "saving" | "kept" | "failed";

/** Debounce edits, keep each card's writes in order, and acknowledge only its latest change. */
export function useLineAnswerSave(persist: Persist | undefined, initiallyKept: boolean) {
  const [state, setState] = useState<SaveState>(initiallyKept ? "kept" : "idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const writes = useRef<Promise<void>>(Promise.resolve());
  const latest = useRef<LineAnswersPatch | null>(null);
  const deferred = useRef<LineAnswersPatch | null>(null);
  const revision = useRef(0);
  const mounted = useRef(true);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);

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
    timer.current = setTimeout(() => {
      timer.current = null;
      const save = async () => {
        if (!mounted.current || version !== revision.current) return;
        let ok = false;
        try {
          ok = (await persist(patch)) !== false;
        } catch {
          // The current edit remains available for an explicit retry.
        }
        if (mounted.current && version === revision.current) setState(ok ? "kept" : "failed");
      };
      // A later edit must not reach the server before this card's in-flight write finishes.
      writes.current = writes.current.then(save, save);
    }, delay);
  }, [clearTimer, persist]);

  const retry = useCallback(() => {
    if (latest.current) schedule(latest.current, 0);
  }, [schedule]);

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
      revision.current += 1;
      clearTimer();
    };
  }, [clearTimer]);

  return { state, schedule, retry };
}
