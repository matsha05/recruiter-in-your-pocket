import { ArrowRight, CheckCircle, XCircle } from "@phosphor-icons/react";
import type { ReportData } from "./ReportTypes";
import styles from "./ReadComparison.module.css";

type ReadComparisonProps = {
    previous: ReportData;
    current: ReportData;
};

function firstFix(report: ReportData) {
    const fix = report.top_fixes?.[0];
    return fix?.fix || fix?.text || "No first fix was returned.";
}

function snapshot(report: ReportData) {
    return {
        takeaway: report.first_impression_takeaway || report.first_impression || report.summary || "No first impression was returned.",
        doubt: report.gaps?.[0] || report.biggest_gap_example || "No main concern was returned.",
        fix: firstFix(report),
    };
}

export function ReadComparison({ previous, current }: ReadComparisonProps) {
    const before = snapshot(previous);
    const after = snapshot(current);
    const changed = before.takeaway !== after.takeaway || before.doubt !== after.doubt || before.fix !== after.fix;

    return (
        <section aria-labelledby="read-comparison-title" className={styles.root}>
            <div className={styles.header}>
                <div>
                    <p className={styles.kicker}>Revision comparison</p>
                    <h2 id="read-comparison-title" className={styles.title}>
                        {changed ? "Here's what changed in your feedback." : "The main feedback hasn't changed."}
                    </h2>
                </div>
                <p className={styles.intro}>
                    Compare the main finding, missing details, and first suggested edit from each report.
                </p>
            </div>

            <div className={styles.grid}>
                <article className={styles.card}>
                    <p className={styles.cardLabel}>Previous report</p>
                    <p className={`${styles.headline} ${styles.previousHeadline}`}>{before.takeaway}</p>
                    <dl className={styles.details}>
                        <div className={styles.detail}>
                            <dt className={styles.detailLabel}>Open question</dt>
                            <dd className={styles.detailText}>{before.doubt}</dd>
                        </div>
                        <div className={styles.detail}>
                            <dt className={styles.detailLabel}>First suggested edit</dt>
                            <dd className={styles.detailText}>{before.fix}</dd>
                        </div>
                    </dl>
                </article>

                <div className={styles.arrow} aria-hidden="true">
                    <ArrowRight weight="bold" />
                </div>

                <article className={`${styles.card} ${styles.current}`}>
                    <div className={styles.currentTag}>
                        {changed ? <CheckCircle className={styles.changedIcon} weight="fill" /> : <XCircle className={styles.sameIcon} weight="duotone" />}
                        <p className={`${styles.cardLabel} ${styles.currentLabel}`}>Current report</p>
                    </div>
                    <p className={styles.headline}>{after.takeaway}</p>
                    <dl className={styles.details}>
                        <div className={styles.detail}>
                            <dt className={styles.detailLabel}>What still needs context</dt>
                            <dd className={styles.detailText}>{after.doubt}</dd>
                        </div>
                        <div className={styles.detail}>
                            <dt className={styles.detailLabel}>First suggested edit</dt>
                            <dd className={styles.detailText}>{after.fix}</dd>
                        </div>
                    </dl>
                </article>
            </div>
        </section>
    );
}
