"use client";

import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
    score: number;
    size?: "sm" | "md" | "lg";
    className?: string;
}

/**
 * ScoreBadge — the First Impression score as the report shows it: a number out of 100 in ink.
 * No color bands or verdict-style labels; the written Verdict carries the judgment.
 */
export function ScoreBadge({ score, size = "md", className }: ScoreBadgeProps) {
    const sizeStyles = {
        sm: "text-base",
        md: "text-xl",
        lg: "text-title",
    };

    return (
        <span className={cn("inline-flex items-baseline font-display font-extrabold tabular-nums tracking-tight text-foreground", sizeStyles[size], className)}>
            {score}
            <span className="ml-0.5 text-xs font-medium tracking-normal text-muted-foreground">/100</span>
        </span>
    );
}
