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
        { icon: Shield, label: "Encrypted in transit" },
        { label: "Delete reports anytime" },
        { label: "We do not sell resume data" }
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
                    {badge.icon && <Shield className="w-3 h-3 text-brand" />}
                    {badge.label}
                    {i < badges.length - 1 && <span className="ml-2">·</span>}
                </span>
            ))}
        </div>
    );
}
