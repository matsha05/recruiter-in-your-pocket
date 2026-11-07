import type { AuthUser } from "@/components/providers/AuthProvider";
import type { LoadedJobContext } from "@/components/workspace/hooks/useJobContextFromExtension";
import InputPanel from "@/components/workspace/InputPanel";
import ReportPanel from "@/components/workspace/ReportPanel";
import AnalysisScanning from "@/components/workspace/AnalysisScanning";
import type { ReportData } from "@/components/workspace/report/ReportTypes";
import { hasEffectiveJobDescriptionValue } from "@/lib/security/effectiveJobDescription";
import type { GenerationStage } from "@/lib/generation-stage";
import type { AskFirstAnswers, AskFirstQuestion } from "@/lib/reports/ask-first";
import { AskFirst } from "@/components/workspace/report/AskFirst";

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
  /** The server has answered what's left; until then a signed-in person isn't promised a free report. */
  freeStatusKnown?: boolean;
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
  /** Ask-first: the questions to show before this report, until the person writes or skips. */
  askFirst?: { report: ReportData; questions: AskFirstQuestion[] } | null;
  onAskFirstWrite?: (answers: AskFirstAnswers) => void;
  onAskFirstSkip?: () => void;
  /** The report is being written again from the answers. */
  rebuilding?: boolean;
  /** How many answers the shown report was written from; 0 for a first read. */
  rebuiltAnswers?: number;
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
  freeStatusKnown = true,
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
  askFirst = null,
  onAskFirstWrite,
  onAskFirstSkip,
  rebuilding = false,
  rebuiltAnswers = 0,
}: ResumeModeSectionProps) {
  if ((!report || rebuilding) && isStreaming) {
    return (
      <div className="workspace-pane h-full overflow-y-auto bg-body">
        <div className="h-full">
          <AnalysisScanning
            mode="resume"
            startedAt={analysisStartedAt}
            stage={analysisStage}
            resumeText={resumeText}
            onCancel={onCancelAnalysis}
            onRetry={rebuilding ? undefined : onRetryAnalysis}
            title={rebuilding ? "Writing it up from your answers." : undefined}
          />
        </div>
      </div>
    );
  }

  // The page isn't ready: the questions a recruiter would ask come before the report (ask-first).
  if (report && askFirst && askFirst.report === report && onAskFirstWrite && onAskFirstSkip) {
    return (
      <div className="workspace-pane h-full overflow-y-auto bg-mineral">
        <AskFirst
          report={askFirst.report}
          questions={askFirst.questions}
          resumeText={resumeText}
          onWrite={onAskFirstWrite}
          onSkip={onAskFirstSkip}
        />
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
          freeStatusKnown={freeStatusKnown}
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
      rebuiltAnswers={rebuiltAnswers}
      isSignedIn={Boolean(user)}
    />
  );
}
