"use client";

import { ArrowRight, BookmarkSimple, CircleNotch, Link as LinkIcon, ShieldCheck, X } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DownloadIcon } from "@/components/ui/download";
import { EmptyReportIcon } from "@/components/icons";
import AnalysisScanning from "./AnalysisScanning";
import { ReportStream } from "./report/ReportStream";
import { ReportData } from "./report/ReportTypes";
import { UnlockBanner } from "./UnlockBanner";
import { ReportLayout } from "@/components/layout/ReportLayout";
import { ReportTOC } from "@/components/workspace/report/ReportTOC";
import { saveUnlockContext } from "@/lib/unlock/unlockContext";
import { Analytics } from "@/lib/analytics";
import { redactReport } from "@/lib/redaction";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { Button } from "@/components/ui/button";
import { ActionFeedback } from "@/components/ui/action-feedback";
import type { StoredLineAnswersByFix } from "@/lib/reports/line-answers";
import { buildPdfExportRequest } from "@/lib/reports/pdf-export";
import { reconcileReport } from "@/lib/reports/report-integrity";

// Re-export specific props if needed, but mainly we ingest ReportData
interface ReportPanelProps {
    report: ReportData | null;
    resumeText?: string;
    isLoading: boolean;
    isStreaming?: boolean;
    hasJobDescription: boolean;
    onExportPdf?: (overrideReport?: ReportData) => void;
    isExporting?: boolean;
    isSample?: boolean;
    onNewReport?: () => void;
    onKeepReport?: () => void;
    isSavingReport?: boolean;
    reportSaveError?: string | null;
    freeUsesRemaining?: number;
    onUpgrade?: () => void;
    isGated?: boolean;
    justUnlocked?: boolean;
    highlightSection?: string | null;
    hasPaidAccess?: boolean;
    analysisStartedAt?: number | null;
    onCancelAnalysis?: () => void;
    onRetryAnalysis?: () => void;
    comparisonBaseline?: ReportData | null;
    onStartRevision?: () => void;
    /** A report opened from My reports. Saved reports never keep the resume. */
    isSavedReport?: boolean;
    /** The reader's answers kept with a saved report (W3). */
    storedLineAnswers?: StoredLineAnswersByFix | null;
}

