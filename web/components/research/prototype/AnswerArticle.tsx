import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { PenNote } from "@/components/research/figures/FigureKit";
import { categories, pillarForHref } from "@/components/research/ResearchHubData";
import { publicPage } from "@/lib/seo/public-pages";
import { formatMonth } from "@/lib/seo/structured-data";
import styles from "./AnswerArticle.module.css";

// Prototype (docs/research-library-strategy.md): an article opens the way its hub row does,
// with the reader's question and the straight answer, then what to do, then the receipts.
// Every source appears once, with what it found, how it was done, and what it can't tell you.

export type EvidenceSource = {
    /** Anchor for links from the text, e.g. "pina-2023". */
    id: string;
    name: string;
    /** What kind of source, in plain words. Not a grade. */
    kind: string;
    /** Full title and where it was published, as the live article's source list gives it. */
    citation: string;
    found: ReactNode;
    method?: ReactNode;
    limit: ReactNode;
    href: string;
    linkLabel: string;
};

type AnswerArticleProps = {
    /** The live article's path: its dates and pillar come from there. */
    path: string;
    /** The question as people search it. Also the search title. */
    question: string;
    answer: ReactNode;
    answerSource: { text: ReactNode; href: string };
    /** One margin note naming why the question hurts. */
    painNote?: ReactNode;
    advice: Array<{ lead: string; body: ReactNode }>;
    notSupported?: { title: string; body: ReactNode };
    bridge: { question: string; body: ReactNode };
    figure?: ReactNode;
    evidence: EvidenceSource[];
    /** Hub answer ids, in the order a reader would ask them next. */
    nextQuestions: string[];
    close: string;
};

const hubAnswers = categories.flatMap((category) => category.articles);

