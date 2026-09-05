"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReportData } from "./report/ReportTypes";
import { cn } from "@/lib/utils";
import { getScoreColor, getScoreLabel } from "@/lib/score-utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

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
                        "h-full rounded-full transition-all duration-150 motion-reduce:transition-none",
                        improved ? "bg-success" : declined ? "bg-destructive" : "bg-brand"
                    )}
                    style={{ width: `${after ?? 0}%` }}
                />
            </div>

            {/* Numbers */}
            <div className="font-mono text-xs tabular-nums text-right shrink-0 w-24">
                <span className="text-muted-foreground">{before ?? ' - '}</span>
                <span className="text-muted-foreground/30 mx-1">→</span>
                <span className={cn(
                    "font-semibold",
                    improved && "text-success",
                    declined && "text-destructive",
                    !improved && !declined && "text-foreground"
                )}>
                    {after ?? ' - '}
                </span>
                {diff !== 0 && (
                    <span className={cn(
                        "text-xs ml-1",
                        improved ? "text-success" : "text-destructive"
                    )}>
                        {diff > 0 ? '+' : ''}{diff}
                    </span>
                )}
            </div>
        </div>
    );
}

// Extract first sentence only - no truncation, complete thoughts
function firstSentence(text: string): string {
    const clean = text.trim();
    const match = clean.match(/^[^.!?]+[.!?]/);
    return match ? match[0] : clean;
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
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden border-border bg-background p-0">

                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4 pr-16">
                    <div className="flex items-center gap-3">
                        <DialogTitle className="text-sm font-medium text-foreground">Compare versions</DialogTitle>
                        <span className="text-xs text-muted-foreground">
                            {getLabel(older)} → {getLabel(newer)}
                        </span>
                    </div>
                </div>
                <DialogDescription className="sr-only">Score and evidence differences between the selected resume report versions.</DialogDescription>

                {/* Review score summary */}
                <div className="px-6 py-8 border-b border-border bg-muted/20 shrink-0">
                    <div className="flex items-center justify-center gap-10">
                        {/* Before */}
                        <div className="text-center">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">Before</p>
                            <span className={cn(
                                "font-display text-6xl riyp-weight-560 tabular-nums tracking-tight",
                                getScoreColor(older.score)
                            )}>
                                {older.score}
                            </span>
                        </div>

                        {/* Delta Badge */}
                        <div className={cn(
                            "flex items-center gap-1.5 border-l-2 px-4 py-2 font-semibold",
                            isImprovement && "border-success bg-success/10 text-success",
                            isDecline && "border-destructive bg-error-surface text-destructive",
                            !isImprovement && !isDecline && "border-line bg-paper-muted text-muted-foreground"
                        )}>
                            {isImprovement ? (
                                <TrendingUp className="size-5" />
                            ) : isDecline ? (
                                <TrendingDown className="size-5" />
                            ) : (
                                <Minus className="size-5" />
                            )}
                            <span className="font-mono text-lg tabular-nums">
                                {scoreDiff > 0 ? '+' : ''}{scoreDiff}
                            </span>
                        </div>

                        {/* After */}
                        <div className="text-center">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">After</p>
                            <span className={cn(
                                "font-display text-6xl riyp-weight-560 tabular-nums tracking-tight",
                                getScoreColor(newer.score)
                            )}>
                                {newer.score}
                            </span>
                        </div>
                    </div>

                    {/* Verdict */}
                    <p className={cn(
                        "text-center text-sm mt-5 font-medium",
                        isImprovement && "text-success",
                        isDecline && "text-destructive",
                        !isImprovement && !isDecline && "text-muted-foreground"
                    )}>
                        {isImprovement
                            ? "The newer report scored higher. Compare the feedback below to see what changed."
                            : isDecline
                                ? "The newer report scored lower. Compare the feedback below before deciding what to revise."
                                : "The overall review score did not change."}
                    </p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">

                    {/* Review breakdown */}
                    {(older.report.subscores || newer.report.subscores) && (
                        <div className="p-5 border-b border-border">
                            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-4 font-semibold">
                                What changed
                            </h3>
                            <div className="gap-y-3">
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
                        <div className="p-5">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-4">
                                {getLabel(older)}
                            </p>

                            {/* Working */}
                            <div className="mb-5">
                                <p className="text-xs font-medium text-foreground mb-2.5">Working</p>
                                <ul className="gap-y-3">
                                    {(older.report.strengths || []).slice(0, 3).map((s, i) => (
                                        <li key={s} className="text-sm text-muted-foreground leading-[1.6]">
                                            {firstSentence(s)}
                                        </li>
                                    ))}
                                    {(!older.report.strengths?.length) && (
                                        <li className="text-xs italic text-muted-foreground">None identified</li>
                                    )}
                                </ul>
                            </div>

                            {/* Gaps */}
                            <div>
                                <p className="text-xs font-medium text-foreground/80 mb-2.5">Gaps</p>
                                <ul className="gap-y-3">
                                    {(older.report.gaps || []).slice(0, 3).map((g, i) => (
                                        <li key={g} className="text-sm text-muted-foreground leading-[1.6]">
                                            {firstSentence(g)}
                                        </li>
                                    ))}
                                    {(!older.report.gaps?.length) && (
                                        <li className="text-xs italic text-muted-foreground">None identified</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* After Column - Highlighted */}
                        <div className="p-5 bg-brand/5">
                            <p className="text-xs uppercase tracking-wide text-brand font-semibold mb-4">
                                {getLabel(newer)} · Current
                            </p>

                            {/* Working */}
                            <div className="mb-5">
                                <p className="text-xs font-medium text-foreground mb-2.5">Working</p>
                                <ul className="gap-y-3">
                                    {(newer.report.strengths || []).slice(0, 3).map((s, i) => (
                                        <li key={s} className="text-sm text-foreground/80 leading-[1.6]">
                                            {firstSentence(s)}
                                        </li>
                                    ))}
                                    {(!newer.report.strengths?.length) && (
                                        <li className="text-xs italic text-muted-foreground">None identified</li>
                                    )}
                                </ul>
                            </div>

                            {/* Gaps */}
                            <div>
                                <p className="text-xs font-medium text-foreground/80 mb-2.5">Gaps</p>
                                <ul className="gap-y-3">
                                    {(newer.report.gaps || []).slice(0, 3).map((g, i) => (
                                        <li key={g} className="text-sm text-foreground/70 leading-[1.6]">
                                            {firstSentence(g)}
                                        </li>
                                    ))}
                                    {(!newer.report.gaps?.length) && (
                                        <li className="text-xs italic text-muted-foreground">None identified</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
