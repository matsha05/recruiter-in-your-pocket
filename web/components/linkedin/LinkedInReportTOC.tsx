"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { m as motion } from "motion/react"
import { Eye, PenLine, Search, Lightbulb } from "lucide-react"
import { InsightSparkleIcon } from "@/components/icons"

interface TOCItem {
    id: string
    label: string
    icon: React.ElementType
}

interface LinkedInReportTOCProps {
    activeId?: string
}

export function LinkedInReportTOC({ activeId }: LinkedInReportTOCProps) {
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
            const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
            el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" })
        }
    }

    return (
        <nav
            aria-label="LinkedIn report sections"
            className="overflow-x-auto border-y border-line bg-paper p-2 md:p-3"
        >
            <div className="flex min-w-max gap-1 md:block md:min-w-0 md:space-y-1">
                <div className="hidden px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/50 md:block">
                    Navigation
                </div>
                {items.map((item) => {
                    const isActive = activeId === item.id
                    return (
                        <button type="button"
                            key={item.id}
                            onClick={() => handleScroll(item.id)}
                            className={cn(
                                "relative flex min-h-10 shrink-0 items-center gap-2 border-l-2 px-3 py-2 text-sm font-medium transition-colors md:min-h-11 md:w-full md:gap-3",
                                isActive
                                    ? "border-cyan-bright bg-surface-sky text-foreground"
                                    : "border-transparent text-muted-foreground hover:bg-paper-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("size-4", isActive ? "text-brand" : "text-muted-foreground")} />
                            {item.label}
                            {isActive && (
                                <motion.div
                                    layoutId="active-linkedin-toc-line"
                                    className="ml-1 h-px w-4 bg-cyan-bright md:ml-auto"
                                />
                            )}
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
