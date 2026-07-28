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
    const isFeaturedMarketing = isMarketing && isFeatured;

    if (variant === "compact") {
        return (
            <button
                type="button"
                onClick={onSelect}
                disabled={loading || disableForFree}
                className={cn(
                    "app-card relative flex min-h-32 flex-col items-center justify-center overflow-hidden p-4 text-center",
                    selected ? "border-brand/60 ring-2 ring-brand/20" : "hover:border-brand/35",
                    isFeatured && "app-card-highlight",
                    disableForFree && "cursor-not-allowed opacity-50",
                    className
                )}
            >
                {data.badge && (
                    <span className="absolute inset-x-0 top-0 flex items-center justify-center bg-brand px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                        {data.badge}
                    </span>
                )}
                <span className="mt-2 font-display text-3xl font-medium text-foreground">{data.price}</span>
                <span className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{data.label}</span>
                <span className="text-xs text-muted-foreground">{data.period}</span>
            </button>
        );
    }

    const cardClass = cn(
        "relative flex h-full flex-col border p-6 md:p-7",
        isMarketing
            ? isFeatured
                ? "rounded-none border-foreground bg-foreground text-background"
                : "rounded-none border-line bg-transparent"
            : isFeatured
                ? "app-card app-card-highlight border-cyan-bright/45"
                : "app-card",
        className
    );

    const featureTextClass = (bold?: boolean) => cn(
        "leading-6",
        isFeaturedMarketing
            ? bold ? "font-medium text-background" : "text-background/72"
            : bold ? "font-medium text-foreground" : "text-muted-foreground"
    );

    const marketingButton = (
        <button
            type="button"
            onClick={onSelect}
            disabled={loading || disableForFree}
            className={cn(
                "flex min-h-12 w-full items-center justify-center gap-2 rounded-md border px-5 py-3 text-base font-semibold transition-[background-color,color,border-color,transform] duration-150 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
                isFeatured
                    ? "border-background bg-background text-foreground hover:border-surface-sky hover:bg-surface-sky"
                    : "border-line bg-transparent text-foreground hover:border-brand/45 hover:bg-brand/5"
            )}
        >
            {loading ? <CircleNotch className="size-4 animate-spin" weight="bold" /> : null}
            {loading ? "Opening checkout..." : buttonLabel}
        </button>
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
                    "mb-3 text-xs font-bold uppercase tracking-[0.14em]",
                    isFeaturedMarketing ? "text-brand-tint" : isFeatured ? "text-brand" : "text-muted-foreground"
                )}>
                    {data.label}
                </div>
                <div className="flex items-end gap-2">
                    <span className={cn("font-display text-5xl font-medium leading-none tracking-[-0.035em]", isFeaturedMarketing ? "text-background" : "text-foreground")}>
                        {data.price}
                    </span>
                    {data.period ? <span className={cn("pb-1 text-base", isFeaturedMarketing ? "text-background/72" : "text-muted-foreground")}>{data.period}</span> : null}
                </div>
                <p className={cn("mt-4 text-lg leading-7", isFeaturedMarketing ? "text-background/72" : "text-muted-foreground")}>{data.description}</p>
            </div>

            <ul className="mb-7 flex-1 space-y-3">
                {data.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3 text-base">
                        <Check className={cn("mt-1 size-4 shrink-0", isFeaturedMarketing ? "text-brand-tint" : isFeatured ? "text-brand" : "text-muted-foreground")} weight="bold" />
                        <span className={featureTextClass(feature.bold)}>{feature.text}</span>
                    </li>
                ))}
            </ul>

            {isMarketing ? marketingButton : appButton}
        </article>
    );
}

export { TIER_DATA };
