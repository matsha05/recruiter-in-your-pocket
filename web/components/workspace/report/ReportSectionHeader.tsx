"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * ReportSectionHeader
 * 
 * A systemized header component for all report sections.
 * Typography follows V2.1 design system:
 * - Eyebrow: text-sm uppercase tracking-wider (Geist)
 * - Subtitle: font-serif text-2xl (Fraunces) - the recruiter-voice hook
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
    subtitle: string;
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
        <div className={cn("space-y-2", className)}>
            {/* Eyebrow: Number + Title + Optional Badge */}
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    {icon}
                    {number}. {title}
                </h2>
                {badge}
            </div>

            {/* Subtitle: Recruiter-voice editorial hook */}
            <p className="font-serif text-2xl text-foreground tracking-tight leading-snug">
                {subtitle}
            </p>
        </div>
    );
}
