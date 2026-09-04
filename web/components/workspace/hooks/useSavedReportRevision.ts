import { useCallback, useEffect, useRef, useState } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { ReportData } from "../report/ReportTypes";
import {
  getSavedReportRevisionHref,
  loadSavedReportRevision,
  savedRevisionErrorMessage,
  type SavedRevisionFailure,
} from "../../../lib/reports/saved-report-revision";

type SavedRevisionState = "idle" | "loading" | "ready" | SavedRevisionFailure;
type SavedRevisionSnapshot = {
  identity: string;
  state: SavedRevisionState;
  baseline: ReportData | null;
};

type Options = {
  searchParams: ReadonlyURLSearchParams;
  userId: string | null;
  isAuthLoading: boolean;
  onBeginRevision: () => void;
};

export function useSavedReportRevision({ searchParams, userId, isAuthLoading, onBeginRevision }: Options) {
  const query = searchParams.toString();
  const reportId = new URLSearchParams(query).get("revision");
  // revision=1 is the existing in-memory comparison flow, with no saved report fetch.
  const requested = reportId !== null && reportId !== "1";
  const identity = JSON.stringify([query, userId, isAuthLoading]);
  const pendingRequestRef = useRef<AbortController | null>(null);
  const dismissedQueryRef = useRef<string | null>(null);
  const begunIntentRef = useRef<string | null>(null);
  const [dismissedQuery, setDismissedQuery] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [snapshot, setSnapshot] = useState<SavedRevisionSnapshot>({ identity, state: requested ? "loading" : "idle", baseline: null });

  const clearSavedRevision = useCallback(() => {
    pendingRequestRef.current?.abort();
    dismissedQueryRef.current = query;
    setDismissedQuery(query);
    setSnapshot({ identity, state: "idle", baseline: null });
  }, [identity, query]);

  const retrySavedRevision = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    if (dismissedQueryRef.current === query) return;
    dismissedQueryRef.current = null;
    setDismissedQuery(null);
    if (!requested || reportId === null) {
      begunIntentRef.current = null;
      setSnapshot({ identity, state: "idle", baseline: null });
      return;
    }

    const controller = new AbortController();
    pendingRequestRef.current = controller;
    const isCurrent = () => !controller.signal.aborted;
    const intent = JSON.stringify([query, userId]);
    if (begunIntentRef.current !== intent) {
      begunIntentRef.current = intent;
      onBeginRevision();
    }

    const settle = (state: SavedRevisionState, baseline: ReportData | null = null) => {
      if (isCurrent()) setSnapshot({ identity, state, baseline });
    };
    settle("loading");

    if (!getSavedReportRevisionHref(reportId)) settle("invalid");
    else if (isAuthLoading) { /* Wait for the current account before requesting private report data. */ }
    else if (!userId) settle("signed_out");
    else {
      void loadSavedReportRevision(reportId, controller.signal).then(
        (result) => settle(result.state, result.baseline),
        () => settle("error"),
      );
    }

    return () => controller.abort();
  }, [attempt, identity, isAuthLoading, onBeginRevision, query, reportId, requested, userId]);

  const active = requested && dismissedQuery !== query;
  // Mask an old account/route during render, before effect cleanup can run.
  const state: SavedRevisionState = !active ? "idle" : snapshot.identity === identity ? snapshot.state : "loading";
  const baseline = active && snapshot.identity === identity && state === "ready" ? snapshot.baseline : null;
  const error = state === "idle" || state === "loading" || state === "ready" ? null : savedRevisionErrorMessage(state);
  return { active, baseline, state, error, clearSavedRevision, retrySavedRevision };
}
