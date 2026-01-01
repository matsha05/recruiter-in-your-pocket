"use client";

import { useState, useEffect } from "react";
import { Trash2, Clock, TrendingUp, FileText, Pencil, AlertTriangle, Check } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { CardInteractive } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBadge } from "@/components/shared/ScoreBadge";
import { VersionComparisonView } from "./VersionComparisonView";
import { ResumeLabel } from "./ResumeLabel";
import { toast } from "sonner";

interface HistoryReport {
    id: string;
    createdAt: string;
    score: number;
    scoreLabel?: string;
    resumeSnippet?: string;
    name?: string;
    targetRole?: string;
    resumeVariant?: string;
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
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null); // For confirmation dialog
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    // Comparison mode state
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
    const [comparisonData, setComparisonData] = useState<{ reportA: any; reportB: any } | null>(null);
    const [loadingComparison, setLoadingComparison] = useState(false);

    // Variant filter state
    const [filterVariant, setFilterVariant] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user?.email) {
            fetchReports();
        }
    }, [isOpen, user?.email]);

    const handleRename = async (reportId: string) => {
        if (!editName.trim() && !reports.find(r => r.id === reportId)?.name) {
            setRenamingId(null);
            return;
        }
        try {
            const res = await fetch(`/api/reports/${reportId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName.trim() })
            });
            const data = await res.json();
            if (data.ok) {
                setReports(prev => prev.map(r =>
                    r.id === reportId ? { ...r, name: editName.trim() || undefined } : r
                ));
            }
        } catch (error) {
            console.error("Failed to rename report:", error);
        } finally {
            setRenamingId(null);
            setEditName("");
        }
    };

    const handleVariantChange = async (reportId: string, variant: string) => {
        try {
            const res = await fetch(`/api/reports/${reportId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resume_variant: variant })
            });
            const data = await res.json();
            if (data.ok) {
                setReports(prev => prev.map(r =>
                    r.id === reportId ? { ...r, resumeVariant: variant } : r
                ));
            }
        } catch (error) {
            console.error("Failed to update variant:", error);
        }
    };

    // Get unique labels from existing reports
    const existingLabels = Array.from(new Set(
        reports.map(r => r.resumeVariant).filter(Boolean) as string[]
    ));

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

    // Opens the delete confirmation dialog
    const handleDeleteClick = (e: React.MouseEvent, reportId: string) => {
        e.stopPropagation();
        if (deletingId) return;
        setDeleteConfirmId(reportId);
    };

    // Performs the actual deletion after confirmation
    const handleConfirmDelete = async () => {
        if (!deleteConfirmId || deletingId) return;

        const reportId = deleteConfirmId;
        setDeleteConfirmId(null); // Close dialog
        setDeletingId(reportId);

        try {
            const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.ok) {
                setReports(prev => prev.filter(r => r.id !== reportId));
                toast.success("Report deleted");
            } else {
                toast.error(data.message || "Failed to delete report");
                console.error("Delete failed:", data);
            }
        } catch (error) {
            console.error("Failed to delete report:", error);
            toast.error("Failed to delete report. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    // Get the report being deleted for the confirmation dialog
    const reportToDelete = deleteConfirmId ? reports.find(r => r.id === deleteConfirmId) : null;

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
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent side="right" className="w-[380px] max-w-[90vw] p-0 flex flex-col">
                    <SheetHeader className="px-6 py-5 border-b border-border/60">
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
                                    <div key={i} className="p-4 rounded border border-border/60 bg-card space-y-3">
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
                                    Run your first analysis to start tracking your resume&apos;s progress.
                                </p>
                            </div>
                        ) : (
                            /* Reports list */
                            <div className="p-4 space-y-3">
                                {/* Summary header with Compare toggle */}
                                <div className="flex items-center justify-between px-2 py-2">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {reports.length} {reports.length === 1 ? "Report" : "Reports"}
                                    </span>
                                    {reports.length > 1 && (
                                        <button
                                            onClick={() => {
                                                setIsCompareMode(!isCompareMode);
                                                setSelectedForCompare([]);
                                            }}
                                            className={`text-xs font-medium px-2 py-1 rounded transition-colors ${isCompareMode
                                                ? 'bg-brand text-white'
                                                : 'text-brand hover:bg-brand/10'
                                                }`}
                                        >
                                            {isCompareMode ? 'Cancel' : 'Compare'}
                                        </button>
                                    )}
                                </div>

                                {/* Label filter chips */}
                                {existingLabels.length > 0 && (
                                    <div className="flex flex-wrap gap-2 px-2 pb-2">
                                        <button
                                            onClick={() => setFilterVariant(null)}
                                            className={`text-xs px-2 py-1 rounded transition-colors ${filterVariant === null
                                                ? 'bg-foreground text-background'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                }`}
                                        >
                                            All
                                        </button>
                                        {existingLabels.map(v => (
                                            <button
                                                key={v}
                                                onClick={() => setFilterVariant(v)}
                                                className={`text-xs px-2 py-1 rounded transition-colors ${filterVariant === v
                                                    ? 'bg-foreground text-background'
                                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                    }`}
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Compare action bar */}
                                {isCompareMode && (
                                    <div className="px-2 py-2 bg-muted/50 rounded flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            Select 2 reports to compare ({selectedForCompare.length}/2)
                                        </span>
                                        {selectedForCompare.length === 2 && (
                                            <button
                                                onClick={async () => {
                                                    setLoadingComparison(true);
                                                    try {
                                                        // Fetch both reports
                                                        const [resA, resB] = await Promise.all([
                                                            fetch(`/api/reports/${selectedForCompare[0]}`),
                                                            fetch(`/api/reports/${selectedForCompare[1]}`)
                                                        ]);
                                                        const [dataA, dataB] = await Promise.all([resA.json(), resB.json()]);

                                                        if (dataA.ok && dataB.ok) {
                                                            const reportInfoA = reports.find(r => r.id === selectedForCompare[0]);
                                                            const reportInfoB = reports.find(r => r.id === selectedForCompare[1]);

                                                            setComparisonData({
                                                                reportA: {
                                                                    id: selectedForCompare[0],
                                                                    name: reportInfoA?.name,
                                                                    score: reportInfoA?.score || 0,
                                                                    scoreLabel: reportInfoA?.scoreLabel,
                                                                    createdAt: reportInfoA?.createdAt || '',
                                                                    report: dataA.report,
                                                                    jdPreview: dataA.jdPreview || null,
                                                                    targetRole: dataA.targetRole || reportInfoA?.targetRole,
                                                                    resumeVariant: dataA.resumeVariant || reportInfoA?.resumeVariant
                                                                },
                                                                reportB: {
                                                                    id: selectedForCompare[1],
                                                                    name: reportInfoB?.name,
                                                                    score: reportInfoB?.score || 0,
                                                                    scoreLabel: reportInfoB?.scoreLabel,
                                                                    createdAt: reportInfoB?.createdAt || '',
                                                                    report: dataB.report,
                                                                    jdPreview: dataB.jdPreview || null,
                                                                    targetRole: dataB.targetRole || reportInfoB?.targetRole,
                                                                    resumeVariant: dataB.resumeVariant || reportInfoB?.resumeVariant
                                                                }
                                                            });
                                                            onClose(); // Close sidebar when opening comparison
                                                        }
                                                    } catch (err) {
                                                        console.error('Failed to load reports for comparison:', err);
                                                    } finally {
                                                        setLoadingComparison(false);
                                                    }
                                                }}
                                                disabled={loadingComparison}
                                                className="text-xs font-medium text-white bg-brand px-3 py-1 rounded hover:bg-brand/90 disabled:opacity-50"
                                            >
                                                {loadingComparison ? 'Loading...' : 'Compare →'}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Report cards */}
                                {reports
                                    .filter(r => !filterVariant || r.resumeVariant === filterVariant)
                                    .map((report) => {
                                        const isSelected = selectedForCompare.includes(report.id);

                                        return (
                                            <CardInteractive
                                                key={report.id}
                                                onClick={(e) => {
                                                    // Skip if click originated from interactive element
                                                    const target = e.target as HTMLElement;
                                                    if (target.closest('[data-no-card-click]')) return;

                                                    if (renamingId === report.id) return;

                                                    if (isCompareMode) {
                                                        // Toggle selection
                                                        if (isSelected) {
                                                            setSelectedForCompare(prev => prev.filter(id => id !== report.id));
                                                        } else if (selectedForCompare.length < 2) {
                                                            setSelectedForCompare(prev => [...prev, report.id]);
                                                        }
                                                    } else {
                                                        onLoadReport?.(report.id);
                                                    }
                                                }}
                                                className={`group relative p-4 ${isCompareMode && isSelected ? 'ring-2 ring-brand' : ''}`}
                                            >
                                                {/* Compare mode checkbox */}
                                                {isCompareMode && (
                                                    <div className="absolute top-2 right-2 z-10">
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected
                                                            ? 'bg-brand border-brand text-white'
                                                            : 'border-muted-foreground/30 bg-card'
                                                            }`}>
                                                            {isSelected && <Check className="w-3 h-3" />}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Version name (editable) */}
                                                {renamingId === report.id ? (
                                                    <div
                                                        className="mb-3"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <input
                                                            type="text"
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleRename(report.id);
                                                                if (e.key === 'Escape') { setRenamingId(null); setEditName(''); }
                                                            }}
                                                            onBlur={() => handleRename(report.id)}
                                                            placeholder="Name this version..."
                                                            className="w-full px-2 py-1 text-sm font-medium border border-brand rounded bg-card focus:outline-none focus:ring-1 focus:ring-brand"
                                                            autoFocus
                                                        />
                                                    </div>
                                                ) : report.name ? (
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="text-sm font-medium text-foreground truncate">
                                                            {report.name}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditName(report.name || '');
                                                                setRenamingId(report.id);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded"
                                                        >
                                                            <Pencil className="w-3 h-3 text-muted-foreground" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditName('');
                                                            setRenamingId(report.id);
                                                        }}
                                                        className="mb-3 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        + Add name
                                                    </button>
                                                )}

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
                                                        onClick={(e) => handleDeleteClick(e, report.id)}
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

                                                {/* Label & Role Tags */}
                                                <div
                                                    data-no-card-click
                                                    className="flex flex-wrap items-center gap-2 mb-3"
                                                >
                                                    <ResumeLabel
                                                        value={report.resumeVariant}
                                                        existingLabels={existingLabels}
                                                        onSelect={(label) => handleVariantChange(report.id, label)}
                                                        onClear={() => handleVariantChange(report.id, "")}
                                                    />
                                                    {report.targetRole && (
                                                        <span className="text-xs px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
                                                            → {report.targetRole}
                                                        </span>
                                                    )}
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
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Comparison Modal */}
            {
                comparisonData && (
                    <VersionComparisonView
                        reportA={comparisonData.reportA}
                        reportB={comparisonData.reportB}
                        onClose={() => {
                            setComparisonData(null);
                            setIsCompareMode(false);
                            setSelectedForCompare([]);
                        }}
                    />
                )
            }
            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <DialogContent className="max-w-[360px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                            </div>
                            <DialogTitle className="font-display">Delete Report?</DialogTitle>
                        </div>
                        <DialogDescription>
                            {reportToDelete?.name || `Report from ${formatDate(reportToDelete?.createdAt || '')}`} will be permanently deleted. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 mt-4">
                        <Button
                            variant="ghost"
                            className="flex-1"
                            onClick={() => setDeleteConfirmId(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={handleConfirmDelete}
                            disabled={deletingId === deleteConfirmId}
                        >
                            {deletingId === deleteConfirmId ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
