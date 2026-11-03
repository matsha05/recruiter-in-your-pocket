import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { ReportData } from "./ReportTypes";
import styles from "./ReadComparison.module.css";

type ReadComparisonProps = {
    previous: ReportData;
    current: ReportData;
};

function normalize(value: string) {
    return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function snapshot(report: ReportData) {
    const miss = report.top_fixes?.[0];
    return {
        verdict: report.first_impression || report.first_impression_takeaway || report.summary || "",
        score: typeof report.score === "number" ? report.score : null,
        miss: miss?.fix || miss?.text || "",
    };
}

/**
 * Compares two reports on the same resume the way a person would: did the Critical Miss change,
 * and did the score move? A changed Critical Miss means the report now leads with something else;
 * it does not prove the old gap was fixed, so the copy never claims that.
 */
export function ReadComparison({ previous, current }: ReadComparisonProps) {
    const before = snapshot(previous);
    const after = snapshot(current);
    const sameMiss = Boolean(before.miss && after.miss) && normalize(before.miss) === normalize(after.miss);
    const delta = before.score !== null && after.score !== null ? after.score - before.score : null;

    const title = sameMiss ? "Same Critical Miss as last time." : "Your Critical Miss changed.";
    const intro = sameMiss
        ? "Your revision didn't change the Critical Miss. Start there again."
        : "The report now leads with a new Critical Miss. Make sure the old one is really answered, then take this one on.";

    return (
        <section aria-labelledby="read-comparison-title" className={styles.root} data-testid="read-comparison">
            <div className={styles.header}>
                <h2 id="read-comparison-title" className={styles.title}>{title}</h2>
                <p className={styles.intro}>{intro}</p>
            </div>

            <div className={styles.grid}>
                <article className={styles.card} aria-label="Last time">
                    <p className={styles.cardLabel}>Last time</p>
                    {before.score !== null && <p className={styles.score}>{before.score}<span>/100</span></p>}
                    <p className={styles.missLabel}>Critical Miss</p>
                    <p className={cn(styles.miss, !sameMiss && styles.missPast)}>{before.miss}</p>
                    <p className={styles.verdict}>{before.verdict}</p>
                </article>

                <div className={styles.arrow} aria-hidden="true"><ArrowRight weight="bold" /></div>

                <article className={cn(styles.card, styles.current)} aria-label="Now">
                    <div className={styles.cardTop}>
                        <p className={styles.cardLabel}>Now</p>
                        {delta !== null && delta !== 0 && (
                            <p className={cn(styles.delta, delta > 0 ? styles.deltaUp : styles.deltaDown)}>
                                {delta > 0 ? `Up ${delta}` : `Down ${Math.abs(delta)}`}
                            </p>
                        )}
                    </div>
                    {after.score !== null && <p className={styles.score}>{after.score}<span>/100</span></p>}
                    <p className={styles.missLabel}>Critical Miss</p>
                    <p className={styles.miss}><span className={styles.mark}>{after.miss}</span></p>
                    <p className={styles.verdict}>{after.verdict}</p>
                </article>
            </div>
        </section>
    );
}
