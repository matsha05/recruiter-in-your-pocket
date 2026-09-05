"use client";

import { useState, useEffect } from "react";
import { Trash2, Clock, TrendingUp, Pencil, AlertTriangle, Check } from "lucide-react";
import { EmptyReportIcon } from "@/components/icons";
import {
    Sheet,
    SheetContent,
    SheetDescription,
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
import { ClientActionError, getClientActionError } from "@/lib/client-action-error";

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
    const [loadError, setLoadError] = useState<string | null>(null);
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
            if (!res.ok || !data.ok) throw new ClientActionError(data.message, "The report couldn’t be renamed. Please try again.");
            setReports(prev => prev.map(r =>
                r.id === reportId ? { ...r, name: editName.trim() || undefined } : r
            ));
            setRenamingId(null);
            setEditName("");
        } catch (error) {
            console.error("Failed to rename report:", error);
            toast.error(getClientActionError(error, "The report couldn’t be renamed. Please try again."));
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
            if (!res.ok || !data.ok) throw new ClientActionError(data.message, "The label couldn’t be saved. Please try again.");
            setReports(prev => prev.map(r =>
                r.id === reportId ? { ...r, resumeVariant: variant } : r
            ));
        } catch (error) {
            console.error("Failed to update variant:", error);
            toast.error(getClientActionError(error, "The label couldn’t be saved. Please try again."));
        }
    };

    // Get unique labels from existing reports
    const existingLabels = Array.from(new Set(
        reports.map(r => r.resumeVariant).filter(Boolean) as string[]
    ));

    const fetchReports = async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const res = await fetch("/api/reports");
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.ok || !Array.isArray(data.reports)) throw new ClientActionError(data.message, "Saved reports could not be loaded. Please try again.");
            setReports(data.reports);
        } catch (error) {
            console.error("Failed to fetch reports:", error);
            setLoadError(getClientActionError(error, "Saved reports could not be loaded. Please try again."));
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
                toast.error(data.message || "The report couldn’t be deleted. Please try again.");
                console.error("Delete failed:", data);
            }
        } catch (error) {
            console.error("Failed to delete report:", error);
            toast.error("The report couldn’t be deleted. Please try again.");
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
    const visibleReports = reports.filter((report) => !filterVariant || report.resumeVariant === filterVariant);

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent side="right" className="w-[380px] max-w-[90vw] p-0 flex flex-col">
                    <SheetHeader className="px-6 py-5 border-b border-border/60">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-md bg-brand/10 flex items-center justify-center">
                                <EmptyReportIcon className="size-4 text-brand" />
                            </div>
                            <SheetTitle className="font-display text-lg font-semibold">
                                Saved reports
                            </SheetTitle>
                        </div>
                        <SheetDescription className="sr-only">Review, compare, rename, or delete saved reports.</SheetDescription>
                    </SheetHeader>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {!user?.email ? (
                            /* Logged out state */
                            <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                                <div className="mb-6 flex size-16 items-center justify-center rounded-sm bg-brand/10">
                                    <TrendingUp className="size-8 text-brand" />
                                </div>
                                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                                    Save reports you want to revisit
                                </h3>
                                <p className="text-sm text-muted-foreground mb-8 max-w-[240px]">
                                    Sign in to save reports and compare feedback on different resume versions.
                                </p>
                                <Button
                                    variant="brand"
                                    className="w-full max-w-[200px]"
                                    onClick={onSignIn}
                                >
                                    Sign in to save reports
                                </Button>
                            </div>
                        ) : loading ? (
                            /* Skeleton loading state */
                            <div className="p-4 gap-y-3" role="status" aria-live="polite">
                                <span className="sr-only">Loading saved reports…</span>
                                {["first", "second", "third"].map((slot) => (
                                    <div key={slot} className="p-4 rounded border border-border/60 bg-card gap-y-3">
                                        <div className="flex items-start justify-between">
                                            <Skeleton className="h-8 w-16 rounded-md" />
                                            <Skeleton className="size-6 rounded" />
                                        </div>
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <div className="flex items-center gap-1.5">
                                            <Skeleton className="size-3 rounded-full" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : loadError ? (
                            <div className="m-4 border-l-2 border-destructive bg-error-surface p-5" role="alert">
                                <h3 className="font-display text-lg font-semibold text-destructive">Saved reports could not load</h3>
                                <p className="mt-2 text-sm leading-6 text-destructive/80">{loadError}</p>
                                <Button type="button" variant="outline" className="mt-4" onClick={() => void fetchReports()}>
                                    Try again
                                </Button>
                            </div>
                        ) : reports.length === 0 ? (
                            /* Empty state */
                            <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                                <div className="mb-6 flex size-20 items-center justify-center border border-cyan-bright/35 bg-surface-sky text-brand">
                                    <EmptyReportIcon className="size-12" />
                                </div>
                                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                                    No reports yet
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-[240px]">
                                    Get a report on your resume, then save it to return to the feedback later.
                                </p>
                            </div>
                        ) : (
                            /* Reports list */
                            <div className="p-4 gap-y-3">
                                {/* Summary header with Compare toggle */}
                                <div className="flex items-center justify-between p-2">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {reports.length} {reports.length === 1 ? "Report" : "Reports"}
                                    </span>
                                    {reports.length > 1 && (
                                        <button type="button"
                                            onClick={() => {
                                                setIsCompareMode(!isCompareMode);
                                                setSelectedForCompare([]);
                                            }}
                                            className={`min-h-11 px-3 text-xs font-medium transition-colors ${isCompareMode
                                                ? 'bg-brand text-white'
                                                : 'text-brand hover:bg-brand/10'
                                                }`}
                                            aria-pressed={isCompareMode}
                                        >
                                            {isCompareMode ? 'Cancel' : 'Compare'}
                                        </button>
                                    )}
                                </div>

                                {/* Label filter chips */}
                                {existingLabels.length > 0 && (
                                    <div className="flex flex-wrap gap-2 px-2 pb-2" aria-label="Filter reports by resume label">
                                        <button type="button"
                                            onClick={() => setFilterVariant(null)}
                                            className={`min-h-11 px-3 text-xs transition-colors ${filterVariant === null
                                                ? 'bg-foreground text-background'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                }`}
                                            aria-pressed={filterVariant === null}
                                        >
                                            All
                                        </button>
                                        {existingLabels.map(v => (
                                            <button type="button"
                                                key={v}
                                                onClick={() => setFilterVariant(v)}
                                                className={`min-h-11 px-3 text-xs transition-colors ${filterVariant === v
                                                    ? 'bg-foreground text-background'
                                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                    }`}
                                                aria-pressed={filterVariant === v}
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <span className="sr-only" role="status" aria-live="polite">
                                    {visibleReports.length} report{visibleReports.length === 1 ? "" : "s"} shown.
                                </span>

                                {/* Compare action bar */}
                                {isCompareMode && (
                                    <div className="flex items-center justify-between border-l-2 border-brand bg-brand/5 p-3">
                                        <span className="text-xs text-muted-foreground" aria-live="polite">
                                            Select 2 reports to compare ({selectedForCompare.length}/2)
                                        </span>
                                        {selectedForCompare.length === 2 && (
                                            <button type="button"
                                                onClick={async () => {
                                                    setLoadingComparison(true);
                                                    try {
                                                        // Fetch both reports
                                                        const [resA, resB] = await Promise.all([
                                                            fetch(`/api/reports/${selectedForCompare[0]}`),
                                                            fetch(`/api/reports/${selectedForCompare[1]}`)
                                                        ]);
                                                        const [dataA, dataB] = await Promise.all([resA.json(), resB.json()]);

                                                        if (!resA.ok || !resB.ok || !dataA.ok || !dataB.ok) {
                                                            throw new ClientActionError(dataA.message || dataB.message, "Reports could not be compared. Please try again.");
                                                        }
                                                        {
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
                                                        toast.error(getClientActionError(err, "Reports could not be compared. Please try again."));
                                                    } finally {
                                                        setLoadingComparison(false);
                                                    }
                                                }}
                                                disabled={loadingComparison}
                                                className="min-h-11 bg-foreground px-3 py-2 text-xs font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
                                            >
                                                {loadingComparison ? 'Loading...' : 'Compare →'}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Report cards */}
                                {visibleReports.map((report) => {
                                        const isSelected = selectedForCompare.includes(report.id);

                                        return (
                                            <CardInteractive
                                                key={report.id}
                                                className={`group relative p-4 ${isCompareMode && isSelected ? 'ring-2 ring-brand' : ''}`}
                                            >
                                                {!isCompareMode ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => onLoadReport?.(report.id)}
                                                        className="focus-ring absolute inset-0 z-0 text-left"
                                                        aria-label={`Open ${report.name || `report from ${formatDate(report.createdAt)}`}`}
                                                    />
                                                ) : null}
                                                {/* Compare mode checkbox */}
                                                {isCompareMode && (
                                                    <label className="absolute right-1 top-1 z-20 flex size-11 cursor-pointer items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            className="peer sr-only"
                                                            checked={isSelected}
                                                            disabled={!isSelected && selectedForCompare.length >= 2}
                                                            onChange={() => {
                                                                if (isSelected) setSelectedForCompare(prev => prev.filter(id => id !== report.id));
                                                                else setSelectedForCompare(prev => [...prev, report.id]);
                                                            }}
                                                            aria-label={`Compare ${report.name || `report from ${formatDate(report.createdAt)}`}`}
                                                        />
                                                        <span className={`flex size-6 items-center justify-center border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand ${isSelected
                                                            ? 'bg-brand border-brand text-white'
                                                            : 'border-muted-foreground/30 bg-card'
                                                            }`}>
                                                            {isSelected && <Check className="size-3" />}
                                                        </span>
                                                    </label>
                                                )}
                                                {/* Version name (editable) */}
                                                {renamingId === report.id ? (
                                                    <div
                                                        className="relative z-20 mb-3"
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
                                                            aria-label={`Name ${report.name || `report from ${formatDate(report.createdAt)}`}`}
                                                            className="w-full px-2 py-1 text-sm font-medium border border-brand rounded bg-card focus:outline-none focus:ring-1 focus:ring-brand"
                                                            autoFocus
                                                        />
                                                    </div>
                                                ) : report.name ? (
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="text-sm font-medium text-foreground truncate">
                                                            {report.name}
                                                        </span>
                                                        <button type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditName(report.name || '');
                                                                setRenamingId(report.id);
                                                            }}
                                                            className="relative z-20 inline-flex size-11 items-center justify-center opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                                                            aria-label={`Rename ${report.name}`}
                                                        >
                                                            <Pencil className="size-3 text-muted-foreground" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditName('');
                                                            setRenamingId(report.id);
                                                        }}
                                                        className="relative z-20 mb-3 min-h-11 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                                                    >
                                                        + Add name
                                                    </button>
                                                )}

                                                {/* Score badge */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <ScoreBadge
                                                        score={report.score}
                                                        size="md"
                                                    />

                                                    {/* Delete button - appears on hover */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => handleDeleteClick(e, report.id)}
                                                        disabled={deletingId === report.id}
                                                        className="relative z-20 opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                                                        aria-label="Delete report"
                                                    >
                                                        {deletingId === report.id ? (
                                                            <div className="size-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                                                        ) : (
                                                            <Trash2 className="size-4" />
                                                        )}
                                                    </Button>
                                                </div>

                                                {/* Label & Role Tags */}
                                                <div
                                                    className="relative z-20 mb-3 flex flex-wrap items-center gap-2"
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
                                                    <Clock className="size-3.5" />
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
                            <div className="flex size-10 items-center justify-center rounded-sm bg-destructive/10">
                                <AlertTriangle className="size-5 text-destructive" />
                            </div>
                            <DialogTitle className="font-display">Delete Report?</DialogTitle>
                        </div>
                        <DialogDescription>
                            {reportToDelete?.name || `Report from ${formatDate(reportToDelete?.createdAt || '')}`} will be permanently deleted. This action cannot be undone.
                            If this report came from a saved job, the saved job and job description stay in Jobs until you delete them there.
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
