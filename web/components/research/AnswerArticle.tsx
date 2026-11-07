import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/landing/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { PenNote } from "@/components/research/figures/FigureKit";
import { ResearchAnswerRow } from "@/components/research/ResearchAnswerRow";
import { hubEntry, hubEntryForHref, pillarForHref } from "@/components/research/ResearchHubData";
import { publicPage } from "@/lib/seo/public-pages";
import { SECTION_NAMES } from "@/lib/seo/site";
import { articleStructuredData, formatMonth } from "@/lib/seo/structured-data";
import styles from "./AnswerArticle.module.css";

// A research article opens the way its row on the Research hub does: the reader's question,
// then the straight answer in the recruiter's voice with its study linked. Then the article,
// with one bridge to the report where the advice is, the sources, and the next questions.
// See docs/research-library-strategy.md and app/(editorial)/research/article-standard.md.

export interface ResearchSource {
    id?: string;
    title: string;
    publisher?: string;
    year?: string | number;
    href?: string;
}

interface AnswerArticleProps {
    /** The article's path. Its question comes from the hub and its dates from PUBLIC_PAGES. */
    path: string;
    /** Two or three plain sentences that answer the question. */
    answer: ReactNode;
    /** The study behind the answer, named, with how big it was. */
    answerSource: { text: ReactNode; href?: string; linkLabel?: string };
    /** One margin note naming why the question hurts. Optional: only when it earns its place. */
    painNote?: string;
    /** The lead figure, full width under the opening. */
    visualization?: ReactNode;
    /** What the lead section is, for screen readers, when it isn't a figure. */
    visualizationLabel?: string;
    children: ReactNode;
    sources: ResearchSource[];
    /** Hub ids, in the order a reader would ask them next. */
    nextQuestions: string[];
}

export function AnswerArticle({ path, answer, answerSource, painNote, visualization, visualizationLabel = "Research visualization", children, sources, nextQuestions }: AnswerArticleProps) {
    const entry = hubEntryForHref(path);
    if (!entry) throw new Error(`${path} has no question on the Research hub (ResearchHubData.ts).`);
    const { updated } = publicPage(path);
    const pillar = pillarForHref(path);
    const next = nextQuestions.map((id) => {
        const article = hubEntry(id);
        if (!article) throw new Error(`${path} lists "${id}" as a next question, but the hub has no such answer.`);
        return article;
    });

    return (
        <>
            <JsonLd
                data={articleStructuredData({
                    path,
                    headline: entry.question,
                    description: entry.answer,
                    trail: [{ name: SECTION_NAMES["/research"], path: "/research" }, { name: entry.question, path }],
                    citations: sources,
                })}
            />
            <div className={styles.page} data-visual-anchor="research-article">
                <div className={styles.inner}>
                    <Link href="/research" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground">
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        All research
                    </Link>

                    <header className={styles.opening}>
                        <h1 className={styles.question}>{entry.question}</h1>
                        <div className={styles.answerGrid}>
                            <div>
                                <p className={styles.answer}>{answer}</p>
                                <p className={styles.answerSource}>
                                    {answerSource.text}
                                    {answerSource.href ? (
                                        <>
                                            {" "}
                                            <a href={answerSource.href} target="_blank" rel="noopener noreferrer" className="focus-ring riyp-link">
                                                {answerSource.linkLabel ?? "Read the study"}<span className="sr-only"> (opens in a new tab)</span>
                                            </a>
                                        </>
                                    ) : null}
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

                    {visualization ? (
                        <section aria-label={visualizationLabel} className={styles.lead}>
                            {visualization}
                        </section>
                    ) : null}

                    <article className={`prose riyp-prose max-w-reading text-prose prose-headings:font-display prose-headings:text-foreground prose-h2:mb-5 prose-h2:mt-14 prose-h2:text-title prose-h3:mt-10 prose-h3:text-heading prose-p:text-prose prose-p:text-foreground prose-li:my-1.5 prose-li:text-prose prose-li:text-foreground prose-strong:font-semibold prose-strong:text-foreground ${styles.body}`}>
                        {children}
                    </article>

                    <section className={styles.section} aria-labelledby="sources-title">
                        <h2 id="sources-title" className={styles.sectionTitle}>Sources</h2>
                        <ol className={styles.sources}>
                            {sources.map((source, index) => {
                                const sourceId = source.id ?? `source-${index + 1}`;
                                const label = [source.title, source.publisher, source.year].filter(Boolean).join(". ").concat(".");
                                return (
                                    <li key={sourceId} id={sourceId} tabIndex={-1} className="riyp-jump-target">
                                        <span className={styles.sourceNumber}>{index + 1}</span>
                                        {source.href ? (
                                            <a href={source.href} target="_blank" rel="noopener noreferrer" className="focus-ring riyp-link-quiet">
                                                {label}<span className="sr-only"> (opens in a new tab)</span>
                                            </a>
                                        ) : <span>{label}</span>}
                                    </li>
                                );
                            })}
                        </ol>
                    </section>

                    {next.length > 0 ? (
                        <section className={styles.section} aria-labelledby="next-questions-title">
                            <h2 id="next-questions-title" className={styles.sectionTitle}>Next questions</h2>
                            <div className={styles.next}>
                                {next.map((article) => <ResearchAnswerRow key={article.id} article={article} heading="h3" />)}
                            </div>
                        </section>
                    ) : null}

                    <section id="how-we-write" tabIndex={-1} className={`riyp-jump-target ${styles.method}`} aria-labelledby="how-we-write-title">
                        <h2 id="how-we-write-title" className={styles.methodTitle}>How we write these</h2>
                        <p className={styles.methodBody}>
                            We link every study we cite and say what it can&rsquo;t tell you. When something is our advice rather than a finding, we say so. The date above is when the page last changed.{" "}
                            <Link href="/methodology#how-we-write-research" className="focus-ring riyp-link-quiet">The longer version</Link>
                        </p>
                    </section>

                    <section className={styles.close} aria-labelledby="research-close-title">
                        <h2 id="research-close-title" className={styles.closeTitle}>Now see what they&rsquo;d make of yours.</h2>
                        <Button asChild size="lg" className="flex-none">
                            <Link href="/workspace" data-analytics-cta="research_close">
                                Get your free report <ArrowRight weight="bold" aria-hidden="true" />
                            </Link>
                        </Button>
                    </section>
                </div>
                <Footer />
            </div>
        </>
    );
}

