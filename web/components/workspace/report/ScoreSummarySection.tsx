"use client";

import { ReportData } from "./ReportTypes";
import { cn } from "@/lib/utils";
import { getScoreColor } from "@/lib/score-utils";
import { SignalRadarIcon } from "@/components/icons";
import { ReportSectionHeader } from "./ReportSectionHeader";

export function ScoreSummarySection({ data }: { data: ReportData }) {
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
            <ReportSectionHeader
                icon={<SignalRadarIcon className="w-4 h-4 text-brand" />}
                number="02"
                title="Signal Analysis"
                subtitle="What made me lean in, and what made me pause."
            />

            {/* Subscores Grid - Story emphasized as most important */}
            {hasSubscores ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {subscores.map((item, index) => item.score !== undefined && (
                        <div
                            key={item.key}
                            className={cn(
                                "bg-card border border-border/60 p-4 rounded flex flex-col items-center justify-center text-center gap-1 transition-all hover:border-brand/30",
                                index === 0 && "ring-1 ring-brand/10 bg-brand/5" // Story gets subtle emphasis
                            )}
                        >
                            <span className={cn(
                                "font-display font-bold tabular-nums text-3xl tracking-tight",
                                getScoreColor(item.score)
                            )}>
                                {item.score}
                            </span>
                            <span className="text-label text-muted-foreground">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded border border-border/60 bg-secondary/10 p-5 text-sm text-muted-foreground">
                    Subscores unavailable for this run.
                </div>
            )}

            {/* Strengths & Gaps - Clean lists, equal weight */}
            {hasLists ? (
                <div className="grid md:grid-cols-2 gap-6">
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
                <div className="rounded border border-border/60 bg-secondary/10 p-5 text-sm text-muted-foreground">
                    Signal breakdown unavailable.
                </div>
            )}
        </section>
    );
}
