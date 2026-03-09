"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PricingCard } from "@/components/shared/PricingCard";
import type { LandingPricingContent } from "@/components/landing/landingConfig";
import {
    LandingSectionBreak,
    LandingSectionFrame,
    LandingSectionHeader,
    LandingSectionTag,
} from "@/components/landing/sections/SectionPrimitives";
import { SCROLL_REVEAL_VARIANTS, SCROLL_REVEAL_FAST } from "@/lib/animation";

type PricingSectionProps = {
    content: LandingPricingContent;
    loadingTier: "monthly" | "lifetime" | null;
    onCheckout: (tier: "monthly" | "lifetime") => void;
    onFreeSelect: () => void;
};

export function PricingSection({ content, loadingTier, onCheckout, onFreeSelect }: PricingSectionProps) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <LandingSectionFrame tone="soft" density="tight" divider="bottom">
            <div className="grid items-start landing-grid-gap xl:grid-cols-[0.72fr_1.28fr]">
                <motion.div
                    className="landing-flow-md xl:sticky xl:top-20"
                    variants={SCROLL_REVEAL_VARIANTS}
                    initial={prefersReducedMotion ? false : "hidden"}
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <LandingSectionTag index="04" label="Plans And Access" />
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
                        <Link href={content.included.cta.href} className="landing-link-inline">
                            {content.included.cta.label}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    className="rounded-2xl border border-border/55 bg-gradient-to-b from-white/90 to-amber-50/45 p-3.5 shadow-[0_24px_48px_-34px_rgba(2,6,23,0.36)] dark:from-slate-900/60 dark:to-slate-900/40 sm:p-4"
                    variants={SCROLL_REVEAL_FAST}
                    initial={prefersReducedMotion ? false : "hidden"}
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                >
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
                </motion.div>
            </div>

            <LandingSectionBreak label={content.trust.kicker} />

            <div className="landing-flow-md">
                <LandingSectionHeader
                    title={content.trust.title}
                    titleAs="h3"
                    titleClassName="landing-title-lg"
                    action={(
                        <Link href={content.trust.cta.href} className="landing-link-inline">
                            {content.trust.cta.label}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                />

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
        </LandingSectionFrame>
    );
}