export default function ReportPanel({
    report,
    resumeText,
    isLoading,
    isStreaming = false,
    hasJobDescription,
    onExportPdf,
    isExporting = false,
    isSample = false,
    onNewReport,
    onKeepReport,
    isSavingReport = false,
    reportSaveError = null,
    freeUsesRemaining = 1,
    onUpgrade,
    isGated = false,
    justUnlocked = false,
    highlightSection = null,
    hasPaidAccess = false,
    analysisStartedAt = null,
    onCancelAnalysis,
    onRetryAnalysis,
    comparisonBaseline = null,
    onStartRevision,
    isSavedReport = false,
    storedLineAnswers = null,
}: ReportPanelProps) {

    const searchParams = useSearchParams();
    const shareEnabled = isLaunchFlagEnabled("publicShareLinks");
    const [shareMode, setShareMode] = useState(false);

    useEffect(() => {
        if (!shareEnabled) {
            setShareMode(false);
            return;
        }
        const shareParam = searchParams.get("share");
        setShareMode(shareParam === "1");
    }, [searchParams, shareEnabled]);

    const displayReport = useMemo(() => {
        if (!report) return null;
        return shareMode ? redactReport(report) : report;
    }, [report, shareMode]);
    // The Keep section lists the strengths after the opening one, once lines the report also fixes are removed.
    const hasKeepSection = useMemo(
        () => Boolean(displayReport && (reconcileReport(displayReport).report.strengths || []).length > 1),
        [displayReport],
    );

    const tocActiveId = highlightSection
        ? ({
            evidence_ledger: "section-first-impression",
            bullet_upgrades: "section-fixes",
            missing_wins: "section-fixes",
            job_alignment: "section-role"
        } as Record<string, string>)[highlightSection]
        : undefined;

    // Derived states
    const showEmptyState = !report && !isLoading;
    const showReport = !!report;
    const canExport = !isStreaming && Boolean(onExportPdf);

    const handleExport = () => {
        if (!onExportPdf) return;
        if (isGated && onUpgrade) {
            saveUnlockContext({ section: 'export_pdf' });
            Analytics.paywallCtaClicked('export_pdf');
            onUpgrade();
            return;
        }
        onExportPdf(shareMode ? displayReport || undefined : undefined);
    };

    const buildShareUrl = () => {
        const url = new URL(window.location.href);
        url.searchParams.set("share", "1");
        return url.toString();
    };

    const handleShare = async () => {
        if (!shareEnabled || typeof window === "undefined") return;
        const url = buildShareUrl();
        setShareMode(true);
        window.history.replaceState({}, "", url);
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied.");
        } catch {
            toast.error("Couldn't copy the link. Copy it from the address bar.");
        }
    };

    const handleExitShare = () => {
        if (!shareEnabled || typeof window === "undefined") return;
        const url = new URL(window.location.href);
        url.searchParams.delete("share");
        window.history.replaceState({}, "", url.toString());
        setShareMode(false);
    };

    return (
        // A report is one document that scrolls with the page; loading and empty states keep the panel.
        <div className={showReport && !isLoading ? "group relative flex flex-col bg-mineral" : "group relative flex h-full flex-col overflow-y-auto bg-mineral"}>

            {/* Loading preserves the report-generation controls. */}
            {isLoading && (
                <AnalysisScanning
                    mode="resume"
                    startedAt={analysisStartedAt}
                    onCancel={onCancelAnalysis}
                    onRetry={onRetryAnalysis}
                />
            )}

            {/* 2. Empty State - Premium, Anxiety-Reducing */}
            {showEmptyState && (
                <div className="flex h-full flex-col items-center justify-center gap-y-8 p-8 text-center">
                    {/* Icon - Subtle, Calm */}
                    <div className="flex size-14 items-center justify-center rounded-xl border border-line bg-card text-brand">
                        <EmptyReportIcon className="size-8" />
                    </div>

                    {/* Copy - Question Headline */}
                    <div className="gap-y-3 max-w-md">
                        <h2 className="font-display text-heading text-foreground">
                            Your report will show up here.
                        </h2>
                        <p className="text-muted-foreground">
                            Add your resume to see what a recruiter sees first.
                        </p>
                    </div>

                    {/* Trust Signal */}
                    <p className="text-sm text-muted-foreground">
                        Your first report is free.
                    </p>

                    {/* Divider + Example Link */}
                    <div className="pt-4 border-t border-border/30 w-full max-w-xs">
                        <button type="button"
                            onClick={onNewReport}
                            className="min-h-11 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <span className="inline-flex items-center gap-1 text-brand hover:underline">Get your free report <ArrowRight className="size-4" weight="bold" aria-hidden="true" /></span>
                        </button>
                    </div>
                </div>
            )}

            {/* 3. The working report */}
            {showReport && !isLoading && displayReport && (
                <ReportLayout mobileReading toc={<ReportTOC activeId={tocActiveId} hasKeep={hasKeepSection} hasRole={Boolean(displayReport.job_alignment)} />}>
                        <div className="gap-y-6">
                            {isStreaming && (
                                <div
                                    role="status"
                                    aria-live="polite"
                                    className="mb-4 flex items-start gap-3 rounded-xl border border-brand/20 bg-surface-sky px-4 py-3 text-sm text-muted-foreground"
                                >
                                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand motion-safe:animate-pulse" aria-hidden="true" />
                                    <p><span className="font-medium text-foreground">Still writing the rest.</span> Start reading. The other sections fill in as they finish.</p>
                                </div>
                            )}
                            {shareEnabled && shareMode && (
                                <div className="mb-4 flex flex-col gap-3 rounded-xl border border-line bg-proof p-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <ShieldCheck className="size-4 text-premium" />
                                        <div>
                                            <p className="text-foreground font-medium">Share view is on.</p>
                                            <p className="text-xs text-muted-foreground">
                                                Some personal details are hidden. Check the report for anything else you want to remove before sharing.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button type="button"
                                            onClick={handleShare}
                                            className="inline-flex min-h-11 items-center gap-2 rounded border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50"
                                        >
                                            <LinkIcon className="size-3.5" />
                                            Copy link
                                        </button>
                                        <button type="button"
                                            onClick={handleExitShare}
                                            className="inline-flex min-h-11 items-center gap-2 rounded border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50"
                                        >
                                            <X className="size-3.5" />
                                            Exit share
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-2 gap-y-2 border-b border-line pb-2 sm:min-h-12 sm:gap-x-4 sm:pb-4">
                                <div className="flex min-w-0 items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        {isSample ? "Sample report · Jordan is fictional" : "Your resume report"}
                                    </span>
                                    {shareEnabled && shareMode && <span className="text-xs font-semibold text-premium">Share view</span>}
                                </div>
                                {/* Below 360px the actions wrap under the label; pull the ghost button's padding back to the column edge. */}
                                <div className={`flex shrink-0 items-center gap-1${isSample ? "" : " max-[359px]:-ml-3"}`}>
                                    {isSample && onNewReport && (
                                        <Button
                                            data-testid="sample-start-report"
                                            type="button"
                                            variant="primary"
                                            size="sm"
                                            onClick={onNewReport}
                                            className="shrink-0 sm:px-4"
                                       >
                                            Get your free report <ArrowRight className="ml-1 size-4" weight="bold" />
                                        </Button>
                                    )}
                                    {!isSample && !isStreaming && !shareMode && onKeepReport && (
                                        <Button
                                            data-testid="workspace-keep-report"
                                            type="button"
                                            variant="quiet"
                                            size="sm"
                                            onClick={onKeepReport}
                                            disabled={isSavingReport}
                                            aria-busy={isSavingReport || undefined}
                                            aria-describedby={reportSaveError ? "report-save-error" : undefined}
                                            className="shrink-0 text-foreground"
                                       >
                                            <BookmarkSimple className="size-4 text-brand" weight="duotone" />
                                            {isSavingReport ? "Saving…" : reportSaveError ? "Try saving again" : "Save report"}
                                        </Button>
                                    )}
                                    {canExport && !isSample && (
                                        <button type="button"
                                            onClick={handleExport}
                                            disabled={isExporting}
                                            aria-busy={isExporting || undefined}
                                            aria-label={isExporting ? "Exporting report as PDF" : "Export report as PDF"}
                                            className="flex min-h-11 items-center gap-2 px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                                        >
                                            <ActionFeedback
                                                state={isExporting ? "pending" : "idle"}
                                                states={{
                                                    idle: { label: <span className="hidden sm:inline">Export PDF</span>, icon: <DownloadIcon size={16} /> },
                                                    pending: { label: <span className="hidden sm:inline">Exporting…</span>, icon: <CircleNotch className="size-4 motion-safe:animate-spin" /> },
                                                }}
                                            />
                                        </button>
                                    )}
                                    {!isStreaming && shareEnabled && !shareMode && !isSample && (
                                        <button type="button"
                                            onClick={handleShare}
                                            aria-label="Share report"
                                            className="flex min-h-11 items-center gap-2 px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            <LinkIcon className="size-4" />
                                            <span className="hidden sm:inline">Share report</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {reportSaveError && !isSample && !shareMode && (
                                <p id="report-save-error" role="alert" className="mt-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground">
                                    {reportSaveError}
                                </p>
                            )}

                            {/* Unlock Banner */}
                            {justUnlocked && report && !shareMode && (
                                <UnlockBanner
                                    reportId={buildPdfExportRequest(report)?.report_id || report.id}
                                    onJumpToRewrites={() => {
                                        const el = document.getElementById('section-fixes');
                                        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                                        el?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
                                    }}
                                    onDownloadPdf={canExport ? handleExport : (() => { })}
                                />
                            )}

                            <ReportStream
                                report={displayReport}
                                isSample={isSample}
                                freeUsesRemaining={freeUsesRemaining}
                                onUpgrade={onUpgrade}
                                hasJobDescription={hasJobDescription}
                                isGated={isGated}
                                justUnlocked={justUnlocked}
                                highlightSection={highlightSection}
                                hasPaidAccess={hasPaidAccess}
                                comparisonBaseline={comparisonBaseline}
                                onStartRevision={onStartRevision}
                                onStartReport={onNewReport}
                                resumeText={resumeText}
                                resumeSource={isSample ? "sample" : isSavedReport ? "saved" : "recovered"}
                                storedLineAnswers={storedLineAnswers}
                                className="max-w-none sm:pb-16"
                            />
                        </div>
                </ReportLayout>
            )
            }
        </div >
    );
}
