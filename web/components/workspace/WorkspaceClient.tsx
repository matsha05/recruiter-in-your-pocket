"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import InputPanel from "@/components/workspace/InputPanel";
import ReportPanel from "@/components/workspace/ReportPanel";
import HistorySidebar from "@/components/workspace/HistorySidebar";
import PaywallModal from "@/components/workspace/PaywallModal";
import AuthModal from "@/components/shared/AuthModal";
import { createResumeFeedback, streamResumeFeedback, parseResume } from "@/lib/api";

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

    // History sidebar, paywall modal, and auth modal state
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    // Check for pending text from homepage upload
    useEffect(() => {
        const pendingText = sessionStorage.getItem("pending_resume_text");
        if (pendingText) {
            setResumeText(pendingText);
            sessionStorage.removeItem("pending_resume_text");
        }
    }, []);

    // Auto-load sample report if ?sample=true
    useEffect(() => {
        if (searchParams.get("sample") === "true" && !report && !skipSample) {
            fetch("/sample-report.json")
                .then(res => res.json())
                .then(data => setReport(data))
                .catch(err => console.error("Failed to load sample report:", err));
        }
    }, [searchParams, report, skipSample]);

    // Handle successful payment redirect
    useEffect(() => {
        const paymentStatus = searchParams.get("payment");
        const tier = searchParams.get("tier");

        if (paymentStatus === "success") {
            // Show success message
            const tierLabel = tier === "30d" ? "30-Day Campaign Pass" : "24-Hour Fix Pass";
            alert(`🎉 Payment successful! Your ${tierLabel} is now active.\n\nYou now have unlimited resume reviews. Log in to access your pass!`);

            // Clean URL params
            window.history.replaceState({}, "", "/workspace");

            // If not logged in, prompt to sign in
            if (!user) {
                setTimeout(() => {
                    setIsAuthOpen(true);
                }, 500);
            } else {
                // Refresh user to get updated pass status
                refreshUser?.();
            }
        }
    }, [searchParams, user, refreshUser]);

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
            } else {
                console.error("Failed to parse resume:", result.message);
                alert("Failed to parse resume: " + (result.message || "Unknown error"));
            }
        } catch (err) {
            console.error("File parsing error:", err);
            alert("File parsing error. Check console for details.");
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
            return;
        }

        setIsLoading(true);
        setIsStreaming(true);
        setReport(null);

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
                }, remaining);
            } else {
                // Error case - show immediately
                console.error("Failed to generate report:", result.message);
                alert("Failed to generate report: " + (result.message || "Unknown error"));
                setIsLoading(false);
                setIsStreaming(false);
            }
        } catch (err) {
            console.error("Report generation error:", err);
            alert("Report generation error. Check console for details.");
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
                alert(error.message || "Failed to export PDF");
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
            alert("Failed to export PDF");
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
                    user={user ? { email: user.email || undefined, firstName: user.firstName || undefined } : null}
                    onNewReport={handleNewReport}
                    onSampleReport={handleSampleReport}
                    onSignIn={() => setIsAuthOpen(true)}
                    onSignOut={signOut}
                    onHistory={() => setIsHistoryOpen(true)}
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
                            alert("Failed to load report: " + (data.message || "Unknown error"));
                        }
                    } catch (err) {
                        console.error("Report load error:", err);
                        alert("Failed to load report");
                    } finally {
                        setIsLoading(false);
                    }
                }}
            />

            {/* Paywall Modal */}
            <PaywallModal
                isOpen={isPaywallOpen}
                onClose={() => setIsPaywallOpen(false)}
                freeUsesRemaining={freeUsesRemaining}
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
        </>
    );
}
