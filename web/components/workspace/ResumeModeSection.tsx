import type { AuthUser } from "@/components/providers/AuthProvider";
import type { LoadedJobContext } from "@/components/workspace/hooks/useJobContextFromExtension";
import InputPanel from "@/components/workspace/InputPanel";
import ReportPanel from "@/components/workspace/ReportPanel";
import AnalysisScanning from "@/components/workspace/AnalysisScanning";

type ResumeModeSectionProps = {
  report: any | null;
  isLoading: boolean;
  isStreaming: boolean;
  resumeText: string;
  jobDescription: string;
  onResumeTextChange: (text: string) => void;
  onJobDescChange: (text: string) => void;
  onFileSelect: (file: File) => void;
  onRun: () => void;
  freeUsesRemaining: number;
  user: AuthUser | null;
  onSampleReport: () => void;
  loadedJobContext: LoadedJobContext | null;
  onExportPdf: () => void;
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
  onRetryAnalysis
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
      <div className="h-full overflow-y-auto bg-muted/10">
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
        />
      </div>
    );
  }

  return (
    <ReportPanel
      report={report}
      isLoading={isLoading}
      hasJobDescription={!!jobDescription.trim()}
      onExportPdf={onExportPdf}
      isExporting={isExporting}
      isSample={isSample}
      onNewReport={onNewReport}
      freeUsesRemaining={freeUsesRemaining}
      onUpgrade={onUpgrade}
      isGated={!isSample && !hasPaidAccess && freeUsesRemaining <= 0}
      justUnlocked={justUnlocked}
      highlightSection={highlightSection}
      hasPaidAccess={hasPaidAccess}
      analysisStartedAt={analysisStartedAt}
      onCancelAnalysis={onCancelAnalysis}
      onRetryAnalysis={onRetryAnalysis}
    />
  );
}
