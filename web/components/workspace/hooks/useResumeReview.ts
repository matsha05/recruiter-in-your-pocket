"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { Analytics } from "@/lib/analytics";
import { parseResume, streamResumeFeedback } from "@/lib/api";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { saveReceiptValidatedReport } from "@/lib/reports/client-report-save";
import { hasEffectiveJobDescriptionValue } from "@/lib/security/effectiveJobDescription";

type Setter<T> = Dispatch<SetStateAction<T>>;

export function useResumeReview(input: {
  resumeText: string;
  jobDescription: string;
  persistedSavedJobId: string | null;
  freeUsesRemaining: number;
  user: any;
  refreshFreeStatus: (options: any) => Promise<unknown>;
  beginAnalysis: (mode: "resume") => AbortController;
  endAnalysis: () => void;
  setResumeText: Setter<string>;
  setReport: Setter<any>;
  setIsLoading: Setter<boolean>;
  setIsStreaming: Setter<boolean>;
  setIsPaywallOpen: Setter<boolean>;
  setPendingReportForSave: Setter<any>;
  setIsSavePromptOpen: Setter<boolean>;
  setIsAuthOpen: Setter<boolean>;
  setAuthContext: Setter<any>;
}) {
  const handleFileSelect = useCallback(async (file: File) => {
    try {
      Analytics.track("workspace_upload_started", {
        source: "workspace", file_type: file.type || "unknown", file_size_bytes: file.size,
      });
      input.setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const result = await parseResume(formData);
      if (result.ok && result.text) {
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
      input.setResumeText("");
      return false;
    } catch (error) {
      console.error("File parsing error:", error);
      toast.error("File parsing error", { description: "Please try another file." });
      input.setResumeText("");
      return false;
    } finally {
      input.setIsLoading(false);
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
      if (result.aborted) {
        await input.refreshFreeStatus({
          fallbackDecrement: result.attemptConsumed === true,
          includeUserRefresh: true,
          requireOk: true,
        });
        if (result.attemptConsumed) {
          toast.warning("Analysis stopped after generation started", {
            description: "This report attempt was used. Your remaining reports are now refreshed.",
          });
        } else {
          toast.info("Analysis canceled", { description: "Your remaining reports are now refreshed." });
        }
        input.setIsLoading(false);
        input.setIsStreaming(false);
        input.endAnalysis();
        return;
      }
      if (result.ok && result.report) {
        input.setReport(result.report);
        input.setIsStreaming(false);
        input.setIsLoading(false);
        input.endAnalysis();
        Analytics.reportCompleted(result.report?.score || 0);
        await input.refreshFreeStatus({ fallbackDecrement: true, includeUserRefresh: true, requireOk: true });
        if (!input.user && !isLaunchFlagEnabled("guestReportSave")) {
          input.setPendingReportForSave(result.report);
          setTimeout(() => {
            Analytics.track("save_prompt_viewed", { score: result.report?.score || 0 });
            input.setIsSavePromptOpen(true);
          }, 5000);
        }
        return;
      }
      console.error("Failed to generate report:", result.message);
      await input.refreshFreeStatus({
        fallbackDecrement: result.attemptConsumed === true,
        includeUserRefresh: true,
        requireOk: true,
      });
      const attemptCopy = result.attemptConsumed
        ? "This report attempt was used because generation had already started."
        : result.creditRestored
          ? "Your report credit was restored; please try again."
          : "Check your remaining reports before retrying.";
      const hasDisposition = /report attempt was used|report credit was restored|could not confirm that your report credit was restored/iu
        .test(result.message || "");
      toast.error("Failed to generate report", {
        description: hasDisposition
          ? result.message
          : `${result.message || "Unknown error"} · ${attemptCopy}`,
      });
    } catch (error) {
      console.error("Report generation error:", error);
      await input.refreshFreeStatus({ includeUserRefresh: true, requireOk: true });
      toast.error("Report generation error", {
        description: "Please try again, then check your remaining reports before retrying.",
      });
    } finally {
      input.setIsLoading(false);
      input.setIsStreaming(false);
      input.endAnalysis();
    }
  }, [input]);

  return { handleFileSelect, handleRequestSaveAuth, handleRun, saveReportForCurrentUser };
}
