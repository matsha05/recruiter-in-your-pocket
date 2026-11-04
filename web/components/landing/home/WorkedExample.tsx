import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { FictionalTag } from "@/components/marketing/FictionalTag";
import { Button } from "@/components/ui/button";
import { JORDAN_EXAMPLE } from "@/lib/marketing/jordan-example";
import styles from "./WorkedExample.module.css";

/**
 * Under the hero: the note the hero blurs, worked through on Jordan's fictional resume. The one-sentence
 * read, the line behind it, the reviewer's note, and the report's own questions. Nothing here answers
 * them: Jordan isn't real, and the report never invents a fact. The revised line joins as a fourth step
 * when the answer-to-line feature ships (plan 2.2).
 */
export function WorkedExample() {
    const { verdict, line, note, asks } = JORDAN_EXAMPLE;
    return (
        <section id="how-it-works" className={styles.example} aria-labelledby="example-title" data-testid="landing-worked-example">
            <div className={styles.inner}>
                <FictionalTag />
                <h2 id="example-title" className={styles.title}>Here&rsquo;s the note Jordan never saw.</h2>

                <figure className={styles.read}>
                    <figcaption className={styles.who}>Jordan&rsquo;s report, in one sentence</figcaption>
                    <blockquote className={styles.verdict}>
                        &ldquo;{verdict.lead} <span className={styles.mark}>{verdict.miss}</span>&rdquo;
                    </blockquote>
                </figure>

                <ol className={styles.sheet}>
                    <li className={styles.step}>
                        <p className={styles.stepLabel}><span className={styles.number} aria-hidden="true">1</span>The line behind it</p>
                        <p className={styles.missLabel}>Critical Miss</p>
                        <blockquote className={styles.quote}>{line}</blockquote>
                    </li>
                    <li className={styles.step}>
                        <p className={styles.stepLabel}><span className={styles.number} aria-hidden="true">2</span>The note</p>
                        <p className={styles.note}>{note}</p>
                    </li>
                    <li className={`${styles.step} ${styles.wide}`}>
                        <p className={styles.stepLabel}><span className={styles.number} aria-hidden="true">3</span>What the report asks</p>
                        <ul className={styles.asks}>
                            {asks.map((ask) => (
                                <li key={ask.question}>{ask.question}</li>
                            ))}
                        </ul>
                    </li>
                </ol>

                <p className={styles.more}>
                    <Link href="/sample-report" className="riyp-link" data-analytics-cta="example_sample">See Jordan&rsquo;s full report</Link>
                </p>

                <div className={styles.turn}>
                    <h2 className={styles.question}>What would they think of yours?</h2>
                    <Button asChild size="lg" className="flex-none">
                        <Link href="/workspace" data-analytics-cta="verdict_report">
                            Get your free report <ArrowRight weight="bold" aria-hidden="true" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
