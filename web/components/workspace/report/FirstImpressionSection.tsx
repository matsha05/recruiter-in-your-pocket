"use client";

import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";
import { ReportData } from "./ReportTypes";
import { cn } from "@/lib/utils";

function getScoreColor(score: number): string {
    if (score >= 90) return 'var(--color-moss-600)';
    if (score >= 85) return 'var(--color-indigo-500)';
    if (score >= 80) return 'var(--color-amber-500)';
    if (score >= 70) return 'var(--color-amber-400)';
    return 'var(--color-danger)';
}

export function FirstImpressionSection({ data }: { data: ReportData }) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const hasAnimated = useRef(false);

    const firstImpressionText = data.score_comment_long || data.score_comment_short || data.first_impression || data.summary;
    const targetScore = data.score || 0;
    const dialColor = getScoreColor(targetScore);

    useEffect(() => {
        if (targetScore <= 0 || hasAnimated.current) {
            if (!hasAnimated.current) setAnimatedScore(targetScore);
            return;
        }
        hasAnimated.current = true;
        const duration = 1000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedScore(Math.round(targetScore * eased));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [targetScore]);

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-px bg-border"></span>
                    01. Recruiter First Impression
                </h2>
            </div>

            {/* Main Dossier Card */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden relative group">
                {/* Subtle background grain or noise could go here */}

                <div className="p-8 md:p-10 space-y-8">

                    {/* Header Row: Label & Score Stamp */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border/60">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 text-primary/80">
                                <Eye className="w-4 h-4" />
                                <span className="text-xs font-bold tracking-widest uppercase">The 6-Second Scan</span>
                            </div>
                            <h3 className="font-serif text-3xl md:text-4xl text-foreground leading-tight max-w-3xl">
                                "Here is exactly what I noticed..."
                            </h3>
                        </div>

                        {/* The "Stamp" - Typography Based */}
                        <div className="flex-shrink-0">
                            <div className="flex flex-col items-center justify-center px-6 py-4 bg-muted/20 border-2 border-primary/10 rounded-lg text-center min-w-[140px]">
                                <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-1">Audit Score</span>
                                <div className="flex items-baseline gap-1" style={{ color: dialColor }}>
                                    <span className="text-5xl font-serif font-bold tracking-tighter">{animatedScore}</span>
                                    <span className="text-lg font-medium text-muted-foreground">/100</span>
                                </div>
                                {data.score_label && (
                                    <div className="mt-2 px-2 py-0.5 bg-background border border-border/50 rounded text-[10px] font-bold uppercase tracking-wider text-foreground">
                                        {data.score_label}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content Row: Narrative & Key Insight */}
                    <div className="grid md:grid-cols-3 gap-10">
                        {/* Narrative (2/3 width) */}
                        <div className="md:col-span-2 prose prose-neutral dark:prose-invert max-w-none">
                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-serif">
                                {firstImpressionText}
                            </p>
                        </div>

                        {/* Critical Issue Sidebar (1/3 width) */}
                        <div className="space-y-4">
                            {data.biggest_gap_example && (
                                <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-500">Critical Miss</span>
                                    </div>
                                    <p className="text-xs md:text-sm text-foreground/80 leading-relaxed font-medium">
                                        {data.biggest_gap_example}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
