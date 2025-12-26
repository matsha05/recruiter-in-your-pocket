"use client";

import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReportData } from "./report/ReportTypes";
import { cn } from "@/lib/utils";
import { getScoreColor, getScoreLabel } from "@/lib/score-utils";

interface ComparisonReport {
    id: string;
    name?: string;
    score: number;
    scoreLabel?: string;
    createdAt: string;
    report: ReportData;
    jdPreview?: string | null;
    targetRole?: string;
    resumeVariant?: string;
}

interface VersionComparisonViewProps {
    reportA: ComparisonReport;
    reportB: ComparisonReport;
    onClose: () => void;
}

// Compact subscore row with mini bar visualization
function SubscoreRow({ label, before, after }: { label: string; before?: number; after?: number }) {
    if (before === undefined && after === undefined) return null;

    const diff = (after ?? 0) - (before ?? 0);
    const improved = diff > 0;
    const declined = diff < 0;

    return (
        <div className="flex items-center gap-4">
            {/* Label */}
            <span className="text-xs text-muted-foreground w-20 shrink-0 capitalize">{label}</span>

            {/* Mini bar visualization - shows after value */}
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-300",
                        improved ? "bg-green-500" : declined ? "bg-destructive" : "bg-brand"
                    )}
                    style={{ width: `${after ?? 0}%` }}
                />
            </div>

            {/* Numbers */}
            <div className="font-mono text-xs tabular-nums text-right shrink-0 w-24">
                <span className="text-muted-foreground">{before ?? '—'}</span>
                <span className="text-muted-foreground/30 mx-1">→</span>
                <span className={cn(
                    "font-semibold",
                    improved && "text-green-600",
                    declined && "text-destructive",
                    !improved && !declined && "text-foreground"
                )}>
                    {after ?? '—'}
                </span>
                {diff !== 0 && (
                    <span className={cn(
                        "text-[10px] ml-1",
                        improved ? "text-green-600" : "text-destructive"
                    )}>
                        {diff > 0 ? '+' : ''}{diff}
                    </span>
                )}
            </div>
        </div>
    );
}

