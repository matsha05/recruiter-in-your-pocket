import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { JORDAN_RECHECK } from "@/lib/marketing/jordan-example";
import { cn } from "@/lib/utils";
import styles from "./RecheckExample.module.css";

/**
 * A miniature of the real re-check (ReadComparison) and the Progress timeline, on Jordan's
 * fictional resume. Like the product, it says the Critical Miss changed, never that it was fixed,
 * and it prints score changes only.
 */
export function RecheckExample({ className, stacked = false }: { className?: string; stacked?: boolean }) {
    const { before, after, change, versions } = JORDAN_RECHECK;
    const first = versions[0].score;
    const latest = versions[versions.length - 1].score;

    return (
        <div className={cn(styles.root, stacked && styles.stacked, className)}>
            <div className={styles.panel}>
                <p className={styles.title}>Your Critical Miss changed.</p>
                <div className={styles.compare}>
                    <div className={styles.card}>
                        <p className={styles.cardLabel}>Last time</p>
                        <p className={cn(styles.miss, styles.missPast)}>{before}</p>
                    </div>
                    <ArrowRight className={styles.arrow} weight="bold" aria-hidden="true" />
                    <div className={cn(styles.card, styles.current)}>
                        <p className={styles.cardLabel}>Now <span className={styles.delta}>Up {change}</span></p>
                        <p className={styles.miss}><span className={styles.mark}>{after}</span></p>
                    </div>
                </div>
            </div>
            <div className={styles.panel}>
                <ol className={styles.journey} aria-label="Each version of Jordan's resume">
                    {versions.map((version, index) => {
                        const step = index === 0 ? null : version.score - versions[index - 1].score;
                        return (
                            <li key={version.label} className={cn(styles.step, index === versions.length - 1 && styles.stepLatest)}>
                                <span>{version.label}</span>
                                <span className={styles.track} aria-hidden="true"><span style={{ transform: `scaleX(${version.score / 100})` }} /></span>
                                <span>{step === null ? "" : `Up ${step}`}</span>
                            </li>
                        );
                    })}
                </ol>
                <p className={styles.title}>Up {latest - first} since your first report.</p>
            </div>
        </div>
    );
}
