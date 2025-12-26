"use client";

import { useState } from "react";
import { X, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { ReportData } from "./report/ReportTypes";
import { ScoreBadge } from "@/components/shared/ScoreBadge";

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

export function VersionComparisonView({ reportA, reportB, onClose }: VersionComparisonViewProps) {
    // Ensure A is older, B is newer for proper comparison
    const older = new Date(reportA.createdAt) < new Date(reportB.createdAt) ? reportA : reportB;
    const newer = older === reportA ? reportB : reportA;

    const scoreDiff = newer.score - older.score;
    const isImprovement = scoreDiff > 0;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-foreground">Version Comparison</h2>

                        {/* Score Delta */}
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${isImprovement
                            ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                            : scoreDiff < 0
                                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                : 'bg-muted text-muted-foreground border border-border'
                            }`}>
                            {isImprovement ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : scoreDiff < 0 ? (
                                <TrendingDown className="w-4 h-4" />
                            ) : null}
                            {scoreDiff > 0 ? '+' : ''}{scoreDiff} points
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Comparison Grid */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 divide-x divide-border">
                        {/* Older Version */}
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Previous</h3>
                                        <p className="text-lg font-semibold text-foreground">
                                            {older.name || formatDate(older.createdAt)}
                                        </p>
                                    </div>
                                    <ScoreBadge score={older.score} label={older.scoreLabel} size="lg" />
                                </div>

                                {/* Role & Variant Badges */}
                                <div className="flex flex-wrap gap-2">
                                    {older.targetRole && (
                                        <span className="text-xs px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
                                            → {older.targetRole}
                                        </span>
                                    )}
                                    {older.resumeVariant && (
                                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                            {older.resumeVariant}
                                        </span>
                                    )}
                                </div>

                                {/* JD Preview */}
                                {older.jdPreview && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 italic">
                                        "{older.jdPreview.slice(0, 100)}..."
                                    </p>
                                )}
                            </div>

                            {/* Strengths */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Strengths</h4>
                                <ul className="space-y-1">
                                    {(older.report.strengths || []).slice(0, 3).map((s, i) => (
                                        <li key={i} className="text-sm text-foreground/80">{s}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Gaps */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gaps</h4>
                                <ul className="space-y-1">
                                    {(older.report.gaps || []).slice(0, 3).map((g, i) => (
                                        <li key={i} className="text-sm text-foreground/80">{g}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Newer Version */}
                        <div className="p-6 space-y-6 bg-muted/10">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Current</h3>
                                        <p className="text-lg font-semibold text-foreground">
                                            {newer.name || formatDate(newer.createdAt)}
                                        </p>
                                    </div>
                                    <ScoreBadge score={newer.score} label={newer.scoreLabel} size="lg" />
                                </div>

                                {/* Role & Variant Badges */}
                                <div className="flex flex-wrap gap-2">
                                    {newer.targetRole && (
                                        <span className="text-xs px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
                                            → {newer.targetRole}
                                        </span>
                                    )}
                                    {newer.resumeVariant && (
                                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                            {newer.resumeVariant}
                                        </span>
                                    )}
                                </div>

                                {/* JD Preview */}
                                {newer.jdPreview && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 italic">
                                        "{newer.jdPreview.slice(0, 100)}..."
                                    </p>
                                )}
                            </div>

                            {/* Strengths */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Strengths</h4>
                                <ul className="space-y-1">
                                    {(newer.report.strengths || []).slice(0, 3).map((s, i) => (
                                        <li key={i} className="text-sm text-foreground/80">{s}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Gaps */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gaps</h4>
                                <ul className="space-y-1">
                                    {(newer.report.gaps || []).slice(0, 3).map((g, i) => (
                                        <li key={i} className="text-sm text-foreground/80">{g}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Summary */}
                <div className="p-4 border-t border-border bg-muted/30">
                    <div className="flex items-center justify-center gap-2 text-sm">
                        {isImprovement ? (
                            <p className="text-green-600 font-medium">
                                ✓ Your resume improved by {scoreDiff} points since {formatDate(older.createdAt)}
                            </p>
                        ) : scoreDiff < 0 ? (
                            <p className="text-destructive font-medium">
                                Score decreased by {Math.abs(scoreDiff)} points — review changes carefully
                            </p>
                        ) : (
                            <p className="text-muted-foreground">
                                No score change between versions
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
