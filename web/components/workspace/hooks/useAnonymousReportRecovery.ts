"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { ReviewMode } from "@/components/workspace/ModeSwitcher";
import {
  watchAnonymousReportRecovery,
  type AnonymousReportRecoveryWatchState,
} from "@/lib/reports/anonymous-report-recovery-client";

type Setter<T> = Dispatch<SetStateAction<T>>;

type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export type AnonymousReportRecoveryState = AnonymousReportRecoveryWatchState;

export function useAnonymousReportRecovery(input: {
  setReport: Setter<any>;
  setSkipSample: Setter<boolean>;
  setReviewMode: Setter<ReviewMode>;
  fetchImpl?: FetchLike;
  captureRestoreOwner?: (recoveryId: string) => unknown;
  isRestoreCurrent?: (recoveryId: string, owner: unknown) => boolean;
}): AnonymousReportRecoveryState {
  const {
    setReport,
    setReviewMode,
    setSkipSample,
    fetchImpl,
    captureRestoreOwner,
    isRestoreCurrent,
  } = input;
  const [state, setState] = useState<AnonymousReportRecoveryState>({
    status: "idle",
    message: null,
  });

  useEffect(() => {
    return watchAnonymousReportRecovery({
      fetchImpl,
      captureRestoreOwner,
      isRestoreCurrent,
      onRestore: (report, ownership) => {
        if (
          isRestoreCurrent
          && !isRestoreCurrent(ownership.recoveryId, ownership.owner)
        ) return false;
        setReviewMode("resume");
        setSkipSample(true);
        setReport(report);
        return true;
      },
      onStateChange: setState,
    });
  }, [captureRestoreOwner, fetchImpl, isRestoreCurrent, setReport, setReviewMode, setSkipSample]);

  return state;
}
