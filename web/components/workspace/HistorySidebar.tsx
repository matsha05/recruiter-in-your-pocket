"use client";

import { useState, useEffect } from "react";
import { Trash2, Clock, TrendingUp, FileText, X } from "lucide-react";

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
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user?.email) {
            fetchReports();
        }
    }, [isOpen, user?.email]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/reports");
            const data = await res.json();
            if (data.ok && Array.isArray(data.reports)) {
                setReports(data.reports);
            }
        } catch (error) {
            console.error("Failed to fetch reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, reportId: string) => {
        e.stopPropagation(); // Don't trigger card click
        if (deletingId) return; // Prevent double-delete

        setDeletingId(reportId);
        try {
            const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.ok) {
                setReports(prev => prev.filter(r => r.id !== reportId));
            }
        } catch (error) {
            console.error("Failed to delete report:", error);
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return "Today";
            if (diffDays === 1) return "Yesterday";
            if (diffDays < 7) return `${diffDays} days ago`;

            return date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
            });
        } catch {
            return dateStr;
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return "text-success";
        if (score >= 70) return "text-brand";
        if (score >= 60) return "text-warning";
        return "text-destructive";
    };

    const getScoreBg = (score: number) => {
        if (score >= 85) return "bg-success/10";
        if (score >= 70) return "bg-brand/10";
        if (score >= 60) return "bg-warning/10";
        return "bg-destructive/10";
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity duration-300
                    ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside
                className={`fixed top-0 right-0 w-[380px] max-w-[90vw] h-screen
                    bg-background border-l border-border/20 shadow-2xl z-[101] flex flex-col
                    transition-transform duration-300 ease-out
                    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-brand/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-brand" />
                        </div>
                        <span className="font-display text-lg font-semibold text-foreground">Your Reports</span>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {!user?.email ? (
                        /* Logged out state */
                        <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mb-6">
                                <TrendingUp className="w-8 h-8 text-brand" />
                            </div>
                            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                                Track your progress
                            </h3>
                            <p className="text-sm text-muted-foreground mb-8 max-w-[240px]">
                                Log in to save your analyses and watch your score improve over time.
                            </p>
                            <button
                                onClick={onSignIn}
                                className="w-full max-w-[200px] py-3 px-6 rounded-md bg-brand text-white font-medium text-sm hover:opacity-90 transition-opacity"
                            >
                                Log In to Save
                            </button>
                        </div>
                    ) : loading ? (
                        /* Loading state */
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin mb-4" />
                            <p className="text-sm text-muted-foreground">Loading your reports...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        /* Empty state */
                        <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
                                <FileText className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                                No reports yet
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-[240px]">
                                Run your first analysis to start tracking your resume's progress.
                            </p>
                        </div>
                    ) : (
                        /* Reports list */
                        <div className="p-4 space-y-3">
                            {/* Summary header */}
                            <div className="flex items-center justify-between px-2 py-2">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {reports.length} {reports.length === 1 ? "Report" : "Reports"}
                                </span>
                                {reports.length > 1 && (
                                    <span className="text-xs text-muted-foreground">
                                        Latest: {formatDate(reports[0]?.createdAt)}
                                    </span>
                                )}
                            </div>

                            {/* Report cards */}
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    onClick={() => onLoadReport?.(report.id)}
                                    className={`group relative p-4 rounded-lg border cursor-pointer transition-all duration-200
                                        bg-card border-border/20 hover:border-brand/40 hover:shadow-md`}
                                >
                                    {/* Score badge */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md ${getScoreBg(report.score)}`}>
                                            <span className={`text-lg font-bold tabular-nums ${getScoreColor(report.score)}`}>
                                                {report.score}
                                            </span>
                                            {report.scoreLabel && (
                                                <span className={`text-xs font-medium ${getScoreColor(report.score)}`}>
                                                    {report.scoreLabel}
                                                </span>
                                            )}
                                        </div>

                                        {/* Delete button - appears on hover */}
                                        <button
                                            onClick={(e) => handleDelete(e, report.id)}
                                            disabled={deletingId === report.id}
                                            className="opacity-0 group-hover:opacity-100 p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                            aria-label="Delete report"
                                        >
                                            {deletingId === report.id ? (
                                                <div className="w-4 h-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Resume snippet */}
                                    {report.resumeSnippet && (
                                        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2 mb-3">
                                            {report.resumeSnippet}
                                        </p>
                                    )}

                                    {/* Date */}
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{formatDate(report.createdAt)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