export function AnswerArticle({
    path,
    question,
    answer,
    answerSource,
    painNote,
    advice,
    notSupported,
    bridge,
    figure,
    evidence,
    nextQuestions,
    close,
}: AnswerArticleProps) {
    const { updated } = publicPage(path);
    const pillar = pillarForHref(path);
    const next = nextQuestions.map((id) => hubAnswers.find((article) => article.id === id)).filter((article) => article !== undefined);

    return (
        <div className={styles.page} data-visual-anchor="research-answer-article">
            <article className={styles.inner}>
                <Link href="/research" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground">
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    All research
                </Link>

                <header className={styles.opening}>
                    <h1 className={styles.question}>{question}</h1>
                    <div className={styles.answerGrid}>
                        <div>
                            <p className={styles.answer}>{answer}</p>
                            <p className={styles.answerSource}>
                                {answerSource.text}{" "}
                                <a href={answerSource.href} target="_blank" rel="noopener noreferrer" className="focus-ring riyp-link">
                                    Read the study<span className="sr-only"> (opens in a new tab)</span>
                                </a>
                            </p>
                        </div>
                        {painNote ? <PenNote className={styles.painNote}>{painNote}</PenNote> : null}
                    </div>
                    <p className={styles.meta}>
                        {pillar ? <span>{pillar}</span> : null}
                        <span>Updated <time dateTime={updated}>{formatMonth(updated)}</time></span>
                        <a href="#how-we-write" className="focus-ring riyp-link-quiet">How we write these</a>
                    </p>
                </header>

                <section className={styles.section} aria-labelledby="for-your-resume">
                    <h2 id="for-your-resume" className={styles.sectionTitle}>What this means for your resume</h2>
                    <p className={styles.label}>Our advice, from what the studies found</p>
                    <ol className={styles.advice}>
                        {advice.map((item, index) => (
                            <li key={item.lead}>
                                <span className={styles.number} aria-hidden="true">{index + 1}</span>
                                <div>
                                    <p className={styles.adviceLead}>{item.lead}</p>
                                    <p className={styles.prose}>{item.body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                    {notSupported ? (
                        <div className={styles.notSupported}>
                            <p className={styles.adviceLead}>{notSupported.title}</p>
                            <p className={styles.prose}>{notSupported.body}</p>
                        </div>
                    ) : null}

                    <aside className={styles.bridge} aria-labelledby="bridge-title">
                        <div>
                            <p id="bridge-title" className={styles.bridgeTitle}>{bridge.question}</p>
                            <p className={styles.bridgeBody}>{bridge.body}</p>
                        </div>
                        <Button asChild variant="secondary" className="w-full shrink-0 sm:w-auto">
                            <Link href="/workspace" data-analytics-cta="research_bridge">
                                Get your free report <ArrowRight weight="bold" aria-hidden="true" />
                            </Link>
                        </Button>
                    </aside>
                </section>

                {figure ? <section className={styles.figure} aria-label="Figure">{figure}</section> : null}

                <section className={styles.section} aria-labelledby="evidence">
                    <h2 id="evidence" className={styles.sectionTitle}>What the evidence says</h2>
                    <div className={styles.sources}>
                        {evidence.map((source) => (
                            <section key={source.id} id={source.id} tabIndex={-1} className={`riyp-jump-target ${styles.source}`} aria-labelledby={`${source.id}-name`}>
                                <div className={styles.sourceHead}>
                                    <h3 id={`${source.id}-name`} className={styles.sourceName}>{source.name}</h3>
                                    <p className={styles.sourceKind}>{source.kind}</p>
                                    <p className={styles.sourceCitation}>{source.citation}</p>
                                    <a href={source.href} target="_blank" rel="noopener noreferrer" className={`focus-ring riyp-link ${styles.sourceLink}`}>
                                        {source.linkLabel}<span className="sr-only"> (opens in a new tab)</span>
                                        <ArrowUpRight className="size-3.5" weight="bold" aria-hidden="true" />
                                    </a>
                                </div>
                                <dl className={styles.sourceBody}>
                                    <div>
                                        <dt className={styles.label}>What it found</dt>
                                        <dd className={styles.prose}>{source.found}</dd>
                                    </div>
                                    {source.method ? (
                                        <div>
                                            <dt className={styles.label}>How it was done</dt>
                                            <dd className={styles.prose}>{source.method}</dd>
                                        </div>
                                    ) : null}
                                    <div>
                                        <dt className={styles.label}>What it can&rsquo;t tell you</dt>
                                        <dd className={styles.prose}>{source.limit}</dd>
                                    </div>
                                </dl>
                            </section>
                        ))}
                    </div>
                </section>

                {next.length > 0 ? (
                    <section className={styles.section} aria-labelledby="next-questions">
                        <h2 id="next-questions" className={styles.sectionTitle}>Next questions</h2>
                        <div className={styles.next}>
                            {next.map((article) => (
                                <div key={article.id} className={styles.nextRow}>
                                    <h3 className={styles.nextQuestion}>{article.question}</h3>
                                    <p className={styles.nextAnswer}>{article.answer}</p>
                                    <Link href={article.href} className={styles.read}>
                                        {article.action ?? "Read"}<span className="sr-only">: {article.title}</span> <ArrowRight weight="bold" aria-hidden="true" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null}

                <section id="how-we-write" tabIndex={-1} className={`riyp-jump-target ${styles.method}`} aria-labelledby="how-we-write-title">
                    <h2 id="how-we-write-title" className={styles.methodTitle}>How we write these</h2>
                    <p className={styles.methodBody}>
                        Every claim names its source, how the study was done, and what it can&rsquo;t tell you. Advice is labeled as ours. We read each study in full where we can, and say so when we read only the abstract.
                        Spot a mistake? Email <a href="mailto:support@recruiterinyourpocket.com" className="focus-ring riyp-link-quiet">support@recruiterinyourpocket.com</a> and we&rsquo;ll fix the page and update its date.{" "}
                        <Link href="/methodology" className="focus-ring riyp-link-quiet">How the report works</Link>
                    </p>
                </section>

                <section className={styles.close} aria-labelledby="research-close-title">
                    <h2 id="research-close-title" className={styles.closeTitle}>{close}</h2>
                    <Button asChild size="lg" className="flex-none">
                        <Link href="/workspace" data-analytics-cta="research_close">
                            Get your free report <ArrowRight weight="bold" aria-hidden="true" />
                        </Link>
                    </Button>
                </section>
            </article>
            <Footer />
        </div>
    );
}
