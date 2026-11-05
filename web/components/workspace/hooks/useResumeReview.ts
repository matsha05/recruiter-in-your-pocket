"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { Analytics } from "@/lib/analytics";
import { parseResume, streamResumeFeedback } from "@/lib/api";
import { saveReceiptValidatedReport } from "@/lib/reports/client-report-save";
import { hasEffectiveJobDescriptionValue } from "@/lib/security/effectiveJobDescription";
import { publishAuthoritativeAnalysis } from "@/lib/analysis-completion";
import type { GenerationStage } from "@/lib/generation-stage";
import { REPORT_ACCESS_NOT_USED, REPORT_ACCESS_OUTCOME_UNKNOWN, REPORT_ACCESS_RESTORED, REPORT_ACCESS_USED_CHECK, REPORT_ACCESS_USED_COUNT_UPDATED, forVisitor, hasAccessOutcome } from "@/lib/billing/generationFailureCopy";

type Setter<T> = Dispatch<SetStateAction<T>>;
export type ResumeFileSelectionOptions = { onParsed?: () => void; preserveExisting?: boolean };
type ReportSaveState = { report: object; status: "saving" | "error"; message: string | null } | null;

export function useResumeReview(input: {
  resumeText: string;
  jobDescription: string;
  persistedSavedJobId: string | null;
  freeUsesRemaining: number;
  user: any;
  refreshFreeStatus: (options: any) => Promise<boolean>;
  beginAnalysis: (mode: "resume") => AbortController;
  isAnalysisCurrent: (controller: AbortController) => boolean;
  endAnalysis: (controller: AbortController) => boolean;
  setResumeText: Setter<string>;
  setReport: Setter<any>;
  setIsLoading: Setter<boolean>;
  setIsStreaming: Setter<boolean>;
  setAnalysisStage?: Setter<GenerationStage | null>;
  setIsPaywallOpen: Setter<boolean>;
  setPendingReportForSave: Setter<any>;
  setIsSavePromptOpen: Setter<boolean>;
  setIsAuthOpen: Setter<boolean>;
  setAuthContext: Setter<any>;
  onReportReady?: () => void;
  /** The report arrived: whether the server offers the questions first, and whether this was a rebuild. */
  onReportComplete?: (report: any, meta: { askFirst: boolean; rebuilt: boolean }) => void;
  canRun?: boolean;
  captureUploadOwner?: () => unknown;
  isUploadOwnerCurrent?: (owner: unknown) => boolean;
}) {
  const [reportSaveState, setReportSaveState] = useState<ReportSaveState>(null);
  const latestUpload = useRef(0);
  useEffect(() => () => { latestUpload.current += 1; }, []);
  const handleFileSelect = useCallback(async (file: File, options?: ResumeFileSelectionOptions) => {
    const upload = ++latestUpload.current;
    const owner = input.captureUploadOwner?.();
    const isCurrent = () => latestUpload.current === upload && (input.isUploadOwnerCurrent?.(owner) ?? true);
    const keepReportVisible = Boolean(options?.preserveExisting && options.onParsed);
    try {
      Analytics.track("workspace_upload_started", {
        source: "workspace", file_type: file.type || "unknown", file_size_bytes: file.size,
      });
      if (!keepReportVisible) input.setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const result = await parseResume(formData);
      if (!isCurrent()) return false;
      if (result.ok && result.text) {
        options?.onParsed?.();
        input.setResumeText(result.text);
        Analytics.track("workspace_upload_succeeded", {
          source: "workspace",
          file_type: file.type || "unknown",
          file_size_bytes: file.size,
          extracted_chars: result.text.length,
        });
        Analytics.resumeUploaded("workspace");
        return true;
      }
      console.error("Failed to parse resume:", result.message);
      toast.error("We couldn’t read this resume", { description: result.message || "Try another PDF or DOCX, or paste the resume text." });
      if (!options?.preserveExisting) input.setResumeText("");
      return false;
    } catch (error) {
      if (!isCurrent()) return false;
      console.error("File parsing error:", error);
      toast.error("We couldn’t read this file", { description: "Try another PDF or DOCX, or paste the resume text." });
      if (!options?.preserveExisting) input.setResumeText("");
      return false;
    } finally {
      if (isCurrent() && !keepReportVisible) input.setIsLoading(false);
    }
  }, [input]);

  const saveReportForCurrentUser = useCallback(async (reportToSave: any) => {
    if (!reportToSave) return;
    setReportSaveState({ report: reportToSave, status: "saving", message: null });
    try {
      const saved = await saveReceiptValidatedReport(reportToSave);
      input.setReport((current: any) => (
        current === reportToSave ? saved : current
      ));
      setReportSaveState((current) => current?.report === reportToSave ? null : current);
      toast.success("Report saved to your history");
      input.setPendingReportForSave((current: any) => current === reportToSave ? null : current);
      input.setIsSavePromptOpen(false);
    } catch (error) {
      setReportSaveState((current) => current?.report === reportToSave ? {
        report: reportToSave,
        status: "error",
        message: "This report wasn’t saved to your history. Keep this tab open and try again.",
      } : current);
      throw error;
    }
  }, [input]);

  const handleRequestSaveAuth = useCallback(() => {
    input.setIsSavePromptOpen(false);
    input.setAuthContext("report");
    input.setIsAuthOpen(true);
  }, [input]);

  /**
   * Runs the report. With `rebuild`, writes it again from `text` (the resume with the person's answers
   * in it) bound to the first report: free, so the gate and the counter are left alone, and the first
   * report stays on screen until the second arrives (ask-first).
   */
  const handleRun = useCallback(async (run?: { rebuild: { reportId?: string | null; recoveryId?: string | null }; text: string }) => {
    if (input.canRun === false) return;
    const rebuild = run?.rebuild ?? null;
    const resumeText = run?.text ?? input.resumeText;
    if (!resumeText.trim()) {
      toast.error("Add your resume first", {
        description: "Upload a file or paste the resume text before creating the report.",
      });
      return;
    }
    const hasPaidAccess = Boolean(input.user?.membership && input.user.membership !== "free");
    if (!rebuild && input.freeUsesRemaining <= 0 && !hasPaidAccess) {
      input.setIsPaywallOpen(true);
      Analytics.paywallViewed("free_uses_exhausted");
      return;
    }

    const signedIn = Boolean(input.user);
    input.setIsLoading(true);
    input.setIsStreaming(true);
    if (!rebuild) input.setReport(null);
    const controller = input.beginAnalysis("resume");
    const hasJobDescription = hasEffectiveJobDescriptionValue(input.jobDescription);
    if (!rebuild) Analytics.reportStarted(hasJobDescription);
    Analytics.track("report_stream_started", { has_jd: hasJobDescription, mode: "resume", rebuild: Boolean(rebuild) });

    try {
      const result = await streamResumeFeedback(
        resumeText,
        input.jobDescription || undefined,
        () => undefined,
        "resume",
        {
          signal: controller.signal,
          savedJobId: input.persistedSavedJobId,
          rebuild,
          onStage: (stage) => {
            if (input.isAnalysisCurrent(controller)) input.setAnalysisStage?.(stage);
          },
        },
      );
      if (!input.isAnalysisCurrent(controller)) return;
      if (result.aborted) {
        const refreshed = await input.refreshFreeStatus({
          fallbackDecrement: result.attemptConsumed === true,
          includeUserRefresh: true,
          requireOk: true,
          shouldApply: () => input.isAnalysisCurrent(controller),
        });
        if (!input.isAnalysisCurrent(controller)) return;
        if (result.attemptConsumed) {
          toast.warning("Report stopped", {
            description: forVisitor(refreshed ? REPORT_ACCESS_USED_COUNT_UPDATED : REPORT_ACCESS_USED_CHECK, signedIn),
          });
        } else if (result.creditRestored) {
          toast.info("Report stopped", {
            description: forVisitor(REPORT_ACCESS_RESTORED, signedIn),
          });
        } else {
          toast.info("Report stopped", {
            description: forVisitor(REPORT_ACCESS_OUTCOME_UNKNOWN, signedIn),
          });
        }
        return;
      }
      if (result.ok && result.report) {
        publishAuthoritativeAnalysis({
          showReport: () => {
            input.onReportReady?.();
            input.setReport(result.report);
            input.onReportComplete?.(result.report, { askFirst: result.askFirst === true, rebuilt: Boolean(rebuild) });
            Analytics.reportCompleted(result.report?.score || 0);
          },
          finishOwner: () => input.endAnalysis(controller),
          clearLoading: () => {
            input.setIsLoading(false);
            input.setIsStreaming(false);
          },
          // A rebuild spent nothing: the counter is refreshed, never decremented on its account.
          refresh: () => input.refreshFreeStatus({
            fallbackDecrement: !rebuild,
            includeUserRefresh: true,
            requireOk: true,
            shouldApply: () => input.isAnalysisCurrent(controller),
          }),
        });
        return;
      }
      if (result.errorCode === "PAYWALL_REQUIRED") {
        await input.refreshFreeStatus({
          fallbackDecrement: false,
          includeUserRefresh: true,
          requireOk: false,
          shouldApply: () => input.isAnalysisCurrent(controller),
        });
        if (!input.isAnalysisCurrent(controller)) return;
        input.setIsPaywallOpen(true);
        Analytics.paywallViewed("free_uses_exhausted");
        return;
      }
      console.error("Failed to generate report:", result.message);
      const refreshed = await input.refreshFreeStatus({
        fallbackDecrement: result.attemptConsumed === true,
        includeUserRefresh: true,
        requireOk: true,
        shouldApply: () => input.isAnalysisCurrent(controller),
      });
      if (!input.isAnalysisCurrent(controller)) return;
      const attemptCopy = result.attemptConsumed
        ? refreshed
          ? REPORT_ACCESS_USED_COUNT_UPDATED
          : REPORT_ACCESS_USED_CHECK
        : result.attemptConsumed === false || result.accessConsumed === false
          ? `${REPORT_ACCESS_NOT_USED} Try again whenever you're ready.`
        : result.creditRestored
          ? REPORT_ACCESS_RESTORED
          : REPORT_ACCESS_OUTCOME_UNKNOWN;
      const hasDisposition = hasAccessOutcome(result.message || "");
      toast.error(result.errorCode === "STREAM_TRANSPORT_ERROR" ? "The connection dropped" : "We couldn’t finish your report", {
        // Generation takes about a minute; keep the outcome visible until the user acts.
        duration: Infinity,
        closeButton: true,
        description: forVisitor(hasDisposition && result.message
            ? result.message
            : `${result.message || "The report didn’t finish."} ${attemptCopy}`, signedIn),
      });
    } catch (error) {
      if (!input.isAnalysisCurrent(controller)) return;
      console.error("Report generation error:", error);
      await input.refreshFreeStatus({
        includeUserRefresh: true,
        requireOk: true,
        shouldApply: () => input.isAnalysisCurrent(controller),
      });
      if (!input.isAnalysisCurrent(controller)) return;
      toast.error("We couldn’t finish your report", {
        duration: Infinity,
        closeButton: true,
        description: forVisitor(REPORT_ACCESS_OUTCOME_UNKNOWN, signedIn),
      });
    } finally {
      if (input.endAnalysis(controller)) {
        input.setIsLoading(false);
        input.setIsStreaming(false);
      }
    }
  }, [input]);

  return { handleFileSelect, handleRequestSaveAuth, handleRun, saveReportForCurrentUser, reportSaveState };
}
