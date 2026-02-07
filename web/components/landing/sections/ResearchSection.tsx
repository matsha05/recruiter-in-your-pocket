"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LandingResearchContent } from "@/components/landing/landingContent";

type ResearchSectionProps = {
    content: LandingResearchContent;
};

export function ResearchSection({ content }: ResearchSectionProps) {
    return (
        <div className="landing-section-split">
            <div className="landing-section-head">
                <div>
                    <div className="landing-kicker">{content.kicker}</div>
                    <h3 className="landing-title-lg">
                        {content.title}
                    </h3>
                    <p className="landing-copy-muted">
                        {content.copy}
                    </p>
                </div>
                <Link
                    href={content.cta.href}
                    className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand/80"
                >
                    {content.cta.label}
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid items-start gap-7 lg:grid-cols-[1.06fr_0.94fr] lg:gap-8">
                <Link
                    href={content.featured.href}
                    className="group card-interactive landing-card block rounded-2xl p-5 lg:p-6"
                >
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <span className="text-label-mono">{content.featured.eyebrow}</span>
                        <span className="text-label-mono text-muted-foreground">{content.featured.readTime}</span>
                    </div>
                    <h4 className="landing-title-md mb-3 transition-colors group-hover:text-brand">
                        {content.featured.title}
                    </h4>
                    <p className="landing-copy-muted">
                        {content.featured.copy}
                    </p>
                    <div className="mt-4 rounded-md border border-border/60 bg-muted/15 px-4 py-3 md:px-5 md:py-3.5">
                        <div className="mb-0.5 text-label-mono text-muted-foreground">{content.featured.highlightLabel}</div>
                        <div className="landing-copy">
                            {content.featured.highlightCopy}
                        </div>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm text-brand">
                        {content.featured.ctaLabel}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                <div className="landing-flow-sm">
                    <div className="landing-eyebrow">{content.curatedLabel}</div>
                    <div className="space-y-3">
                        {content.curated.map((article) => (
                            <Link
                                key={article.title}
                                href={article.href}
                                className="group card-interactive block rounded-xl border border-border/60 bg-white px-4 py-3.5 dark:bg-slate-900"
                            >
                                <div className="mb-2 flex items-center justify-between gap-4">
                                    <div className="text-label-mono">{article.category}</div>
                                    <span className="text-label-mono text-muted-foreground shrink-0">{article.readTime}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-md bg-brand/10 text-brand flex items-center justify-center shrink-0">
                                        <article.icon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[20px] font-display leading-[1.1] tracking-tight text-slate-900 transition-colors group-hover:text-brand dark:text-slate-100">
                                            {article.title}
                                        </div>
                                        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{article.copy}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
