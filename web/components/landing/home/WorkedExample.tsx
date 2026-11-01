import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { FictionalTag } from "@/components/marketing/FictionalTag";
import { Button } from "@/components/ui/button";
import { JORDAN_EXAMPLE } from "@/lib/marketing/jordan-example";
import styles from "./WorkedExample.module.css";

/**
 * Under the hero: the note the hero blurs, worked through on Jordan's fictional resume. The one-sentence
 * read, the line behind it, the reviewer's note, and the report's own questions with the answers only
 * Jordan can give. The revised line joins as a fourth step when the answer-to-line feature ships
 * (plan 2.2); until then nothing here promises a rewrite.
 */
export function WorkedExample() {
    const { verdict, line, note, asks } = JORDAN_EXAMPLE;
    return (
        <section id="how-it-works" className={styles.example} aria-labelledby="example-title" data-testid="landing-worked-example">
            <div className={styles.inner}>
                <FictionalTag />
                <h2 id="example-title" className={styles.title}>Here&rsquo;s the note Jordan never saw.</h2>
                <p className={styles.deck}>It&rsquo;s about one line. The report finds it, then asks what only Jordan can answer.</p>

                <figure className={styles.read}>
                    <figcaption className={styles.who}>The read on <b>Jordan&rsquo;s</b> resume, in one sentence:</figcaption>
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
                        <p className={styles.stepLabel}><span className={styles.number} aria-hidden="true">3</span>Jordan&rsquo;s answer</p>
                        <p className={styles.asks}>The report asks:</p>
                        <dl className={styles.answers}>
                            {asks.map((ask) => (
                                <div key={ask.question} className={styles.answer}>
                                    <dt>{ask.question}</dt>
                                    <dd>{ask.placeholder}</dd>
                                </div>
                            ))}
                        </dl>
                        <p className={styles.aside}>Blank on purpose. Jordan isn&rsquo;t real, and we don&rsquo;t make up answers for anyone.</p>
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
