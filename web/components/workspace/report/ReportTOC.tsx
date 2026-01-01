"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
    HiddenGemIcon,
    PrincipalRecruiterIcon,
    RoleTargetIcon,
    SignalRadarIcon,
    TransformArrowIcon
} from "@/components/icons"

interface TOCItem {
    id: string
    label: string
    icon: React.ElementType
    score?: number
}

interface ReportTOCProps {
    activeId?: string
    score?: number
}

export function ReportTOC({ activeId, score }: ReportTOCProps) {
    const items: TOCItem[] = [
        { id: "section-first-impression", label: "The Verdict", icon: PrincipalRecruiterIcon },
        { id: "section-score-summary", label: "Signal Check", icon: SignalRadarIcon },
        { id: "section-bullet-upgrades", label: "Red Pen Rewrites", icon: TransformArrowIcon },
        { id: "section-missing-wins", label: "Missing Wins", icon: HiddenGemIcon },
        { id: "section-job-alignment", label: "Job Fit", icon: RoleTargetIcon },
    ]

    const handleScroll = (id: string) => {
        const el = document.getElementById(id)
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" })
        }
    }

    return (
        <nav className="space-y-4">
            {/* Score Mini-Card */}
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm text-center mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Resume Score
                </div>
                <div className="text-3xl font-display font-bold text-foreground">
                    {score || 0}
                </div>
            </div>

            <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/50">
                    Navigation
                </div>
                {items.map((item) => {
                    const isActive = activeId === item.id
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleScroll(item.id)}
                            className={cn(
                                "flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-all",
                                isActive
                                    ? "bg-brand/10 text-brand"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("w-4 h-4", isActive ? "text-brand" : "text-muted-foreground")} />
                            {item.label}
                            {isActive && (
                                <motion.div
                                    layoutId="active-toc-pill"
                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-brand"
                                />
                            )}
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
