import rhythm from "@/components/materials/Rhythm.module.css";
import styles from "./HiringTruths.module.css";

/** What the read looks for, each paired with what the report actually does about it. */
export function HiringTruths() {
    return (
        <section id="what-we-look-for" className={rhythm.section} aria-labelledby="truths-title">
            <h2 id="truths-title" className={`${rhythm.title} ${styles.title}`}>What we look for, line by line.</h2>
            <dl className={styles.list}>
                <div className={styles.row}>
                    <dt className={styles.quote}><s>&ldquo;Results-driven professional&rdquo;</s> is on every resume.</dt>
                    <dd className={styles.answer}><strong>Show the result instead.</strong> We point to the line that already has one, and ask for the detail you left out.</dd>
                </div>
                <div className={styles.row}>
                    <dt className={styles.quote}>Your best example stops right before the good part.</dt>
                    <dd className={styles.answer}><strong>Not forty tips.</strong> Every Critical Miss, and the one to fix first.</dd>
                </div>
                <div className={styles.row}>
                    <dt className={styles.quote}>No ATS score. No interview odds.</dt>
                    <dd className={styles.answer}><strong>Just what reads clearly and what doesn&rsquo;t.</strong> We&rsquo;ll rewrite your line. Only from your facts.</dd>
                </div>
            </dl>
        </section>
    );
}
