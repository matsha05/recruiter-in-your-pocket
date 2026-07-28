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
import { isSampleParamEnabled, useSampleReport } from "@/components/workspace/hooks/useSampleReport";
import { useFreeStatus } from "@/components/workspace/hooks/useFreeStatus";
import { useLinkedInReview } from "@/components/workspace/hooks/useLinkedInReview";
import { getUnlockContext, clearUnlockContext, type UnlockSection } from "@/lib/unlock/unlockContext";
import { takeCheckoutWorkspaceState } from "@/lib/unlock/unlockContext";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import type { AuthContext } from "@/lib/auth/content";
import { buildPdfExportRequest } from "@/lib/reports/pdf-export";
import type { ReportData } from "@/components/workspace/report/ReportTypes";

const SAVED_JOB_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getPersistedSavedJobId(jobContext: LoadedJobContext | null) {
    return jobContext?.id && SAVED_JOB_ID_PATTERN.test(jobContext.id) ? jobContext.id : null;
}

export default function WorkspaceClient() {
    const { push, replace } = useRouter();
    const searchParams = useSearchParams();
    const getSearchParam = searchParams.get.bind(searchParams);
    const sampleParamEnabled = isSampleParamEnabled(getSearchParam("sample"));
    const { user, refreshUser } = useAuth();
    const [resumeText, setResumeText] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [report, setReport] = useState<any>(null);
    const [comparisonBaseline, setComparisonBaseline] = useState<ReportData | null>(null);
    const [skipSample, setSkipSample] = useState(false);
    const [freeUsesRemaining, setFreeUsesRemaining] = useState(1);
    const [analysisStartedAt, setAnalysisStartedAt] = useState<number | null>(null);
    const [analysisMode, setAnalysisMode] = useState<"resume" | "linkedin">("resume");
    const [lastLinkedInPdf, setLastLinkedInPdf] = useState<string | null>(null);
    const linkedInReviewEnabled = isLaunchFlagEnabled("linkedInReview");

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
    const [authContext, setAuthContext] = useState<AuthContext>("default");
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
        setResumeText,
        setJobDescription,
        setLoadedJobContext,
        setSkipSample,
        shouldHydrateDefaultResume: Boolean(user)
    });

    // Ref to store latest handleRun (avoids circular dependency with resumeText)
    const handleRunRef = useRef<() => void>(() => { });

    // Auto-run when resumeText is set from landing page
    useEffect(() => {
        if (pendingAutoRunRef.current && resumeText.trim()) {
            pendingAutoRunRef.current = false;
            // Small delay to ensure component is fully mounted
            const timer = setTimeout(() => {
                handleRunRef.current();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [resumeText]);

    useSampleReport({
        searchParams,
        report,
        skipSample,
        setReport
    });

    useEffect(() => {
        const restored = takeCheckoutWorkspaceState();
        if (!restored) return;
        setResumeText(restored.resumeText || "");
        setJobDescription(restored.jobDescription || "");
        setReport(restored.report);
        setSkipSample(true);
        toast.success("Your report is back", { description: "Checkout did not discard the read you were working from." });
    }, []);

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

    const saveReportForCurrentUser = useCallback(async (reportToSave: any) => {
        if (!reportToSave) return;

        const res = await fetch("/api/reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ report: reportToSave })
        });

        const result = await res.json();
        if (!result.ok) {
            throw new Error(result.message || "Failed to save report");
        }

        toast.success("Report saved to your history");
        setPendingReportForSave(null);
        setIsSavePromptOpen(false);
    }, []);

    const handleRequestSaveAuth = useCallback(() => {
        setIsSavePromptOpen(false);
        setAuthContext("report");
        setIsAuthOpen(true);
    }, []);

    const handleFileSelect = useCallback(async (file: File) => {
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
            if (result.ok && result.text) {
                setResumeText(result.text);
                Analytics.track("workspace_upload_succeeded", {
                    source: "workspace",
                    file_type: file.type || "unknown",
                    file_size_bytes: file.size,
                    extracted_chars: result.text.length
                });
                Analytics.resumeUploaded("workspace");
                return true;
            } else {
                console.error("Failed to parse resume:", result.message);
                toast.error("Failed to parse resume", { description: result.message || "Unknown error" });
                setResumeText("");
                return false;
            }
        } catch (err) {
            console.error("File parsing error:", err);
            toast.error("File parsing error", { description: "Please try another file." });
            setResumeText("");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const persistedSavedJobId = getPersistedSavedJobId(loadedJobContext);

    const handleRun = useCallback(async () => {
        if (!resumeText.trim()) {
            toast.error("Add your resume first", { description: "Upload a file or paste the resume text before creating the report." });
            return;
        }
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
                { signal: controller.signal, savedJobId: persistedSavedJobId }
            );
            if (result.aborted) {
                setIsLoading(false);
                setIsStreaming(false);
                endAnalysis();
                return;
            }

            if (result.ok && result.report) {
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
                if (!user && result.report && !isLaunchFlagEnabled("guestReportSave")) {
                    setPendingReportForSave(result.report);
                    setTimeout(() => {
                        Analytics.track('save_prompt_viewed', { score: result.report?.score || 0 });
                        setIsSavePromptOpen(true);
                    }, 5000);
                }
            } else {
                // Error case - show immediately
                console.error("Failed to generate report:", result.message);
                toast.error("Failed to generate report", { description: `${result.message || "Unknown error"} · Your free report was not used` });
                setIsLoading(false);
                setIsStreaming(false);
                endAnalysis();
            }
        } catch (err) {
            console.error("Report generation error:", err);
            toast.error("Report generation error", { description: "Please try again. Your free report was not used." });
            setIsLoading(false);
            setIsStreaming(false);
            endAnalysis();
        }
    }, [resumeText, jobDescription, persistedSavedJobId, freeUsesRemaining, user, refreshFreeStatus, isLoading, beginAnalysis, endAnalysis]);

    // Keep ref in sync with latest handleRun
    handleRunRef.current = handleRun;

    const handleNewReport = useCallback(() => {
        handleCancelAnalysis(true);
        setSkipSample(true);
        setResumeText("");
        setJobDescription("");
        setReport(null);
        setComparisonBaseline(null);
        // Clear LinkedIn state too
        setLinkedInReport(null);
        setLinkedInProfileName('');
        setLinkedInProfileHeadline('');
        // Use the Next router so useSearchParams updates before the sample hook can reload.
        replace("/workspace", { scroll: false });
    }, [handleCancelAnalysis, replace]);

    const handleStartRevision = useCallback(() => {
        if (!report) return;
        handleCancelAnalysis(true);
        setComparisonBaseline(report as ReportData);
        setSkipSample(true);
        setResumeText("");
        setJobDescription("");
        setReport(null);
        setLoadedJobContext(null);
        replace("/workspace?revision=1", { scroll: false });
    }, [handleCancelAnalysis, replace, report]);

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
        const requestBody = buildPdfExportRequest(payload);
        if (!requestBody) {
            toast.error("This report is missing some data. Please rerun it and try exporting again.");
            return;
        }

        setIsExporting(true);
        try {
            const response = await fetch("/api/export-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
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
                if (report && hasPaidAccess) {
                    handleExportPdf();
                } else if (report) {
                    setIsPaywallOpen(true);
                }
                break;
            case 'copy-link':
                // Copy current URL to clipboard
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard');
                break;
            case 'upload':
                document.querySelector<HTMLInputElement>('[data-testid="workspace-resume-file"]')?.click();
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
        window.dispatchEvent(new CustomEvent("riyp-report-visibility", {
            detail: { visible: Boolean(report || linkedInReport) }
        }));
        return () => {
            window.dispatchEvent(new CustomEvent("riyp-report-visibility", { detail: { visible: false } }));
        };
    }, [report, linkedInReport]);

    useEffect(() => {
        if (!linkedInReviewEnabled && reviewMode !== "resume") {
            setReviewMode("resume");
        }
    }, [linkedInReviewEnabled, reviewMode]);

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
                const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                el?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
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

    const isSampleReport = sampleParamEnabled || (!skipSample && !resumeText.trim());

    return (
        <>
            <section
                aria-label="Workspace"
                data-visual-anchor="workspace-shell"
                data-workspace-mode={reviewMode}
                className="workspace-product-shell flex flex-col overflow-hidden bg-body"
            >
                <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
                    {/* Mode Switcher - show only when no report is displayed */}
                    {linkedInReviewEnabled && !report && !linkedInReport && (
                        <div className="flex items-center justify-end border-b border-border bg-body px-5 py-2 md:px-8">
                            <ModeSwitcher
                                mode={reviewMode}
                                onModeChange={setReviewMode}
                                disabled={isLoading || isStreaming}
                            />
                        </div>
                    )}

                    {/* Content Area - Mode-aware */}
                    {!linkedInReviewEnabled || reviewMode === 'resume' ? (
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
                            onExportPdf={hasPaidAccess ? handleExportPdf : undefined}
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
                            comparisonBaseline={comparisonBaseline}
                            onStartRevision={handleStartRevision}
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
                    setAuthContext("history");
                    setIsAuthOpen(true);
                }}
                onLoadReport={async (reportId) => {
                    setIsHistoryOpen(false);
                    push(`/reports/${reportId}`);
                }}
            />

            {/* Paywall Modal */}
            <PaywallModal
                isOpen={isPaywallOpen}
                onClose={() => setIsPaywallOpen(false)}
                creditsRemaining={freeUsesRemaining}
                hasCurrentReport={Boolean(report)}
                workspaceState={report ? { report, resumeText, jobDescription } : null}
            />

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => {
                    setIsAuthOpen(false);
                    setAuthContext("default");
                }}
                context={authContext}
                onSuccess={async () => {
                    await refreshUser();
                    if (pendingReportForSave) {
                        try {
                            await saveReportForCurrentUser(pendingReportForSave);
                        } catch (error: any) {
                            toast.error(error?.message || "Failed to save report");
                        }
                    }
                    setIsAuthOpen(false);
                    setAuthContext("default");
                }}
            />

            {/* Save Report Prompt for Guests */}
            <SaveReportPrompt
                isOpen={isSavePromptOpen}
                onClose={() => setIsSavePromptOpen(false)}
                report={pendingReportForSave}
                onRequestAuth={handleRequestSaveAuth}
            />
        </>
    );
}
