import Link from "next/link";
import { FictionalTag } from "@/components/marketing/FictionalTag";
import { RecheckExample } from "@/components/marketing/RecheckExample";
import styles from "./ProgressBeat.module.css";

/** The revision journey, before sign-in: revise, re-check, and watch the Critical Miss change (plan 4.11). */
export function ProgressBeat() {
    return (
        <section className={styles.progress} aria-labelledby="progress-title" data-testid="landing-progress-beat">
            <div className={styles.inner}>
                <FictionalTag />
                <h2 id="progress-title" className={styles.title}>Fix it. Then check it again.</h2>
                <p className={styles.deck}>A re-check reads your revised resume and puts it beside the last one, so you can see what changed.</p>
                <RecheckExample className={styles.demo} />
                <p className={styles.footnote}>
                    A re-check is one Job Search Pass report. Signed in, Progress keeps every version. Scores compare versions of your own resume; they don&rsquo;t predict interviews.{" "}
                    <Link href="/pricing" className="riyp-link">What the pass includes</Link>
                </p>
            </div>
        </section>
    );
}
