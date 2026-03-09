"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { LandingResearchContent } from "@/components/landing/landingConfig";
import { LandingSectionHeader, LandingSectionTag } from "@/components/landing/sections/SectionPrimitives";
import { SCROLL_REVEAL_VARIANTS, SCROLL_REVEAL_FAST } from "@/lib/animation";

type ResearchSectionProps = {
    content: LandingResearchContent;
};

export function ResearchSection({ content }: ResearchSectionProps) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <div className="landing-flow-lg">
            <LandingSectionTag index="02" label="Research Library" />

            <LandingSectionHeader
                kicker={content.kicker}
                title={content.title}
                titleAs="h2"
                titleClassName="landing-title-lg"
                copy={content.copy}
                copyClassName="max-w-[43rem]"
                action={(
                    <Link
                        href={content.cta.href}
                        className="landing-btn-quiet"
                    >
                        {content.cta.label}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                )}
            />

            <div className="grid items-start landing-grid-gap lg:grid-cols-[1.06fr_0.94fr]">
                <motion.div
                    variants={SCROLL_REVEAL_VARIANTS}
                    initial={prefersReducedMotion ? false : "hidden"}
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                >
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
                        <div className="mt-4 rounded-lg border border-border/60 bg-gradient-to-b from-amber-50/55 to-white/85 px-4 py-3 md:px-5 md:py-3.5 dark:from-slate-900/70 dark:to-slate-900/55">
                            <div className="mb-0.5 text-label-mono text-muted-foreground">{content.featured.highlightLabel}</div>
                            <div className="landing-copy">
                                {content.featured.highlightCopy}
                            </div>
                        </div>
                        <div className="mt-4 landing-link-inline">
                            {content.featured.ctaLabel}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                </motion.div>

                <motion.div
                    className="landing-flow-sm"
                    variants={SCROLL_REVEAL_FAST}
                    initial={prefersReducedMotion ? false : "hidden"}
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                >
                    <div className="landing-eyebrow">{content.curatedLabel}</div>
                    <div className="landing-card landing-card-pad-compact">
                        {content.curated.map((article, index) => (
                            <Link
                                key={article.title}
                                href={article.href}
                                className="group block border-t border-border/45 py-3 first:border-t-0 first:pt-0 last:pb-0"
                            >
                                <div className="mb-2 flex items-center justify-between gap-4">
                                    <div className="text-label-mono">{article.category}</div>
                                    <span className="text-label-mono text-muted-foreground shrink-0">{article.readTime}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 font-mono text-[11px] font-semibold tracking-[0.12em] text-brand/70">
                                        {String(index + 1).padStart(2, "0")}
                                    </div>
                                    <div className="w-8 h-8 rounded-md bg-brand/10 text-brand flex items-center justify-center shrink-0">
                                        <article.icon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="landing-title-card transition-colors group-hover:text-brand">
                                            {article.title}
                                        </div>
                                        <p className="mt-1 landing-copy-muted">{article.copy}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