/** The one turn to the report, placed where the article's advice is. Says which part of the report applies it. */
export { ArticleBridge } from "./ArticleBridge";

/** Numbered moves for the reader's resume, labeled as our advice. */
export function AdviceList({ items, notSupported }: { items: Array<{ lead: string; body: ReactNode }>; notSupported?: { title: string; body: ReactNode } }) {
    return (
        <div className="not-prose">
            <p className={styles.label}>Our advice, from what the studies found</p>
            <ol className={styles.advice}>
                {items.map((item, index) => (
                    <li key={item.lead}>
                        <span className={styles.number} aria-hidden="true">{index + 1}</span>
                        <div>
                            <p className={styles.adviceLead}>{item.lead}</p>
                            <p className={styles.text}>{item.body}</p>
                        </div>
                    </li>
                ))}
            </ol>
            {notSupported ? (
                <div className={styles.notSupported}>
                    <p className={styles.adviceLead}>{notSupported.title}</p>
                    <p className={styles.text}>{notSupported.body}</p>
                </div>
            ) : null}
        </div>
    );
}

export type EvidenceEntry = {
    /** Anchor for links from the text, e.g. "pina-2023". */
    id: string;
    name: string;
    /** What kind of source, in plain words. Not a grade. */
    kind: string;
    found: ReactNode;
    method?: ReactNode;
    limit: ReactNode;
    href: string;
    linkLabel: string;
};

/** Each source once: what it found, how it was done, and what it can't tell you. */
export function EvidenceList({ entries }: { entries: EvidenceEntry[] }) {
    return (
        <div className={`not-prose ${styles.entries}`}>
            {entries.map((source) => (
                <section key={source.id} id={source.id} tabIndex={-1} className={`riyp-jump-target ${styles.entry}`} aria-labelledby={`${source.id}-name`}>
                    <div>
                        <h3 id={`${source.id}-name`} className={styles.entryName}>{source.name}</h3>
                        <p className={styles.entryKind}>{source.kind}</p>
                        <a href={source.href} target="_blank" rel="noopener noreferrer" className={`focus-ring riyp-link ${styles.entryLink}`}>
                            {source.linkLabel}<span className="sr-only"> (opens in a new tab)</span>
                            <ArrowUpRight className="size-3.5" weight="bold" aria-hidden="true" />
                        </a>
                    </div>
                    <dl className={styles.entryBody}>
                        <div>
                            <dt className={styles.label}>What it found</dt>
                            <dd className={styles.text}>{source.found}</dd>
                        </div>
                        {source.method ? (
                            <div>
                                <dt className={styles.label}>How it was done</dt>
                                <dd className={styles.text}>{source.method}</dd>
                            </div>
                        ) : null}
                        <div>
                            <dt className={styles.label}>What it can&rsquo;t tell you</dt>
                            <dd className={styles.text}>{source.limit}</dd>
                        </div>
                    </dl>
                </section>
            ))}
        </div>
    );
}
