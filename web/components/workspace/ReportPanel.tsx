"use client";

import { Plus, ArrowRight, Link2, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DownloadIcon } from "@/components/ui/download";
import AnalysisScanning from "./AnalysisScanning";
import { ReportStream } from "./report/ReportStream";
import { ReportData } from "./report/ReportTypes";
import { UnlockBanner } from "./UnlockBanner";
import { ReportLayout } from "@/components/layout/ReportLayout";
import { ReportTOC } from "@/components/workspace/report/ReportTOC";
import { BottomActionRail } from "@/components/ui/bottom-action-rail";
import { saveUnlockContext } from "@/lib/unlock/unlockContext";
import { Analytics } from "@/lib/analytics";
import { redactReport } from "@/lib/redaction";

// Re-export specific props if needed, but mainly we ingest ReportData
interface ReportPanelProps {
    report: ReportData | null;
    isLoading: boolean;
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
}

export default function ReportPanel({
    report,
    isLoading,
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
    onRetryAnalysis
}: ReportPanelProps) {

    const searchParams = useSearchParams();
    const [shareMode, setShareMode] = useState(false);
    const [shareToast, setShareToast] = useState<{ message: string; type?: "success" | "info" } | null>(null);

    useEffect(() => {
        const shareParam = searchParams.get("share");
        setShareMode(shareParam === "1");
    }, [searchParams]);

    useEffect(() => {
        if (!shareToast) return;
        const timer = setTimeout(() => setShareToast(null), 3500);
        return () => clearTimeout(timer);
    }, [shareToast]);

    const displayReport = useMemo(() => {
        if (!report) return null;
        return shareMode ? redactReport(report) : report;
    }, [report, shareMode]);

    const tocActiveId = highlightSection
        ? ({
            evidence_ledger: "section-evidence-ledger",
            bullet_upgrades: "section-bullet-upgrades",
            missing_wins: "section-missing-wins",
            job_alignment: "section-job-alignment"
        } as Record<string, string>)[highlightSection]
        : undefined;

    // Derived states
    const showEmptyState = !report && !isLoading;
    const showReport = !!report;
    const canRunAnother = hasPaidAccess || freeUsesRemaining > 0;
    const canExport = Boolean(onExportPdf);

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
        if (typeof window === "undefined") return;
        const url = buildShareUrl();
        navigator.clipboard.writeText(url);
        setShareMode(true);
        window.history.replaceState({}, "", url);
        setShareToast({ message: "Share link copied", type: "success" });
    };

    const handleExitShare = () => {
        if (typeof window === "undefined") return;
        const url = new URL(window.location.href);
        url.searchParams.delete("share");
        window.history.replaceState({}, "", url.toString());
        setShareMode(false);
        setShareToast({ message: "Share mode off", type: "info" });
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto bg-body relative group">

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
                <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8">
                    {/* Icon - Subtle, Calm */}
                    <div className="w-16 h-16 rounded bg-secondary/30 border border-border/20 flex items-center justify-center">
                        <Plus className="w-6 h-6 text-muted-foreground/50" />
                    </div>

                    {/* Copy - Question Headline */}
                    <div className="space-y-3 max-w-md">
                        <h2 className="font-display text-2xl md:text-3xl text-foreground">
                            What will recruiters notice?
                        </h2>
                        <p className="text-muted-foreground">
                            Drop your resume to find out. Takes 30 seconds.
                        </p>
                    </div>

                    {/* Trust Signal */}
                    <p className="text-xs text-muted-foreground/60 font-medium">
                        First review free · No login required
                    </p>

                    {/* Divider + Example Link */}
                    <div className="pt-4 border-t border-border/30 w-full max-w-xs">
                        <button
                            onClick={onNewReport}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Want to see an example first? <span className="text-brand hover:underline">View example →</span>
                        </button>
                    </div>
                </div>
            )}

            {/* 3. The Report Stream (V2 Layout) */}
            {showReport && !isLoading && displayReport && (
                <>
                    <ReportLayout
                        toc={<ReportTOC activeId={tocActiveId} />}
                    >
                        {/* Document Meta / Actions Header (Inline for Mobile, handled by Layout context usually but here just content) */}
                        <div className="space-y-6">
                            {shareMode && (
                                <div className="rounded border border-premium/20 bg-premium/5 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <ShieldCheck className="h-4 w-4 text-premium" />
                                        <div>
                                            <p className="text-foreground font-medium">Share mode is active.</p>
                                            <p className="text-xs text-muted-foreground">
                                                PII is redacted in this view. Use this link to share safely.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleShare}
                                            className="inline-flex items-center gap-2 rounded border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50"
                                        >
                                            <Link2 className="h-3.5 w-3.5" />
                                            Copy Share Link
                                        </button>
                                        <button
                                            onClick={handleExitShare}
                                            className="inline-flex items-center gap-2 rounded border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                            Exit Share View
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h1 className="text-xl sm:text-2xl font-display font-semibold text-foreground tracking-tight truncate">
                                            {displayReport.job_alignment?.role_fit?.best_fit_roles?.[0] || 'Resume Review'}
                                        </h1>
                                        {isSample && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-muted text-muted-foreground border border-border shrink-0">
                                                Example
                                            </span>
                                        )}
                                        {shareMode && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-premium/15 text-premium border border-premium/30 shrink-0">
                                                Share View
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">This is what a recruiter sees.</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {isSample && onNewReport && !shareMode && (
                                        <button
                                            onClick={onNewReport}
                                            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded text-sm font-medium bg-brand text-white hover:bg-brand/90 transition-colors"
                                        >
                                            <span className="hidden sm:inline">Run Your Review</span>
                                            <span className="sm:hidden">Run</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    )}
                                    {!isSample && canRunAnother && onNewReport && !shareMode && (
                                        <button
                                            onClick={onNewReport}
                                            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded text-sm font-medium bg-brand text-white hover:bg-brand/90 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span className="hidden sm:inline">Run Another</span>
                                            <span className="sm:hidden">New</span>
                                        </button>
                                    )}
                                    {!isSample && !canRunAnother && onUpgrade && !shareMode && (
                                        <button
                                            onClick={onUpgrade}
                                            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded text-sm font-medium bg-premium text-white hover:bg-premium/90 transition-colors"
                                        >
                                            <span className="hidden sm:inline">Get More Reviews</span>
                                            <span className="sm:hidden">Upgrade</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    )}

                                    {canExport && (
                                        <button
                                            onClick={handleExport}
                                            disabled={isExporting}
                                            className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 min-h-10"
                                        >
                                            <DownloadIcon size={16} />
                                            <span className="hidden sm:inline">{isExporting ? "Exporting..." : "PDF"}</span>
                                        </button>
                                    )}
                                    {!shareMode && (
                                        <button
                                            onClick={handleShare}
                                            className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                        >
                                            <Link2 className="h-4 w-4" />
                                            <span className="hidden sm:inline">Share</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Unlock Banner */}
                            {justUnlocked && report && !shareMode && (
                                <UnlockBanner
                                    reportId={report.id || 'current'}
                                    onJumpToRewrites={() => {
                                        const el = document.getElementById('section-bullet-upgrades');
                                        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    onDownloadPdf={canExport ? handleExport : (() => { })}
                                />
                            )}

                            <ReportStream
                                report={displayReport}
                                isSample={isSample}
                                onNewReport={onNewReport}
                                freeUsesRemaining={freeUsesRemaining}
                                onUpgrade={onUpgrade}
                                hasJobDescription={hasJobDescription}
                                isGated={isGated}
                                justUnlocked={justUnlocked}
                                highlightSection={highlightSection}
                                hasPaidAccess={hasPaidAccess}
                                className="max-w-none pb-16" // Extra padding for BottomActionRail
                            />
                        </div>
                    </ReportLayout>

                    {/* Bottom Action Rail - Raycast Pattern */}
                    <BottomActionRail
                        sectionName={displayReport.job_alignment?.role_fit?.best_fit_roles?.[0] || 'Resume Review'}
                        primaryActionLabel={shareMode ? "Exit Share View" : isSample ? "Run Your Review" : canRunAnother ? "Run Another" : "Upgrade"}
                        onPrimaryAction={shareMode ? handleExitShare : isSample || canRunAnother ? onNewReport : onUpgrade}
                        onExport={canExport ? handleExport : undefined}
                        onShare={shareMode ? handleShare : handleShare}
                        toast={shareToast}
                    />
                </>
            )
            }
        </div >
    );
}
