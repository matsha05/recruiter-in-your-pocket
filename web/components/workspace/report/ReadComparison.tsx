"use client";

import { Clipping } from "@/components/materials/Clipping";
import { readCriticalMisses, withCriticalFirst } from "@/lib/reports/report-presentation";
import { cn } from "@/lib/utils";
import type { ReportData } from "./ReportTypes";
import { marksLine, missingWhere, quotedLine } from "./markup/MarkedRows";
import styles from "./ReadComparison.module.css";

type ReadComparisonProps = {
    previous: ReportData;
    current: ReportData;
};

type Fix = NonNullable<ReportData["top_fixes"]>[number];

function normalize(value: string) {
    return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function fixText(fix: Fix) {
    return fix?.fix || fix?.text || "";
}

/** A report's Critical Misses, in order: one to three, and whether there were more than three. */
function snapshot(report: ReportData) {
    const ordered = withCriticalFirst(report);
    const misses = readCriticalMisses(ordered);
    const fixes = (ordered.top_fixes || []).slice(0, Math.max(1, misses.count)).filter((fix) => fixText(fix));
    return {
        verdict: report.first_impression || report.first_impression_takeaway || report.summary || "",
        score: typeof report.score === "number" ? report.score : null,
        fixes,
        more: misses.more,
    };
}

/**
 * Compares two reports on the same resume the way a person would: did the Critical Misses change, and did
 * the score move? Each Critical Miss is the site's clipping (Nov 4, 2026): the line on its strip with the
 * recruiter's note beside it, last time's dimmed, the way the homepage shows a re-check. A changed Critical
 * Miss means the report now leads with something else; it does not prove the old gap was fixed, so the copy
 * never claims that, and the score appears only as a change. A report can carry one to three Critical
 * Misses, and say that there were more than three.
 */
export function ReadComparison({ previous, current }: ReadComparisonProps) {
    const before = snapshot(previous);
    const after = snapshot(current);
    const afterKeys = new Set(after.fixes.map((fix) => normalize(fixText(fix))));
    const beforeKeys = new Set(before.fixes.map((fix) => normalize(fixText(fix))));
    const remaining = before.fixes.filter((fix) => afterKeys.has(normalize(fixText(fix))));
    const gone = before.fixes.filter((fix) => !afterKeys.has(normalize(fixText(fix))));
    const single = before.fixes.length <= 1 && after.fixes.length <= 1;
    const delta = before.score !== null && after.score !== null ? after.score - before.score : null;
    const verdictSame = normalize(before.verdict) === normalize(after.verdict);

    let title: string;
    let intro: string;
    if (gone.length === 0 && before.fixes.length > 0) {
        title = single ? "Same problem as last time." : "Same problems as last time.";
        intro = single ? "Your revision didn't change it. Let's start there again." : "Your revision didn't change them. Let's start with the first one again.";
    } else if (remaining.length === 0) {
        title = single ? "Your top problem changed." : "Your top problems changed.";
        intro = single ? "The earlier one isn't in this report. It now leads with the problem on the right." : "The earlier ones aren't in this report. It now leads with the problems on the right.";
    } else {
        title = gone.length === 1 ? "One problem changed." : `${gone.length} problems changed.`;
        intro = `${remaining.length === 1 ? "One is" : `${remaining.length} are`} still there. Let's start with ${remaining.length === 1 ? "that one" : "those"} again.`;
    }

    const caption = (when: string, count: number, index: number) => (count > 1 ? `${when} · Problem ${index + 1}` : when);
    const lineOf = (fix: Fix) => (marksLine(fix) ? quotedLine(fix) : missingWhere(fix));
    const sum = delta === null || delta === 0 ? null : delta > 0 ? `Up ${delta} since last time. That's the right direction!` : `Down ${Math.abs(delta)} since last time.`;

    return (
        <section aria-labelledby="read-comparison-title" className={styles.root} data-testid="read-comparison">
            <div className={styles.header}>
                <h2 id="read-comparison-title" className={styles.title}>{title}</h2>
                <p className={styles.intro}>{intro}</p>
            </div>

            <div className={styles.reads}>
                <article className={styles.read} aria-label="Last time">
                    {before.fixes.map((fix, index) => (
                        <Clipping key={fixText(fix)} caption={caption("Last time", before.fixes.length, index)} line={lineOf(fix)} note={fixText(fix)} dim />
                    ))}
                    {before.more && <p className={styles.more}>More than three. The three that mattered most were here.</p>}
                    <p className={styles.verdict}>{before.verdict}</p>
                </article>

                <article className={cn(styles.read, styles.current)} aria-label="Now">
                    {after.fixes.map((fix, index) => (
                        <Clipping key={fixText(fix)} caption={caption("Now", after.fixes.length, index)} line={lineOf(fix)} note={fixText(fix)} dim={beforeKeys.has(normalize(fixText(fix)))} />
                    ))}
                    {after.more && <p className={styles.more}>More than three. The three that matter most are here.</p>}
                    <p className={styles.verdict}>{after.verdict}</p>
                </article>
            </div>

            <p className={styles.sum}>
                {sum && <span className={styles.delta}>{sum}</span>}
                {verdictSame && <span className={styles.sumQuiet}>The verdict reads the same.</span>}
            </p>
        </section>
    );
}
