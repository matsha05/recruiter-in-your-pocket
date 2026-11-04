import { JORDAN_ROLE_FIT } from "@/lib/marketing/jordan-example";
import { cn } from "@/lib/utils";
import { FictionalTag } from "./FictionalTag";
import { RecheckExample } from "./RecheckExample";
import styles from "./PassExamples.module.css";

/** What the five paid reports are for, each shown on Jordan's fictional resume. The demos speak for themselves. */
export function PassExamples() {
    return (
        <section className={styles.section} aria-labelledby="pass-uses-title" data-testid="pricing-pass-examples">
            <div className={styles.inner}>
                <div className={styles.head}>
                    <FictionalTag />
                    <h2 id="pass-uses-title" className={styles.title}>What five more reports are for.</h2>
                </div>

                <div className={styles.uses}>
                    <article className={styles.use} aria-labelledby="pass-use-recheck">
                        <h3 id="pass-use-recheck" className={styles.useTitle}>Check your revision</h3>
                        <RecheckExample className={styles.demo} stacked />
                    </article>

                    <article className={styles.use} aria-labelledby="pass-use-job">
                        <h3 id="pass-use-job" className={styles.useTitle}>Read it against each job</h3>
                        <div className={cn(styles.demo, styles.fit)}>
                            <p className={styles.posting}>Job posting · {JORDAN_ROLE_FIT.posting}</p>
                            <dl className={styles.groups}>
                                {JORDAN_ROLE_FIT.groups.map((group) => (
                                    <div key={group.label} className={styles.group}>
                                        <dt className={cn(styles.groupLabel, "missing" in group && styles.groupMissing)}>{group.label}</dt>
                                        <dd>{group.text}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}
