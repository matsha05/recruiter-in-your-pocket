import { useCallback, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AuthUser } from "@/components/providers/AuthProvider";
import { streamResumeFeedback, parseResume } from "@/lib/api";
import { Analytics } from "@/lib/analytics";
import { REPORT_ACCESS_OUTCOME_UNKNOWN } from "@/lib/billing/generationFailureCopy";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { toast } from "sonner";

type RefreshFreeStatus = (options?: {
  fallbackDecrement?: boolean;
  includeUserRefresh?: boolean;
  requireOk?: boolean;
}) => Promise<boolean>;

type ResumeAnalysisOptions = {
  user: AuthUser | null;
  resumeText: string;
  jobDescription: string;
  savedJobId: string | null;
  freeUsesRemaining: number;
  refreshFreeStatus: RefreshFreeStatus;
  isLoading: boolean;
  setResumeText: Dispatch<SetStateAction<string>>;
  setIsPaywallOpen: Dispatch<SetStateAction<boolean>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setIsStreaming: Dispatch<SetStateAction<boolean>>;
  setReport: Dispatch<SetStateAction<any>>;
  setPendingReportForSave: Dispatch<SetStateAction<any>>;
  setIsSavePromptOpen: Dispatch<SetStateAction<boolean>>;
};

export function useResumeAnalysis({
  user,
  resumeText,
  jobDescription,
  savedJobId,
  freeUsesRemaining,
  refreshFreeStatus,
  isLoading,
  setResumeText,
  setIsPaywallOpen,
  setIsLoading,
  setIsStreaming,
  setReport,
  setPendingReportForSave,
  setIsSavePromptOpen,
}: ResumeAnalysisOptions) {
  const [analysisStartedAt, setAnalysisStartedAt] = useState<number | null>(null);
  const [analysisMode, setAnalysisMode] = useState<"resume" | "linkedin">("resume");
  const abortControllerRef = useRef<AbortController | null>(null);

  const beginAnalysis = useCallback((mode: "resume" | "linkedin") => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setAnalysisMode(mode);
    setAnalysisStartedAt(Date.now());
    return controller;
  }, []);

  const endAnalysis = useCallback(() => {
    setAnalysisStartedAt(null);
    abortControllerRef.current = null;
  }, []);

  const handleCancelAnalysis = useCallback((silent?: boolean) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
    setIsStreaming(false);
    setAnalysisStartedAt(null);
    if (!silent) toast.info("Analysis canceled");
  }, [setIsLoading, setIsStreaming]);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      Analytics.track("workspace_upload_started", {
        source: "workspace",
        file_type: file.type || "unknown",
        file_size_bytes: file.size,
      });
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const result = await parseResume(formData);
      if (result.ok && result.text) {
        setResumeText(result.text);
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
      toast.error("Failed to parse resume", {
        description: result.message || "Unknown error",
      });
      setResumeText("");
      return false;
    } catch (error) {
      console.error("File parsing error:", error);
      toast.error("File parsing error", { description: "Please try another file." });
      setResumeText("");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setResumeText]);

  const reconcileAfterUnsuccessfulRun = useCallback(async () => {
    setIsLoading(false);
    setIsStreaming(false);
    endAnalysis();
    await refreshFreeStatus({
      fallbackDecrement: false,
      includeUserRefresh: true,
      requireOk: true,
    });
  }, [endAnalysis, refreshFreeStatus, setIsLoading, setIsStreaming]);

  const handleRun = useCallback(async () => {
    if (!resumeText.trim()) {
      toast.error("Add your resume first", {
        description: "Upload a file or paste the resume text before creating the report.",
      });
      return;
    }

    const hasPaidAccess = Boolean(user?.membership && user.membership !== "free");
    if (freeUsesRemaining <= 0 && !hasPaidAccess) {
      setIsPaywallOpen(true);
      Analytics.paywallViewed("free_uses_exhausted");
      return;
    }

    setIsLoading(true);
    setIsStreaming(true);
    setReport(null);
    const controller = beginAnalysis("resume");
    Analytics.reportStarted(Boolean(jobDescription.trim()));
    Analytics.track("report_stream_started", {
      has_jd: Boolean(jobDescription.trim()),
      mode: "resume",
    });

    try {
      const streamStartedAt = Date.now();
      let firstMeaningfulTracked = false;
      const result = await streamResumeFeedback(
        resumeText,
        jobDescription || undefined,
        (_partialJson, partialReport) => {
          if (!partialReport) return;
          setReport(partialReport);
          const hasMeaningfulOutput = Boolean(
            partialReport.score || partialReport.summary || partialReport.first_impression
          );
          if (!firstMeaningfulTracked && hasMeaningfulOutput) {
            firstMeaningfulTracked = true;
            Analytics.track("report_first_meaningful_chunk_rendered", {
              mode: "resume",
              latency_ms: Date.now() - streamStartedAt,
              has_score: typeof partialReport.score === "number",
            });
          }
          if (isLoading && hasMeaningfulOutput) setIsLoading(false);
        },
        "resume",
        { signal: controller.signal, savedJobId }
      );

      if (result.aborted) {
        // Cancellation never decrements locally. The server ledger decides
        // whether a validated report committed before the connection closed.
        await reconcileAfterUnsuccessfulRun();
        return;
      }

      if (result.ok && result.report) {
        setReport(result.report);
        setIsStreaming(false);
        setIsLoading(false);
        endAnalysis();
        Analytics.reportCompleted(result.report?.score || 0);
        await refreshFreeStatus({
          fallbackDecrement: true,
          includeUserRefresh: true,
          requireOk: true,
        });

        if (!user && !isLaunchFlagEnabled("guestReportSave")) {
          setPendingReportForSave(result.report);
          setTimeout(() => {
            Analytics.track("save_prompt_viewed", { score: result.report?.score || 0 });
            setIsSavePromptOpen(true);
          }, 5000);
        }
        return;
      }

      console.error("Failed to generate report:", result.message);
      toast.error("Failed to generate report", {
        description: result.message || REPORT_ACCESS_OUTCOME_UNKNOWN,
      });
      await reconcileAfterUnsuccessfulRun();
    } catch (error) {
      console.error("Report generation error:", error);
      toast.error("Report generation error", {
        description: REPORT_ACCESS_OUTCOME_UNKNOWN,
      });
      await reconcileAfterUnsuccessfulRun();
    }
  }, [
    resumeText,
    jobDescription,
    savedJobId,
    freeUsesRemaining,
    user,
    refreshFreeStatus,
    isLoading,
    beginAnalysis,
    endAnalysis,
    reconcileAfterUnsuccessfulRun,
    setIsLoading,
    setIsPaywallOpen,
    setIsSavePromptOpen,
    setIsStreaming,
    setPendingReportForSave,
    setReport,
  ]);

  return {
    analysisMode,
    analysisStartedAt,
    beginAnalysis,
    endAnalysis,
    handleCancelAnalysis,
    handleFileSelect,
    handleRun,
  };
}
