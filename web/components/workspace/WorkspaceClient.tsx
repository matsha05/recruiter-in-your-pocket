"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import HistorySidebar from "@/components/workspace/HistorySidebar";
import PaywallModal from "@/components/workspace/PaywallModal";
import SaveReportPrompt from "@/components/workspace/SaveReportPrompt";
import AuthModal from "@/components/shared/AuthModal";
import { streamResumeFeedback, parseResume } from "@/lib/api";
import { toast } from "sonner";
import { Analytics } from "@/lib/analytics";
import { useCommandAction, CommandAction } from "@/components/CommandPalette";
import { ModeSwitcher, type ReviewMode } from "@/components/workspace/ModeSwitcher";
import ResumeModeSection from "@/components/workspace/ResumeModeSection";
import LinkedInModeSection from "@/components/workspace/LinkedInModeSection";
import { useWorkspaceInit } from "@/components/workspace/hooks/useWorkspaceInit";
import { useJobContextFromExtension, type LoadedJobContext } from "@/components/workspace/hooks/useJobContextFromExtension";
import { useSampleReport } from "@/components/workspace/hooks/useSampleReport";
import { useFreeStatus } from "@/components/workspace/hooks/useFreeStatus";
import { useLinkedInReview } from "@/components/workspace/hooks/useLinkedInReview";
import { getUnlockContext, clearUnlockContext, type UnlockSection } from "@/lib/unlock/unlockContext";

