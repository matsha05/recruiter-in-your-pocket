"use client";

import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { Analytics } from "@/lib/analytics";
import { parseResume, streamResumeFeedback } from "@/lib/api";
import { saveReceiptValidatedReport } from "@/lib/reports/client-report-save";
import { hasEffectiveJobDescriptionValue } from "@/lib/security/effectiveJobDescription";
import { publishAuthoritativeAnalysis } from "@/lib/analysis-completion";
import { REPORT_ACCESS_NOT_USED } from "@/lib/billing/generationFailureCopy";

type Setter<T> = Dispatch<SetStateAction<T>>;
export type ResumeFileSelectionOptions = { onParsed?: () => void; preserveExisting?: boolean };

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
  setIsPaywallOpen: Setter<boolean>;
  setPendingReportForSave: Setter<any>;
  setIsSavePromptOpen: Setter<boolean>;
  setIsAuthOpen: Setter<boolean>;
  setAuthContext: Setter<any>;
  onReportReady?: () => void;
  canRun?: boolean;
  captureUploadOwner?: () => unknown;
  isUploadOwnerCurrent?: (owner: unknown) => boolean;
}) {
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
      toast.error("Failed to parse resume", { description: result.message || "Unknown error" });
      if (!options?.preserveExisting) input.setResumeText("");
      return false;
    } catch (error) {
      if (!isCurrent()) return false;
      console.error("File parsing error:", error);
      toast.error("File parsing error", { description: "Please try another file." });
      if (!options?.preserveExisting) input.setResumeText("");
      return false;
    } finally {
      if (isCurrent() && !keepReportVisible) input.setIsLoading(false);
    }
  }, [input]);

  const saveReportForCurrentUser = useCallback(async (reportToSave: any) => {
    if (!reportToSave) return;
    const saved = await saveReceiptValidatedReport(reportToSave);
    input.setReport((current: any) => (
      current === reportToSave ? saved : current
    ));
    toast.success("Report saved to your history");
    input.setPendingReportForSave(null);
    input.setIsSavePromptOpen(false);
  }, [input]);

  const handleRequestSaveAuth = useCallback(() => {
    input.setIsSavePromptOpen(false);
    input.setAuthContext("report");
    input.setIsAuthOpen(true);
  }, [input]);

  const handleRun = useCallback(async () => {
    if (input.canRun === false) return;
    if (!input.resumeText.trim()) {
      toast.error("Add your resume first", {
        description: "Upload a file or paste the resume text before creating the report.",
      });
      return;
    }
    const hasPaidAccess = Boolean(input.user?.membership && input.user.membership !== "free");
    if (input.freeUsesRemaining <= 0 && !hasPaidAccess) {
      input.setIsPaywallOpen(true);
      Analytics.paywallViewed("free_uses_exhausted");
      return;
    }

    input.setIsLoading(true);
    input.setIsStreaming(true);
    input.setReport(null);
    const controller = input.beginAnalysis("resume");
    const hasJobDescription = hasEffectiveJobDescriptionValue(input.jobDescription);
    Analytics.reportStarted(hasJobDescription);
    Analytics.track("report_stream_started", { has_jd: hasJobDescription, mode: "resume" });

    try {
      const result = await streamResumeFeedback(
        input.resumeText,
        input.jobDescription || undefined,
        () => undefined,
        "resume",
        { signal: controller.signal, savedJobId: input.persistedSavedJobId },
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
          toast.warning("Analysis stopped after generation started", {
            description: refreshed
              ? "This report attempt was used. Your remaining reports are current."
              : "This report attempt was used. Check History and your remaining reports before retrying.",
          });
        } else if (result.creditRestored) {
          toast.info("Analysis stopped", {
            description: "Your report credit was restored. You can run the report again.",
          });
        } else {
          toast.info("Analysis stopped", {
            description: "We could not confirm this attempt's status. Check History and your remaining reports before retrying.",
          });
        }
        return;
      }
      if (result.ok && result.report) {
        publishAuthoritativeAnalysis({
          showReport: () => {
            input.onReportReady?.();
            input.setReport(result.report);
            Analytics.reportCompleted(result.report?.score || 0);
          },
          finishOwner: () => input.endAnalysis(controller),
          clearLoading: () => {
            input.setIsLoading(false);
            input.setIsStreaming(false);
          },
          refresh: () => input.refreshFreeStatus({
            fallbackDecrement: true,
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
          ? "This report attempt was used. Your remaining reports are current."
          : "This report attempt was used. Check History and your remaining reports before retrying."
        : result.attemptConsumed === false || result.accessConsumed === false
          ? `${REPORT_ACCESS_NOT_USED} You can try again.`
        : result.creditRestored
          ? "Your report credit was restored. You can try again."
          : "We could not confirm this attempt's status. Check History and your remaining reports before retrying.";
      const hasDisposition = /report attempt was used|report credit was restored|did not use your free report or a paid report credit|could not confirm (?:whether report access changed|that your report credit was restored|this attempt's status)/iu
        .test(result.message || "");
      toast.error(result.errorCode === "STREAM_TRANSPORT_ERROR" ? "Connection ended" : "Failed to generate report", {
        description: hasDisposition
            ? result.message
            : `${result.message || "The report did not finish."} · ${attemptCopy}`,
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
      toast.error("Report generation error", {
        description: "We could not confirm this attempt's status. Check History and your remaining reports before retrying.",
      });
    } finally {
      if (input.endAnalysis(controller)) {
        input.setIsLoading(false);
        input.setIsStreaming(false);
      }
    }
  }, [input]);

  return { handleFileSelect, handleRequestSaveAuth, handleRun, saveReportForCurrentUser };
}
