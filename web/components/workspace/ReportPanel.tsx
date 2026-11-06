"use client";

import { ArrowRight, BookmarkSimple, CircleNotch, Link as LinkIcon, ShieldCheck, X } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DownloadIcon } from "@/components/ui/download";
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
import { candidateNameOf, formatReadTime, targetRoleOf } from "@/lib/reports/report-opening";
import { isWorklistReport } from "@/lib/llm/worklist-schema";
import { worklistTargetRole } from "@/lib/reports/worklist-presentation";

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
    /** How long this visit's report took to arrive, for the header row. Absent on the sample, a saved or a recovered report. */
    readDurationMs?: number | null;
    /** The reader has an account: the ending leads with saving this version (W3). */
    isSignedIn?: boolean;
    /** How many of the person's answers this report was written from (ask-first); 0 for a first read. */
    rebuiltAnswers?: number;
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
    readDurationMs = null,
    isSignedIn = false,
    rebuiltAnswers = 0,
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
    const worklist = Boolean(displayReport && isWorklistReport(displayReport));
    const hasKeepSection = useMemo(
        () => Boolean(displayReport && !isWorklistReport(displayReport) && (reconcileReport(displayReport).report.strengths || []).length > 1),
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
    const showReport = !!report;
    const canExport = !isStreaming && Boolean(onExportPdf);
    // One name for keeping a report (copy-system §1): the ending says the same.
    const saveLabel = isSavingReport ? "Saving…" : reportSaveError ? "Try saving again" : "Save this version";
    // The header row: the role the report reads toward, the level it reads at, and how long it took.
    const roleFit = displayReport?.job_alignment?.role_fit;
    const targetRole = displayReport && isWorklistReport(displayReport) ? worklistTargetRole(displayReport) : targetRoleOf(roleFit);
    // A report written from the person's answers says so where the read time would go.
    const readTime = rebuiltAnswers > 0
        ? `written from ${rebuiltAnswers === 1 ? "your answer" : `${rebuiltAnswers} answers`}`
        : isSample || isSavedReport ? null : formatReadTime(readDurationMs ?? Number.NaN);

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
                    resumeText={resumeText}
                    onCancel={onCancelAnalysis}
                    onRetry={onRetryAnalysis}
                />
            )}

            {/* The working report */}
            {showReport && !isLoading && displayReport && (
                <ReportLayout
                    mobileReading
                    toc={<ReportTOC activeId={tocActiveId} hasKeep={hasKeepSection} hasRole={worklist ? Boolean(displayReport.fit?.note || displayReport.fit?.roles?.length) : Boolean(displayReport.job_alignment)} worklist={worklist} />}
                    head={
                        /* Whose resume, the role it reads toward, and how long the read took (W1, Nov 2, 2026). */
                        <>
                            <div className="min-w-0">
                                <p className="text-small font-semibold text-foreground">
                                    {isSample ? "Sample report · Jordan is fictional" : (!shareMode && candidateNameOf(resumeText)) || "Your resume report"}
                                </p>
                                {(targetRole || readTime) && (
                                    <p className="text-label font-normal text-muted-foreground">{[targetRole, readTime].filter(Boolean).join(" · ")}</p>
                                )}
                            </div>
                            {isSample && onNewReport ? (
                                <Button data-testid="sample-start-report" type="button" variant="primary" size="sm" onClick={onNewReport} className="shrink-0">
                                    Get your free report <ArrowRight className="size-4" weight="bold" />
                                </Button>
                            ) : null}
                        </>
                    }
                    actions={!isSample && (
                        <>
                            {!isStreaming && !shareMode && onKeepReport && (
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
                                    {/* Icon-only on phones; the label is still the button's name. */}
                                    <span className="sr-only sm:not-sr-only">{saveLabel}</span>
                                </Button>
                            )}
                            {canExport && (
                                <button type="button"
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    aria-busy={isExporting || undefined}
                                    aria-label={isExporting ? "Exporting report as PDF" : "Export report as PDF"}
                                    className="focus-ring flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
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
                            {!isStreaming && shareEnabled && !shareMode && (
                                <button type="button"
                                    onClick={handleShare}
                                    aria-label="Share report"
                                    className="focus-ring flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <LinkIcon className="size-4" />
                                    <span className="hidden sm:inline">Share report</span>
                                </button>
                            )}
                        </>
                    )}
                >
                        <div className="gap-y-6">
                            {isStreaming && (
                                <div
                                    role="status"
                                    aria-live="polite"
                                    className="mb-4 flex items-start gap-3 rounded-xl border border-brand/20 bg-surface-sky px-4 py-3 text-sm text-muted-foreground"
                                >
                                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand motion-safe:animate-pulse" aria-hidden="true" />
                                    <p className="font-medium text-foreground">Still writing the rest.</p>
                                </div>
                            )}
                            {shareEnabled && shareMode && (
                                <div className="mb-4 flex flex-col gap-3 rounded-xl border border-line bg-proof p-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <ShieldCheck className="size-4 text-brand" />
                                        <div>
                                            <p className="text-foreground font-medium">Share view is on.</p>
                                            <p className="text-xs text-muted-foreground">
                                                Some personal details are hidden. Check the report for anything else you want to remove before sharing.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="secondary" size="sm" onClick={handleShare}>
                                            <LinkIcon className="size-3.5" />
                                            Copy link
                                        </Button>
                                        <Button type="button" variant="secondary" size="sm" onClick={handleExitShare}>
                                            <X className="size-3.5" />
                                            Exit share
                                        </Button>
                                    </div>
                                </div>
                            )}

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
                                isSignedIn={isSignedIn}
                                onSaveReport={!isStreaming && !shareMode ? onKeepReport : undefined}
                                isSavingReport={isSavingReport}
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