export default function WorkspaceClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, refreshUser } = useAuth();
    const [resumeText, setResumeText] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [report, setReport] = useState<any>(null);
    const [skipSample, setSkipSample] = useState(false);
    const [freeUsesRemaining, setFreeUsesRemaining] = useState(1);
    const [analysisStartedAt, setAnalysisStartedAt] = useState<number | null>(null);
    const [analysisMode, setAnalysisMode] = useState<"resume" | "linkedin">("resume");
    const [lastLinkedInPdf, setLastLinkedInPdf] = useState<string | null>(null);

    // Mode switcher state (Resume vs LinkedIn)
    const [reviewMode, setReviewMode] = useState<ReviewMode>('resume');

    // LinkedIn-specific state
    const [linkedInReport, setLinkedInReport] = useState<any>(null);
    const [linkedInProfileName, setLinkedInProfileName] = useState<string>('');
    const [linkedInProfileHeadline, setLinkedInProfileHeadline] = useState<string>('');

    // History sidebar, paywall modal, auth modal, and save prompt state
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isSavePromptOpen, setIsSavePromptOpen] = useState(false);
    const [pendingReportForSave, setPendingReportForSave] = useState<any>(null);
    const [justUnlocked, setJustUnlocked] = useState(false);
    const [highlightSection, setHighlightSection] = useState<string | null>(null);

    // Job context from extension capture (when accessing via ?job=id)
    const [loadedJobContext, setLoadedJobContext] = useState<LoadedJobContext | null>(null);

    // Ref to track pending auto-run from landing page
    const pendingAutoRunRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    useWorkspaceInit({
        searchParams,
        setResumeText,
        setSkipSample,
        setReviewMode,
        pendingAutoRunRef
    });

    useJobContextFromExtension({
        searchParams,
        setJobDescription,
        setLoadedJobContext,
        setSkipSample
    });

    // Ref to store latest handleRun (avoids circular dependency with resumeText)
    const handleRunRef = useRef<() => void>(() => { });

    // Auto-run when resumeText is set from landing page
    useEffect(() => {
        if (pendingAutoRunRef.current && resumeText.trim()) {
            pendingAutoRunRef.current = false;
            // Small delay to ensure component is fully mounted
            setTimeout(() => {
                handleRunRef.current();
            }, 100);
        }
    }, [resumeText]);

    useSampleReport({
        searchParams,
        report,
        skipSample,
        setReport
    });

    const { refreshFreeStatus } = useFreeStatus({ refreshUser, setFreeUsesRemaining });

    const beginAnalysis = useCallback((mode: "resume" | "linkedin") => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;
        setAnalysisMode(mode);
        setAnalysisStartedAt(Date.now());
        return controller;
    }, []);

    const endAnalysis = useCallback(() => {
        setAnalysisStartedAt(null);
        abortControllerRef.current = null;
    }, []);

    const handleCancelAnalysis = useCallback((silent?: boolean) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsLoading(false);
        setIsStreaming(false);
        setAnalysisStartedAt(null);
        if (!silent) {
            toast.info("Analysis canceled");
        }
    }, []);

    const { handleLinkedInPdfSubmit, handleLinkedInUrlSubmit, handleLinkedInSample } = useLinkedInReview({
        user,
        freeUsesRemaining,
        refreshFreeStatus,
        setIsPaywallOpen,
        setIsLoading,
        setIsStreaming,
        setLinkedInReport,
        setLinkedInProfileName,
        setLinkedInProfileHeadline,
        setReviewMode,
        beginAnalysis,
        endAnalysis,
        setLastLinkedInPdf
    });

    const handleFileSelect = useCallback(async (file: File) => {
        console.log("[WorkspaceClient] handleFileSelect called with:", file.name, file.type);
        try {
            Analytics.track("workspace_upload_started", {
                source: "workspace",
                file_type: file.type || "unknown",
                file_size_bytes: file.size
            });
            setIsLoading(true);
            const formData = new FormData();
            formData.append("file", file);

            const result = await parseResume(formData);
            console.log("[WorkspaceClient] parseResume result:", result);
            if (result.ok && result.text) {
                setResumeText(result.text);
                Analytics.track("workspace_upload_succeeded", {
                    source: "workspace",
                    file_type: file.type || "unknown",
                    file_size_bytes: file.size,
                    extracted_chars: result.text.length
                });
                Analytics.resumeUploaded("workspace");
            } else {
                console.error("Failed to parse resume:", result.message);
                toast.error("Failed to parse resume", { description: result.message || "Unknown error" });
            }
        } catch (err) {
            console.error("File parsing error:", err);
            toast.error("File parsing error", { description: "Please try another file." });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleRun = useCallback(async () => {
        console.log("[WorkspaceClient] handleRun called, resumeText length:", resumeText.length);
        if (!resumeText.trim()) return;
        const hasPaidAccess = Boolean(user?.membership && user.membership !== "free");

        // Check if free uses exhausted (and user doesn't have active pass)
        if (freeUsesRemaining <= 0 && !hasPaidAccess) {
            setIsPaywallOpen(true);
            Analytics.paywallViewed("free_uses_exhausted");
            return;
        }

        setIsLoading(true);
        setIsStreaming(true);
        setReport(null);
        const controller = beginAnalysis("resume");
        Analytics.reportStarted(!!jobDescription.trim());
        Analytics.track("report_stream_started", {
            has_jd: !!jobDescription.trim(),
            mode: "resume"
        });

        try {
            console.log("[WorkspaceClient] Calling streamResumeFeedback...");
            const streamStartedAt = Date.now();
            let firstMeaningfulTracked = false;

            const result = await streamResumeFeedback(
                resumeText,
                jobDescription || undefined,
                (partialJson, partialReport) => {
                    if (partialReport) {
                        setReport(partialReport);
                        const hasMeaningfulOutput = Boolean(
                            partialReport.score || partialReport.summary || partialReport.first_impression
                        );
                        if (!firstMeaningfulTracked && hasMeaningfulOutput) {
                            firstMeaningfulTracked = true;
                            Analytics.track("report_first_meaningful_chunk_rendered", {
                                mode: "resume",
                                latency_ms: Date.now() - streamStartedAt,
                                has_score: typeof partialReport.score === "number"
                            });
                        }
                        // Reveal meaningful partial output as soon as we have it.
                        if (isLoading && (partialReport.score || partialReport.summary || partialReport.first_impression)) {
                            setIsLoading(false);
                        }
                    }
                },
                "resume",
                { signal: controller.signal }
            );
            console.log("[WorkspaceClient] streamResumeFeedback result:", result);

            if (result.aborted) {
                setIsLoading(false);
                setIsStreaming(false);
                endAnalysis();
                return;
            }

            if (result.ok && result.report) {
                console.log("[WorkspaceClient] Setting final report:", result.report);
                setReport(result.report);
                setIsStreaming(false);
                setIsLoading(false);
                endAnalysis();
                Analytics.reportCompleted(result.report?.score || 0);

                await refreshFreeStatus({
                    fallbackDecrement: true,
                    includeUserRefresh: true,
                    requireOk: true
                });

                // Show save prompt for guest users after report is generated
                if (!user && result.report) {
                    setPendingReportForSave(result.report);
                    setTimeout(() => {
                        Analytics.track('save_prompt_viewed', { score: result.report?.score || 0 });
                        setIsSavePromptOpen(true);
                    }, 5000);
                }
            } else {
                // Error case - show immediately
                console.error("Failed to generate report:", result.message);
                toast.error("Failed to generate report", { description: `${result.message || "Unknown error"} · No credits consumed` });
                setIsLoading(false);
                setIsStreaming(false);
                endAnalysis();
            }
        } catch (err) {
            console.error("Report generation error:", err);
            toast.error("Report generation error", { description: "Please try again. No credits consumed." });
            setIsLoading(false);
            setIsStreaming(false);
            endAnalysis();
        }
    }, [resumeText, jobDescription, freeUsesRemaining, user, refreshFreeStatus, isLoading, beginAnalysis, endAnalysis]);

    // Keep ref in sync with latest handleRun
    handleRunRef.current = handleRun;

    const handleNewReport = useCallback(() => {
        setSkipSample(true);
        setResumeText("");
        setJobDescription("");
        setReport(null);
        // Clear LinkedIn state too
        setLinkedInReport(null);
        setLinkedInProfileName('');
        setLinkedInProfileHeadline('');
        // Remove sample param so it doesn't auto-load again
        if (window?.history) {
            window.history.replaceState({}, "", "/workspace");
        }
    }, []);

    const handleResumeSample = useCallback(async () => {
        try {
            const res = await fetch("/sample-report.json");
            const data = await res.json();
            setReport(data);
            setReviewMode('resume');
        } catch (err) {
            console.error("Failed to load sample report:", err);
        }
    }, []);

    const handleRetryAnalysis = useCallback(() => {
        if (analysisMode === "resume") {
            handleCancelAnalysis(true);
            handleRunRef.current();
            return;
        }
        if (analysisMode === "linkedin") {
            if (!lastLinkedInPdf) {
                toast.message("Retry unavailable", { description: "Please re-upload your LinkedIn PDF." });
                return;
            }
            handleCancelAnalysis(true);
            handleLinkedInPdfSubmit(lastLinkedInPdf);
        }
    }, [analysisMode, handleCancelAnalysis, lastLinkedInPdf, handleLinkedInPdfSubmit]);

    // PDF export state
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPdf = useCallback(async (overrideReport?: any) => {
        const payload = overrideReport || report;
        if (!payload) return;

        setIsExporting(true);
        try {
            const response = await fetch("/api/export-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ report: payload }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                toast.error(error.message || "Failed to export PDF");
                return;
            }

            // Download PDF
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "resume-report.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("PDF export error:", err);
            toast.error("Failed to export PDF");
        } finally {
            setIsExporting(false);
        }
    }, [report]);

    // Handle Command Palette actions
    useCommandAction((action: CommandAction) => {
        switch (action) {
            case 'export-pdf':
                if (report) handleExportPdf();
                break;
            case 'copy-link':
                // Copy current URL to clipboard
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard');
                break;
            case 'upload':
                // Focus on file input or trigger file dialog
                toast.info('Drop your resume file to upload');
                break;
            case 'run-analysis':
                handleRun();
                break;
            case 'keyboard-shortcuts':
                toast.info('Keyboard shortcuts: Cmd+K to open commands');
                break;
        }
    });

    const hasPaidAccess = Boolean(user?.membership && user.membership !== "free");
    const effectiveUsesRemaining = hasPaidAccess ? Math.max(freeUsesRemaining, 1) : freeUsesRemaining;

    useEffect(() => {
        if (!hasPaidAccess) return;
        if (!report) return;

        const context = getUnlockContext();
        if (!context?.section) return;

        const sectionMap: Record<UnlockSection, string | null> = {
            evidence_ledger: "section-evidence-ledger",
            bullet_upgrades: "section-bullet-upgrades",
            missing_wins: "section-missing-wins",
            job_alignment: "section-job-alignment",
            export_pdf: null
        };

        setJustUnlocked(true);
        setHighlightSection(context.section);
        Analytics.unlockUiRevealed(context.section, Date.now() - context.timestamp);

        const targetId = sectionMap[context.section];
        if (targetId) {
            setTimeout(() => {
                const el = document.getElementById(targetId);
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 350);
        }

        clearUnlockContext();

        const highlightTimer = setTimeout(() => setHighlightSection(null), 3500);
        const bannerTimer = setTimeout(() => setJustUnlocked(false), 6500);
        return () => {
            clearTimeout(highlightTimer);
            clearTimeout(bannerTimer);
        };
    }, [hasPaidAccess, report]);

    const isSampleReport = searchParams.get("sample") === "true" || (!skipSample && !resumeText.trim());

    return (
        <>
            <section aria-label="Workspace" className="h-full flex flex-col bg-body overflow-hidden">
                <h1 className="sr-only">Resume Workspace — Analyze Your Resume</h1>

                <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
                    {/* Mode Switcher - show only when no report is displayed */}
                    {!report && !linkedInReport && (
                        <div className="flex justify-center py-4 bg-body border-b border-border">
                            <ModeSwitcher
                                mode={reviewMode}
                                onModeChange={setReviewMode}
                                disabled={isLoading || isStreaming}
                            />
                        </div>
                    )}

                    {/* Content Area - Mode-aware */}
                    {reviewMode === 'resume' ? (
                        <ResumeModeSection
                            report={report}
                            isLoading={isLoading}
                            isStreaming={isStreaming}
                            resumeText={resumeText}
                            jobDescription={jobDescription}
                            onResumeTextChange={setResumeText}
                            onJobDescChange={setJobDescription}
                            onFileSelect={handleFileSelect}
                            onRun={handleRun}
                            freeUsesRemaining={effectiveUsesRemaining}
                            user={user}
                            onSampleReport={handleResumeSample}
                            loadedJobContext={loadedJobContext}
                            onExportPdf={handleExportPdf}
                            isExporting={isExporting}
                            isSample={isSampleReport}
                            onNewReport={handleNewReport}
                            onUpgrade={() => setIsPaywallOpen(true)}
                            justUnlocked={justUnlocked}
                            highlightSection={highlightSection}
                            hasPaidAccess={hasPaidAccess}
                            analysisStartedAt={analysisStartedAt}
                            onCancelAnalysis={() => handleCancelAnalysis()}
                            onRetryAnalysis={handleRetryAnalysis}
                        />
                    ) : (
                        <LinkedInModeSection
                            linkedInReport={linkedInReport}
                            linkedInProfileName={linkedInProfileName}
                            linkedInProfileHeadline={linkedInProfileHeadline}
                            isLoading={isLoading}
                            isStreaming={isStreaming}
                            freeUsesRemaining={effectiveUsesRemaining}
                            user={user}
                            onUrlSubmit={handleLinkedInUrlSubmit}
                            onPdfSubmit={handleLinkedInPdfSubmit}
                            onSampleReport={handleLinkedInSample}
                            onNewReport={handleNewReport}
                            onUpgrade={() => setIsPaywallOpen(true)}
                            analysisStartedAt={analysisStartedAt}
                            onCancelAnalysis={() => handleCancelAnalysis()}
                            onRetryAnalysis={handleRetryAnalysis}
                        />
                    )}
                </div>
            </section>


            {/* History Sidebar */}
            <HistorySidebar
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                user={user ? { email: user.email || undefined } : null}
                onSignIn={() => {
                    setIsHistoryOpen(false);
                    setIsAuthOpen(true);
                }}
                onLoadReport={async (reportId) => {
                    setIsHistoryOpen(false);
                    router.push(`/reports/${reportId}`);
                }}
            />

            {/* Paywall Modal */}
            <PaywallModal
                isOpen={isPaywallOpen}
                onClose={() => setIsPaywallOpen(false)}
                creditsRemaining={freeUsesRemaining}
            />

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => {
                    setIsAuthOpen(false);
                }}
                context="default"
                onSuccess={async () => {
                    await refreshUser();
                    setIsAuthOpen(false);
                }}
            />

            {/* Save Report Prompt for Guests */}
            <SaveReportPrompt
                isOpen={isSavePromptOpen}
                onClose={() => setIsSavePromptOpen(false)}
                report={pendingReportForSave}
                onSuccess={(email) => {
                    // Could refresh user or show sign-in prompt
                    toast.success("Report saved! Check your email for access.");
                }}
            />
        </>
    );
}
