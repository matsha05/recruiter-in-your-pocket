"use client";

import { useState, useEffect } from "react";
import { Trash2, Clock, TrendingUp, FileText } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { CardInteractive } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBadge } from "@/components/shared/ScoreBadge";

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

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-[380px] max-w-[90vw] p-0 flex flex-col">
                <SheetHeader className="px-6 py-5 border-b border-border/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-brand/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-brand" />
                        </div>
                        <SheetTitle className="font-display text-lg font-semibold">
                            Your Reports
                        </SheetTitle>
                    </div>
                </SheetHeader>

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
                            <Button
                                variant="brand"
                                className="w-full max-w-[200px]"
                                onClick={onSignIn}
                            >
                                Log In to Save
                            </Button>
                        </div>
                    ) : loading ? (
                        /* Skeleton loading state */
                        <div className="p-4 space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-4 rounded-md border border-border/10 bg-card space-y-3">
                                    <div className="flex items-start justify-between">
                                        <Skeleton className="h-8 w-16 rounded-md" />
                                        <Skeleton className="h-6 w-6 rounded" />
                                    </div>
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <div className="flex items-center gap-1.5">
                                        <Skeleton className="h-3 w-3 rounded-full" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                            ))}
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
                                <CardInteractive
                                    key={report.id}
                                    onClick={() => onLoadReport?.(report.id)}
                                    className="group relative p-4"
                                >
                                    {/* Score badge */}
                                    <div className="flex items-start justify-between mb-3">
                                        <ScoreBadge
                                            score={report.score}
                                            label={report.scoreLabel}
                                            size="md"
                                        />

                                        {/* Delete button - appears on hover */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => handleDelete(e, report.id)}
                                            disabled={deletingId === report.id}
                                            className="opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
                                            aria-label="Delete report"
                                        >
                                            {deletingId === report.id ? (
                                                <div className="w-4 h-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </Button>
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
                                </CardInteractive>
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
