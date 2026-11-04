import { ArrowRight } from "@phosphor-icons/react";
import { readCriticalMisses, withCriticalFirst } from "@/lib/reports/report-presentation";
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

/** A report's Critical Misses, in order: one to three, and whether there were more than three. */
function snapshot(report: ReportData) {
    const ordered = withCriticalFirst(report);
    const misses = readCriticalMisses(ordered);
    const texts = (ordered.top_fixes || []).slice(0, Math.max(1, misses.count)).map((fix) => fix?.fix || fix?.text || "").filter(Boolean);
    return {
        verdict: report.first_impression || report.first_impression_takeaway || report.summary || "",
        score: typeof report.score === "number" ? report.score : null,
        misses: texts,
        more: misses.more,
    };
}

/**
 * Compares two reports on the same resume the way a person would: did the Critical Misses change, and did
 * the score move? A changed Critical Miss means the report now leads with something else; it does not prove
 * the old gap was fixed, so the copy never claims that. A report can carry one to three Critical Misses,
 * and say that there were more than three.
 */
export function ReadComparison({ previous, current }: ReadComparisonProps) {
    const before = snapshot(previous);
    const after = snapshot(current);
    const afterKeys = new Set(after.misses.map(normalize));
    const beforeKeys = new Set(before.misses.map(normalize));
    const remaining = before.misses.filter((miss) => afterKeys.has(normalize(miss)));
    const gone = before.misses.filter((miss) => !afterKeys.has(normalize(miss)));
    const single = before.misses.length <= 1 && after.misses.length <= 1;
    const delta = before.score !== null && after.score !== null ? after.score - before.score : null;

    let title: string;
    let intro: string;
    if (gone.length === 0 && before.misses.length > 0) {
        title = single ? "Same Critical Miss as last time." : "Same Critical Misses as last time.";
        intro = single ? "Your revision didn't change the Critical Miss. Start there again." : "Your revision didn't change them. Start with the first one again.";
    } else if (remaining.length === 0) {
        title = single ? "Your Critical Miss changed." : "Your Critical Misses changed.";
        intro = single
            ? "The report now leads with a new Critical Miss."
            : "The report now leads with new ones.";
    } else {
        title = gone.length === 1 ? "One Critical Miss changed." : `${gone.length} Critical Misses changed.`;
        intro = `${remaining.length === 1 ? "One is" : `${remaining.length} are`} still there. Start with ${remaining.length === 1 ? "that one" : "those"} again.`;
    }

    const label = (count: number, index: number) => (count > 1 ? `Critical Miss ${index + 1}` : "Critical Miss");

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
                    {before.misses.map((miss, index) => (
                        <div key={miss} className={styles.missRow}>
                            <p className={styles.missLabel}>{label(before.misses.length, index)}</p>
                            <p className={cn(styles.miss, !afterKeys.has(normalize(miss)) && styles.missPast)}>{miss}</p>
                        </div>
                    ))}
                    {before.more && <p className={styles.more}>More than three. The three that mattered most were here.</p>}
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
                    {after.misses.map((miss, index) => (
                        <div key={miss} className={styles.missRow}>
                            <p className={styles.missLabel}>{label(after.misses.length, index)}</p>
                            {/* A new Critical Miss carries the highlighter; one that stayed is just there. */}
                            <p className={styles.miss}>{beforeKeys.has(normalize(miss)) ? miss : <span className={styles.mark}>{miss}</span>}</p>
                        </div>
                    ))}
                    {after.more && <p className={styles.more}>More than three. The three that matter most are here.</p>}
                    <p className={styles.verdict}>{after.verdict}</p>
                </article>
            </div>
        </section>
    );
}
