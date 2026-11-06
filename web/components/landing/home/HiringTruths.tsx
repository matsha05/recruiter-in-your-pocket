import rhythm from "@/components/materials/Rhythm.module.css";
import styles from "./HiringTruths.module.css";

/** What a recruiter looks for, each paired with what the report actually does about it. */
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
                    <dd className={styles.answer}><strong>We show you where.</strong> The lines a recruiter would stop on, in the order they&rsquo;d read them.</dd>
                </div>
                <div className={styles.row}>
                    <dt className={styles.quote}>Nobody can score you against an ATS or tell you your interview odds.</dt>
                    <dd className={styles.answer}><strong>So we don&rsquo;t pretend to.</strong> We tell you which lines are clear, and rewrite yours only from your facts.</dd>
                </div>
            </dl>
        </section>
    );
}
