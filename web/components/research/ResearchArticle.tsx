"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";

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
    };
    keyFinding: {
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
        title: "See what your resume looks like",
        buttonText: "Run Free Analysis",
        href: "/workspace"
    }
}: ResearchArticleProps) {
    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": header.title,
                        "description": header.description,
                        "author": {
                            "@type": "Organization",
                            "name": "Recruiter in Your Pocket"
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Recruiter in Your Pocket"
                        },
                        "datePublished": header.lastUpdated ? new Date(header.lastUpdated).toISOString() : undefined,
                        "dateModified": header.lastUpdated ? new Date(header.lastUpdated).toISOString() : undefined,
                    })
                }}
            />
            {faq && faq.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": faq.map((item) => ({
                                "@type": "Question",
                                "name": item.question,
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": item.answer
                                }
                            }))
                        })
                    }}
                />
            )}
            <div className="max-w-3xl mx-auto space-y-12 pb-16 px-6 md:px-0 pt-8">
                <header className="space-y-6">
                    <Link
                        href="/research"
                        className="inline-flex items-center mb-6 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 hover:text-foreground transition-colors"
                    >
                        Back to Research
                    </Link>
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                                {header.tag}
                            </span>
                            {(header.readTime || header.lastUpdated) && (
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground/60">
                                    {header.readTime && (
                                        <span className="flex items-baseline gap-2">
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                                                Read time
                                            </span>
                                            <span>{header.readTime}</span>
                                        </span>
                                    )}
                                    {header.lastUpdated && (
                                        <span className="flex items-baseline gap-2">
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                                                Updated
                                            </span>
                                            <span>{header.lastUpdated}</span>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground tracking-tight">
                            {header.title}
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                            {header.description}
                        </p>
                    </div>
                </header>

                <div className="border-l-4 border-brand pl-5 py-5 space-y-4">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-brand/80">
                        {keyFinding.subtitle}
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground tracking-tight">{keyFinding.stat}</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            {keyFinding.statDescription}
                        </p>
                    </div>
                    <dl className="pt-4 border-t border-border/40 text-xs text-muted-foreground/70 space-y-2">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                            <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                                Source
                            </dt>
                            <dd>
                                {keyFinding.source.href ? (
                                    <a
                                        href={keyFinding.source.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-foreground underline underline-offset-4 decoration-border"
                                    >
                                        {keyFinding.source.text}
                                    </a>
                                ) : (
                                    <span>{keyFinding.source.text}</span>
                                )}
                            </dd>
                        </div>
                        {keyFinding.sampleSize && (
                            <div className="flex flex-wrap items-baseline gap-x-2">
                                <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                                    Sample
                                </dt>
                                <dd>{keyFinding.sampleSize}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {visualization && (
                    <section className="my-12">
                        {visualization}
                    </section>
                )}

                <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:tracking-tight prose-p:text-base prose-p:leading-relaxed prose-p:text-muted-foreground prose-strong:font-medium prose-strong:text-foreground prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4">
                    {children}
                </article>

                {faq && faq.length > 0 && (
                    <section className="space-y-6">
                        <h2 className="font-display text-2xl font-medium text-foreground">FAQ</h2>
                        <div className="border-t border-border/30 divide-y divide-border/30">
                            {faq.map((item) => (
                                <div key={item.question} className="py-4">
                                    <h3 className="text-sm font-medium text-foreground mb-2">{item.question}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <hr className="border-border/40 my-12" />

                <div className="border-l-2 border-border/60 pl-4 space-y-4">
                    <h3 className="font-display text-lg font-medium text-foreground">
                        {productTieIn.title}
                    </h3>
                    <div className="space-y-4">
                        {productTieIn.items.map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <span className="font-mono text-[10px] text-muted-foreground/40 mt-1 shrink-0">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <div>
                                    <h4 className="font-medium text-foreground text-sm mb-1">{item.title}</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {relatedArticles && relatedArticles.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-display text-lg font-medium text-foreground">Related Research</h3>
                        <div className="border-t border-border/30 divide-y divide-border/30">
                            {relatedArticles.map((article, i) => (
                                <Link
                                    key={article.href ?? `related-${i}`}
                                    href={article.href}
                                    className="group flex items-baseline justify-between py-3"
                                >
                                    <span className="text-sm text-foreground group-hover:text-brand transition-colors">
                                        {article.title}
                                    </span>
                                    {article.tag && (
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">{article.tag}</span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {sources && sources.length > 0 && (
                    <section className="border-t border-border/40 pt-10 space-y-4">
                        <h3 className="font-display text-lg font-medium text-foreground">Sources</h3>
                        <ol className="list-decimal pl-5 space-y-2 text-xs text-muted-foreground leading-relaxed">
                            {sources.map((source, index) => {
                                const sourceId = source.id ?? `source-${index + 1}`;
                                const sourceLabel = [
                                    source.title,
                                    source.publisher ? `- ${source.publisher}` : null,
                                    source.year ? `(${source.year})` : null
                                ]
                                    .filter(Boolean)
                                    .join(" ")
                                    .trim()
                                    .concat(".");

                                return (
                                    <li key={sourceId} id={sourceId}>
                                        {source.href ? (
                                            <a
                                                href={source.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-foreground underline underline-offset-4 decoration-border"
                                            >
                                                {sourceLabel}
                                            </a>
                                        ) : (
                                            <span>{sourceLabel}</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    </section>
                )}

                <div className="border-t border-border/40 pt-12 flex flex-col items-center justify-center gap-3 text-center">
                    <h3 className="font-display text-xl font-medium">{cta.title}</h3>
                    <Link
                        href={cta.href}
                        className="text-sm font-medium text-foreground hover:underline underline-offset-4"
                    >
                        {cta.buttonText}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export function ArticleInsight({ title, desc }: { title: string, desc: ReactNode }) {
    return (
        <div className="border-l-2 border-border/60 pl-4 py-2">
            <div className="text-foreground font-medium text-sm mb-1">{title}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
    );
}

export function Citation({ id, children }: { id: string; children: ReactNode }) {
    return (
        <sup className="align-super">
            <a
                href={`#${id}`}
                className="text-[10px] font-mono text-muted-foreground hover:text-foreground"
            >
                {children}
            </a>
        </sup>
    );
}
