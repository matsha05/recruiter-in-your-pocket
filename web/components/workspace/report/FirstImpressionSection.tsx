"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PrincipalRecruiterIcon } from "@/components/icons";
import { ReportData } from "./ReportTypes";
import { cn } from "@/lib/utils";

function getScoreColor(score: number): string {
    // Return hsl color string for inline SVG stroke
    if (score >= 85) return 'hsl(var(--success))';
    if (score >= 70) return 'hsl(var(--premium))';
    return 'hsl(var(--destructive))';
}

function getScoreBand(score: number): { label: string; colorClass: string } {
    if (score >= 85) return { label: 'Competes for Senior Roles', colorClass: 'bg-success/10 border-success/20 text-success' };
    if (score >= 70) return { label: 'Solid Foundation', colorClass: 'bg-premium/10 border-premium/20 text-premium' };
    return { label: 'Needs Work', colorClass: 'bg-destructive/10 border-destructive/20 text-destructive' };
}

export function FirstImpressionSection({ data }: { data: ReportData }) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const [showBadge, setShowBadge] = useState(false);
    const [sectionVisible, setSectionVisible] = useState(false);
    const hasAnimated = useRef(false);

    const firstImpressionText = data.score_comment_long || data.score_comment_short || data.first_impression || data.summary;
    const targetScore = data.score || 0;
    const strokeColor = getScoreColor(targetScore);
    const scoreBand = data.score_label ? { label: data.score_label, colorClass: getScoreBand(targetScore).colorClass } : getScoreBand(targetScore);

    // Section entrance animation
    useEffect(() => {
        const timer = setTimeout(() => setSectionVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Score animation with badge reveal
    useEffect(() => {
        if (targetScore <= 0 || hasAnimated.current) {
            if (!hasAnimated.current) {
                setAnimatedScore(targetScore);
                setShowBadge(true);
            }
            return;
        }
        hasAnimated.current = true;
        const duration = 1200; // Slightly longer for more impact
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Smooth ease-out cubic for premium feel
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedScore(Math.round(targetScore * eased));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Show badge after score animation completes
                setTimeout(() => setShowBadge(true), 200);
            }
        };
        requestAnimationFrame(animate);
    }, [targetScore]);

    // Calculate stroke dash offset for the dial
    const circumference = 2 * Math.PI * 60; // r=60
    const strokeDashoffset = circumference - (circumference * animatedScore) / 100;

    return (
        <section className={cn(
            "space-y-6 transition-all duration-500 ease-out",
            sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
            {/* Section Header with horizontal line decoration */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-px bg-border" />
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <PrincipalRecruiterIcon className="w-4 h-4 text-brand" />
                        01. Recruiter First Impression
                    </h2>
                </div>
                <a
                    href="/research/how-we-score"
                    className="text-[10px] text-muted-foreground/60 hover:text-brand transition-colors font-medium"
                    target="_blank"
                    rel="noopener"
                >
                    How we score →
                </a>
            </div>

            {/* Main Card - THE Signature Moment */}
            <div className={cn(
                "bg-card rounded border border-border/60 shadow-sm overflow-hidden transition-all duration-700 ease-out",
                sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )} style={{ transitionDelay: '150ms' }}>
                <div className="grid md:grid-cols-5">

                    {/* LEFT: THE VERDICT (3 cols) */}
                    <div className="md:col-span-3 p-6 md:p-8 border-r border-border/40 space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-headline text-foreground">
                                &quot;Here is exactly what I noticed...&quot;
                            </h3>
                        </div>

                        <p className="text-base text-muted-foreground leading-relaxed font-serif">
                            {firstImpressionText}
                            {data.first_impression_takeaway && (
                                <> <span className="font-semibold text-foreground">{data.first_impression_takeaway}</span></>
                            )}
                        </p>

                        {/* The Critical Miss - uses warning color, not premium */}
                        {data.biggest_gap_example && (
                            <div className="p-4 bg-warning/10 border border-warning/20 rounded transition-all duration-300" style={{ transitionDelay: '400ms' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                                    <span className="text-label text-warning">Critical Miss</span>
                                </div>
                                <p className="text-sm text-foreground/90 leading-relaxed">
                                    {data.biggest_gap_example}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: THE SCORE DIAL (2 cols) */}
                    <div className="md:col-span-2 p-6 md:p-8 bg-secondary/20 flex flex-col items-center justify-center space-y-6">

                        {/* Score Dial */}
                        <div className="text-center space-y-4">
                            <div className="relative inline-flex items-center justify-center">
                                <svg className="w-36 h-36 transform -rotate-90">
                                    {/* Background circle */}
                                    <circle
                                        cx="72"
                                        cy="72"
                                        r="60"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="transparent"
                                        className="text-black/5 dark:text-white/5"
                                    />
                                    {/* Animated progress circle */}
                                    <circle
                                        cx="72"
                                        cy="72"
                                        r="60"
                                        stroke={strokeColor}
                                        strokeWidth="3"
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        style={{
                                            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
                                        }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-5xl font-serif font-bold tracking-tighter tabular-nums">{animatedScore}</span>
                                    <span className="text-label text-muted-foreground">Score</span>
                                </div>
                            </div>

                            {/* Score Band Badge - Delayed reveal */}
                            <div className={cn(
                                "transition-all duration-300 ease-out",
                                showBadge ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                            )}>
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider",
                                    scoreBand.colorClass
                                )}>
                                    <CheckCircle2 className="w-3 h-3" /> {scoreBand.label}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
