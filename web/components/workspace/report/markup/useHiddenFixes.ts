"use client";

import { useCallback, useEffect, useState } from "react";

const PREFIX = "riyp:hidden-fixes:";

function read(key: string): number[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(PREFIX + key) || "[]");
    return Array.isArray(value) ? value.filter((item): item is number => Number.isInteger(item)) : [];
  } catch {
    return [];
  }
}

function write(key: string, hidden: number[]) {
  try {
    if (hidden.length === 0) window.localStorage.removeItem(PREFIX + key);
    else window.localStorage.setItem(PREFIX + key, JSON.stringify(hidden));
  } catch {
    // Private windows and blocked storage: hiding still works for this visit.
  }
}

/**
 * "Hide this suggestion" (plan item 1.8). Hidden fixes stay hidden for this report
 * in this browser, through refreshes and reopening. Nothing is sent anywhere.
 */
export function useHiddenFixes(reportKey: string | undefined) {
  const [hidden, setHidden] = useState<number[]>([]);

  useEffect(() => {
    setHidden(reportKey ? read(reportKey) : []);
  }, [reportKey]);

  const update = useCallback((next: (current: number[]) => number[]) => {
    setHidden((current) => {
      const value = next(current);
      if (reportKey) write(reportKey, value);
      return value;
    });
  }, [reportKey]);

  return {
    isHidden: (index: number) => hidden.includes(index),
    hide: (index: number) => update((current) => (current.includes(index) ? current : [...current, index])),
    restore: (index: number) => update((current) => current.filter((item) => item !== index)),
  };
}

/** A stable key for a report: its saved id, or its opening line when it has no id yet. */
export function hiddenFixesKey(report: { id?: string; report_id?: unknown; first_impression?: string; top_fixes?: Array<{ fix?: string }> }) {
  const id = report.id || (typeof report.report_id === "string" ? report.report_id : undefined);
  if (id) return id;
  const basis = `${report.first_impression || ""}|${report.top_fixes?.[0]?.fix || ""}`;
  if (basis === "|") return undefined;
  let hash = 0;
  for (let index = 0; index < basis.length; index += 1) hash = (hash * 31 + basis.charCodeAt(index)) | 0;
  return `local-${(hash >>> 0).toString(36)}`;
}
