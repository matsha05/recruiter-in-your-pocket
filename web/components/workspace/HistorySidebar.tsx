"use client";

import { useState, useEffect } from "react";
import { EmptyReportIcon } from "@/components/icons";

interface HistoryReport {
    id: string;
    createdAt: string;
    score: number;
    scoreLabel?: string;
    resumeSnippet?: string;
}

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    user?: { email?: string } | null;
    onSignIn?: () => void;
    onLoadReport?: (reportId: string) => void;
}

export default function HistorySidebar({
    isOpen,
    onClose,
    user,
    onSignIn,
    onLoadReport
}: HistorySidebarProps) {
    const [reports, setReports] = useState<HistoryReport[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user?.email) {
            setLoading(true);
            fetch("/api/reports")
                .then(res => res.json())
                .then(data => {
                    if (data.ok && Array.isArray(data.reports)) {
                        setReports(data.reports);
                    }
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen, user?.email]);

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric"
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 z-[100] transition-opacity duration-300
                    ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside
                className={`fixed top-0 right-0 w-[340px] max-w-full h-screen
                    bg-card shadow-lg z-[101] flex flex-col
                    transition-transform duration-300 ease-out
                    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/10">
                    <span className="font-display text-lg font-bold text-foreground">Your Reports</span>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="text-2xl text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                        ×
                    </button>
                </div>

                <div className="flex-1 p-5 overflow-y-auto">
                    {!user?.email ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <EmptyReportIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <div className="text-lg font-semibold text-foreground mb-2">
                                Track your progress
                            </div>
                            <p className="mb-5">
                                Log in to save every analysis, track your score improvements, and compare different versions of your resume.
                            </p>
                            <button onClick={onSignIn} className="w-full py-3 px-4 rounded-md bg-brand text-white font-medium text-sm hover:opacity-90 transition-opacity">
                                Log In to Save History
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="text-center py-10 text-muted-foreground">Loading...</div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <EmptyReportIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <div className="text-lg font-semibold text-foreground mb-2">
                                No reports yet
                            </div>
                            <p>Run an analysis to see your history here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    onClick={() => onLoadReport?.(report.id)}
                                    className="p-4 bg-card border border-border/10 rounded-md cursor-pointer
                                        hover:border-brand transition-colors"
                                >
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold text-brand">
                                            Score: {report.score}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(report.createdAt)}
                                        </span>
                                    </div>
                                    {report.resumeSnippet && (
                                        <p className="text-xs text-muted leading-relaxed">
                                            {report.resumeSnippet.substring(0, 100)}...
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