// Smart summarization - aggressive truncation for single-line scannability
function summarize(text: string): string {
    const clean = text.trim();
    // Try to get first sentence if short enough
    const match = clean.match(/^[^.!?]+[.!?]/);
    if (match && match[0].length <= 60) return match[0];
    // Aggressively truncate at word boundary
    if (clean.length <= 55) return clean;
    const truncated = clean.slice(0, 55);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 30 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

export function VersionComparisonView({ reportA, reportB, onClose }: VersionComparisonViewProps) {
    // Ensure A is older, B is newer
    const older = new Date(reportA.createdAt) < new Date(reportB.createdAt) ? reportA : reportB;
    const newer = older === reportA ? reportB : reportA;

    const scoreDiff = newer.score - older.score;
    const isImprovement = scoreDiff > 0;
    const isDecline = scoreDiff < 0;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getLabel = (report: ComparisonReport) => report.name || formatDate(report.createdAt);

    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-background border border-border rounded-lg w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-sm">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-medium text-foreground">Compare</h2>
                        <span className="text-xs text-muted-foreground">
                            {getLabel(older)} → {getLabel(newer)}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-muted rounded transition-colors"
                    >
                        <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>

                {/* Score Hero */}
                <div className="px-6 py-8 border-b border-border bg-muted/20 shrink-0">
                    <div className="flex items-center justify-center gap-10">
                        {/* Before */}
                        <div className="text-center">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">Before</p>
                            <span className={cn(
                                "font-display text-6xl font-bold tabular-nums tracking-tight",
                                getScoreColor(older.score)
                            )}>
                                {older.score}
                            </span>
                        </div>

                        {/* Delta Badge */}
                        <div className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold",
                            isImprovement && "bg-green-100 text-green-800",
                            isDecline && "bg-red-100 text-red-800",
                            !isImprovement && !isDecline && "bg-muted text-muted-foreground"
                        )}>
                            {isImprovement ? (
                                <TrendingUp className="w-5 h-5" />
                            ) : isDecline ? (
                                <TrendingDown className="w-5 h-5" />
                            ) : (
                                <Minus className="w-5 h-5" />
                            )}
                            <span className="font-mono text-lg tabular-nums">
                                {scoreDiff > 0 ? '+' : ''}{scoreDiff}
                            </span>
                        </div>

                        {/* After */}
                        <div className="text-center">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">After</p>
                            <span className={cn(
                                "font-display text-6xl font-bold tabular-nums tracking-tight",
                                getScoreColor(newer.score)
                            )}>
                                {newer.score}
                            </span>
                        </div>
                    </div>

                    {/* Verdict */}
                    <p className={cn(
                        "text-center text-sm mt-5 font-medium",
                        isImprovement && "text-green-700",
                        isDecline && "text-destructive",
                        !isImprovement && !isDecline && "text-muted-foreground"
                    )}>
                        {isImprovement
                            ? "Your resume is getting stronger."
                            : isDecline
                                ? "Review your recent edits."
                                : "No change in overall score."}
                    </p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">

                    {/* Signal Breakdown */}
                    {(older.report.subscores || newer.report.subscores) && (
                        <div className="px-5 py-5 border-b border-border">
                            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 font-semibold">
                                Signal Breakdown
                            </h3>
                            <div className="space-y-3">
                                <SubscoreRow
                                    label="Story"
                                    before={older.report.subscores?.story}
                                    after={newer.report.subscores?.story}
                                />
                                <SubscoreRow
                                    label="Impact"
                                    before={older.report.subscores?.impact}
                                    after={newer.report.subscores?.impact}
                                />
                                <SubscoreRow
                                    label="Clarity"
                                    before={older.report.subscores?.clarity}
                                    after={newer.report.subscores?.clarity}
                                />
                                <SubscoreRow
                                    label="Readability"
                                    before={older.report.subscores?.readability}
                                    after={newer.report.subscores?.readability}
                                />
                            </div>
                        </div>
                    )}

                    {/* Qualitative Comparison */}
                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                        {/* Before Column */}
                        <div className="px-5 py-5">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-4">
                                {getLabel(older)}
                            </p>

                            {/* Working */}
                            <div className="mb-4">
                                <p className="text-xs font-medium text-foreground mb-2">Working</p>
                                <ul className="space-y-2">
                                    {(older.report.strengths || []).slice(0, 3).map((s, i) => (
                                        <li key={i} className="text-xs text-muted-foreground leading-snug">
                                            {summarize(s)}
                                        </li>
                                    ))}
                                    {(!older.report.strengths?.length) && (
                                        <li className="text-xs text-muted-foreground/50 italic">None identified</li>
                                    )}
                                </ul>
                            </div>

                            {/* Gaps */}
                            <div>
                                <p className="text-xs font-medium text-foreground/80 mb-2">Gaps</p>
                                <ul className="space-y-2">
                                    {(older.report.gaps || []).slice(0, 3).map((g, i) => (
                                        <li key={i} className="text-xs text-muted-foreground leading-snug">
                                            {summarize(g)}
                                        </li>
                                    ))}
                                    {(!older.report.gaps?.length) && (
                                        <li className="text-xs text-muted-foreground/50 italic">None identified</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* After Column - Highlighted */}
                        <div className="px-5 py-5 bg-brand/5">
                            <p className="text-[10px] uppercase tracking-widest text-brand font-semibold mb-4">
                                {getLabel(newer)} · Current
                            </p>

                            {/* Working */}
                            <div className="mb-4">
                                <p className="text-xs font-medium text-foreground mb-2">Working</p>
                                <ul className="space-y-2">
                                    {(newer.report.strengths || []).slice(0, 3).map((s, i) => (
                                        <li key={i} className="text-xs text-foreground/80 leading-snug">
                                            {summarize(s)}
                                        </li>
                                    ))}
                                    {(!newer.report.strengths?.length) && (
                                        <li className="text-xs text-muted-foreground/50 italic">None identified</li>
                                    )}
                                </ul>
                            </div>

                            {/* Gaps */}
                            <div>
                                <p className="text-xs font-medium text-foreground/80 mb-2">Gaps</p>
                                <ul className="space-y-2">
                                    {(newer.report.gaps || []).slice(0, 3).map((g, i) => (
                                        <li key={i} className="text-xs text-foreground/70 leading-snug">
                                            {summarize(g)}
                                        </li>
                                    ))}
                                    {(!newer.report.gaps?.length) && (
                                        <li className="text-xs text-muted-foreground/50 italic">None identified</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
