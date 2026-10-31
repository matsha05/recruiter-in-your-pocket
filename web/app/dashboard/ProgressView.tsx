"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import styles from "./progress.module.css";

export interface ProgressAnalytics {
    totalReviews: number;
    averageScore: number;
    scoreImprovement: number;
    scoreHistory: Array<{ date: string; score: number; name?: string; variant?: string; targetRole?: string }>;
    commonGaps: Array<{ text: string; count: number }>;
    topStrengths: Array<{ text: string; count: number }>;
    variants: string[];
}

const formatDate = (value: string) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function movementSentence(first: number, latest: number, count: number) {
    if (count < 2) return "One report so far. Save your next version and you'll see how it moves.";
    const change = latest - first;
    if (change > 0) return `Up ${change} since your first report.`;
    if (change < 0) return `Down ${Math.abs(change)} since your first report. Read the latest Critical Miss before changing it again.`;
    return "Same score as your first report. The written findings show what moved.";
}

/** The signed-in Progress view: written patterns first, the score timeline second. */
export function ProgressView({ analytics }: { analytics: ProgressAnalytics }) {
    const [filterVariant, setFilterVariant] = useState<string | null>(null);
    const history = useMemo(() => {
        const filtered = filterVariant ? analytics.scoreHistory.filter((point) => point.variant === filterVariant) : analytics.scoreHistory;
        return [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [analytics, filterVariant]);

    const first = history[0]?.score ?? 0;
    const latest = history[history.length - 1]?.score ?? 0;
    const latestIndex = history.length - 1;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Your progress</h1>
                    <p className={styles.deck}>What keeps tripping recruiters up, and what keeps landing.</p>
                </div>
                <Link href="/reports" className={styles.textLink}>My reports</Link>
            </header>

            {analytics.variants.length > 0 && (
                <div className={styles.filters} role="group" aria-label="Show progress for">
                    {[null, ...analytics.variants].map((variant) => (
                        <button
                            key={variant ?? "all"}
                            type="button"
                            aria-pressed={filterVariant === variant}
                            className={cn(styles.filter, filterVariant === variant && styles.filterActive)}
                            onClick={() => setFilterVariant(variant)}
                        >
                            {variant ?? "All resumes"}
                        </button>
                    ))}
                </div>
            )}

            <div className={styles.grid}>
                <section className={styles.sheet} aria-labelledby="coming-up-title">
                    <h2 id="coming-up-title" className={styles.sheetTitle}>What keeps coming up</h2>
                    {analytics.commonGaps.length > 0 ? (
                        <ul className={styles.notes}>
                            {analytics.commonGaps.map((gap) => (
                                <li key={gap.text}>
                                    <p className={styles.note}>{gap.text}</p>
                                    {gap.count > 1 && <p className={styles.noteMeta}>In {gap.count} reports</p>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.empty}>Nothing has repeated across your reports yet.</p>
                    )}
                </section>

                <section className={styles.sheet} aria-labelledby="working-title">
                    <h2 id="working-title" className={styles.sheetTitle}>What keeps working</h2>
                    {analytics.topStrengths.length > 0 ? (
                        <ul className={styles.notes}>
                            {analytics.topStrengths.map((strength) => (
                                <li key={strength.text}>
                                    <p className={cn(styles.note, styles.noteKeep)}>{strength.text}</p>
                                    {strength.count > 1 && <p className={styles.noteMeta}>In {strength.count} reports</p>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.empty}>Strengths that show up more than once will collect here.</p>
                    )}
                </section>
            </div>

            <section className={styles.sheet} aria-labelledby="scores-title">
                <div className={styles.scoresHeader}>
                    <h2 id="scores-title" className={styles.sheetTitle}>First Impression score over time</h2>
                    <p className={styles.movement}>{movementSentence(first, latest, history.length)}</p>
                </div>
                <ol className={styles.timeline}>
                    {history.map((point, index) => (
                        <li key={`${point.date}-${index}`} className={cn(styles.point, index === latestIndex && styles.pointLatest)}>
                            <span className={styles.pointLabel}>{point.name ? <>{point.name}<span className={styles.pointDate}>{formatDate(point.date)}</span></> : formatDate(point.date)}</span>
                            <span className={styles.track} aria-hidden="true"><span style={{ transform: `scaleX(${point.score / 100})` }} /></span>
                            <span className={styles.pointScore}>{point.score}</span>
                        </li>
                    ))}
                </ol>
                <p className={styles.footnote}>Scores compare versions of your own resume. They don&apos;t predict interviews or offers.</p>
            </section>
        </div>
    );
}
