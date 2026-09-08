"use client";

import { Check, CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PRICING_PLANS } from "@/lib/billing/pricing";
import { cn } from "@/lib/utils";

export type PricingTier = "free" | "30d";

interface PricingCardProps {
    tier: PricingTier;
    variant?: "full" | "compact";
    context?: "app" | "marketing";
    selected?: boolean;
    onSelect?: () => void;
    loading?: boolean;
    allowFreeSelect?: boolean;
    className?: string;
}

const TIER_DATA = PRICING_PLANS;

export function PricingCard({
    tier,
    variant = "full",
    context = "app",
    selected = false,
    onSelect,
    loading = false,
    allowFreeSelect = false,
    className,
}: PricingCardProps) {
    const data = TIER_DATA[tier];
    const isFree = tier === "free";
    const isFeatured = tier === "30d";
    const disableForFree = isFree && !allowFreeSelect;
    const buttonLabel = isFree && allowFreeSelect ? "Get the free report" : data.buttonText;
    const isMarketing = context === "marketing";

    if (variant === "compact") {
        return (
            <button
                type="button"
                onClick={onSelect}
                disabled={loading || disableForFree}
                className={cn(
                    "app-card relative flex min-h-32 flex-col items-center justify-center overflow-hidden p-4 text-center",
                    selected ? "border-brand/60 ring-2 ring-brand/20" : "hover:border-brand/35",
                    isFeatured && "border-brand/30 bg-surface-sky/45",
                    disableForFree && "cursor-not-allowed opacity-50",
                    className
                )}
            >
                {data.badge && (
                    <span className="absolute inset-x-0 top-0 flex items-center justify-center bg-surface-sky px-2 py-1 text-eyebrow uppercase text-brand">
                        {data.badge}
                    </span>
                )}
                <span className="mt-2 font-display text-3xl font-medium text-foreground">{data.price}</span>
                <span className="mt-1 text-eyebrow uppercase text-muted-foreground">{data.label}</span>
                <span className="text-xs text-muted-foreground">{data.period}</span>
            </button>
        );
    }

    const cardClass = cn(
        "relative flex h-full flex-col rounded-2xl border p-6 md:rounded-3xl md:p-8",
        isMarketing
            ? isFeatured
                ? "border-brand/30 bg-card text-foreground"
                : "border-line bg-card"
            : isFeatured
                ? "app-card border-brand/30 bg-surface-sky/45"
                : "app-card",
        className
    );

    const featureTextClass = (bold?: boolean) => cn(
        "leading-6",
        bold ? "font-medium text-foreground" : "text-muted-foreground"
    );

    const marketingButton = (
        <Button
            type="button"
            variant={isFeatured ? "brand" : "outline"}
            size="lg"
            onClick={onSelect}
            disabled={loading || disableForFree}
            className="w-full"
        >
            {loading ? <CircleNotch className="size-4 animate-spin" weight="bold" /> : null}
            {loading ? "Opening checkout..." : buttonLabel}
        </Button>
    );

    const appButton = (
        <Button
            variant={isFeatured ? "brand" : isFree ? "ghost" : "outline"}
            className="w-full"
            onClick={onSelect}
            disabled={loading || disableForFree}
        >
            {loading ? <CircleNotch className="mr-2 size-4 animate-spin" weight="bold" /> : null}
            {loading ? "Opening checkout..." : buttonLabel}
        </Button>
    );

    return (
        <article className={cardClass}>
            <div className="mb-6">
                <div className={cn(
                    "mb-3 text-eyebrow uppercase",
                    isFeatured ? "text-brand" : "text-muted-foreground"
                )}>
                    {data.label}
                </div>
                <div className="flex items-end gap-2">
                    <span className="font-display text-5xl font-normal leading-none tracking-tight text-foreground">
                        {data.price}
                    </span>
                    {data.period ? <span className="pb-1 text-base text-muted-foreground">{data.period}</span> : null}
                </div>
                <p className="mt-4 text-lg leading-7 text-muted-foreground">{data.description}</p>
            </div>

            <ul className="mb-7 flex-1 space-y-3">
                {data.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3 text-base">
                        <Check className={cn("mt-1 size-4 shrink-0", isFeatured ? "text-brand" : "text-muted-foreground")} weight="bold" />
                        <span className={featureTextClass(feature.bold)}>{feature.text}</span>
                    </li>
                ))}
            </ul>

            {isMarketing ? marketingButton : appButton}
        </article>
    );
}

export { TIER_DATA };
