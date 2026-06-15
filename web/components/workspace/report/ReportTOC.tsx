"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { m as motion } from "motion/react"
import {
    HiddenGemIcon,
    InsightSparkleIcon,
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
}

export function ReportTOC({ activeId }: ReportTOCProps) {
    const items: TOCItem[] = [
        { id: "section-first-impression", label: "First Read", icon: PrincipalRecruiterIcon },
        { id: "section-score-summary", label: "Signal Breakdown", icon: SignalRadarIcon },
        { id: "section-evidence-ledger", label: "Evidence Ledger", icon: InsightSparkleIcon },
        { id: "section-bullet-upgrades", label: "Red Pen", icon: TransformArrowIcon },
        { id: "section-missing-wins", label: "Missing Wins", icon: HiddenGemIcon },
        { id: "section-job-alignment", label: "Role Fit", icon: RoleTargetIcon },
    ]

    const handleScroll = (id: string) => {
        const el = document.getElementById(id)
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" })
        }
    }

    return (
        <nav className="rounded-2xl border border-border/60 bg-card/80 p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-sm">
            <div className="gap-y-1">
                <div className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground/55">
                    Report
                </div>
                {items.map((item) => {
                    const isActive = activeId === item.id
                    return (
                        <button type="button"
                            key={item.id}
                            onClick={() => handleScroll(item.id)}
                            className={cn(
                                "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                isActive
                                    ? "bg-brand/10 text-brand shadow-[inset_0_0_0_1px_rgba(13,148,136,0.12)]"
                                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("size-4", isActive ? "text-brand" : "text-muted-foreground")} />
                            {item.label}
                            {isActive && (
                                <motion.div
                                    layoutId="active-toc-pill"
                                    className="ml-auto size-1.5 rounded-full bg-brand"
                                />
                            )}
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
