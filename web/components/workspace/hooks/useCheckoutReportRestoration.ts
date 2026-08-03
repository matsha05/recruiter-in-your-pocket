"use client";

import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { saveReceiptValidatedReport } from "@/lib/reports/client-report-save";
import { takeCheckoutWorkspaceState } from "@/lib/unlock/unlockContext";

type Setter<T> = Dispatch<SetStateAction<T>>;

export function useCheckoutReportRestoration(input: {
  user: any;
  setResumeText: Setter<string>;
  setJobDescription: Setter<string>;
  setReport: Setter<any>;
  setSkipSample: Setter<boolean>;
}) {
  const { user, setResumeText, setJobDescription, setReport, setSkipSample } = input;
  const restoredReport = useRef<any>(null);
  const saveStarted = useRef(false);

  useEffect(() => {
    const restored = takeCheckoutWorkspaceState();
    if (!restored) return;
    restoredReport.current = restored.report;
    setResumeText(restored.resumeText || "");
    setJobDescription(restored.jobDescription || "");
    setReport(restored.report);
    setSkipSample(true);
    toast.success("Your report is back", {
      description: "Checkout did not discard the read you were working from.",
    });
  }, [setJobDescription, setReport, setResumeText, setSkipSample]);

  useEffect(() => {
    if (!user || !restoredReport.current || saveStarted.current) return;
    saveStarted.current = true;
    const original = restoredReport.current;
    void saveReceiptValidatedReport(original).then((saved) => {
      restoredReport.current = saved;
      setReport((current: any) => current === original ? saved : current);
    }).catch((error: any) => {
      saveStarted.current = false;
      toast.error("Your report is restored but not saved yet", {
        description: error?.message || "Try exporting again to retry the secure save.",
      });
    });
  }, [user, setReport]);
}
