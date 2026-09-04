"use client";

import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { saveReceiptValidatedReport } from "@/lib/reports/client-report-save";
import { takeCheckoutWorkspaceState } from "@/lib/unlock/unlockContext";

type Setter<T> = Dispatch<SetStateAction<T>>;

export function useCheckoutReportRestoration(input: {
  user: any;
  allowRestore?: boolean;
  setResumeText: Setter<string>;
  setJobDescription: Setter<string>;
  setReport: Setter<any>;
  setSkipSample: Setter<boolean>;
}) {
  const { user, allowRestore = true, setResumeText, setJobDescription, setReport, setSkipSample } = input;
  const restoredReport = useRef<any>(null);
  const saveStarted = useRef(false);

  useEffect(() => {
    const restored = takeCheckoutWorkspaceState();
    if (!allowRestore) {
      restoredReport.current = null;
      saveStarted.current = false;
      return;
    }
    if (!restored) return;
    restoredReport.current = restored.report;
    setResumeText(restored.resumeText || "");
    setJobDescription(restored.jobDescription || "");
    setReport(restored.report);
    setSkipSample(true);
    toast.success("Your report is back", {
      description: "You can continue from the report you opened before checkout.",
    });
  }, [allowRestore, setJobDescription, setReport, setResumeText, setSkipSample]);

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
