"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LandingEvidenceContent } from "@/components/landing/landingConfig";
import { LandingSectionTag } from "@/components/landing/sections/SectionPrimitives";

type EvidenceSectionProps = {
    content: LandingEvidenceContent;
};

export function EvidenceSection({ content }: EvidenceSectionProps) {
    return (
        <div className="landing-flow-lg">
            <LandingSectionTag index="01" label="Evidence System" />

            <div className="grid items-start landing-grid-gap xl:grid-cols-[0.92fr_1.08fr]">
                <div className="landing-flow-md">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-gradient-to-r from-white/95 to-amber-50/55 px-3 py-1 text-label-mono text-muted-foreground dark:border-slate-700 dark:bg-slate-900/50">
                        {content.eyebrow}
                    </div>
                    <h2 className="landing-title-xl max-w-[31rem]">
                        {content.title}
                    </h2>
                    <p className="max-w-[34rem] landing-copy">
                        {content.copy}
                    </p>

                    <div className="landing-card card-interactive landing-card-pad landing-flow-sm">
                        <div className="landing-eyebrow">{content.howItWorks.eyebrow}</div>
                        <ol className="landing-flow-sm landing-copy">
                            {content.howItWorks.steps.map((step, index) => (
                                <li key={step} className="flex items-start gap-2.5">
                                    <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-brand/12 text-[11px] font-semibold text-brand">
                                        {index + 1}
                                    </span>
                                    <span>{step.replace(/^\d+\.\s*/, "")}</span>
                                </li>
                            ))}
                        </ol>
                        <Link
                            href={content.howItWorks.cta.href}
                            className="landing-link-inline"
                        >
                            {content.howItWorks.cta.label}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                <div className="grid auto-rows-fr landing-grid-gap sm:grid-cols-2">
                    {content.signalCards.map((card, index) => (
                        <div
                            key={card.title}
                            className={cn(
                                "landing-card card-interactive h-full landing-card-pad-compact landing-flow-sm",
                                (index === 0 || index === content.signalCards.length - 1) && "sm:col-span-2"
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="w-8 h-8 rounded-md bg-brand/10 text-brand flex items-center justify-center">
                                    <card.icon className="w-4 h-4" />
                                </div>
                                <span className="text-label-mono text-muted-foreground">{card.weight}</span>
                            </div>
                            <h3 className="landing-title-card">{card.title}</h3>
                            <p className="landing-copy-muted">{card.description}</p>
                            <div className="inline-flex items-center rounded-md border border-border/55 bg-muted/25 px-2 py-0.5 text-label-mono text-muted-foreground">
                                {card.citation}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
