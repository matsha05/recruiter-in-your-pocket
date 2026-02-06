import { Linkedin, Plus, ArrowRight } from "lucide-react";
import type { AuthUser } from "@/components/providers/AuthProvider";
import { LinkedInInputPanel } from "@/components/linkedin/LinkedInInputPanel";
import { LinkedInReportPanel } from "@/components/linkedin/LinkedInReportPanel";
import { LinkedInReportTOC } from "@/components/linkedin/LinkedInReportTOC";
import { ReportLayout } from "@/components/layout/ReportLayout";

type LinkedInModeSectionProps = {
  linkedInReport: any | null;
  linkedInProfileName: string;
  linkedInProfileHeadline: string;
  isLoading: boolean;
  freeUsesRemaining: number;
  user: AuthUser | null;
  onUrlSubmit: (url: string) => void;
  onPdfSubmit: (pdfText: string) => void;
  onSampleReport: () => void;
  onNewReport: () => void;
  onUpgrade: () => void;
};

export default function LinkedInModeSection({
  linkedInReport,
  linkedInProfileName,
  linkedInProfileHeadline,
  isLoading,
  freeUsesRemaining,
  user,
  onUrlSubmit,
  onPdfSubmit,
  onSampleReport,
  onNewReport,
  onUpgrade
}: LinkedInModeSectionProps) {
  const hasPaidAccess = Boolean(user?.membership && user.membership !== "free");

  if (!linkedInReport) {
    return (
      <div className="h-full overflow-y-auto bg-muted/10">
        <div className="flex justify-center p-6 md:p-12 min-h-full">
          <div className="w-full max-w-xl space-y-6">
            <div className="text-center space-y-2 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-tight">
                This is what they see.
              </h1>
              <div className="flex items-center justify-center gap-2 text-muted-foreground pt-2">
                <Linkedin className="w-5 h-5 text-brand" />
                <p className="text-lg font-medium">3 seconds on your LinkedIn profile.</p>
              </div>
            </div>

            <LinkedInInputPanel
              onUrlSubmit={onUrlSubmit}
              onPdfSubmit={onPdfSubmit}
              isLoading={isLoading}
              freeUsesRemaining={freeUsesRemaining}
              user={user}
              onSampleReport={onSampleReport}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-body relative group">
      <ReportLayout toc={<LinkedInReportTOC />}>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-display font-semibold text-foreground tracking-tight truncate">
                  {linkedInProfileName || "LinkedIn Report"}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                This is what a recruiter sees on your LinkedIn profile.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {hasPaidAccess || freeUsesRemaining > 0 ? (
                <button
                  onClick={onNewReport}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded text-sm font-medium bg-brand text-white hover:bg-brand/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Run Another</span>
                  <span className="sm:hidden">New</span>
                </button>
              ) : null}
              {!hasPaidAccess && freeUsesRemaining <= 0 && (
                <button
                  onClick={onUpgrade}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded text-sm font-medium bg-premium text-white hover:bg-premium/90 transition-colors"
                >
                  <span className="hidden sm:inline">Get More Reviews</span>
                  <span className="sm:hidden">Upgrade</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <LinkedInReportPanel
            report={linkedInReport}
            profileName={linkedInProfileName}
            profileHeadline={linkedInProfileHeadline}
            isSample={false}
            onNewReport={onNewReport}
            freeUsesRemaining={freeUsesRemaining}
            hasPaidAccess={hasPaidAccess}
            onUpgrade={onUpgrade}
          />
        </div>
      </ReportLayout>
    </div>
  );
}
