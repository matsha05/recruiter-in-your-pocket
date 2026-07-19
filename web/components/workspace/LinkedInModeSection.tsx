import { Linkedin, Plus, ArrowRight } from "lucide-react";
import type { AuthUser } from "@/components/providers/AuthProvider";
import { LinkedInInputPanel } from "@/components/linkedin/LinkedInInputPanel";
import { LinkedInReportPanel } from "@/components/linkedin/LinkedInReportPanel";
import { LinkedInReportTOC } from "@/components/linkedin/LinkedInReportTOC";
import { ReportLayout } from "@/components/layout/ReportLayout";
import AnalysisScanning from "@/components/workspace/AnalysisScanning";

type LinkedInModeSectionProps = {
  linkedInReport: any | null;
  linkedInProfileName: string;
  linkedInProfileHeadline: string;
  isLoading: boolean;
  isStreaming: boolean;
  freeUsesRemaining: number;
  user: AuthUser | null;
  onUrlSubmit: (url: string) => void;
  onPdfSubmit: (pdfText: string) => void;
  onSampleReport: () => void;
  onNewReport: () => void;
  onUpgrade: () => void;
  analysisStartedAt: number | null;
  onCancelAnalysis: () => void;
  onRetryAnalysis: () => void;
};

export default function LinkedInModeSection({
  linkedInReport,
  linkedInProfileName,
  linkedInProfileHeadline,
  isLoading,
  isStreaming,
  freeUsesRemaining,
  user,
  onUrlSubmit,
  onPdfSubmit,
  onSampleReport,
  onNewReport,
  onUpgrade,
  analysisStartedAt,
  onCancelAnalysis,
  onRetryAnalysis
}: LinkedInModeSectionProps) {
  const hasPaidAccess = Boolean(user?.membership && user.membership !== "free");

  if (!linkedInReport && isStreaming) {
    return (
      <div className="h-full overflow-y-auto bg-mineral">
        <div className="h-full">
          <AnalysisScanning
            mode="linkedin"
            startedAt={analysisStartedAt}
            onCancel={onCancelAnalysis}
            onRetry={onRetryAnalysis}
          />
        </div>
      </div>
    );
  }

  if (!linkedInReport) {
    return (
      <div className="h-full overflow-y-auto bg-mineral">
        <div data-visual-anchor="workspace-linkedin-empty" className="flex min-h-full justify-center px-5 py-8 md:px-8 md:py-12">
          <div className="grid w-full max-w-[72rem] items-start gap-10 lg:grid-cols-[minmax(15rem,0.65fr)_minmax(0,1.35fr)] lg:gap-16">
            <div className="lg:sticky lg:top-24">
              <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase riyp-track-010 text-brand">
                <Linkedin className="size-4" /> LinkedIn report
              </p>
              <h1 className="font-display text-[clamp(2.75rem,6vw,4.6rem)] riyp-weight-520 leading-[0.96] tracking-[-0.04em] text-foreground riyp-stretch-88">
                See what your profile says first.
              </h1>
              <p className="mt-5 max-w-[28rem] text-lg leading-8 text-muted-foreground">
                Export the profile you are actually using. We&apos;ll show what reads clearly, what gets lost, and what to fix first.
              </p>
              <dl className="mt-9 border-y border-border/70">
                <div className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-border/50 py-4"><dt className="font-mono text-[11px] font-semibold text-brand">01</dt><dd className="text-sm leading-6 text-muted-foreground">Profile-card first impression</dd></div>
                <div className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-border/50 py-4"><dt className="font-mono text-[11px] font-semibold text-brand">02</dt><dd className="text-sm leading-6 text-muted-foreground">Headline and About clarity</dd></div>
                <div className="grid grid-cols-[2.5rem_1fr] gap-3 py-4"><dt className="font-mono text-[11px] font-semibold text-brand">03</dt><dd className="text-sm leading-6 text-muted-foreground">Search visibility and next moves</dd></div>
              </dl>
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
    <div className="group relative h-full overflow-y-auto bg-mineral">
      <ReportLayout toc={<LinkedInReportTOC />}>
        <div className="gap-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="gap-y-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-display font-semibold text-foreground tracking-tight truncate">
                  {linkedInProfileName || "LinkedIn Report"}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                A structured read of the profile you uploaded.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {hasPaidAccess || freeUsesRemaining > 0 ? (
                <button type="button"
                  onClick={onNewReport}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded text-sm font-medium bg-brand text-white hover:bg-brand/90 transition-colors"
                >
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">Run Another</span>
                  <span className="sm:hidden">New</span>
                </button>
              ) : null}
              {!hasPaidAccess && freeUsesRemaining <= 0 && (
                <button type="button"
                  onClick={onUpgrade}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded text-sm font-medium bg-premium text-white hover:bg-premium/90 transition-colors"
                >
                  <span className="hidden sm:inline">See the Job Search Pass</span>
                  <span className="sm:hidden">Get pass</span>
                  <ArrowRight className="size-4" />
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
