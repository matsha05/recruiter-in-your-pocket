"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Eye, PenLine, Search, Lightbulb, Target } from "lucide-react"
import { InsightSparkleIcon } from "@/components/icons"

interface TOCItem {
    id: string
    label: string
    icon: React.ElementType
}

interface LinkedInReportTOCProps {
    activeId?: string
    score?: number
}

export function LinkedInReportTOC({ activeId, score }: LinkedInReportTOCProps) {
    const items: TOCItem[] = [
        { id: "linkedin-first-impression", label: "First Impression", icon: Eye },
        { id: "linkedin-headline", label: "Headline Analysis", icon: PenLine },
        { id: "linkedin-about", label: "About Section", icon: InsightSparkleIcon },
        { id: "linkedin-visibility", label: "Search Visibility", icon: Search },
        { id: "linkedin-quick-wins", label: "Quick Wins", icon: Lightbulb },
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
                    LinkedIn Score
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
                                    layoutId="active-linkedin-toc-pill"
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
