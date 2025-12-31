"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { getUnlockContext, clearUnlockContext } from "@/lib/unlock/unlockContext";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import InputPanel from "@/components/workspace/InputPanel";
import ReportPanel from "@/components/workspace/ReportPanel";
import HistorySidebar from "@/components/workspace/HistorySidebar";
import PaywallModal from "@/components/workspace/PaywallModal";
import SaveReportPrompt from "@/components/workspace/SaveReportPrompt";
import AuthModal from "@/components/shared/AuthModal";
import { createResumeFeedback, streamResumeFeedback, parseResume, streamLinkedInFeedback } from "@/lib/api";
import { toast } from "sonner";
import { Linkedin, Plus, ArrowRight } from "lucide-react";
import { Analytics } from "@/lib/analytics";
import { ModeSwitcher, type ReviewMode } from "@/components/workspace/ModeSwitcher";
import { LinkedInInputPanel } from "@/components/linkedin/LinkedInInputPanel";
import { LinkedInReportPanel } from "@/components/linkedin/LinkedInReportPanel";
import { LinkedInReportTOC } from "@/components/linkedin/LinkedInReportTOC";
import { ReportLayout } from "@/components/layout/ReportLayout";

export default function WorkspaceClient() {
    const searchParams = useSearchParams();
    const { user, signOut, refreshUser } = useAuth();
    const [resumeText, setResumeText] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [report, setReport] = useState<any>(null);
    const [skipSample, setSkipSample] = useState(false);
    const [freeUsesRemaining, setFreeUsesRemaining] = useState(2);

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
    const [authContext, setAuthContext] = useState<"default" | "report">("default");
    const [pendingRunAfterAuth, setPendingRunAfterAuth] = useState(false);
    const [isSavePromptOpen, setIsSavePromptOpen] = useState(false);
    const [pendingReportForSave, setPendingReportForSave] = useState<any>(null);

    // Unlock experience state
    const [unlockStatus, setUnlockStatus] = useState<'pending' | 'complete' | 'error' | null>(null);
    const [justUnlocked, setJustUnlocked] = useState(false);
    const [highlightSection, setHighlightSection] = useState<string | null>(null);

    // Ref to track just-completed auth (prevents race condition in handleRun)
    const justCompletedAuthRef = useRef(false);

    // Ref to track pending auto-run from landing page
    const pendingAutoRunRef = useRef(false);

    // Check for pending text from homepage upload
    useEffect(() => {
        const pendingText = sessionStorage.getItem("pending_resume_text");
        const autoRun = sessionStorage.getItem("pending_auto_run");

        if (pendingText) {
            setResumeText(pendingText);
            sessionStorage.removeItem("pending_resume_text");
            sessionStorage.removeItem("pending_auto_run");
            setSkipSample(true); // Don't show sample if user came with text

            // Set flag for auto-run (will be triggered when resumeText state updates)
            if (autoRun === "true") {
                pendingAutoRunRef.current = true;
            }
        }

        // Check for mode query param (e.g., ?mode=linkedin)
        const modeParam = searchParams.get("mode");
        if (modeParam === "linkedin") {
            setReviewMode("linkedin");
        }
    }, [searchParams]);

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

    // Load sample report ONLY if explicitly requested via ?sample=true
    // By default, show the upload state so users can run their own report
    useEffect(() => {
        const sampleParam = searchParams.get("sample");

        // Only load sample if explicitly requested
        if (sampleParam === "true" && !report && !skipSample) {
            fetch("/sample-report.json")
                .then(res => res.json())
                .then(data => setReport(data))
                .catch(err => console.error("Failed to load sample report:", err));
        }
    }, [searchParams, report, skipSample]);

    // Handle successful payment redirect
    useEffect(() => {
        const paymentStatus = searchParams.get("payment");
        const sessionId = searchParams.get("session_id");
        const tier = searchParams.get("tier");

        if (paymentStatus === "success" && sessionId) {
            const confirmPurchase = async () => {
                const startTime = Date.now();
                setUnlockStatus("pending");

                // Progressive loading: update copy after 4s to reduce anxiety
                const progressiveTimeout = setTimeout(() => {
                    toast.loading("Still unlocking… this can take a moment.", { id: "unlock-progress" });
                }, 4000);

                try {
                    const res = await fetch("/api/billing/confirm", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sessionId })
                    });
                    const data = await res.json();
                    clearTimeout(progressiveTimeout);
                    toast.dismiss("unlock-progress");

                    const latency = Date.now() - startTime;

                    if (data.ok) {
                        setUnlockStatus("complete");
                        setJustUnlocked(true);

                        // Track analytics
                        Analytics.unlockConfirmCompleted("success", latency);

                        // Handle auto-scroll based on context
                        const ctx = getUnlockContext();
                        if (ctx) {
                            setHighlightSection(ctx.section);
                            Analytics.unlockUiRevealed(ctx.section, latency);

                            // Clear context after a delay to allow UI to react
                            setTimeout(() => {
                                setHighlightSection(null);
                                clearUnlockContext();
                            }, 3000);

                            // Scroll to section after a short delay to let report render fully
                            setTimeout(() => {
                                const sectionId = `section-${ctx.section.replace('_', '-')}`;
                                const el = document.getElementById(sectionId);
                                if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }, 300);
                        } else {
                            // No unlock context – unexpected flow (purchased from pricing page, deep link)
                            Analytics.unlockContextMissing();
                        }

                        // Refresh user to get latest entitlements
                        await refreshUser?.();

                        // Clean URL params
                        window.history.replaceState({}, "", "/workspace");

                        // Fire toast AFTER content is visible for psychological reinforcement
                        setTimeout(() => {
                            toast.success("Unlocked: Full Review", {
                                description: "Rewrites, Missing Wins, and export are now available.",
                                duration: 5000
                            });
                        }, 400);
                    } else {
                        setUnlockStatus("error");
                        Analytics.unlockConfirmCompleted("error", latency);
                        toast.error("Confirmation pending", {
                            description: "Your payment was successful but we're still unlocking your review. Please refresh in a moment."
                        });
                    }
                } catch (err) {
                    clearTimeout(progressiveTimeout);
                    toast.dismiss("unlock-progress");
                    setUnlockStatus("error");
                    const latency = Date.now() - startTime;
                    Analytics.unlockConfirmCompleted("error", latency);
                    console.error("Confirmation error:", err);
                }
            };

            confirmPurchase();
        }
    }, [searchParams, refreshUser]);

    const handleFileSelect = useCallback(async (file: File) => {
        console.log("[WorkspaceClient] handleFileSelect called with:", file.name, file.type);
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("file", file);

            const result = await parseResume(formData);
            console.log("[WorkspaceClient] parseResume result:", result);
            if (result.ok && result.text) {
                setResumeText(result.text);
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

        // GATE: Require authentication before running report
        // Skip if we just completed auth (ref prevents race condition with user state)
        if (!user && !justCompletedAuthRef.current) {
            setAuthContext("report");
            setPendingRunAfterAuth(true);
            setIsAuthOpen(true);
            Analytics.authGateViewed("free_report");
            return;
        }
        // Reset the ref after using it
        justCompletedAuthRef.current = false;

        // Check if free uses exhausted (and user doesn't have active pass)
        if (freeUsesRemaining <= 0) {
            setIsPaywallOpen(true);
            Analytics.paywallViewed("free_uses_exhausted");
            return;
        }

        setIsLoading(true);
        setIsStreaming(true);
        setReport(null);
        Analytics.reportStarted(!!jobDescription.trim());

        // REPORT BUFFERING LOGIC
        // We enforce a minimum "Theater Duration" of 10s so the user sees the scanning animation.
        // During this time, we capture the report in a ref but do NOT show it.
        const theaterDurationMs = 10000;
        const startTime = Date.now();
        let isTheaterOver = false;
        let bufferedReport: any = null;

        try {
            console.log("[WorkspaceClient] Calling streamResumeFeedback...");

            // Start the "Theater Timer"
            setTimeout(() => {
                isTheaterOver = true;
                // If we have a buffered report ready, show it now
                if (bufferedReport) {
                    console.log("[WorkspaceClient] Theater over, revealing buffered report");
                    setReport(bufferedReport);
                }
            }, theaterDurationMs);

            const result = await streamResumeFeedback(
                resumeText,
                jobDescription || undefined,
                (partialJson, partialReport) => {
                    // Update report with partial data as it arrives
                    if (partialReport) {
                        if (isTheaterOver) {
                            // If theater is over, show immediately
                            setReport(partialReport);
                        } else {
                            // If theater is still running, just buffer it
                            bufferedReport = partialReport;
                        }
                    }
                }
            );
            console.log("[WorkspaceClient] streamResumeFeedback result:", result);

            if (result.ok && result.report) {
                console.log("[WorkspaceClient] Setting final report:", result.report);
                // Ensure we respect the theater timer even for the final result
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, theaterDurationMs - elapsed);

                setTimeout(async () => {
                    setReport(result.report);
                    setIsStreaming(false);
                    setIsLoading(false);
                    Analytics.reportCompleted(result.report?.score || 0);

                    // Refresh free status from API to sync with database
                    try {
                        const statusRes = await fetch("/api/free-status");
                        const statusData = await statusRes.json();
                        if (statusData.ok) {
                            setFreeUsesRemaining(statusData.free_uses_left);
                        }
                        // Also refresh the global user object so nav/settings update
                        await refreshUser?.();
                    } catch (err) {
                        console.error("Failed to refresh free status:", err);
                        // Fallback to local decrement
                        setFreeUsesRemaining((prev) => Math.max(0, prev - 1));
                    }

                    // Show save prompt for guest users after report is generated
                    if (!user && result.report) {
                        setPendingReportForSave(result.report);
                        // Give user time to see their score before prompting (5 seconds)
                        setTimeout(() => {
                            Analytics.track('save_prompt_viewed', { score: result.report?.score || 0 });
                            setIsSavePromptOpen(true);
                        }, 5000);
                    }
                }, remaining);
            } else {
                // Error case - show immediately
                console.error("Failed to generate report:", result.message);
                toast.error("Failed to generate report", { description: `${result.message || "Unknown error"} · No credits consumed` });
                setIsLoading(false);
                setIsStreaming(false);
            }
        } catch (err) {
            console.error("Report generation error:", err);
            toast.error("Report generation error", { description: "Please try again. No credits consumed." });
            setIsLoading(false);
            setIsStreaming(false);
        }
        // Note: We handle setIsLoading(false) in the success timeout above
    }, [resumeText, jobDescription, freeUsesRemaining, user, refreshUser]);

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

    // LinkedIn handlers
    const handleLinkedInPdfSubmit = useCallback(async (pdfText: string) => {
        // Check auth gate first
        if (!user && !justCompletedAuthRef.current) {
            setAuthContext("report");
            setPendingRunAfterAuth(true);
            setIsAuthOpen(true);
            Analytics.authGateViewed('linkedin_review');
            return;
        }
        justCompletedAuthRef.current = false;

        // Check if free uses exhausted
        if (freeUsesRemaining <= 0) {
            setIsPaywallOpen(true);
            Analytics.paywallViewed('linkedin_free_exhausted');
            return;
        }

        setIsLoading(true);
        setIsStreaming(true);
        setLinkedInReport(null);
        Analytics.linkedInReviewStarted('pdf');

        const theaterDurationMs = 10000;
        const startTime = Date.now();
        let isTheaterOver = false;
        let bufferedReport: any = null;

        try {
            setTimeout(() => {
                isTheaterOver = true;
                if (bufferedReport) {
                    setLinkedInReport(bufferedReport);
                }
            }, theaterDurationMs);

            const result = await streamLinkedInFeedback(
                { pdfText, source: 'pdf' },
                (partialJson, partialReport) => {
                    if (partialReport) {
                        if (isTheaterOver) {
                            setLinkedInReport(partialReport);
                        } else {
                            bufferedReport = partialReport;
                        }
                    }
                },
                (meta) => {
                    if (meta.name) setLinkedInProfileName(meta.name);
                    if (meta.headline) setLinkedInProfileHeadline(meta.headline);
                }
            );

            if (result.ok && result.report) {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, theaterDurationMs - elapsed);

                setTimeout(async () => {
                    setLinkedInReport(result.report);
                    if (result.profile) {
                        setLinkedInProfileName(result.profile.name || '');
                        setLinkedInProfileHeadline(result.profile.headline || '');
                    }
                    setIsStreaming(false);
                    setIsLoading(false);
                    Analytics.linkedInReviewCompleted(result.report?.score || 0);

                    // Refresh free status
                    try {
                        const statusRes = await fetch("/api/free-status");
                        const statusData = await statusRes.json();
                        if (statusData.ok) {
                            setFreeUsesRemaining(statusData.free_uses_left);
                        }
                        await refreshUser?.();
                    } catch (err) {
                        console.error("Failed to refresh free status:", err);
                        setFreeUsesRemaining((prev) => Math.max(0, prev - 1));
                    }
                }, remaining);
            } else {
                console.error("Failed to generate LinkedIn report:", result.message);
                toast.error("Failed to analyze LinkedIn profile", { description: `${result.message || "Unknown error"} · No credits consumed` });
                setIsLoading(false);
                setIsStreaming(false);
            }
        } catch (err) {
            console.error("LinkedIn analysis error:", err);
            toast.error("LinkedIn analysis error", { description: "Please try again. No credits consumed." });
            setIsLoading(false);
            setIsStreaming(false);
        }
    }, [freeUsesRemaining, user, refreshUser]);

    const handleLinkedInUrlSubmit = useCallback(async (url: string) => {
        // URL flow - currently shows "coming soon" message
        toast.info("URL analysis coming soon", { description: "Please upload your LinkedIn PDF for now." });
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

    const handleLinkedInSample = useCallback(async () => {
        try {
            const res = await fetch("/sample-linkedin-report.json");
            const data = await res.json();
            setLinkedInReport(data);
            setLinkedInProfileName("Alex Thompson");
            setLinkedInProfileHeadline("Product Manager at TechCorp | Building Great Products");
            setReviewMode('linkedin');
        } catch (err) {
            console.error("Failed to load sample report:", err);
        }
    }, []);

    // PDF export state
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPdf = useCallback(async () => {
        if (!report) return;

        setIsExporting(true);
        try {
            const response = await fetch("/api/export-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ report }),
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

    // Fetch free status on mount
    useEffect(() => {
        fetch("/api/free-status")
            .then(res => res.json())
            .then(data => {
                if (data.free_uses_left !== undefined) {
                    setFreeUsesRemaining(data.free_uses_left);
                }
            })
            .catch(err => console.error("Failed to fetch free status:", err));
    }, []);


    return (
        <>
            <main className="h-screen max-h-screen flex flex-col bg-body overflow-hidden">
                <h1 className="sr-only">Resume Workspace — Analyze Your Resume</h1>

                <WorkspaceHeader
                    user={user}
                    onNewReport={handleNewReport}
                    onResumeSample={handleResumeSample}
                    onLinkedInSample={handleLinkedInSample}
                    onSignIn={() => setIsAuthOpen(true)}
                    onSignOut={signOut}
                    onHistory={() => setIsHistoryOpen(true)}
                    showBack={!!report || !!linkedInReport}
                    onBack={handleNewReport}
                />

                <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
                    {/* Mode Switcher - show only when no report is displayed */}
                    {!report && !linkedInReport && (
                        <div className="flex justify-center py-4 bg-body border-b border-border">
                            <ModeSwitcher
                                mode={reviewMode}
                                onModeChange={setReviewMode}
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    {/* Content Area - Mode-aware */}
                    {reviewMode === 'resume' ? (
                        // Resume Mode
                        <>
                            {!report ? (
                                <div className="h-full overflow-y-auto bg-muted/10">
                                    <InputPanel
                                        resumeText={resumeText}
                                        jobDescription={jobDescription}
                                        onResumeTextChange={setResumeText}
                                        onJobDescChange={setJobDescription}
                                        onFileSelect={handleFileSelect}
                                        onRun={handleRun}
                                        isLoading={isLoading}
                                        freeUsesRemaining={freeUsesRemaining}
                                        user={user}
                                        onSampleReport={handleResumeSample}
                                    />
                                </div>
                            ) : (
                                <ReportPanel
                                    report={report}
                                    isLoading={isLoading}
                                    hasJobDescription={!!jobDescription.trim()}
                                    onExportPdf={handleExportPdf}
                                    isExporting={isExporting}
                                    isSample={searchParams.get("sample") === "true" || (!skipSample && !resumeText.trim())}
                                    onNewReport={handleNewReport}
                                    freeUsesRemaining={freeUsesRemaining}
                                    onUpgrade={() => setIsPaywallOpen(true)}
                                    isGated={false}
                                    justUnlocked={justUnlocked}
                                />
                            )}
                        </>
                    ) : (
                        // LinkedIn Mode
                        <>
                            {!linkedInReport ? (
                                <div className="h-full overflow-y-auto bg-muted/10">
                                    <div className="flex justify-center p-6 md:p-12 min-h-full">
                                        <div className="w-full max-w-xl space-y-6">
                                            {/* Hero Header - matches Resume mode */}
                                            <div className="text-center space-y-2 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-tight">
                                                    This is what they see.
                                                </h1>
                                                <div className="flex items-center justify-center gap-2 text-muted-foreground pt-2">
                                                    <Linkedin className="w-5 h-5 text-brand" />
                                                    <p className="text-lg font-medium">3 seconds on your LinkedIn profile.</p>
                                                </div>
                                            </div>

                                            <LinkedInInputPanel
                                                onUrlSubmit={handleLinkedInUrlSubmit}
                                                onPdfSubmit={handleLinkedInPdfSubmit}
                                                isLoading={isLoading}
                                                freeUsesRemaining={freeUsesRemaining}
                                                user={user}
                                                onSampleReport={handleLinkedInSample}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full overflow-y-auto bg-body relative group">
                                    {/* Background texture to match Resume report */}
                                    <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-[0.015] pointer-events-none mix-blend-overlay" />

                                    <ReportLayout
                                        toc={<LinkedInReportTOC score={linkedInReport.score} />}
                                    >
                                        {/* Header matching Resume report structure */}
                                        <div className="space-y-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                <div className="space-y-1 min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <h1 className="text-xl sm:text-2xl font-serif font-semibold text-foreground tracking-tight truncate">
                                                            {linkedInProfileName || 'LinkedIn Report'}
                                                        </h1>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">This is what a recruiter sees on your LinkedIn profile.</p>
                                                </div>

                                                {/* Action Buttons matching Resume */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {freeUsesRemaining > 0 && (
                                                        <button
                                                            onClick={handleNewReport}
                                                            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium bg-brand text-white hover:bg-brand/90 transition-colors"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            <span className="hidden sm:inline">Run Another</span>
                                                            <span className="sm:hidden">New</span>
                                                        </button>
                                                    )}
                                                    {freeUsesRemaining <= 0 && (
                                                        <button
                                                            onClick={() => setIsPaywallOpen(true)}
                                                            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium bg-premium text-white hover:bg-premium/90 transition-colors"
                                                        >
                                                            <span className="hidden sm:inline">Get More Reviews</span>
                                                            <span className="sm:hidden">Upgrade</span>
                                                            <ArrowRight className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <LinkedInReportPanel
                                                report={linkedInReport}
                                                profileName={linkedInProfileName}
                                                profileHeadline={linkedInProfileHeadline}
                                                isSample={false}
                                                onNewReport={handleNewReport}
                                                freeUsesRemaining={freeUsesRemaining}
                                                onUpgrade={() => setIsPaywallOpen(true)}
                                            />
                                        </div>
                                    </ReportLayout>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>


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
                    console.log("Load report:", reportId);
                    setIsHistoryOpen(false);
                    setIsLoading(true);
                    setSkipSample(true); // Prevent "Example" badge on historical reports
                    try {
                        const res = await fetch(`/api/reports/${reportId}`);
                        const data = await res.json();
                        if (data.ok && data.report) {
                            setReport(data.report);
                        } else {
                            console.error("Failed to load report:", data.message);
                            toast.error("Failed to load report", { description: data.message || "Unknown error" });
                        }
                    } catch (err) {
                        console.error("Report load error:", err);
                        toast.error("Failed to load report");
                    } finally {
                        setIsLoading(false);
                    }
                }}
            />

            {/* Paywall Modal */}
            <PaywallModal
                isOpen={isPaywallOpen}
                onClose={() => setIsPaywallOpen(false)}
                creditsRemaining={freeUsesRemaining}
                onSuccess={() => {
                    setIsPaywallOpen(false);
                    // Refresh free uses count
                }}
            />

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => {
                    setIsAuthOpen(false);
                    setPendingRunAfterAuth(false);
                    setAuthContext("default");
                }}
                context={authContext}
                onSuccess={async () => {
                    await refreshUser();
                    setIsAuthOpen(false);

                    // If user was trying to run a report, auto-trigger it now
                    if (pendingRunAfterAuth) {
                        setPendingRunAfterAuth(false);
                        setAuthContext("default");
                        // Set ref to skip auth check (prevents race condition with user state)
                        justCompletedAuthRef.current = true;
                        // Small delay to let modal close animation complete
                        setTimeout(() => {
                            // Use ref to get latest handleRun (avoids stale closure)
                            handleRunRef.current();
                        }, 100);
                    }
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
