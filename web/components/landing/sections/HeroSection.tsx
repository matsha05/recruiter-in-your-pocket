"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { HeroReportArtifact } from "@/components/landing/HeroReportArtifact";
import type { LandingHeroContent } from "@/components/landing/landingConfig";
import { LandingSectionFrame, LandingSectionTag } from "@/components/landing/sections/SectionPrimitives";

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
            <div className="landing-stat-label mt-1">{label}</div>
            {sublabel ? <div className="landing-stat-sublabel mt-1">{sublabel}</div> : null}
        </div>
    );
}

type HeroSectionProps = {
    content: LandingHeroContent;
    onPrimaryCta?: () => void;
};

export function HeroSection({ content, onPrimaryCta }: HeroSectionProps) {
    return (
        <LandingSectionFrame tone="hero" density="hero" divider="bottom">
            <div className="grid items-start landing-grid-gap lg:grid-cols-[0.98fr_1.02fr]">
                <div className="landing-flow-lg">
                    <LandingSectionTag index="00" label="First Impression" />
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/90 px-3 py-1.5 text-xs text-slate-600 shadow-[0_8px_24px_-20px_rgba(2,6,23,0.35)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                        <content.badgeIcon className="w-3.5 h-3.5" />
                        {content.badge}
                    </div>

                    <h1 className="landing-headline">
                        {content.title}
                    </h1>

                    <p className="max-w-[36rem] landing-subhead">{content.subtitle}</p>

                    <div className="overflow-hidden rounded-2xl border border-border/55 bg-white/95 shadow-[0_28px_58px_-44px_rgba(2,6,23,0.44)] dark:bg-slate-900/65">
                        <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-5 py-3.5">
                            <div className="flex items-center gap-2 text-label-mono">
                                <content.reportIcon className="w-4 h-4 text-brand" />
                                {content.reportLabel}
                            </div>
                            <span className="text-label-mono text-muted-foreground">{content.reportSubtitle}</span>
                        </div>
                        <div className="grid divide-y divide-border/60 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
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

                    <div className="grid max-w-[36rem] gap-3 sm:grid-cols-3">
                        {content.bullets.map((bullet) => (
                            <div
                                key={bullet}
                                className="rounded-xl border border-border/55 bg-gradient-to-b from-white/95 to-amber-50/35 px-3.5 py-3 text-[13px] leading-relaxed text-slate-700 dark:from-slate-900/60 dark:to-slate-900/40 dark:text-slate-300"
                            >
                                {bullet}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={content.primaryCta.href}
                            onClick={onPrimaryCta}
                            className="landing-btn-primary"
                        >
                            {content.primaryCta.label}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href={content.secondaryCta.href} className="landing-btn-secondary">
                            {content.secondaryCta.label}
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>
                    <p className="landing-footnote">
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
        </LandingSectionFrame>
    );
}
