import type { AuthUser } from "@/components/providers/AuthProvider";
import type { LoadedJobContext } from "@/components/workspace/hooks/useJobContextFromExtension";
import InputPanel from "@/components/workspace/InputPanel";
import ReportPanel from "@/components/workspace/ReportPanel";

type ResumeModeSectionProps = {
  report: any | null;
  isLoading: boolean;
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
  hasPaidAccess: boolean;
};

export default function ResumeModeSection({
  report,
  isLoading,
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
  hasPaidAccess
}: ResumeModeSectionProps) {
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
      hasPaidAccess={hasPaidAccess}
    />
  );
}
