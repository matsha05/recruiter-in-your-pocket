"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ScoreProgressChart } from "@/components/workspace/ScoreProgressChart";
import { TrendingUp, BarChart3, Target, AlertTriangle, Star, ArrowLeft } from "lucide-react";
import { EmptyReportIcon } from "@/components/icons";
import { AppPageIntro } from "@/components/layout/AppPageIntro";
import Link from "next/link";

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
    const { user, signOut } = useAuth();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterVariant, setFilterVariant] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchAnalytics();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch("/api/analytics");
            const data = await res.json();
            if (data.ok) {
                setAnalytics(data.analytics);
            } else {
                setError(data.message || "Failed to load analytics");
            }
        } catch (err) {
            console.error("Analytics fetch error:", err);
            setError("Failed to load analytics");
        } finally {
            setLoading(false);
        }
    };

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

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-body p-6">
                <div className="text-center gap-y-4">
                    <BarChart3 className="size-12 mx-auto text-muted-foreground" />
                    <h1 className="text-2xl font-display text-foreground">Sign in to view your progress</h1>
                    <p className="text-muted-foreground max-w-md">
                        Compare resume versions and revisit the written findings from each report.
                    </p>
                    <Link
                        href="/workspace"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded bg-brand text-white hover:bg-brand/90 transition-colors"
                    >
                        Go to Workspace
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-body">
                <div className="animate-pulse gap-y-4 text-center">
                    <BarChart3 className="size-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Loading your progress…</p>
                </div>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-body p-6">
                <div className="text-center gap-y-4">
                    <AlertTriangle className="size-12 mx-auto text-destructive" />
                    <h1 className="text-2xl font-display text-foreground">Something went wrong</h1>
                    <p className="text-muted-foreground">{error || "Could not load analytics"}</p>
                </div>
            </div>
        );
    }

    if (analytics.totalReviews === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-body p-6">
                <div className="text-center gap-y-4">
                    <div className="mx-auto flex size-20 items-center justify-center rounded-xl border border-brand/15 bg-brand/[0.045] text-brand">
                        <EmptyReportIcon className="size-12" />
                    </div>
                    <h1 className="text-2xl font-display text-foreground">No reports yet</h1>
                    <p className="text-muted-foreground max-w-md">
                        Get your first resume report to start tracking your progress.
                    </p>
                    <Link
                        href="/workspace"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded bg-brand text-white hover:bg-brand/90 transition-colors"
                    >
                        Review my resume
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-mineral">
            <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
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
                    <div className="flex flex-wrap gap-2">
                        <button type="button"
                            onClick={() => setFilterVariant(null)}
                            className={`text-sm px-4 py-2 rounded transition-colors ${filterVariant === null
                                ? 'bg-foreground text-background'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            All Resumes
                        </button>
                        {analytics.variants.map(v => (
                            <button type="button"
                                key={v}
                                onClick={() => setFilterVariant(v)}
                                className={`text-sm px-4 py-2 rounded transition-colors ${filterVariant === v
                                    ? 'bg-foreground text-background'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
                        <div className="bg-card border border-border rounded p-6">
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
                        <div className="bg-card border border-border rounded p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Star className="size-5 text-green-500" />
                                <h2 className="font-semibold text-foreground">Consistent Strengths</h2>
                            </div>
                            <ul className="gap-y-2">
                                {analytics.topStrengths.map((strength, i) => (
                                    <li key={strength.text} className="flex items-start gap-2 text-sm">
                                        <span className="text-green-500">✓</span>
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
            </main>
        </div>
    );
}
