"use client";

import { useState, useCallback, useEffect } from "react";
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
import { createResumeFeedback, streamResumeFeedback, parseResume } from "@/lib/api";
import { toast } from "sonner";
import { Analytics } from "@/lib/analytics";

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

    // History sidebar, paywall modal, auth modal, and save prompt state
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isSavePromptOpen, setIsSavePromptOpen] = useState(false);
    const [pendingReportForSave, setPendingReportForSave] = useState<any>(null);

    // Unlock experience state
    const [unlockStatus, setUnlockStatus] = useState<'pending' | 'complete' | 'error' | null>(null);
    const [justUnlocked, setJustUnlocked] = useState(false);
    const [highlightSection, setHighlightSection] = useState<string | null>(null);

    // Check for pending text from homepage upload
    useEffect(() => {
        const pendingText = sessionStorage.getItem("pending_resume_text");
        if (pendingText) {
            setResumeText(pendingText);
            sessionStorage.removeItem("pending_resume_text");
            setSkipSample(true); // Don't show sample if user came with text
        }
    }, []);

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

                setTimeout(() => {
                    setReport(result.report);
                    setFreeUsesRemaining((prev) => Math.max(0, prev - 1));
                    setIsStreaming(false);
                    setIsLoading(false);
                    Analytics.reportCompleted(result.report?.score || 0);

                    // Show save prompt for guest users after report is generated
                    if (!user && result.report) {
                        setPendingReportForSave(result.report);
                        // Small delay to let user see their report first
                        setTimeout(() => setIsSavePromptOpen(true), 2000);
                    }
                }, remaining);
            } else {
                // Error case - show immediately
                console.error("Failed to generate report:", result.message);
                toast.error("Failed to generate report", { description: result.message || "Unknown error" });
                setIsLoading(false);
                setIsStreaming(false);
            }
        } catch (err) {
            console.error("Report generation error:", err);
            toast.error("Report generation error", { description: "Please try again." });
            setIsLoading(false);
            setIsStreaming(false);
        }
        // Note: We handle setIsLoading(false) in the success timeout above
    }, [resumeText, jobDescription, freeUsesRemaining]);

    const handleNewReport = useCallback(() => {
        setSkipSample(true);
        setResumeText("");
        setJobDescription("");
        setReport(null);
        // Remove sample param so it doesn't auto-load again
        if (window?.history) {
            window.history.replaceState({}, "", "/workspace");
        }
    }, []);

    const handleSampleReport = useCallback(async () => {
        // Load sample report
        try {
            const res = await fetch("/sample-report.json");
            const data = await res.json();
            setReport(data);
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
                    onSampleReport={handleSampleReport}
                    onSignIn={() => setIsAuthOpen(true)}
                    onSignOut={signOut}
                    onHistory={() => setIsHistoryOpen(true)}
                    showBack={!!report}
                    onBack={handleNewReport}
                />

                <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
                    {/* View Switcher: Input vs Report */}
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
                            isGated={!(searchParams.get("sample") === "true" || (!skipSample && !resumeText.trim()))}
                            justUnlocked={justUnlocked}
                        />
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
                onClose={() => setIsAuthOpen(false)}
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
