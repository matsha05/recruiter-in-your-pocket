"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Check } from "lucide-react";

interface ScorePoint {
    date: string;
    score: number;
    name?: string;
}

interface ScoreProgressChartProps {
    scores: ScorePoint[];
    className?: string;
}

export function ScoreProgressChart({ scores, className = "" }: ScoreProgressChartProps) {
    const sortedScores = useMemo(() => {
        return [...scores].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [scores]);

    const improvement = useMemo(() => {
        if (sortedScores.length < 2) return 0;
        return sortedScores[sortedScores.length - 1].score - sortedScores[0].score;
    }, [sortedScores]);

    const maxScore = Math.max(...sortedScores.map(s => s.score), 100);
    const minScore = Math.min(...sortedScores.map(s => s.score), 0);
    const range = maxScore - minScore || 1;

    if (sortedScores.length === 0) {
        return (
            <div className={`text-center text-muted-foreground ${className}`}>
                No score data available
            </div>
        );
    }

    if (sortedScores.length === 1) {
        return (
            <div className={`text-center ${className}`}>
                <div className="mb-2 font-display text-5xl riyp-weight-560 tabular-nums text-foreground">
                    {sortedScores[0].score}
                </div>
                <p className="text-sm text-muted-foreground">Your first report</p>
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Summary Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Review score history</h3>
                    <p className="text-xs text-muted-foreground">
                        {sortedScores.length} reports tracked
                    </p>
                </div>
                <div className={`flex items-center gap-2 border-l-2 px-3 py-1 text-sm font-semibold ${improvement > 0
                    ? 'border-success bg-success/10 text-success'
                    : improvement < 0
                        ? 'border-destructive bg-error-surface text-destructive'
                        : 'border-line bg-paper-muted text-muted-foreground'
                    }`}>
                    {improvement > 0 ? (
                        <TrendingUp className="size-4" />
                    ) : improvement < 0 ? (
                        <TrendingDown className="size-4" />
                    ) : (
                        <Minus className="size-4" />
                    )}
                    {improvement > 0 ? '+' : ''}{improvement} pts
                </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="gap-y-2">
                {sortedScores.map((point, idx) => {
                    const widthPercent = ((point.score - minScore) / range) * 100;
                    const isLatest = idx === sortedScores.length - 1;
                    const formatDate = (dateStr: string) => {
                        return new Date(dateStr).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                        });
                    };

                    return (
                        <div key={point.date} className="gap-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className={`${isLatest ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                    {point.name || formatDate(point.date)}
                                </span>
                                <span className={`font-semibold ${isLatest ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {point.score}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-150 motion-reduce:transition-none ${point.score >= 75 ? 'bg-success' :
                                        point.score >= 60 ? 'bg-brand' :
                                            point.score >= 45 ? 'bg-warning' :
                                                'bg-destructive'
                                        }`}
                                    style={{ width: `${widthPercent}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Improvement Message */}
            {improvement !== 0 && (
                <div className={`mt-4 text-center text-sm ${improvement > 0 ? 'text-success' : 'text-destructive'
                    }`}>
                    {improvement > 0 ? (
                        <><Check className="inline size-4 mr-1" /> The latest version scored {improvement} points higher in this review</>
                    ) : (
                        `The latest version scored ${Math.abs(improvement)} points lower. Review the written findings before changing it again.`
                    )}
                </div>
            )}
        </div>
    );
}
