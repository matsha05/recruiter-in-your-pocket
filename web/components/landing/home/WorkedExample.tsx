import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { FictionalTag } from "@/components/marketing/FictionalTag";
import { Button } from "@/components/ui/button";
import { JORDAN_EXAMPLE } from "@/lib/marketing/jordan-example";
import styles from "./WorkedExample.module.css";

/**
 * Under the hero: the note the hero blurs, worked through on Jordan's fictional resume. The one-sentence
 * read, then the line beside the note, then the report's own questions. Set as text with white space
 * between the parts; the highlighter marks the Critical Miss and the pen writes the rest. Nothing here
 * answers the questions: Jordan isn't real, and the report never invents a fact.
 */
export function WorkedExample() {
    const { verdict, line, note, asks } = JORDAN_EXAMPLE;
    return (
        <section id="how-it-works" className={styles.example} aria-labelledby="example-title" data-testid="landing-worked-example">
            <h2 id="example-title" className={styles.title}>Here&rsquo;s the note Jordan never saw.</h2>

            <figure className={styles.read}>
                <figcaption className={styles.who}>Jordan&rsquo;s report, in one sentence <FictionalTag /></figcaption>
                <blockquote className={styles.verdict}>
                    &ldquo;{verdict.lead} {verdict.miss}&rdquo;
                </blockquote>
            </figure>

            <div className={styles.spread}>
                <div className={styles.part}>
                    <p className={styles.label}>The line behind it</p>
                    <blockquote className={styles.quote}><span className={styles.mark}>{line}</span></blockquote>
                </div>
                <div className={styles.part}>
                    <p className={styles.label}>The note</p>
                    <p className={styles.note}>{note}</p>
                </div>
                <div className={styles.part}>
                    <p className={styles.label}>What the report asks</p>
                    <ul className={styles.asks}>
                        {asks.map((ask) => (
                            <li key={ask.question}>{ask.question}</li>
                        ))}
                    </ul>
                </div>
                <p className={styles.more}>
                    <Link href="/sample-report" className="riyp-link" data-analytics-cta="example_sample">See Jordan&rsquo;s full report</Link>
                </p>
            </div>

            <div className={styles.turn}>
                <h2 className={styles.question}>What would they think of yours?</h2>
                <Button asChild size="lg" className="flex-none">
                    <Link href="/workspace" data-analytics-cta="verdict_report">
                        Get your free report <ArrowRight weight="bold" aria-hidden="true" />
                    </Link>
                </Button>
            </div>
        </section>
    );
}
