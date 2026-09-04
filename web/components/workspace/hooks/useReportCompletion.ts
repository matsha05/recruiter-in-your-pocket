"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useReportCompletion(report: unknown) {
  const [announcement, setAnnouncement] = useState("");
  const completedFocusOwner = useRef<HTMLElement | null>(null);

  const prepareReportCompletion = useCallback(() => {
    const focused = document.activeElement;
    completedFocusOwner.current = focused instanceof HTMLElement
      && focused.closest('[aria-labelledby="analysis-title"][aria-busy="true"]')
      ? focused
      : null;
    setAnnouncement("Your report is ready.");
  }, []);

  const resetReportCompletion = useCallback(() => {
    completedFocusOwner.current = null;
    setAnnouncement("");
  }, []);

  useEffect(() => {
    if (!report || !completedFocusOwner.current) return;
    const owner = completedFocusOwner.current;
    const frame = requestAnimationFrame(() => {
      completedFocusOwner.current = null;
      const current = document.activeElement;
      // Only replace focus lost with the completed progress screen. A dialog,
      // navigation link, or another control the reader chose keeps its focus.
      if (current !== owner && current !== document.body) return;
      const heading = document.querySelector<HTMLElement>("#section-first-impression h1");
      if (!heading) return;
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [report]);

  return { announcement, prepareReportCompletion, resetReportCompletion };
}
