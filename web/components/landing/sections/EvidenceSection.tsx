"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LandingEvidenceContent } from "@/components/landing/landingContent";

type EvidenceSectionProps = {
    content: LandingEvidenceContent;
};

export function EvidenceSection({ content }: EvidenceSectionProps) {
    return (
        <div className="grid items-start landing-grid-gap lg:grid-cols-[0.9fr_1.1fr]">
            <div className="landing-flow-md">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-label-mono text-muted-foreground dark:border-slate-700">
                    {content.eyebrow}
                </div>
                <h2 className="landing-title-xl">
                    {content.title}
                </h2>
                <p className="max-w-[34rem] landing-copy">
                    {content.copy}
                </p>

                <div className="landing-card landing-card-pad landing-flow-sm">
                    <div className="landing-eyebrow">{content.howItWorks.eyebrow}</div>
                    <ol className="landing-flow-sm landing-copy">
                        {content.howItWorks.steps.map((step) => (
                            <li key={step}>{step}</li>
                        ))}
                    </ol>
                    <Link href={content.howItWorks.cta.href} className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand/80">
                        {content.howItWorks.cta.label}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            <div className="grid landing-grid-gap sm:grid-cols-2">
                {content.signalCards.map((card) => (
                    <div key={card.title} className="landing-card landing-card-pad-compact landing-flow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div className="w-8 h-8 rounded-md bg-brand/10 text-brand flex items-center justify-center">
                                <card.icon className="w-4 h-4" />
                            </div>
                            <span className="text-label-mono text-muted-foreground">{card.weight}</span>
                        </div>
                        <h3 className="font-display text-[21px] leading-[1.08] tracking-tight">{card.title}</h3>
                        <p className="text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">{card.description}</p>
                        <div className="inline-flex items-center rounded bg-muted/25 px-2 py-0.5 text-label-mono text-muted-foreground">
                            {card.citation}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
