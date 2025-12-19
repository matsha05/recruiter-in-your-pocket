"use client";

import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgesProps {
    variant?: "inline" | "stacked";
    className?: string;
}

/**
 * TrustBadges — Systematic trust signal component
 * 
 * Displays security and privacy assurances.
 * Used in InputPanel dropzone and landing page.
 */
export function TrustBadges({ variant = "inline", className }: TrustBadgesProps) {
    const badges = [
        { icon: Shield, label: "Encrypted" },
        { label: "Auto-deleted in 24h" },
        { label: "Never trains AI" }
    ];

    if (variant === "stacked") {
        return (
            <div className={cn("flex flex-col gap-2 text-xs text-muted-foreground", className)}>
                {badges.map((badge, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                        {badge.icon && <badge.icon className="w-3 h-3 text-brand" />}
                        {badge.label}
                    </span>
                ))}
            </div>
        );
    }

    return (
        <div className={cn("flex items-center justify-center gap-4 text-[11px] text-muted-foreground", className)}>
            {badges.map((badge, i) => (
                <span key={i} className="flex items-center gap-1.5">
                    {badge.icon && (
                        <svg className="w-3 h-3 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    )}
                    {badge.label}
                    {i < badges.length - 1 && <span className="ml-2">·</span>}
                </span>
            ))}
        </div>
    );
}
