import { FictionalTag } from "@/components/marketing/FictionalTag";
import { Clipping } from "@/components/materials/Clipping";
import rhythm from "@/components/materials/Rhythm.module.css";
import { JORDAN_RECHECK } from "@/lib/marketing/jordan-example";
import { cn } from "@/lib/utils";
import styles from "./RecheckSection.module.css";

/**
 * The re-check: the same clipping, twice. The first report's Critical Miss with a faded marker, the revision's
 * with the pen's "Changed. Up 6.", and the version ladder in the same pen. Like the product, it says the
 * Critical Miss changed, never fixed, and prints score changes only (plan 4.11, D5).
 */
export function RecheckSection() {
    const { before, after, change, versions } = JORDAN_RECHECK;
    const first = versions[0].score;
    const latest = versions[versions.length - 1].score;
    return (
        <section className={rhythm.section} aria-labelledby="progress-title" data-testid="landing-progress-beat">
            <h2 id="progress-title" className={rhythm.title}>Fix it. Then check it again.</h2>
            <div className={styles.recheck}>
                <Clipping caption="First report" line={before} dim />
                <Clipping caption="Revision 1" line={after} note={`Changed. Up ${change}.`} />
                <ol className={styles.ladder} aria-label="Each version of Jordan's resume">
                    {versions.map((version, index) => {
                        const step = index === 0 ? null : version.score - versions[index - 1].score;
                        return (
                            <li key={version.label} className={cn(styles.rung, index === versions.length - 1 && styles.rungLatest)}>
                                <span>{version.label}</span>
                                <span className={styles.track} aria-hidden="true"><span style={{ transform: `scaleX(${version.score / 100})` }} /></span>
                                <span className={styles.step}>{step === null ? "" : `Up ${step}`}</span>
                            </li>
                        );
                    })}
                </ol>
                <div className={styles.sum}>
                    <span>Up {latest - first} since the first report.</span>
                    <FictionalTag className={styles.tag} />
                </div>
            </div>
        </section>
    );
}
