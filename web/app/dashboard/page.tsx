"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ScoreProgressChart } from "@/components/workspace/ScoreProgressChart";
import { TrendingUp, BarChart3, Target, AlertTriangle, Star, ArrowLeft } from "lucide-react";
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
                <div className="text-center space-y-4">
                    <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground" />
                    <h1 className="text-2xl font-display text-foreground">Sign in to view your progress</h1>
                    <p className="text-muted-foreground max-w-md">
                        Track your progress, see score trends, and identify patterns across your resume reviews.
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
                <div className="animate-pulse space-y-4 text-center">
                    <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Loading your progress...</p>
                </div>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-body p-6">
                <div className="text-center space-y-4">
                    <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
                    <h1 className="text-2xl font-display text-foreground">Something went wrong</h1>
                    <p className="text-muted-foreground">{error || "Could not load analytics"}</p>
                </div>
            </div>
        );
    }

    if (analytics.totalReviews === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-body p-6">
                <div className="text-center space-y-4">
                    <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground" />
                    <h1 className="text-2xl font-display text-foreground">No reviews yet</h1>
                    <p className="text-muted-foreground max-w-md">
                        Run your first resume review to start tracking your progress.
                    </p>
                    <Link
                        href="/workspace"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded bg-brand text-white hover:bg-brand/90 transition-colors"
                    >
                        Run Your Review
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-body">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/workspace" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to Workspace</span>
                    </Link>
                    <h1 className="font-display text-lg font-semibold text-foreground">Your Progress</h1>
                    <div className="w-20" /> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* Variant Filter Tabs */}
                {analytics.variants.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilterVariant(null)}
                            className={`text-sm px-4 py-2 rounded transition-colors ${filterVariant === null
                                ? 'bg-foreground text-background'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            All Resumes
                        </button>
                        {analytics.variants.map(v => (
                            <button
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
                    <div className="bg-card border border-border rounded p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="w-5 h-5 text-brand" />
                            <span className="text-sm text-muted-foreground">
                                {filterVariant ? `${filterVariant} Reviews` : 'Total Reviews'}
                            </span>
                        </div>
                        <p className="text-3xl font-display font-bold text-foreground">
                            {filterVariant ? filteredStats.total : analytics.totalReviews}
                        </p>
                    </div>

                    {/* Average Score */}
                    <div className="bg-card border border-border rounded p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="w-5 h-5 text-brand" />
                            <span className="text-sm text-muted-foreground">Average Score</span>
                        </div>
                        <p className="text-3xl font-display font-bold text-foreground">
                            {filterVariant ? filteredStats.avg : analytics.averageScore}
                        </p>
                    </div>

                    {/* Improvement */}
                    <div className="bg-card border border-border rounded p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-brand" />
                            <span className="text-sm text-muted-foreground">Score Change</span>
                        </div>
                        <p className={`text-3xl font-display font-bold ${(filterVariant ? filteredStats.improvement : analytics.scoreImprovement) > 0 ? 'text-green-500' :
                                (filterVariant ? filteredStats.improvement : analytics.scoreImprovement) < 0 ? 'text-destructive' :
                                    'text-foreground'
                            }`}>
                            {(filterVariant ? filteredStats.improvement : analytics.scoreImprovement) > 0 ? '+' : ''}
                            {filterVariant ? filteredStats.improvement : analytics.scoreImprovement}
                        </p>
                    </div>
                </div>

                {/* Score Progress Chart */}
                <div className="bg-card border border-border rounded p-6">
                    <ScoreProgressChart scores={filteredScoreHistory} />
                </div>

                {/* Insights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Common Gaps */}
                    {analytics.commonGaps.length > 0 && (
                        <div className="bg-card border border-border rounded p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-5 h-5 text-warning" />
                                <h2 className="font-semibold text-foreground">Recurring Gaps</h2>
                            </div>
                            <ul className="space-y-2">
                                {analytics.commonGaps.map((gap, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
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
                                <Star className="w-5 h-5 text-green-500" />
                                <h2 className="font-semibold text-foreground">Consistent Strengths</h2>
                            </div>
                            <ul className="space-y-2">
                                {analytics.topStrengths.map((strength, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
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
