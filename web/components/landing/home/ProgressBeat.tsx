import { RecheckExample } from "@/components/marketing/RecheckExample";
import styles from "./ProgressBeat.module.css";

/** The revision journey, before sign-in: revise, re-check, and watch the Critical Miss change (plan 4.11). */
export function ProgressBeat() {
    return (
        <section className={styles.progress} aria-labelledby="progress-title" data-testid="landing-progress-beat">
            <div className={styles.inner}>
                <h2 id="progress-title" className={styles.title}>Fix it. Then check it again.</h2>
                <RecheckExample className={styles.demo} />
            </div>
        </section>
    );
}
