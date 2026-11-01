import { JORDAN_ROLE_FIT } from "@/lib/marketing/jordan-example";
import { cn } from "@/lib/utils";
import { FictionalTag } from "./FictionalTag";
import { RecheckExample } from "./RecheckExample";
import styles from "./PassExamples.module.css";

/** What the five paid reports are for, each shown on Jordan's fictional resume. */
export function PassExamples() {
    return (
        <section className={styles.section} aria-labelledby="pass-uses-title" data-testid="pricing-pass-examples">
            <div className={styles.inner}>
                <div className={styles.head}>
                    <h2 id="pass-uses-title" className={styles.title}>What five more reports are for.</h2>
                    <p className={styles.deck}>Most people use them two ways. Here&rsquo;s each one on Jordan&rsquo;s resume.</p>
                </div>

                <div className={styles.uses}>
                    <article className={styles.use} aria-labelledby="pass-use-recheck">
                        <FictionalTag />
                        <h3 id="pass-use-recheck" className={styles.useTitle}>Check your revision</h3>
                        <p className={styles.useBody}>Run the revised resume, and the report puts it beside the last one: whether the Critical Miss changed, and which way the score moved.</p>
                        <RecheckExample className={styles.demo} stacked />
                        <p className={styles.footnote}>Signed in, Progress keeps every version. Scores compare versions of your own resume. They don&rsquo;t predict interviews.</p>
                    </article>

                    <article className={styles.use} aria-labelledby="pass-use-job">
                        <FictionalTag />
                        <h3 id="pass-use-job" className={styles.useTitle}>Read it against each job</h3>
                        <p className={styles.useBody}>Paste the posting with your resume. The report shows what fits, what needs more detail, and what the posting asks for that your resume doesn&rsquo;t show.</p>
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
                        <p className={styles.footnote}>Any report can include a posting, including your free one. The pass gives you a report for each job you&rsquo;re serious about.</p>
                    </article>
                </div>
            </div>
        </section>
    );
}
