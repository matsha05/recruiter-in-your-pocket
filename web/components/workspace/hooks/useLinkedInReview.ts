import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AuthUser } from "@/components/providers/AuthProvider";
import type { ReviewMode } from "@/components/workspace/ModeSwitcher";
import { streamLinkedInFeedback } from "@/lib/api";
import { Analytics } from "@/lib/analytics";
import { toast } from "sonner";

type RefreshFreeStatus = (options?: {
  fallbackDecrement?: boolean;
  includeUserRefresh?: boolean;
  requireOk?: boolean;
  shouldApply?: () => boolean;
}) => Promise<boolean>;

type LinkedInReviewOptions = {
  user: AuthUser | null;
  freeUsesRemaining: number;
  refreshFreeStatus: RefreshFreeStatus;
  setIsPaywallOpen: Dispatch<SetStateAction<boolean>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setIsStreaming: Dispatch<SetStateAction<boolean>>;
  setLinkedInReport: Dispatch<SetStateAction<any>>;
  setLinkedInProfileName: Dispatch<SetStateAction<string>>;
  setLinkedInProfileHeadline: Dispatch<SetStateAction<string>>;
  setReviewMode: Dispatch<SetStateAction<ReviewMode>>;
  beginAnalysis: (mode: "resume" | "linkedin") => AbortController;
  isAnalysisCurrent: (controller: AbortController) => boolean;
  endAnalysis: (controller: AbortController) => boolean;
  setLastLinkedInPdf: Dispatch<SetStateAction<string | null>>;
};

export function useLinkedInReview({
  user,
  freeUsesRemaining,
  refreshFreeStatus,
  setIsPaywallOpen,
  setIsLoading,
  setIsStreaming,
  setLinkedInReport,
  setLinkedInProfileName,
  setLinkedInProfileHeadline,
  setReviewMode,
  beginAnalysis,
  isAnalysisCurrent,
  endAnalysis,
  setLastLinkedInPdf
}: LinkedInReviewOptions) {
  const handleLinkedInPdfSubmit = useCallback(
    async (pdfText: string) => {
      const hasPaidAccess = Boolean(user?.membership && user.membership !== "free");
      if (freeUsesRemaining <= 0 && !hasPaidAccess) {
        setIsPaywallOpen(true);
        Analytics.paywallViewed("linkedin_free_exhausted");
        return;
      }

      setLastLinkedInPdf(pdfText);
      const controller = beginAnalysis("linkedin");
      setIsLoading(true);
      setIsStreaming(true);
      setLinkedInReport(null);
      Analytics.linkedInReviewStarted("pdf");

      try {
        const result = await streamLinkedInFeedback(
          { pdfText, source: "pdf" },
          (partialJson, partialReport) => {
            if (!isAnalysisCurrent(controller)) return;
            if (partialReport) {
              setLinkedInReport(partialReport);
              if (partialReport.score || partialReport.summary || partialReport.first_impression) {
                setIsLoading(false);
              }
            }
          },
          (meta) => {
            if (!isAnalysisCurrent(controller)) return;
            if (meta.name) setLinkedInProfileName(meta.name);
            if (meta.headline) setLinkedInProfileHeadline(meta.headline);
          },
          { signal: controller.signal }
        );
        if (!isAnalysisCurrent(controller)) return;

        if (result.aborted) {
          return;
        }

        if (result.ok && result.report) {
          setLinkedInReport(result.report);
          if (result.profile) {
            setLinkedInProfileName(result.profile.name || "");
            setLinkedInProfileHeadline(result.profile.headline || "");
          }
          Analytics.linkedInReviewCompleted(result.report?.score || 0);

          void refreshFreeStatus({
            fallbackDecrement: true,
            includeUserRefresh: true,
            requireOk: true,
            shouldApply: () => isAnalysisCurrent(controller),
          });
        } else {
          console.error("Failed to generate LinkedIn report:", result.message);
          toast.error("Failed to analyze LinkedIn profile", {
            description: `${result.message || "Unknown error"} · Your free report was not used`
          });
        }
      } catch (err) {
        if (!isAnalysisCurrent(controller)) return;
        console.error("LinkedIn analysis error:", err);
        toast.error("LinkedIn analysis error", {
          description: "Please try again. Your free report was not used."
        });
      } finally {
        if (endAnalysis(controller)) {
          setIsLoading(false);
          setIsStreaming(false);
        }
      }
    },
    [
      user,
      freeUsesRemaining,
      refreshFreeStatus,
      setIsPaywallOpen,
      setIsLoading,
      setIsStreaming,
      setLinkedInReport,
      setLinkedInProfileName,
      setLinkedInProfileHeadline,
      beginAnalysis,
      isAnalysisCurrent,
      endAnalysis,
      setLastLinkedInPdf
    ]
  );

  const handleLinkedInUrlSubmit = useCallback(async (url: string) => {
    toast.info("URL analysis coming soon", {
      description: "Please upload your LinkedIn PDF for now."
    });
  }, []);

  const handleLinkedInSample = useCallback(async () => {
    try {
      const res = await fetch("/sample-linkedin-report.json");
      const data = await res.json();
      setLinkedInReport(data);
      setLinkedInProfileName("Alex Thompson");
      setLinkedInProfileHeadline("Product Manager at TechCorp | Building Great Products");
      setReviewMode("linkedin");
    } catch (err) {
      console.error("Failed to load sample report:", err);
    }
  }, [setLinkedInProfileHeadline, setLinkedInProfileName, setLinkedInReport, setReviewMode]);

  return {
    handleLinkedInPdfSubmit,
    handleLinkedInUrlSubmit,
    handleLinkedInSample
  };
}
