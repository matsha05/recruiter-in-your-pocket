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
    /** "app" = in-app surfaces (settings, modals) using app-card tokens.
     *  "marketing" = Editor's Desk warm-paper pages using white card + paper shadow + slate CTAs. */
    context?: "app" | "marketing";
    selected?: boolean;
    onSelect?: () => void;
    loading?: boolean;
    allowFreeSelect?: boolean;
    className?: string;
}

const TIER_DATA = PRICING_PLANS;

/** Paper shadow matching all Editor's Desk cards */
const paperShadow =
    "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)";

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
    const isHighlighted = tier === "lifetime";
    const isFree = tier === "free";
    const disableForFree = isFree && !allowFreeSelect;
    const buttonLabel = isFree && allowFreeSelect ? "Start free review" : data.buttonText;
    const isMarketing = context === "marketing";

    // COMPACT variant — modals (always uses app tokens)
    if (variant === "compact") {
        return (
            <button
                type="button"
                onClick={onSelect}
                disabled={loading || disableForFree}
                className={cn(
                    "app-card p-4 text-center flex flex-col items-center justify-center relative overflow-hidden",
                    selected
                        ? "ring-2 ring-brand/35 border-transparent"
                        : "hover:border-brand/30",
                    isHighlighted && "app-card-highlight",
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

    // ─── FULL variant ────────────────────────────────────────────────────
    // Marketing context: white card, paper shadow, slate-900 dark pill CTAs
    // App context: original app-card tokens, teal brand CTAs

    // ── Card wrapper classes ──
    const cardClass = isMarketing
        ? cn(
            "rounded-2xl bg-white p-6 flex flex-col relative transition-all duration-200 hover:-translate-y-0.5",
            isHighlighted && "ring-1 ring-slate-900/10",
            className
        )
        : cn(
            "app-card p-6 flex flex-col relative",
            isHighlighted && "app-card-highlight ring-1 ring-brand/35",
            className
        );

    // ── Card inline style (shadow) ──
    const cardStyle = isMarketing
        ? {
            boxShadow: isHighlighted
                ? `0 0 0 1px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)`
                : paperShadow
        }
        : undefined;

    // ── Badge ──
    const badgeNode = isHighlighted && data.badge && (
        <div
            className={cn(
                "absolute -top-2.5 left-4 text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded flex items-center gap-1",
                isMarketing
                    ? "bg-slate-900 text-white"
                    : "bg-brand text-white"
            )}
        >
            <Sparkles className="w-3 h-3" />
            {data.badge}
        </div>
    );

    // ── Label color ──
    const labelClass = cn(
        "text-xs font-bold uppercase tracking-wider mb-1",
        isMarketing
            ? (isHighlighted ? "text-slate-900" : "text-slate-400")
            : (isHighlighted ? "text-brand" : "text-muted-foreground")
    );

    // ── Price color ──
    const priceClass = cn(
        "text-3xl font-display font-medium",
        isMarketing ? "text-slate-900" : "text-foreground"
    );

    // ── Check icon color ──
    const checkColor = (featureIndex: number) =>
        isMarketing
            ? (featureIndex === 0 && isHighlighted ? "text-slate-900" : "text-slate-300")
            : (featureIndex === 0 && isHighlighted ? "text-brand" : "text-muted-foreground/50");

    // ── Feature text color ──
    const featureTextClass = (bold?: boolean) =>
        isMarketing
            ? (bold ? "font-medium text-slate-700" : "text-slate-500")
            : (bold ? "font-medium text-foreground" : "text-muted-foreground");

    // ── CTA button ──
    const buttonNode = (
        <button
            type="button"
            onClick={onSelect}
            disabled={loading || disableForFree}
            className={cn(
                "w-full flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200",
                isMarketing
                    ? isHighlighted
                        ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]"
                        : isFree
                            ? "bg-transparent text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 active:scale-[0.98]"
                            : "bg-transparent text-slate-900 border border-slate-200 hover:bg-slate-50 active:scale-[0.98]"
                    : "" // app context uses the Button component below
            )}
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                </>
            ) : (
                buttonLabel
            )}
        </button>
    );

    const appButtonNode = (
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
    );

    return (
        <div className={cardClass} style={cardStyle}>
            {badgeNode}

            <div className="mb-5">
                <div className={labelClass}>
                    {data.label}
                </div>
                <div className="flex items-baseline gap-1">
                    <span className={priceClass}>
                        {data.price}
                    </span>
                    {data.period && (
                        <span className={cn(
                            "text-sm",
                            isMarketing ? "text-slate-400" : "text-muted-foreground"
                        )}>{data.period}</span>
                    )}
                </div>
                <p className={cn(
                    "text-sm mt-1",
                    isMarketing ? "text-slate-500" : "text-muted-foreground"
                )}>{data.description}</p>
            </div>

            <ul className="space-y-2.5 mb-6 flex-1">
                {data.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                        <Check className={cn(
                            "w-3.5 h-3.5 mt-0.5 shrink-0",
                            checkColor(i)
                        )} />
                        <span className={featureTextClass(feature.bold)}>
                            {feature.text}
                        </span>
                    </li>
                ))}
            </ul>

            {isMarketing ? buttonNode : appButtonNode}
        </div>
    );
}

// Export tier data for use elsewhere
export { TIER_DATA };
