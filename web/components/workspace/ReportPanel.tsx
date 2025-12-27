"use client";

import { Download, Plus, ArrowRight } from "lucide-react";
import AnalysisScanning from "./AnalysisScanning";
import { ReportStream } from "./report/ReportStream";
import { ReportData } from "./report/ReportTypes";
import { UnlockBanner } from "./UnlockBanner";
import { ReportLayout } from "@/components/layout/ReportLayout";
import { ReportTOC } from "@/components/workspace/report/ReportTOC";

// Re-export specific props if needed, but mainly we ingest ReportData
interface ReportPanelProps {
    report: ReportData | null;
    isLoading: boolean;
    hasJobDescription: boolean;
    onExportPdf?: () => void;
    isExporting?: boolean;
    isSample?: boolean;
    onNewReport?: () => void;
    freeUsesRemaining?: number;
    onUpgrade?: () => void;
    isGated?: boolean;
    justUnlocked?: boolean;
    highlightSection?: string | null;
}

export default function ReportPanel({
    report,
    isLoading,
    hasJobDescription,
    onExportPdf,
    isExporting = false,
    isSample = false,
    onNewReport,
    freeUsesRemaining = 2,
    onUpgrade,
    isGated = false,
    justUnlocked = false,
    highlightSection = null
}: ReportPanelProps) {

    // Derived states
    const showEmptyState = !report && !isLoading;
    const showReport = !!report;

    return (
        <div className="flex flex-col h-full overflow-y-auto bg-body relative group">

            {/* BACKGROUND NOISE/TEXTURE (Subtle Studio Feel) */}
            <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-[0.015] pointer-events-none mix-blend-overlay" />

            {/* 1. Loading State - Analysis Theater */}
            {isLoading && (
                <AnalysisScanning />
            )}

            {/* 2. Empty State - Premium, Anxiety-Reducing */}
            {showEmptyState && (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8">
                    {/* Icon - Subtle, Calm */}
                    <div className="w-16 h-16 rounded-2xl bg-secondary/30 border border-border/20 flex items-center justify-center">
                        <Plus className="w-6 h-6 text-muted-foreground/50" />
                    </div>

                    {/* Copy - Question Headline */}
                    <div className="space-y-3 max-w-md">
                        <h2 className="font-serif text-2xl md:text-3xl text-foreground">
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
            {showReport && !isLoading && (
                <ReportLayout
                    toc={<ReportTOC activeId={highlightSection || undefined} score={report.score} />}
                >
                    {/* Document Meta / Actions Header (Inline for Mobile, handled by Layout context usually but here just content) */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-serif font-semibold text-foreground tracking-tight">
                                        {report.job_alignment?.role_fit?.best_fit_roles?.[0] || 'Resume Review'}
                                    </h1>
                                    {isSample && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                            Example
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">This is what a recruiter sees.</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                {isSample && onNewReport && (
                                    <button
                                        onClick={onNewReport}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-brand text-white hover:bg-brand/90 transition-colors"
                                    >
                                        Run Your Review
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                                {!isSample && freeUsesRemaining > 0 && onNewReport && (
                                    <button
                                        onClick={onNewReport}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-brand text-white hover:bg-brand/90 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Run Another
                                    </button>
                                )}
                                {!isSample && freeUsesRemaining <= 0 && onUpgrade && (
                                    <button
                                        onClick={onUpgrade}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-premium text-white hover:bg-premium/90 transition-colors"
                                    >
                                        Unlock Full Reports
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}

                                {onExportPdf && (
                                    <button
                                        onClick={onExportPdf}
                                        disabled={isExporting}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span className="hidden sm:inline">{isExporting ? "Exporting..." : "PDF"}</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Unlock Banner */}
                        {justUnlocked && report && (
                            <UnlockBanner
                                reportId={report.id || 'current'}
                                onJumpToRewrites={() => {
                                    const el = document.getElementById('section-bullet-upgrades');
                                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                onDownloadPdf={onExportPdf || (() => { })}
                            />
                        )}

                        <ReportStream
                            report={report}
                            isSample={isSample}
                            onNewReport={onNewReport}
                            freeUsesRemaining={freeUsesRemaining}
                            onUpgrade={onUpgrade}
                            hasJobDescription={hasJobDescription}
                            isGated={isGated}
                            justUnlocked={justUnlocked}
                            highlightSection={highlightSection}
                            className="max-w-none pb-0" // Reset margin constraints as Layout handles it
                        />
                    </div>
                </ReportLayout>
            )}
        </div>
    );
}
