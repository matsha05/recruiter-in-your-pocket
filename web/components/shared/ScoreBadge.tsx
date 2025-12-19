"use client";

import { cn } from "@/lib/utils";
import { getScoreColor, getScoreBg, getScoreLabel } from "@/lib/score-utils";

interface ScoreBadgeProps {
    score: number;
    label?: string;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    className?: string;
}

/**
 * ScoreBadge — Systematic score display component
 * 
 * Uses semantic colors from lib/score-utils:
 * - 85+ (Success): Green
 * - 70-84 (Premium): Gold  
 * - <70 (Destructive): Red
 */
export function ScoreBadge({
    score,
    label,
    size = "md",
    showLabel = true,
    className
}: ScoreBadgeProps) {
    const displayLabel = label || getScoreLabel(score);

    const sizeStyles = {
        sm: "px-2 py-1 text-sm gap-1",
        md: "px-3 py-1.5 text-base gap-2",
        lg: "px-4 py-2 text-lg gap-2"
    };

    const scoreSizeStyles = {
        sm: "text-sm font-bold",
        md: "text-lg font-bold",
        lg: "text-2xl font-bold"
    };

    const labelSizeStyles = {
        sm: "text-[10px]",
        md: "text-xs",
        lg: "text-sm"
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-md font-mono tabular-nums",
                getScoreBg(score),
                sizeStyles[size],
                className
            )}
        >
            <span className={cn(scoreSizeStyles[size], getScoreColor(score))}>
                {score}
            </span>
            {showLabel && displayLabel && (
                <span className={cn(labelSizeStyles[size], "font-medium", getScoreColor(score))}>
                    {displayLabel}
                </span>
            )}
        </div>
    );
}
