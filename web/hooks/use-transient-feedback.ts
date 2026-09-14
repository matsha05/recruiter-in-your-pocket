"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Brief success feedback. Repeated actions restart the window; leaving clears it. */
export function useTransientFeedback(durationMs = 1600) {
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    if (mounted.current) setActive(false);
  }, [clearTimer]);

  const trigger = useCallback(() => {
    if (!mounted.current) return;
    clearTimer();
    setActive(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      if (mounted.current) setActive(false);
    }, durationMs);
  }, [clearTimer, durationMs]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimer();
    };
  }, [clearTimer]);

  return { active, trigger, reset };
}
