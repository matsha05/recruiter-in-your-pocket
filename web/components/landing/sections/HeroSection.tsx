"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { HeroReportArtifact } from "@/components/landing/HeroReportArtifact";
import type { LandingHeroContent } from "@/components/landing/landingContent";

function HeroStat({
    value,
    label,
    sublabel,
    highlight = false,
    valueClassName,
}: {
    value: ReactNode;
    label: string;
    sublabel?: string;
    highlight?: boolean;
    valueClassName?: string;
}) {
    return (
        <div className="text-center">
            <div
                className={`font-mono ${highlight ? "text-brand" : "text-slate-900 dark:text-slate-100"} ${valueClassName ?? "text-3xl font-bold"}`}
            >
                {value}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</div>
            {sublabel ? <div className="text-[10px] text-slate-400 mt-1">{sublabel}</div> : null}
        </div>
    );
}

type HeroSectionProps = {
    content: LandingHeroContent;
    onPrimaryCta?: () => void;
};

export function HeroSection({ content, onPrimaryCta }: HeroSectionProps) {
    return (
        <section className="landing-section-pad landing-section-divider landing-section-hero">
            <div className="landing-rail">
                <div className="grid items-start landing-grid-gap lg:grid-cols-[0.98fr_1.02fr]">
                    <div className="landing-flow-lg">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                            <content.badgeIcon className="w-3.5 h-3.5" />
                            {content.badge}
                        </div>

                        <h1 className="text-hero text-[46px] font-normal leading-[0.96] tracking-tight md:text-[58px] lg:text-[64px]">
                            {content.title}
                        </h1>

                        <p className="max-w-[33rem] landing-copy">{content.subtitle}</p>

                        <div className="overflow-hidden rounded-[12px] border border-border/60 bg-white/95 dark:bg-slate-900/65">
                            <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-5 py-3.5">
                                <div className="flex items-center gap-2 text-label-mono">
                                    <content.reportIcon className="w-4 h-4 text-brand" />
                                    {content.reportLabel}
                                </div>
                                <span className="text-label-mono text-muted-foreground">{content.reportSubtitle}</span>
                            </div>
                            <div className="grid sm:grid-cols-3 divide-x divide-border/60">
                                {content.stats.map((stat) => (
                                    <div key={stat.label} className="px-5 py-5">
                                        <HeroStat
                                            value={stat.value}
                                            label={stat.label}
                                            sublabel={stat.sublabel}
                                            highlight={stat.highlight}
                                            valueClassName={stat.valueClassName}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="max-w-[34rem] landing-flow-sm landing-copy-muted">
                            {content.bullets.map((bullet) => (
                                <div key={bullet} className="flex items-center gap-2">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand" />
                                    {bullet}
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href={content.primaryCta.href}
                                onClick={onPrimaryCta}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-brand text-white font-medium hover:bg-brand/90 transition-colors"
                            >
                                {content.primaryCta.label}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link href={content.secondaryCta.href} className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand transition-colors flex items-center gap-1">
                                {content.secondaryCta.label}
                                <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-500">
                            {content.footnote}
                        </p>
                    </div>

                    <div className="lg:pt-0.5">
                        <HeroReportArtifact
                            data={content.reportSample}
                            playbackSeconds={content.reportPlaybackSeconds}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
