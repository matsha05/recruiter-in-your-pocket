"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import Footer from "@/components/landing/Footer";

interface ResearchSource {
    id?: string;
    title: string;
    publisher?: string;
    year?: string | number;
    href?: string;
}

interface ResearchArticleProps {
    header: {
        tag: string;
        title: string;
        description: string;
        lastUpdated?: string;
        readTime?: string;
        sourceSummary?: string;
    };
    keyFinding: {
        label?: string;
        subtitle: string;
        stat: string;
        statDescription: ReactNode;
        source: {
            text: string;
            href?: string;
        };
        sampleSize?: ReactNode;
    };
    visualization?: ReactNode;
    children: ReactNode;
    productTieIn: {
        title: string;
        items: Array<{
            title: string;
            description: string;
        }>;
    };
    relatedArticles?: Array<{
        title: string;
        href: string;
        tag?: string;
    }>;
    sources?: ResearchSource[];
    faq?: Array<{
        question: string;
        answer: string;
    }>;
    cta?: {
        title: string;
        buttonText: string;
        href: string;
    };
}

function dateToIso(date?: string): string | undefined {
    if (!date) return undefined;
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export function ResearchArticle({
    header,
    keyFinding,
    visualization,
    children,
    productTieIn,
    relatedArticles,
    sources,
    faq,
    cta = {
        title: "See what your resume makes clear—and what it leaves open.",
        buttonText: "Review my resume",
        href: "/workspace",
    },
}: ResearchArticleProps) {
    const publishedDate = dateToIso(header.lastUpdated);
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        headline: header.title,
                        description: header.description,
                        author: { "@type": "Organization", name: "Recruiter in Your Pocket" },
                        publisher: { "@type": "Organization", name: "Recruiter in Your Pocket" },
                        datePublished: publishedDate,
                        dateModified: publishedDate,
                    }),
                }}
            />
            {faq && faq.length > 0 ? (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            mainEntity: faq.map((item) => ({
                                "@type": "Question",
                                name: item.question,
                                acceptedAnswer: { "@type": "Answer", text: item.answer },
                            })),
                        }),
                    }}
                />
            ) : null}

            <div className="lift-page research-page bg-paper text-foreground selection:bg-brand/15" data-visual-anchor="research-article">
                <header className="border-b border-line bg-paper px-6 pb-12 pt-24 md:px-8 md:pb-16 md:pt-28">
                    <div className="mx-auto max-w-[72rem]">
                        <Link
                            href="/research"
                            className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                            All research
                        </Link>

                        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.18fr)_minmax(19rem,0.82fr)] lg:items-end lg:gap-20">
                            <div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                                    <span className="font-semibold uppercase tracking-[0.11em] text-brand">{header.tag}</span>
                                    {header.readTime ? <><span className="text-line">/</span><span className="font-medium text-muted-foreground">{header.readTime}</span></> : null}
                                    {sources?.length ? <><span className="text-line">/</span><span className="font-medium text-muted-foreground">{header.sourceSummary ?? "Direct sources linked"}</span></> : null}
                                </div>
                                <h1 className="mt-5 max-w-[16ch] font-display text-[clamp(2.75rem,5.5vw,5.5rem)] riyp-weight-620 leading-[0.97] tracking-[-0.04em] text-foreground riyp-stretch-91 [text-wrap:balance]">
                                    {header.title}
                                </h1>
                                <p className="mt-6 max-w-[42rem] text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
                                    {header.description}
                                </p>
                            </div>

                            <aside className="border-t border-line bg-surface-sky p-5 lg:border-l lg:border-t-0 lg:p-7" aria-label="Best-supported conclusion">
                                <div className="text-xs font-semibold uppercase tracking-[0.11em] text-brand">
                                    {keyFinding.label ?? (header.tag === "Methodology" ? "Bottom line" : "What the research says")}
                                </div>
                                <p className="mt-3 font-display text-[clamp(2rem,3.5vw,3.25rem)] riyp-weight-540 leading-[1] tracking-[-0.03em] text-foreground riyp-stretch-91">
                                    {keyFinding.stat}
                                </p>
                                <div className="mt-4 text-sm leading-6 text-muted-foreground">
                                    {keyFinding.statDescription}
                                </div>
                                <p className="mt-5 border-t border-line pt-4 text-xs leading-5 text-muted-foreground">
                                    {keyFinding.source.href ? (
                                        <a href={keyFinding.source.href} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 transition-colors hover:text-foreground">
                                            {keyFinding.source.text}
                                        </a>
                                    ) : <span>{keyFinding.source.text}</span>}
                                    {keyFinding.sampleSize ? <><span className="mx-2 text-line">/</span><span>{keyFinding.sampleSize}</span></> : null}
                                </p>
                            </aside>
                        </div>
                    </div>
                </header>

                <div className="px-6 md:px-8">
                    <div className="mx-auto max-w-[72rem]">
                        {visualization ? (
                            <section aria-label="Research visualization" className="relative border-b border-line py-9 md:py-10">
                                {visualization}
                            </section>
                        ) : null}

                        <div className="grid gap-12 pb-20 pt-12 lg:grid-cols-[11rem_minmax(0,48rem)] lg:justify-center lg:gap-14 md:pb-28 md:pt-16">
                            <aside className="hidden lg:block">
                                <div className="sticky top-28 border-t border-line pt-4">
                                    <p className="riyp-type-0625 font-bold uppercase riyp-track-016 text-brand">{header.tag === "Methodology" ? "About the method" : "About this research"}</p>
                                    <dl className="mt-4 divide-y divide-line border-y border-line text-xs leading-5">
                                        <div className="py-3"><dt className="text-muted-foreground">Topic</dt><dd className="mt-1 font-semibold text-foreground">{header.tag}</dd></div>
                                        {sources?.length ? <div className="py-3"><dt className="text-muted-foreground">Source record</dt><dd className="mt-1 font-semibold text-foreground">{header.sourceSummary ?? "Direct sources linked below"}</dd></div> : null}
                                    </dl>
                                </div>
                            </aside>

                            <div className="min-w-0">
                                <article className="prose max-w-none prose-headings:font-display prose-headings:riyp-weight-560 prose-headings:riyp-track-n025 prose-headings:text-foreground prose-h2:mb-4 prose-h2:mt-14 prose-h2:riyp-type-200 prose-h2:riyp-leading-102 prose-h3:mt-10 prose-h3:text-xl prose-p:text-[1.0625rem] prose-p:leading-[1.66] prose-p:text-muted-foreground prose-li:my-1.5 prose-li:text-muted-foreground prose-strong:font-semibold prose-strong:text-foreground prose-a:text-brand prose-a:decoration-brand/30 prose-a:underline-offset-4">
                                    {children}
                                </article>

                                {faq && faq.length > 0 ? (
                                    <section className="mt-16 border-t border-line" aria-labelledby="faq-title">
                                        <h2 id="faq-title" className="py-6 font-display text-3xl riyp-weight-560 tracking-tight text-foreground riyp-stretch-96">Common questions</h2>
                                        <div className="divide-y divide-line border-b border-line">
                                            {faq.map((item) => (
                                                <div key={item.question} className="grid gap-2 py-6 md:grid-cols-[0.8fr_1.2fr] md:gap-8">
                                                    <h3 className="text-sm font-semibold leading-6 text-foreground">{item.question}</h3>
                                                    <p className="text-sm leading-7 text-muted-foreground">{item.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                ) : null}

                                <section className="relative mt-16 border-y border-line bg-surface-sky px-6 py-8" aria-labelledby="product-translation-title">
                                    <span className="absolute left-0 top-8 h-16 w-[3px] bg-cyan-bright" aria-hidden="true" />
                                    <h2 id="product-translation-title" className="font-display text-3xl riyp-weight-560 leading-tight tracking-tight text-foreground riyp-stretch-96">{productTieIn.title}</h2>
                                    <div className="mt-7 divide-y divide-line border-t border-line">
                                        {productTieIn.items.map((item, index) => (
                                            <div key={item.title} className="grid gap-2 py-5 md:grid-cols-[2.25rem_0.8fr_1.35fr] md:items-baseline md:gap-5">
                                                <span className="text-xs tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                                                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                                                <p className="text-sm leading-7 text-muted-foreground">{item.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {(relatedArticles?.length || sources?.length) ? (
                                    <section className="mt-16" aria-labelledby="evidence-notes-title">
                                        <div className="flex items-baseline justify-between border-b border-line pb-4">
                                            <h2 id="evidence-notes-title" className="font-display text-3xl riyp-weight-560 tracking-tight text-foreground riyp-stretch-96">Sources and related research</h2>
                                        </div>

                                        {sources && sources.length > 0 ? (
                                            <div className="py-7">
                                                <h3 className="text-xs font-semibold uppercase tracking-[0.11em] text-brand">Sources</h3>
                                                <ol className="mt-5 space-y-3 border-l border-line pl-6 text-sm leading-6 text-muted-foreground">
                                                {sources.map((source, index) => {
                                                    const sourceId = source.id ?? `source-${index + 1}`;
                                                    const sourceLabel = [source.title, source.publisher ? `— ${source.publisher}` : null, source.year ? `(${source.year})` : null].filter(Boolean).join(" ").trim().concat(".");
                                                    return (
                                                        <li key={sourceId} id={sourceId}>
                                                            <span className="mr-2 tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                                                            {source.href ? <a href={source.href} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 transition-colors hover:text-foreground">{sourceLabel}</a> : <span>{sourceLabel}</span>}
                                                        </li>
                                                    );
                                                })}
                                                </ol>
                                            </div>
                                        ) : null}

                                        {relatedArticles && relatedArticles.length > 0 ? (
                                            <div className="border-t border-line pt-7">
                                                <h3 className="text-xs font-semibold uppercase tracking-[0.11em] text-muted-foreground">Related research</h3>
                                                <div className="mt-3 divide-y divide-line border-b border-line">
                                                    {relatedArticles.map((article, index) => (
                                                        <Link key={article.href ?? `related-${index}`} href={article.href} className="focus-ring group grid min-h-14 gap-2 rounded-sm py-4 transition-colors hover:text-brand md:grid-cols-[1fr_auto] md:items-center">
                                                            <span className="text-sm font-medium">{article.title}</span>
                                                            <span className="flex items-center gap-3 text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">
                                                                {article.tag || "Read next"}
                                                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                                            </span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                    </section>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                <section className="border-y border-line bg-surface-sky px-6 py-16 text-foreground md:px-8 md:py-20">
                    <div className="mx-auto flex max-w-[72rem] flex-col gap-8 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="riyp-type-0625 font-bold uppercase riyp-track-016 text-brand">Apply it to your resume</p>
                            <h2 className="mt-4 max-w-[15ch] font-display riyp-display-section-lg riyp-weight-540 riyp-leading-094 riyp-track-n04 text-foreground riyp-stretch-90">{cta.title}</h2>
                        </div>
                        <Link href={cta.href} className="focus-ring inline-flex min-h-14 items-center justify-between gap-8 rounded-sm border border-foreground bg-foreground px-6 py-4 font-display text-sm font-semibold text-background transition-colors hover:bg-foreground/90">
                            {cta.buttonText}
                            <ArrowRight className="size-5 text-citron" weight="bold" />
                        </Link>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}

export function ArticleInsight({ title, desc }: { title: string; desc: ReactNode }) {
    return (
        <aside className="relative my-8 border-y border-line bg-proof py-5 pl-6 pr-5">
            <span className="absolute left-0 top-5 h-10 w-[3px] bg-cyan-bright" aria-hidden="true" />
            <div className="riyp-type-0625 font-bold uppercase riyp-track-015 text-foreground">{title}</div>
            <div className="mt-2 text-sm leading-7 text-muted-foreground">{desc}</div>
        </aside>
    );
}

export function Citation({ id, children }: { id: string; children: ReactNode }) {
    const sourceLabel = typeof children === "string" || typeof children === "number" ? children : "reference";
    return (
        <sup className="relative top-[-0.25em] ml-0.5 inline-flex align-baseline">
            <a href={`#${id}`} aria-label={`Go to source ${sourceLabel}`} className="focus-ring inline-flex min-h-8 min-w-8 items-center justify-center rounded-sm text-xs font-semibold leading-none tabular-nums text-brand underline decoration-brand/30 underline-offset-2 hover:text-brand-strong">
                {children}
            </a>
        </sup>
    );
}
