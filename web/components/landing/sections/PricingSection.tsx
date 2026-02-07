"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PricingCard } from "@/components/shared/PricingCard";
import type { LandingPricingContent } from "@/components/landing/landingContent";

type PricingSectionProps = {
    content: LandingPricingContent;
    loadingTier: "monthly" | "lifetime" | null;
    onCheckout: (tier: "monthly" | "lifetime") => void;
    onFreeSelect: () => void;
};

export function PricingSection({ content, loadingTier, onCheckout, onFreeSelect }: PricingSectionProps) {
    return (
        <section className="landing-section-pad landing-section landing-section-tight landing-section-divider">
            <div className="landing-rail grid items-start landing-grid-gap xl:grid-cols-[0.72fr_1.28fr]">
                <div className="landing-flow-md">
                    <div className="text-label-mono text-muted-foreground">{content.eyebrow}</div>
                    <h2 className="landing-title-xl">
                        {content.title}
                    </h2>
                    <p className="landing-copy">
                        {content.copy}
                    </p>

                    <div className="landing-card-soft landing-card-pad landing-flow-sm">
                        <div className="text-label-mono text-muted-foreground">{content.included.eyebrow}</div>
                        <div className="space-y-2 landing-copy-muted">
                            {content.included.items.map((item) => (
                                <p key={item}>{item}</p>
                            ))}
                        </div>
                        <Link href={content.included.cta.href} className="inline-flex items-center gap-1 text-sm text-brand hover:text-brand/80">
                            {content.included.cta.label}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
                    <PricingCard
                        tier="free"
                        allowFreeSelect
                        onSelect={onFreeSelect}
                    />
                    <PricingCard
                        tier="monthly"
                        onSelect={() => onCheckout("monthly")}
                        loading={loadingTier === "monthly"}
                    />
                    <PricingCard
                        tier="lifetime"
                        onSelect={() => onCheckout("lifetime")}
                        loading={loadingTier === "lifetime"}
                    />
                </div>
            </div>

            <div className="landing-rail landing-section-split">
                <div className="landing-section-head">
                    <div>
                        <div className="landing-kicker">{content.trust.kicker}</div>
                        <h3 className="landing-title-lg">{content.trust.title}</h3>
                    </div>
                    <Link href={content.trust.cta.href} className="text-sm text-brand hover:text-brand/80 inline-flex items-center gap-1">
                        {content.trust.cta.label}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid landing-grid-gap md:grid-cols-2 lg:grid-cols-4">
                    {content.trust.items.map((item) => (
                        <div key={item.title} className="landing-card landing-card-pad landing-flow-sm">
                            <div className="w-8 h-8 rounded-md bg-brand/10 text-brand flex items-center justify-center">
                                <item.icon className="w-4 h-4" />
                            </div>
                            <div className="text-base font-medium">{item.title}</div>
                            <div className="landing-copy-muted">{item.copy}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
