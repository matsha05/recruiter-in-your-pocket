"use client";

import { ReportData } from "./ReportTypes";
import { cn } from "@/lib/utils";
import { SignalRadarIcon } from "@/components/icons";

function getScoreColor(score: number): string {
    if (score >= 90) return 'text-moss';
    if (score >= 80) return 'text-amber';
    return 'text-rose';
}

export function ScoreSummarySection({ data }: { data: ReportData }) {
    if (!data.subscores) return null;

    return (
        <section className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <SignalRadarIcon className="w-4 h-4 text-brand" />
                02. Signal Analysis
            </h2>

            {/* Subscores Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { key: 'impact', label: 'Impact', score: data.subscores.impact },
                    { key: 'clarity', label: 'Clarity', score: data.subscores.clarity },
                    { key: 'story', label: 'Story', score: data.subscores.story },
                    { key: 'readability', label: 'Readability', score: data.subscores.readability },
                ].map((item) => item.score !== undefined && (
                    <div key={item.key} className="bg-secondary/30 border border-border/40 p-5 rounded-xl flex flex-col items-center justify-center text-center gap-1 group hover:bg-secondary/50 transition-colors">
                        <span className={cn("text-3xl font-serif font-bold", getScoreColor(item.score))}>{item.score}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Strengths & Gaps */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
                {/* Working */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-moss flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-moss" /> Working
                    </h3>
                    <ul className="space-y-2">
                        {data.strengths?.slice(0, 5).map((s, i) => (
                            <li key={i} className="text-sm text-foreground/80 leading-snug pl-2 border-l border-border/50">
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Missing */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-amber flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber" /> Missing
                    </h3>
                    <ul className="space-y-2">
                        {data.gaps?.slice(0, 5).map((s, i) => (
                            <li key={i} className="text-sm text-foreground/80 leading-snug pl-2 border-l border-border/50">
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
