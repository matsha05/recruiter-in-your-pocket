import type { AuthUser } from "@/components/providers/AuthProvider";
import type { LoadedJobContext } from "@/components/workspace/hooks/useJobContextFromExtension";
import InputPanel from "@/components/workspace/InputPanel";
import ReportPanel from "@/components/workspace/ReportPanel";
import AnalysisScanning from "@/components/workspace/AnalysisScanning";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import { hasEffectiveJobDescriptionValue } from "@/lib/security/effectiveJobDescription";

type ResumeModeSectionProps = {
  report: any | null;
  isLoading: boolean;
  isStreaming: boolean;
  resumeText: string;
  jobDescription: string;
  onResumeTextChange: (text: string) => void;
  onJobDescChange: (text: string) => void;
  onFileSelect: (file: File) => void | boolean | Promise<void | boolean>;
  onRun: () => void;
  freeUsesRemaining: number;
  user: AuthUser | null;
  onSampleReport: () => void;
  loadedJobContext: LoadedJobContext | null;
  onExportPdf?: () => void;
  isExporting: boolean;
  isSample: boolean;
  onNewReport: () => void;
  onUpgrade: () => void;
  justUnlocked: boolean;
  highlightSection?: string | null;
  hasPaidAccess: boolean;
  analysisStartedAt: number | null;
  onCancelAnalysis: () => void;
  onRetryAnalysis: () => void;
  comparisonBaseline?: ReportData | null;
  onStartRevision: () => void;
};

export default function ResumeModeSection({
  report,
  isLoading,
  isStreaming,
  resumeText,
  jobDescription,
  onResumeTextChange,
  onJobDescChange,
  onFileSelect,
  onRun,
  freeUsesRemaining,
  user,
  onSampleReport,
  loadedJobContext,
  onExportPdf,
  isExporting,
  isSample,
  onNewReport,
  onUpgrade,
  justUnlocked,
  highlightSection,
  hasPaidAccess,
  analysisStartedAt,
  onCancelAnalysis,
  onRetryAnalysis,
  comparisonBaseline = null,
  onStartRevision,
}: ResumeModeSectionProps) {
  if (!report && isStreaming) {
    return (
      <div className="h-full overflow-y-auto bg-body">
        <div className="h-full">
          <AnalysisScanning
            mode="resume"
            startedAt={analysisStartedAt}
            onCancel={onCancelAnalysis}
            onRetry={onRetryAnalysis}
          />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="h-full overflow-y-auto bg-mineral">
        <InputPanel
          resumeText={resumeText}
          jobDescription={jobDescription}
          onResumeTextChange={onResumeTextChange}
          onJobDescChange={onJobDescChange}
          onFileSelect={onFileSelect}
          onRun={onRun}
          isLoading={isLoading}
          freeUsesRemaining={freeUsesRemaining}
          user={user}
          onSampleReport={onSampleReport}
          loadedJobContext={loadedJobContext}
          isRevision={Boolean(comparisonBaseline)}
        />
      </div>
    );
  }

  return (
    <ReportPanel
      report={report}
      resumeText={resumeText}
      isLoading={isLoading}
      isStreaming={isStreaming}
      hasJobDescription={hasEffectiveJobDescriptionValue(jobDescription)}
      onExportPdf={onExportPdf}
      isExporting={isExporting}
      isSample={isSample}
      onNewReport={onNewReport}
      freeUsesRemaining={freeUsesRemaining}
      onUpgrade={onUpgrade}
      isGated={false}
      justUnlocked={justUnlocked}
      highlightSection={highlightSection}
      hasPaidAccess={hasPaidAccess}
      analysisStartedAt={analysisStartedAt}
      onCancelAnalysis={onCancelAnalysis}
      onRetryAnalysis={onRetryAnalysis}
      comparisonBaseline={comparisonBaseline}
      onStartRevision={onStartRevision}
    />
  );
}
