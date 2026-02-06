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
  endAnalysis: () => void;
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
            if (partialReport) {
              setLinkedInReport(partialReport);
              if (partialReport.score || partialReport.summary || partialReport.first_impression) {
                setIsLoading(false);
              }
            }
          },
          (meta) => {
            if (meta.name) setLinkedInProfileName(meta.name);
            if (meta.headline) setLinkedInProfileHeadline(meta.headline);
          },
          { signal: controller.signal }
        );

        if (result.aborted) {
            setIsLoading(false);
            setIsStreaming(false);
            endAnalysis();
            return;
        }

        if (result.ok && result.report) {
          setLinkedInReport(result.report);
          if (result.profile) {
            setLinkedInProfileName(result.profile.name || "");
            setLinkedInProfileHeadline(result.profile.headline || "");
          }
          setIsStreaming(false);
          setIsLoading(false);
          endAnalysis();
          Analytics.linkedInReviewCompleted(result.report?.score || 0);

          await refreshFreeStatus({
            fallbackDecrement: true,
            includeUserRefresh: true,
            requireOk: true
          });
        } else {
          console.error("Failed to generate LinkedIn report:", result.message);
          toast.error("Failed to analyze LinkedIn profile", {
            description: `${result.message || "Unknown error"} · No credits consumed`
          });
          setIsLoading(false);
          setIsStreaming(false);
          endAnalysis();
        }
      } catch (err) {
        console.error("LinkedIn analysis error:", err);
        toast.error("LinkedIn analysis error", {
          description: "Please try again. No credits consumed."
        });
        setIsLoading(false);
        setIsStreaming(false);
        endAnalysis();
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
