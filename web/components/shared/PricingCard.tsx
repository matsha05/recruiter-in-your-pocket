"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PRICING_PLANS } from "@/lib/billing/pricing";

// Pricing tiers: free, monthly ($9), lifetime ($79)
export type PricingTier = "free" | "monthly" | "lifetime";

interface PricingCardProps {
    tier: PricingTier;
    variant?: "full" | "compact";
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
    selected = false,
    onSelect,
    loading = false,
    allowFreeSelect = false,
    className,
}: PricingCardProps) {
    const data = TIER_DATA[tier];
    const isHighlighted = tier === "lifetime";
    const isFree = tier === "free";
    const disableForFree = isFree && !allowFreeSelect;
    const buttonLabel = isFree && allowFreeSelect ? "Run Free Review" : data.buttonText;

    // COMPACT variant - for modals
    if (variant === "compact") {
        return (
            <button
                type="button"
                onClick={onSelect}
                disabled={loading || disableForFree}
                className={cn(
                    "p-4 rounded-xl text-center transition-all duration-200 ease-out border flex flex-col items-center justify-center relative overflow-hidden",
                    selected
                        ? "bg-card ring-2 ring-brand border-transparent"
                        : "bg-transparent border-border/60 hover:bg-secondary/10 hover:border-brand/30",
                    disableForFree && "opacity-50 cursor-not-allowed",
                    className
                )}
            >
                {isHighlighted && data.badge && (
                    <div className="absolute -top-0.5 right-0 left-0 flex justify-center">
                        <span className="text-[9px] uppercase tracking-wider bg-brand text-white px-2 py-0.5 rounded font-bold flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            {data.badge}
                        </span>
                    </div>
                )}
                <span className={cn(
                    "text-2xl font-display font-medium mt-1",
                    isHighlighted ? "text-brand" : "text-foreground"
                )}>
                    {data.price}
                </span>
                <span className={cn(
                    "text-xs font-medium uppercase tracking-wider mt-1",
                    isHighlighted ? "text-brand" : "text-muted-foreground"
                )}>
                    {data.label}
                </span>
                <span className="text-[10px] text-muted-foreground">{data.period}</span>
            </button>
        );
    }

    // FULL variant - for landing page and settings
    return (
        <div
            className={cn(
                "p-6 rounded-xl border transition-all duration-200 ease-out flex flex-col relative hover:shadow-md",
                isHighlighted
                    ? "border-2 border-brand/30 bg-brand/5 hover:shadow-brand/10"
                    : "border-border/40 bg-white dark:bg-card hover:border-border",
                className
            )}
        >
            {isHighlighted && data.badge && (
                <div className="absolute -top-2.5 left-4 bg-brand text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {data.badge}
                </div>
            )}

            <div className="mb-5">
                <div className={cn(
                    "text-xs font-bold uppercase tracking-wider mb-1",
                    isHighlighted ? "text-brand" : "text-muted-foreground"
                )}>
                    {data.label}
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-display font-medium text-foreground">
                        {data.price}
                    </span>
                    {data.period && (
                        <span className="text-muted-foreground text-sm">{data.period}</span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{data.description}</p>
            </div>

            <ul className="space-y-2.5 mb-6 flex-1">
                {data.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                        <Check className={cn(
                            "w-3.5 h-3.5 mt-0.5 shrink-0",
                            i === 0 && isHighlighted ? "text-brand" : "text-muted-foreground/50"
                        )} />
                        <span className={cn(
                            feature.bold ? "font-medium text-foreground" : "text-muted-foreground"
                        )}>
                            {feature.text}
                        </span>
                    </li>
                ))}
            </ul>

            <Button
                variant={isHighlighted ? "brand" : isFree ? "ghost" : "outline"}
                className="w-full"
                onClick={onSelect}
                disabled={loading || disableForFree}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    buttonLabel
                )}
            </Button>
        </div>
    );
}

// Export tier data for use elsewhere
export { TIER_DATA };
