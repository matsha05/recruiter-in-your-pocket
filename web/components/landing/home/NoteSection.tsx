import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { FictionalTag } from "@/components/marketing/FictionalTag";
import { Clipping } from "@/components/materials/Clipping";
import rhythm from "@/components/materials/Rhythm.module.css";
import { JORDAN_EXAMPLE } from "@/lib/marketing/jordan-example";
import styles from "./NoteSection.module.css";

/**
 * The why, on Jordan: the product's output shown as a clipping, one line cut out of the resume on its own
 * strip of paper with the recruiter's note in the margin, then one link to the full report. The report's
 * verdict sentence and its questions live on the sample report; the margin note already asks them.
 * The line and the note are quoted from Jordan's generated sample report (see lib/marketing/jordan-example).
 */
export function NoteSection() {
    const { line, note } = JORDAN_EXAMPLE;
    return (
        <section id="how-it-works" className={rhythm.section} aria-labelledby="example-title" data-testid="landing-worked-example">
            <h2 id="example-title" className={rhythm.title}>Here&rsquo;s the note Jordan never saw.</h2>
            <Clipping
                line={line}
                note={note}
                above="Managed 32 B2B SaaS accounts with $2.4M in annual recurring revenue"
                below="Ran quarterly business reviews with customer leadership teams"
            />
            <div className={rhythm.link}>
                <Link href="/sample-report" className="riyp-link" data-analytics-cta="example_sample">See Jordan&rsquo;s full report <ArrowRight aria-hidden="true" /></Link>
                <FictionalTag className={styles.tag} />
            </div>
        </section>
    );
}
