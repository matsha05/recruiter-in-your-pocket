"use client";

import { useState } from "react";
import { ReportData } from "./ReportTypes";
import { cn } from "@/lib/utils";
import { SignalRadarIcon } from "@/components/icons";
import { ReportSectionHeader } from "./ReportSectionHeader";
import { Info } from "lucide-react";

function getScoreColor(score: number): string {
    if (score >= 85) return 'text-success';
    if (score >= 70) return 'text-premium';
    return 'text-destructive';
}

function getScoreBg(score: number): string {
    if (score >= 85) return 'bg-success/5 border-success/20';
    if (score >= 70) return 'bg-premium/5 border-premium/20';
    return 'bg-destructive/5 border-destructive/20';
}

export function ScoreSummarySection({ data }: { data: ReportData }) {
    const [showTooltip, setShowTooltip] = useState(false);

    // Story first (most important), then others
    const subscores = [
        { key: 'story', label: 'Story', score: data.subscores?.story },
        { key: 'impact', label: 'Impact', score: data.subscores?.impact },
        { key: 'clarity', label: 'Clarity', score: data.subscores?.clarity },
        { key: 'readability', label: 'Readability', score: data.subscores?.readability },
    ];

    const hasSubscores = Boolean(data.subscores);
    const strengths = data.strengths?.slice(0, 5) || [];
    const gaps = data.gaps?.slice(0, 5) || [];
    const hasLists = strengths.length > 0 || gaps.length > 0;

    return (
        <section className="space-y-8">
            <div className="flex items-start justify-between">
                <ReportSectionHeader
                    icon={<SignalRadarIcon className="w-4 h-4 text-brand" />}
                    number="02"
                    title="Signal Analysis"
                    subtitle="What made me lean in, and what made me pause."
                />

                {/* Methodology Tooltip */}
                <div className="relative">
                    <button
                        onClick={() => setShowTooltip(!showTooltip)}
                        className="text-muted-foreground/40 hover:text-muted-foreground transition-colors p-1"
                        aria-label="How we score"
                    >
                        <Info className="w-4 h-4" />
                    </button>
                    {showTooltip && (
                        <div className="absolute right-0 top-8 z-20 w-72 p-4 bg-card border border-border rounded-lg shadow-lg text-xs space-y-3">
                            <p className="font-semibold text-foreground">How we score</p>
                            <p className="text-muted-foreground">
                                Each dimension is scored 0–100 based on how clearly your resume signals that quality.
                            </p>
                            <div className="space-y-1 pt-2 border-t border-border">
                                <p><span className="font-semibold text-foreground">Story</span> — What narrative are you telling? This is the most important signal.</p>
                                <p><span className="text-muted-foreground">Impact, Clarity, Readability</span> — Supporting dimensions that strengthen your story.</p>
                            </div>
                            <div className="space-y-1 pt-2 border-t border-border">
                                <p><span className="text-success font-medium">85+</span> Strong signal</p>
                                <p><span className="text-premium font-medium">70–84</span> Solid</p>
                                <p><span className="text-destructive font-medium">&lt;70</span> Needs work</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Subscores Grid - Clean, colored numbers only */}
            {hasSubscores ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {subscores.map((item) => item.score !== undefined && (
                        <div
                            key={item.key}
                            className="bg-secondary/20 border border-border/40 p-5 rounded-lg flex flex-col items-center justify-center text-center gap-1"
                        >
                            <span className={cn("text-3xl font-serif font-bold tabular-nums", getScoreColor(item.score))}>
                                {item.score}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border border-border bg-secondary/10 p-5 text-sm text-muted-foreground">
                    Subscores weren’t available for this run. The summary below is based on the returned strengths and gaps.
                </div>
            )}

            {/* Strengths & Gaps - Clean lists, equal weight */}
            {hasLists ? (
                <div className="grid md:grid-cols-2 gap-8">
                {/* Working */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Working
                    </h3>
                    <ul className="space-y-3">
                        {strengths.length > 0 ? strengths.map((s, i) => (
                            <li key={i} className="text-sm leading-relaxed text-muted-foreground">
                                {s}
                            </li>
                        )) : (
                            <li className="text-sm leading-relaxed text-muted-foreground/70">No strengths were returned.</li>
                        )}
                    </ul>
                </div>

                {/* Missing */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-premium">
                        Missing
                    </h3>
                    <ul className="space-y-3">
                        {gaps.length > 0 ? gaps.map((s, i) => (
                            <li key={i} className="text-sm leading-relaxed text-muted-foreground">
                                {s}
                            </li>
                        )) : (
                            <li className="text-sm leading-relaxed text-muted-foreground/70">No gaps were returned.</li>
                        )}
                    </ul>
                </div>
            </div>
            ) : (
                <div className="rounded-lg border border-border bg-secondary/10 p-5 text-sm text-muted-foreground">
                    Signal analysis wasn’t available for this run.
                </div>
            )}
        </section>
    );
}
