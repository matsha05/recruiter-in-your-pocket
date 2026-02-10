"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
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

/** Compress "December 2025" → "Dec 2025" */
function compressDate(date: string): string {
    return date
        .replace("January", "Jan").replace("February", "Feb").replace("March", "Mar")
        .replace("April", "Apr").replace("June", "Jun").replace("July", "Jul")
        .replace("August", "Aug").replace("September", "Sep").replace("October", "Oct")
        .replace("November", "Nov").replace("December", "Dec");
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
        title: "See your resume through recruiter eyes",
        buttonText: "Start free review",
        href: "/workspace"
    }
}: ResearchArticleProps) {
    return (
        <>
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

            <main className="bg-[#FAFAF8] text-slate-900 selection:bg-teal-700/15 pt-28 md:pt-36">

                {/* ── Header ── */}
                <section className="px-6 md:px-8">
                    <div className="mx-auto max-w-3xl pb-8">
                        <Link
                            href="/research"
                            className="group inline-flex items-center gap-1.5 mb-10 text-[13px] text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                            Research
                        </Link>

                        {/* Compact meta line: tag · read time · date */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-5">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "#0D7377" }}>
                                {header.tag}
                            </span>
                            {(header.readTime || header.lastUpdated) && (
                                <>
                                    <span className="text-slate-200">·</span>
                                    {header.readTime && (
                                        <span className="text-[12px] text-slate-400">{header.readTime}</span>
                                    )}
                                    {header.readTime && header.lastUpdated && (
                                        <span className="text-slate-200">·</span>
                                    )}
                                    {header.lastUpdated && (
                                        <span className="text-[12px] text-slate-400">{compressDate(header.lastUpdated)}</span>
                                    )}
                                </>
                            )}
                        </div>

                        <h1
                            className="font-display text-slate-900"
                            style={{
                                fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
                                lineHeight: 1.05,
                                letterSpacing: "-0.035em",
                                fontWeight: 400,
                            }}
                        >
                            {header.title}
                        </h1>
                        <p className="mt-4 max-w-xl text-[17px] leading-[1.7] text-slate-500">
                            {header.description}
                        </p>
                    </div>
                </section>

                {/* ── Key finding — subordinate callout ── */}
                <section className="px-6 md:px-8">
                    <div className="mx-auto max-w-3xl pb-10">
                        <div
                            className="rounded-xl px-6 py-5 md:px-8 md:py-6"
                            style={{ backgroundColor: "hsl(40 25% 95%)" }}
                        >
                            <p
                                className="font-display text-slate-900"
                                style={{
                                    fontSize: "clamp(1.35rem, 3vw, 1.65rem)",
                                    lineHeight: 1.15,
                                    letterSpacing: "-0.02em",
                                    fontWeight: 500,
                                }}
                            >
                                {keyFinding.stat}
                            </p>
                            <p className="mt-3 max-w-xl text-[15px] leading-[1.65] text-slate-500">
                                {keyFinding.statDescription}
                            </p>
                            <p className="mt-3 text-[12px] text-slate-400">
                                {keyFinding.source.href ? (
                                    <a
                                        href={keyFinding.source.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-slate-600 underline underline-offset-4 decoration-slate-200"
                                    >
                                        {keyFinding.source.text}
                                    </a>
                                ) : (
                                    <span>{keyFinding.source.text}</span>
                                )}
                                {keyFinding.sampleSize && (
                                    <>
                                        <span className="mx-1.5 text-slate-200">·</span>
                                        <span>{keyFinding.sampleSize}</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="px-6 md:px-8">
                    <div className="mx-auto max-w-3xl space-y-12 pb-10">

                        {/* ── Visualization ── */}
                        {visualization && (
                            <section>
                                {visualization}
                            </section>
                        )}

                        {/* ── Article body ── */}
                        <article className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-normal prose-headings:tracking-tight prose-p:text-base prose-p:leading-[1.7] prose-p:text-slate-500 prose-strong:font-medium prose-strong:text-slate-700 prose-h2:text-2xl prose-h2:text-slate-900 prose-h2:mt-10 prose-h2:mb-3 prose-li:my-1 prose-li:text-slate-500">
                            {children}
                        </article>

                        {/* ── FAQ ── */}
                        {faq && faq.length > 0 && (
                            <section className="space-y-5">
                                <h2
                                    className="font-display text-slate-900"
                                    style={{ fontSize: "1.35rem", fontWeight: 400, letterSpacing: "-0.02em" }}
                                >
                                    Frequently asked
                                </h2>
                                <div className="border-t border-slate-100 divide-y divide-slate-100">
                                    {faq.map((item) => (
                                        <div key={item.question} className="py-4">
                                            <h3 className="text-[15px] font-medium text-slate-700 mb-1.5">{item.question}</h3>
                                            <p className="text-[14px] text-slate-500 leading-relaxed">{item.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <hr className="border-slate-100 my-10" />

                        {/* ── Product tie-in ── */}
                        <div
                            className="rounded-xl bg-white p-6 space-y-4"
                            style={{
                                boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
                            }}
                        >
                            <h3
                                className="font-display text-slate-900"
                                style={{ fontSize: "1.1rem", fontWeight: 500, letterSpacing: "-0.01em" }}
                            >
                                {productTieIn.title}
                            </h3>
                            <div className="space-y-3">
                                {productTieIn.items.map((item, i) => (
                                    <div key={i} className="flex gap-3.5 items-start">
                                        <span className="font-mono text-[10px] text-slate-300 mt-0.5 shrink-0">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <div>
                                            <h4 className="font-medium text-slate-700 text-[14px] mb-0.5">{item.title}</h4>
                                            <p className="text-[13px] text-slate-500 leading-relaxed">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Further reading (related + sources merged) ── */}
                        {(relatedArticles?.length || sources?.length) && (
                            <section className="border-t border-slate-100 pt-8 space-y-6">
                                <h3
                                    className="font-display text-slate-900"
                                    style={{ fontSize: "1.1rem", fontWeight: 500, letterSpacing: "-0.01em" }}
                                >
                                    Further reading
                                </h3>

                                {relatedArticles && relatedArticles.length > 0 && (
                                    <div className="divide-y divide-slate-50">
                                        {relatedArticles.map((article, i) => (
                                            <Link
                                                key={article.href ?? `related-${i}`}
                                                href={article.href}
                                                className="group flex items-baseline justify-between py-2.5"
                                            >
                                                <span className="text-[14px] text-slate-600 group-hover:text-slate-900 transition-colors">
                                                    {article.title}
                                                </span>
                                                {article.tag && (
                                                    <span className="text-[10px] uppercase tracking-[0.08em] text-slate-300">
                                                        {article.tag}
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {sources && sources.length > 0 && (
                                    <div className="pt-2">
                                        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-slate-300 mb-3">Sources</p>
                                        <ol className="list-decimal pl-5 space-y-1.5 text-[12px] text-slate-400 leading-relaxed">
                                            {sources.map((source, index) => {
                                                const sourceId = source.id ?? `source-${index + 1}`;
                                                const sourceLabel = [
                                                    source.title,
                                                    source.publisher ? `— ${source.publisher}` : null,
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
                                                                className="hover:text-slate-600 underline underline-offset-4 decoration-slate-200"
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
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                </section>

                {/* ── CTA — dark strip ── */}
                <section
                    className="px-6 py-12 md:px-8 md:py-16"
                    style={{ backgroundColor: "#0F172A" }}
                >
                    <div className="mx-auto max-w-3xl flex flex-col items-center justify-center gap-5 text-center">
                        <h3
                            className="font-display text-white"
                            style={{
                                fontSize: "clamp(1.4rem, 3vw, 1.75rem)",
                                fontWeight: 400,
                                letterSpacing: "-0.025em",
                                lineHeight: 1.1,
                            }}
                        >
                            {cta.title}
                        </h3>
                        <Link
                            href={cta.href}
                            className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                            {cta.buttonText}
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export function ArticleInsight({ title, desc }: { title: string, desc: ReactNode }) {
    return (
        <div className="border-l-2 border-slate-200 pl-4 py-2">
            <div className="text-slate-700 font-medium text-[14px] mb-1">{title}</div>
            <p className="text-[13px] text-slate-500 leading-relaxed">{desc}</p>
        </div>
    );
}

export function Citation({ id, children }: { id: string; children: ReactNode }) {
    return (
        <sup className="align-super">
            <a
                href={`#${id}`}
                className="text-[10px] font-mono text-slate-400 hover:text-slate-600"
            >
                {children}
            </a>
        </sup>
    );
}
