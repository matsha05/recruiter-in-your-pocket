"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Which sample report is open (lib/reports/sample-reports.ts). The report's sample header and ending name the
 * fictional person, and the header offers the other samples. Outside a sample page it is Jordan's, with no
 * switcher, which is what the workspace's "?sample" view shows.
 */
export type SamplePersonValue = {
  person: string;
  /** Every sample, for the switcher; the open one is marked. */
  samples: ReadonlyArray<{ href: string; label: string; current: boolean }>;
};

const SamplePersonContext = createContext<SamplePersonValue>({ person: "Jordan", samples: [] });

export function SamplePersonProvider({ value, children }: { value: SamplePersonValue; children: ReactNode }) {
  return <SamplePersonContext.Provider value={value}>{children}</SamplePersonContext.Provider>;
}

export function useSamplePerson() {
  return useContext(SamplePersonContext);
}
