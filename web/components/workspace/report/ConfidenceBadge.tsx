"use client";

import React from "react";

interface ConfidenceBadgeProps {
    level: 'high' | 'medium' | 'low' | undefined;
    className?: string;
}

/**
 * ConfidenceBadge displays High/Medium/Low confidence indicators per spec-freeze requirements.
 * 
 * ● High   - Green, standard display
 * ○ Medium - Yellow, depends on context
 * △ Low    - Gray, limited evidence
 */
export function ConfidenceBadge({ level, className = "" }: ConfidenceBadgeProps) {
    if (!level) return null;

    const config = {
        high: {
            icon: "●",
            label: "High",
            className: "text-emerald-600 dark:text-emerald-400",
            bgClassName: "bg-emerald-50 dark:bg-emerald-900/20",
        },
        medium: {
            icon: "○",
            label: "Medium",
            className: "text-amber-600 dark:text-amber-400",
            bgClassName: "bg-amber-50 dark:bg-amber-900/20",
        },
        low: {
            icon: "△",
            label: "Low",
            className: "text-gray-500 dark:text-gray-400",
            bgClassName: "bg-gray-100 dark:bg-gray-800",
        },
    };

    const { icon, label, className: colorClass, bgClassName } = config[level];

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colorClass} ${bgClassName} ${className}`}
            title={`Confidence: ${label}`}
        >
            <span className="text-[10px]">{icon}</span>
            <span>{label}</span>
        </span>
    );
}

export default ConfidenceBadge;
