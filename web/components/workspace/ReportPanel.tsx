"use client";

import { Link as LinkIcon, ShieldCheck, X } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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

// Re-export specific props if needed, but mainly we ingest ReportData
interface ReportPanelProps {
    report: ReportData | null;
    isLoading: boolean;
    isStreaming?: boolean;
    hasJobDescription: boolean;
    onExportPdf?: (overrideReport?: ReportData) => void;
    isExporting?: boolean;
    isSample?: boolean;
    onNewReport?: () => void;
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
}

export default function ReportPanel({
    report,
    isLoading,
    isStreaming = false,
    hasJobDescription,
    onExportPdf,
    isExporting = false,
    isSample = false,
    onNewReport,
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

    const handleShare = () => {
        if (!shareEnabled || typeof window === "undefined") return;
        const url = buildShareUrl();
        navigator.clipboard.writeText(url);
        setShareMode(true);
        window.history.replaceState({}, "", url);
    };

    const handleExitShare = () => {
        if (!shareEnabled || typeof window === "undefined") return;
        const url = new URL(window.location.href);
        url.searchParams.delete("share");
        window.history.replaceState({}, "", url.toString());
        setShareMode(false);
    };

    return (
        <div className="group relative flex h-full flex-col overflow-y-auto bg-mineral">

            {/* 1. Loading State - Analysis Theater */}
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
                    <div className="flex size-20 items-center justify-center rounded-full border border-brand/20 bg-white/50 text-brand">
                        <EmptyReportIcon className="size-12" />
                    </div>

                    {/* Copy - Question Headline */}
                    <div className="gap-y-3 max-w-md">
                        <h2 className="font-display text-2xl md:text-3xl text-foreground">
                            Your report will appear here.
                        </h2>
                        <p className="text-muted-foreground">
                            Add your resume to see what stands out first.
                        </p>
                    </div>

                    {/* Trust Signal */}
                    <p className="text-xs text-muted-foreground/60 font-medium">
                        First report included · No account required
                    </p>

                    {/* Divider + Example Link */}
                    <div className="pt-4 border-t border-border/30 w-full max-w-xs">
                        <button type="button"
                            onClick={onNewReport}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Want a sample first? <span className="text-brand hover:underline">View sample →</span>
                        </button>
                    </div>
                </div>
            )}

            {/* 3. The working report */}
            {showReport && !isLoading && displayReport && (
                <ReportLayout toc={<ReportTOC activeId={tocActiveId} />}>
                        <div className="gap-y-6">
                            {isStreaming && (
                                <div
                                    role="status"
                                    aria-live="polite"
                                    className="flex items-start gap-3 border-y border-brand/20 bg-brand/5 px-4 py-3 text-sm leading-6 text-muted-foreground"
                                >
                                    <span className="mt-2 size-1.5 shrink-0 animate-pulse rounded-full bg-brand" aria-hidden="true" />
                                    <p><span className="font-medium text-foreground">Still building your report.</span> You can start reading now; the remaining sections will fill in as they arrive.</p>
                                </div>
                            )}
                            {shareEnabled && shareMode && (
                                <div className="flex flex-col gap-3 border-y border-premium/20 bg-premium/5 p-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <ShieldCheck className="size-4 text-premium" />
                                        <div>
                                            <p className="text-foreground font-medium">Share view is on.</p>
                                            <p className="text-xs text-muted-foreground">
                                                Personal details are hidden in this view, so you can share it safely.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button type="button"
                                            onClick={handleShare}
                                            className="inline-flex items-center gap-2 rounded border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50"
                                        >
                                            <LinkIcon className="size-3.5" />
                                            Copy link
                                        </button>
                                        <button type="button"
                                            onClick={handleExitShare}
                                            className="inline-flex items-center gap-2 rounded border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50"
                                        >
                                            <X className="size-3.5" />
                                            Exit share
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="riyp-border-paper-line animate-in slide-in-from-bottom-2 fade-in flex min-h-12 items-center justify-between gap-4 border-b pb-3 duration-500">
                                <div className="flex min-w-0 items-center gap-2">
                                    <span className="text-[10px] font-semibold uppercase riyp-track-015 text-muted-foreground">
                                        {isSample ? "Example report" : "Your resume review"}
                                    </span>
                                    {shareEnabled && shareMode && <span className="text-[10px] font-semibold uppercase riyp-track-015 text-premium">Share view</span>}
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    {canExport && !isSample && (
                                        <button type="button"
                                            onClick={handleExport}
                                            disabled={isExporting}
                                            aria-label={isExporting ? "Exporting report as PDF" : "Export report as PDF"}
                                            className="flex min-h-11 items-center gap-2 px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                                        >
                                            <DownloadIcon size={16} />
                                            <span className="hidden sm:inline">{isExporting ? "Exporting..." : "Export PDF"}</span>
                                        </button>
                                    )}
                                    {!isStreaming && shareEnabled && !shareMode && !isSample && (
                                        <button type="button"
                                            onClick={handleShare}
                                            aria-label="Share report"
                                            className="flex min-h-11 items-center gap-2 px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            <LinkIcon className="size-4" />
                                            <span className="hidden sm:inline">Share Report</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Unlock Banner */}
                            {justUnlocked && report && !shareMode && (
                                <UnlockBanner
                                    reportId={report.id || 'current'}
                                    onJumpToRewrites={() => {
                                        const el = document.getElementById('section-fixes');
                                        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    onDownloadPdf={canExport ? handleExport : (() => { })}
                                />
                            )}

                            <ReportStream
                                report={displayReport}
                                isSample={isSample}
                                onNewReport={isStreaming ? undefined : onNewReport}
                                freeUsesRemaining={freeUsesRemaining}
                                onUpgrade={onUpgrade}
                                hasJobDescription={hasJobDescription}
                                isGated={isGated}
                                justUnlocked={justUnlocked}
                                highlightSection={highlightSection}
                                hasPaidAccess={hasPaidAccess}
                                comparisonBaseline={comparisonBaseline}
                                onStartRevision={onStartRevision}
                                className="max-w-none sm:pb-16"
                            />
                        </div>
                </ReportLayout>
            )
            }
        </div >
    );
}
