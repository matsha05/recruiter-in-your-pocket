"use client";

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type PricingTier = "single" | "pack";

interface PricingCardProps {
    tier: PricingTier;
    variant?: "full" | "compact";
    selected?: boolean;
    onSelect?: () => void;
    loading?: boolean;
    className?: string;
}

const TIER_DATA = {
    single: {
        label: "Quick Check",
        price: "$9",
        reviews: "1 review",
        description: "Best for first-time feedback",
        buttonText: "Get 1 Review",
        badge: undefined as string | undefined,
        features: [
            { text: "1 full review included", bold: true },
            { text: "See what recruiters notice in 7.4 seconds", bold: false },
            { text: "Copy-paste rewrites for weak bullets", bold: false },
        ],
    },
    pack: {
        label: "Active Search",
        price: "$29",
        reviews: "5 reviews",
        description: "For an active job search",
        buttonText: "Get 5 Reviews",
        badge: "Best Value",
        features: [
            { text: "5 full reviews included", bold: true },
            { text: "Tailor versions for different roles", bold: false },
            { text: "Full rewrites and missing wins", bold: false },
            { text: "Compare progress across versions", bold: false },
            { text: "Export clean PDF when ready", bold: false },
        ],
    },
} as const;

export function PricingCard({
    tier,
    variant = "full",
    selected = false,
    onSelect,
    loading = false,
    className,
}: PricingCardProps) {
    const data = TIER_DATA[tier];
    const isPack = tier === "pack";

    // COMPACT variant - for modals
    if (variant === "compact") {
        return (
            <button
                type="button"
                onClick={onSelect}
                disabled={loading}
                className={cn(
                    "p-4 rounded-xl text-center transition-all duration-200 ease-out border flex flex-col items-center justify-center relative overflow-hidden",
                    selected
                        ? "bg-card ring-2 ring-brand border-transparent"
                        : "bg-transparent border-border/60 hover:bg-secondary/10 hover:border-brand/30",
                    className
                )}
            >
                {isPack && data.badge && (
                    <div className="absolute -top-0.5 right-0 left-0 flex justify-center">
                        <span className="text-[9px] uppercase tracking-wider bg-premium text-white px-2 py-0.5 rounded font-bold">
                            {data.badge}
                        </span>
                    </div>
                )}
                <span className={cn(
                    "text-2xl font-display font-medium mt-1",
                    isPack ? "text-premium" : "text-foreground"
                )}>
                    {data.price}
                </span>
                <span className={cn(
                    "text-xs font-medium uppercase tracking-wider mt-1",
                    isPack ? "text-premium" : "text-muted-foreground"
                )}>
                    {data.label}
                </span>
                <span className="text-[10px] text-muted-foreground">{data.reviews}</span>
            </button>
        );
    }

    // FULL variant - for landing page and settings
    return (
        <div
            className={cn(
                "p-6 rounded-xl border transition-all duration-200 ease-out flex flex-col relative hover:shadow-md",
                isPack
                    ? "border-2 border-brand/30 bg-brand/5 hover:shadow-brand/10"
                    : "border-border/40 bg-white dark:bg-card hover:border-border",
                className
            )}
        >
            {isPack && data.badge && (
                <div className="absolute -top-2.5 left-4 bg-brand text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                    {data.badge}
                </div>
            )}

            <div className="mb-5">
                <div className={cn(
                    "text-xs font-bold uppercase tracking-wider mb-1",
                    isPack ? "text-brand" : "text-muted-foreground"
                )}>
                    {data.label}
                </div>
                <div className="text-3xl font-display font-medium text-foreground">
                    {data.price}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{data.description}</p>
            </div>

            <ul className="space-y-2.5 mb-6 flex-1">
                {data.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                        <Check className={cn(
                            "w-3.5 h-3.5 mt-0.5 shrink-0",
                            i === 0 && isPack ? "text-brand" : "text-muted-foreground/50"
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
                variant={isPack ? "brand" : "outline"}
                className="w-full"
                onClick={onSelect}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    data.buttonText
                )}
            </Button>
        </div>
    );
}

// Export tier data for use elsewhere (e.g., checkout copy)
export { TIER_DATA };
