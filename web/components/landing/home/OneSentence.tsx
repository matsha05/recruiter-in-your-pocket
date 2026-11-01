import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import styles from "./OneSentence.module.css";

/** The payoff: one real-sounding verdict on Jordan's resume, then the question about yours. */
export function OneSentence() {
    return (
        <section className={styles.oneSentence} aria-labelledby="one-sentence-title">
            <p className={styles.who}>The read on <b>Jordan&rsquo;s</b> resume, in one sentence:</p>
            <blockquote className={styles.verdict}>
                &ldquo;A capable account manager with a real book of business. <span className={styles.mark}>What&rsquo;s missing is proof Jordan changed the outcome.</span>&rdquo;
            </blockquote>
            <div className={styles.turn}>
                <h2 id="one-sentence-title" className={styles.question}>What would they think of yours?</h2>
                <Link href="/workspace" className={styles.primary} data-analytics-cta="verdict_report">
                    Read mine <ArrowRight weight="bold" aria-hidden="true" />
                </Link>
            </div>
        </section>
    );
}
