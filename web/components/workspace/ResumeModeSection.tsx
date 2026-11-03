import type { AuthUser } from "@/components/providers/AuthProvider";
import type { LoadedJobContext } from "@/components/workspace/hooks/useJobContextFromExtension";
import InputPanel from "@/components/workspace/InputPanel";
import ReportPanel from "@/components/workspace/ReportPanel";
import AnalysisScanning from "@/components/workspace/AnalysisScanning";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import { hasEffectiveJobDescriptionValue } from "@/lib/security/effectiveJobDescription";
import type { GenerationStage } from "@/lib/generation-stage";

type ResumeModeSectionProps = {
  report: any | null;
  isLoading: boolean;
  isStreaming: boolean;
  resumeText: string;
  jobDescription: string;
  onResumeTextChange: (text: string) => void;
  onJobDescChange: (text: string) => void;
  onFileSelect: (file: File) => void | boolean | Promise<void | boolean>;
  commandUploadName?: string | null;
  onRun: () => void;
  freeUsesRemaining: number;
  user: AuthUser | null;
  onSampleReport: () => void;
  onOpenLastReport?: () => void;
  loadedJobContext: LoadedJobContext | null;
  onExportPdf?: () => void;
  isExporting: boolean;
  isSample: boolean;
  onNewReport: () => void;
  onKeepReport?: () => void;
  isSavingReport?: boolean;
  reportSaveError?: string | null;
  onUpgrade: () => void;
  justUnlocked: boolean;
  highlightSection?: string | null;
  hasPaidAccess: boolean;
  analysisStartedAt: number | null;
  analysisStage?: GenerationStage | null;
  onCancelAnalysis: () => void;
  onRetryAnalysis: () => void;
  comparisonBaseline?: ReportData | null;
  onStartRevision: () => void;
  /** How long this visit's report took to arrive; null when it was restored or sampled. */
  readDurationMs?: number | null;
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
  commandUploadName,
  onRun,
  freeUsesRemaining,
  user,
  onSampleReport,
  onOpenLastReport,
  loadedJobContext,
  onExportPdf,
  isExporting,
  isSample,
  onNewReport,
  onKeepReport,
  isSavingReport,
  reportSaveError,
  onUpgrade,
  justUnlocked,
  highlightSection,
  hasPaidAccess,
  analysisStartedAt,
  analysisStage = null,
  onCancelAnalysis,
  onRetryAnalysis,
  comparisonBaseline = null,
  onStartRevision,
  readDurationMs = null,
}: ResumeModeSectionProps) {
  if (!report && isStreaming) {
    return (
      <div className="workspace-pane h-full overflow-y-auto bg-body">
        <div className="h-full">
          <AnalysisScanning
            mode="resume"
            startedAt={analysisStartedAt}
            stage={analysisStage}
            resumeText={resumeText}
            onCancel={onCancelAnalysis}
            onRetry={onRetryAnalysis}
          />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="workspace-pane h-full overflow-y-auto bg-mineral">
        <InputPanel
          resumeText={resumeText}
          jobDescription={jobDescription}
          onResumeTextChange={onResumeTextChange}
          onJobDescChange={onJobDescChange}
          onFileSelect={onFileSelect}
          commandUploadName={commandUploadName}
          onRun={onRun}
          isLoading={isLoading}
          freeUsesRemaining={freeUsesRemaining}
          user={user}
          onSampleReport={onSampleReport}
          onOpenLastReport={onOpenLastReport}
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
      onKeepReport={onKeepReport}
      isSavingReport={isSavingReport}
      reportSaveError={reportSaveError}
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
      readDurationMs={readDurationMs}
      isSignedIn={Boolean(user)}
    />
  );
}
