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
            el.scrollIntoView({ behavior: "smooth", block: "center" })
        }
    }

    return (
        <nav className="gap-y-4">
            <div className="gap-y-1">
                <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/50">
                    Navigation
                </div>
                {items.map((item) => {
                    const isActive = activeId === item.id
                    return (
                        <button type="button"
                            key={item.id}
                            onClick={() => handleScroll(item.id)}
                            className={cn(
                                "flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded transition-all",
                                isActive
                                    ? "bg-brand/10 text-brand"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("size-4", isActive ? "text-brand" : "text-muted-foreground")} />
                            {item.label}
                            {isActive && (
                                <motion.div
                                    layoutId="active-linkedin-toc-pill"
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
