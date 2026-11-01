"use client";

import { Button } from "@/components/ui/button";
import type { MouseEvent, ReactNode } from "react";
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
        title: "Find out where your resume needs more detail.",
        buttonText: "Get your free report",
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
                                    <span className="riyp-evidence-label text-brand">{header.tag}</span>
                                    {header.readTime ? <><span className="text-line">/</span><span className="font-medium text-muted-foreground">{header.readTime}</span></> : null}
                                    {sources?.length ? <><span className="text-line">/</span><span className="font-medium text-muted-foreground">{header.sourceSummary ?? "Direct sources linked"}</span></> : null}
                                </div>
                                <h1 className="mt-5 max-w-[20ch] text-balance font-display text-headline text-foreground">
                                    {header.title}
                                </h1>
                                <p className="mt-6 max-w-reading text-prose text-muted-foreground">
                                    {header.description}
                                </p>
                            </div>

                            <aside className="rounded-sheet border border-line bg-card p-5 lg:p-7" aria-label="Best-supported conclusion">
                                <div className="riyp-evidence-label text-brand">
                                    {keyFinding.label ?? "Key finding"}
                                </div>
                                <p className="mt-3 text-balance font-display text-title text-foreground">
                                    {keyFinding.stat}
                                </p>
                                <div className="mt-4 text-sm text-muted-foreground">
                                    {keyFinding.statDescription}
                                </div>
                                <p className="mt-5 border-t border-line pt-4 text-xs text-muted-foreground">
                                    {keyFinding.source.href ? (
                                        <a href={keyFinding.source.href} target="_blank" rel="noopener noreferrer" className="riyp-link-quiet">
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

                        <div className="pb-20 pt-12 md:pb-28 md:pt-16">
                            <div className="min-w-0 max-w-[46rem]">
                                <article className="prose riyp-prose max-w-reading text-prose prose-headings:font-display prose-headings:text-foreground prose-h2:mb-5 prose-h2:mt-14 prose-h2:text-title prose-h3:mt-10 prose-h3:text-heading prose-p:text-prose prose-p:text-muted-foreground prose-li:my-1.5 prose-li:text-prose prose-li:text-muted-foreground prose-strong:font-semibold prose-strong:text-foreground">
                                    {children}
                                </article>

                                {faq && faq.length > 0 ? (
                                    <section className="mt-16 border-t border-line" aria-labelledby="faq-title">
                                        <h2 id="faq-title" className="py-6 font-display text-heading text-foreground">Common questions</h2>
                                        <div className="divide-y divide-line border-b border-line">
                                            {faq.map((item) => (
                                                <div key={item.question} className="grid gap-2 py-6 md:grid-cols-[0.8fr_1.2fr] md:gap-8">
                                                    <h3 className="text-base font-semibold text-foreground">{item.question}</h3>
                                                    <p className="text-base text-muted-foreground">{item.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                ) : null}

                                <section className="mt-16 rounded-sheet border border-line bg-card px-6 py-8" aria-labelledby="product-translation-title">
                                    <h2 id="product-translation-title" className="font-display text-heading text-foreground">{productTieIn.title}</h2>
                                    <div className="mt-7 divide-y divide-line border-t border-line">
                                        {productTieIn.items.map((item, index) => (
                                            <div key={item.title} className="grid gap-2 py-5 md:grid-cols-[2.25rem_0.8fr_1.35fr] md:items-baseline md:gap-5">
                                                <span className="text-xs tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                                                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {(relatedArticles?.length || sources?.length) ? (
                                    <section className="mt-16" aria-labelledby="evidence-notes-title">
                                        <div className="flex items-baseline justify-between border-b border-line pb-4">
                                            <h2 id="evidence-notes-title" className="font-display text-heading text-foreground">Sources and related research</h2>
                                        </div>

                                        {sources && sources.length > 0 ? (
                                            <div className="py-7">
                                                <h3 className="riyp-evidence-label text-brand">Sources</h3>
                                                <ol className="mt-5 space-y-3 border-l border-line pl-6 text-sm text-muted-foreground">
                                                {sources.map((source, index) => {
                                                    const sourceId = source.id ?? `source-${index + 1}`;
                                                    const sourceLabel = [source.title, source.publisher ? `— ${source.publisher}` : null, source.year ? `(${source.year})` : null].filter(Boolean).join(" ").trim().concat(".");
                                                    return (
                                                        <li key={sourceId} id={sourceId} tabIndex={-1} className="riyp-jump-target -mx-2 px-2 py-1">
                                                            <span className="mr-2 tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                                                            {source.href ? <a href={source.href} target="_blank" rel="noopener noreferrer" className="riyp-link-quiet">{sourceLabel}</a> : <span>{sourceLabel}</span>}
                                                        </li>
                                                    );
                                                })}
                                                </ol>
                                            </div>
                                        ) : null}

                                        {relatedArticles && relatedArticles.length > 0 ? (
                                            <div className="border-t border-line pt-7">
                                                <h3 className="riyp-evidence-label text-muted-foreground">Related research</h3>
                                                <div className="mt-3 divide-y divide-line border-b border-line">
                                                    {relatedArticles.map((article, index) => (
                                                        <Link key={article.href ?? `related-${index}`} href={article.href} className="focus-ring riyp-surface-link -mx-3 grid min-h-14 gap-2 rounded-lg px-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
                                                            <span className="text-sm font-medium">{article.title}</span>
                                                            <span className="riyp-evidence-label flex items-center gap-3 text-muted-foreground">
                                                                {article.tag || "Read next"}
                                                                <ArrowRight data-affordance className="size-4" />
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

                <section className="border-y border-line bg-card px-6 py-16 text-foreground md:px-8 md:py-20">
                    <div className="mx-auto flex max-w-[72rem] flex-col gap-8 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="riyp-evidence-label text-brand">Apply it to your resume</p>
                            <h2 className="mt-4 max-w-[24ch] font-display text-headline text-foreground">{cta.title}</h2>
                        </div>
                        <Button asChild className="shrink-0">
                            <Link href={cta.href}>
                                {cta.buttonText}
                                <ArrowRight className="size-4" weight="bold" />
                            </Link>
                        </Button>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}

export function ArticleInsight({ title, desc }: { title: string; desc: ReactNode }) {
    return (
        <aside className="my-8 rounded-xl border border-line bg-proof px-5 py-5">
            <div className="riyp-evidence-label text-foreground">{title}</div>
            <div className="mt-2 text-base text-muted-foreground">{desc}</div>
        </aside>
    );
}

// The browser scrolls to the source (its scroll margin clears the fixed header); keyboard
// and screen-reader position follow it there instead of staying on the citation.
function focusCitedSource(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const source = document.getElementById(id);
    if (!source) return;
    requestAnimationFrame(() => source.focus({ preventScroll: true }));
}

export function Citation({ id, children }: { id: string; children: ReactNode }) {
    const sourceLabel = typeof children === "string" || typeof children === "number" ? children : "reference";
    return (
        <sup className="relative top-[-0.25em] ml-0.5 inline-flex size-4 align-baseline">
            <a href={`#${id}`} onClick={(event) => focusCitedSource(event, id)} aria-label={`Go to source ${sourceLabel}`} className="focus-ring absolute left-1/2 top-1/2 inline-flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm text-xs font-semibold tabular-nums riyp-link">
                {children}
            </a>
        </sup>
    );
}
