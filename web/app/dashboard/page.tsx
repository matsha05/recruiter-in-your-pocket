"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ScoreProgressChart } from "@/components/workspace/ScoreProgressChart";
import { TrendingUp, BarChart3, Target, AlertTriangle, Star, ArrowLeft, Check } from "lucide-react";
import { EmptyReportIcon } from "@/components/icons";
import { AppPageIntro } from "@/components/layout/AppPageIntro";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Analytics {
    totalReviews: number;
    averageScore: number;
    scoreImprovement: number;
    scoreHistory: Array<{ date: string; score: number; name?: string; variant?: string; targetRole?: string }>;
    commonGaps: Array<{ text: string; count: number }>;
    topStrengths: Array<{ text: string; count: number }>;
    variants: string[];
}

export default function DashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterVariant, setFilterVariant] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/analytics");
            const data = await res.json().catch(() => null);
            if (res.ok && data?.ok) {
                setAnalytics(data.analytics);
            } else {
                setError(data?.message || "We could not load your progress right now.");
            }
        } catch (err) {
            console.error("Analytics fetch error:", err);
            setError("Failed to load analytics");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;

        if (user) {
            void fetchAnalytics();
            return;
        }

        setAnalytics(null);
        setError(null);
        setLoading(false);
    }, [authLoading, fetchAnalytics, user]);

    // Filtered score history based on variant selection
    const filteredScoreHistory = useMemo(() => {
        if (!analytics) return [];
        if (!filterVariant) return analytics.scoreHistory;
        return analytics.scoreHistory.filter(s => s.variant === filterVariant);
    }, [analytics, filterVariant]);

    // Computed stats for filtered data
    const filteredStats = useMemo(() => {
        if (filteredScoreHistory.length === 0) {
            return { total: 0, avg: 0, improvement: 0 };
        }
        const scores = filteredScoreHistory.map(s => s.score);
        return {
            total: filteredScoreHistory.length,
            avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            improvement: filteredScoreHistory.length >= 2
                ? filteredScoreHistory[filteredScoreHistory.length - 1].score - filteredScoreHistory[0].score
                : 0
        };
    }, [filteredScoreHistory]);

    if (authLoading || loading) {
        return (
            <section className="flex flex-1 bg-paper px-5 pb-20 pt-20 md:px-8 md:pb-28 md:pt-28" aria-busy="true" aria-live="polite">
                <div className="mx-auto w-full max-w-[72rem] border-t border-line pt-7">
                    <div className="grid animate-pulse gap-10 motion-reduce:animate-none md:grid-cols-[13rem_minmax(0,1fr)] md:gap-12">
                        <div className="h-3 w-20 bg-brand/20" />
                        <div className="max-w-[48rem] space-y-5">
                            <div className="h-16 w-full bg-paper-muted" />
                            <div className="h-5 w-4/5 bg-paper-muted" />
                            <p className="sr-only">Loading your progress</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="flex flex-1 bg-paper px-5 pb-20 pt-20 md:px-8 md:pb-28 md:pt-28">
                <div className="mx-auto w-full max-w-[72rem] border-t border-line pt-7">
                    <div className="grid gap-10 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-12">
                        <div>
                            <p className="text-xs font-semibold uppercase riyp-track-010 text-brand">Progress</p>
                            <div className="mt-6 flex size-16 items-center justify-center border border-cyan-bright/35 bg-surface-sky text-brand">
                                <BarChart3 className="size-8" aria-hidden="true" />
                            </div>
                        </div>
                        <div className="max-w-[48rem]">
                            <h1 className="exception-page-title font-display riyp-weight-620 text-foreground riyp-stretch-91">
                                Your resume should get clearer with every pass.
                            </h1>
                            <p className="mt-6 max-w-[40rem] text-lg leading-8 text-muted-foreground">
                                Sign in to compare saved versions, revisit the evidence behind each report, and see which findings keep showing up.
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/auth?from=dashboard&next=/dashboard"
                                    className="focus-ring inline-flex min-h-13 items-center justify-center gap-3 rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                                >
                                    Sign in to view progress
                                    <ArrowLeft className="size-4 rotate-180 text-citron" aria-hidden="true" />
                                </Link>
                                <Link
                                    href="/workspace"
                                    className="focus-ring inline-flex min-h-13 items-center justify-center rounded-md border border-foreground bg-paper px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-paper-muted"
                                >
                                    Start a new report
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (error || !analytics) {
        return (
            <section className="flex flex-1 bg-paper px-5 pb-20 pt-20 md:px-8 md:pb-28 md:pt-28">
                <div className="mx-auto w-full max-w-[72rem] border-t border-line pt-7">
                    <div className="grid gap-10 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-12">
                        <div>
                            <p className="text-xs font-semibold uppercase riyp-track-010 text-destructive">Progress unavailable</p>
                            <div className="mt-6 flex size-16 items-center justify-center border border-destructive/30 bg-error-surface text-destructive">
                                <AlertTriangle className="size-8" aria-hidden="true" />
                            </div>
                        </div>
                        <div className="max-w-[48rem]">
                            <h1 className="exception-page-title font-display riyp-weight-620 text-foreground riyp-stretch-91">Your reports are still here.</h1>
                            <p role="alert" className="mt-6 max-w-[40rem] text-lg leading-8 text-muted-foreground">{error || "We could not load your progress right now."}</p>
                            <Button type="button" onClick={() => void fetchAnalytics()} className="mt-9 min-h-13 bg-foreground px-6 py-3 text-sm font-semibold text-background hover:bg-foreground/90">Try again</Button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (analytics.totalReviews === 0) {
        return (
            <section className="flex flex-1 bg-paper px-5 pb-20 pt-20 md:px-8 md:pb-28 md:pt-28">
                <div className="mx-auto w-full max-w-[72rem] border-t border-line pt-7">
                    <div className="grid gap-10 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-12">
                        <div>
                            <p className="text-xs font-semibold uppercase riyp-track-010 text-brand">No history yet</p>
                            <div className="mt-6 flex size-16 items-center justify-center border border-cyan-bright/35 bg-surface-sky text-brand">
                                <EmptyReportIcon className="size-9" />
                            </div>
                        </div>
                        <div className="max-w-[48rem]">
                            <h1 className="exception-page-title font-display riyp-weight-620 text-foreground riyp-stretch-91">The first version sets the baseline.</h1>
                            <p className="mt-6 max-w-[40rem] text-lg leading-8 text-muted-foreground">Run and save a report. The next version will have something honest to compare against.</p>
                            <Link href="/workspace" className="focus-ring mt-9 inline-flex min-h-13 items-center gap-3 rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90">
                                Review my resume
                                <ArrowLeft className="size-4 rotate-180 text-citron" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <div className="flex-1 bg-mineral">
            <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
                <AppPageIntro
                    eyebrow="Progress"
                    title="What changed between versions"
                    description="Compare your report history, see whether the written findings are getting clearer, and revisit the patterns that keep showing up."
                    actions={
                        <Link href="/workspace" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40">
                            <ArrowLeft className="size-4" />
                            Back to workspace
                        </Link>
                    }
                />
                {/* Variant Filter Tabs */}
                {analytics.variants.length > 0 && (
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter progress by resume label">
                        <button type="button"
                            onClick={() => setFilterVariant(null)}
                            aria-pressed={filterVariant === null}
                            className={`min-h-11 border-b-2 px-4 py-2 text-sm transition-colors ${filterVariant === null
                                ? 'border-citron bg-foreground text-background'
                                : 'border-transparent bg-paper-muted text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            All Resumes
                        </button>
                        {analytics.variants.map(v => (
                            <button type="button"
                                key={v}
                                onClick={() => setFilterVariant(v)}
                                aria-pressed={filterVariant === v}
                                className={`min-h-11 border-b-2 px-4 py-2 text-sm transition-colors ${filterVariant === v
                                    ? 'border-citron bg-foreground text-background'
                                    : 'border-transparent bg-paper-muted text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                )}
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Reviews */}
                    <div className="border-y border-border bg-card px-1 py-5 md:px-5">
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="size-5 text-brand" />
                            <span className="text-sm text-muted-foreground">
                                {filterVariant ? `${filterVariant} Reviews` : 'Total Reviews'}
                            </span>
                        </div>
                        <p className="font-display text-3xl riyp-weight-560 tabular-nums text-foreground">
                            {filterVariant ? filteredStats.total : analytics.totalReviews}
                        </p>
                    </div>

                    {/* Average Score */}
                    <div className="border-y border-border bg-card px-1 py-5 md:px-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="size-5 text-brand" />
                            <span className="text-sm text-muted-foreground">Average Score</span>
                        </div>
                        <p className="font-display text-3xl riyp-weight-560 tabular-nums text-foreground">
                            {filterVariant ? filteredStats.avg : analytics.averageScore}
                        </p>
                    </div>

                    {/* Improvement */}
                    <div className="border-y border-border bg-card px-1 py-5 md:px-5">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="size-5 text-brand" />
                            <span className="text-sm text-muted-foreground">Score Change</span>
                        </div>
                        <p className={`font-display text-3xl riyp-weight-560 tabular-nums ${(filterVariant ? filteredStats.improvement : analytics.scoreImprovement) > 0 ? 'text-success' :
                                (filterVariant ? filteredStats.improvement : analytics.scoreImprovement) < 0 ? 'text-destructive' :
                                    'text-foreground'
                            }`}>
                            {(filterVariant ? filteredStats.improvement : analytics.scoreImprovement) > 0 ? '+' : ''}
                            {filterVariant ? filteredStats.improvement : analytics.scoreImprovement}
                        </p>
                    </div>
                </div>

                {/* Score Progress Chart */}
                <div className="border-y border-border bg-card p-6">
                    <ScoreProgressChart scores={filteredScoreHistory} />
                </div>

                {/* Insights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Common Gaps */}
                    {analytics.commonGaps.length > 0 && (
                        <div className="border-y border-line bg-background p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="size-5 text-warning" />
                                <h2 className="font-semibold text-foreground">Recurring Gaps</h2>
                            </div>
                            <ul className="gap-y-2">
                                {analytics.commonGaps.map((gap, i) => (
                                    <li key={gap.text} className="flex items-start gap-2 text-sm">
                                        <span className="text-warning">•</span>
                                        <span className="text-foreground/80">{gap.text}</span>
                                        {gap.count > 1 && (
                                            <span className="text-xs text-muted-foreground ml-auto">×{gap.count}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Top Strengths */}
                    {analytics.topStrengths.length > 0 && (
                        <div className="border-y border-line bg-background p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Star className="size-5 text-success" />
                                <h2 className="font-semibold text-foreground">Consistent Strengths</h2>
                            </div>
                            <ul className="gap-y-2">
                                {analytics.topStrengths.map((strength, i) => (
                                    <li key={strength.text} className="flex items-start gap-2 text-sm">
                                        <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                                        <span className="text-foreground/80">{strength.text}</span>
                                        {strength.count > 1 && (
                                            <span className="text-xs text-muted-foreground ml-auto">×{strength.count}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
