"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * ReportSectionHeader
 * 
 * A systemized header component for all report sections.
 * Typography follows V3 design system:
 * - Eyebrow: text-sm uppercase tracking-wider (Satoshi)
 * - Subtitle: font-display text-xl (Sentient) - the recruiter-voice hook
 * 
 * Usage:
 *   <ReportSectionHeader
 *     icon={<SignalRadarIcon className="w-4 h-4 text-brand" />}
 *     number="02"
 *     title="Signal Analysis"
 *     subtitle="What made me lean in, and what made me pause."
 *     badge={<span>...</span>} // optional
 *   />
 */
interface ReportSectionHeaderProps {
    icon: ReactNode;
    number: string;
    title: string;
    subtitle?: string;
    badge?: ReactNode;
    className?: string;
}

export function ReportSectionHeader({
    icon,
    number,
    title,
    subtitle,
    badge,
    className
}: ReportSectionHeaderProps) {
    return (
        <div className={cn("space-y-3", className)}>
            {/* Eyebrow: Number + Title + Optional Badge */}
            <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {icon}
                    {number}. {title}
                </h2>
                {badge}
            </div>

            {subtitle ? (
                <p className="max-w-2xl font-display text-[1.15rem] font-medium leading-snug tracking-tight text-foreground md:text-[1.25rem]">
                    {subtitle}
                </p>
            ) : null}
        </div>
    );
}
