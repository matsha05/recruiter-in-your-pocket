"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import styles from "./ReportStream.module.css";

/**
 * ReportSectionHeader
 * 
 * A systemized header component for all report sections.
 * Typography follows the shared browser design system:
 * - Eyebrow: compact shared sans label treatment
 * - Subtitle: readable report heading scale
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
                <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {icon}
                    {number}. {title}
                </h2>
                {badge}
            </div>

            {subtitle ? (
                <p className={cn(styles.sectionTitle, "max-w-2xl")}>
                    {subtitle}
                </p>
            ) : null}
        </div>
    );
}
