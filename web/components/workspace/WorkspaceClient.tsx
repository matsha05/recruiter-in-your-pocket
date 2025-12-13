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
    const [freeUsesRemaining, setFreeUsesRemaining] = useState(2);

    // History sidebar, paywall modal, and auth modal state
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    // Auto-load sample report if ?sample=true
    useEffect(() => {
        if (searchParams.get("sample") === "true" && !report) {
            fetch("/sample-report.json")
                .then(res => res.json())
                .then(data => setReport(data))
                .catch(err => console.error("Failed to load sample report:", err));
        }
    }, [searchParams, report]);

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

        try {
            console.log("[WorkspaceClient] Calling streamResumeFeedback...");
            const result = await streamResumeFeedback(
                resumeText,
                jobDescription || undefined,
                (partialJson, partialReport) => {
                    // Update report with partial data as it arrives
                    if (partialReport) {
                        console.log("[WorkspaceClient] Got partial report:", Object.keys(partialReport));
                        setReport(partialReport);
                    }
                }
            );
            console.log("[WorkspaceClient] streamResumeFeedback result:", result);

            if (result.ok && result.report) {
                console.log("[WorkspaceClient] Setting final report:", result.report);
                setReport(result.report);
                setFreeUsesRemaining((prev) => Math.max(0, prev - 1));
            } else {
                console.error("Failed to generate report:", result.message);
                alert("Failed to generate report: " + (result.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Report generation error:", err);
            alert("Report generation error. Check console for details.");
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
        }
    }, [resumeText, jobDescription, freeUsesRemaining]);

    const handleNewReport = useCallback(() => {
        setResumeText("");
        setJobDescription("");
        setReport(null);
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
            <main className="min-h-screen flex flex-col bg-body">
                <h1 className="sr-only">Resume Workspace — Analyze Your Resume</h1>

                <WorkspaceHeader
                    user={user ? { email: user.email || undefined, firstName: user.firstName || undefined } : null}
                    onNewReport={handleNewReport}
                    onSampleReport={handleSampleReport}
                    onSignIn={() => setIsAuthOpen(true)}
                    onSignOut={signOut}
                    onHistory={() => setIsHistoryOpen(true)}
                />

                <div className={`flex-1 grid ${report ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
                    {/* Input Panel - hidden when report is showing */}
                    <div className={`${report ? "hidden" : "block"} h-full`}>
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

                    <ReportPanel
                        report={report}
                        isLoading={isLoading}
                        hasJobDescription={!!jobDescription.trim()}
                        onExportPdf={handleExportPdf}
                        isExporting={isExporting}
                    />
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

