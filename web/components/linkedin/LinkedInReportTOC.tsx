"use client";

import * as React from "react";
import { LayoutGroup, m } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Eye, PenLine, Search, Lightbulb } from "lucide-react";
import { InsightSparkleIcon } from "@/components/icons";
import { useReportNavigation } from "@/components/workspace/report/useReportNavigation";
import { UI_TRANSITION } from "@/lib/animation";
import { cn } from "@/lib/utils";

interface LinkedInReportTOCProps {
    activeId?: string;
}

const LINKEDIN_TOC_ITEMS = [
    { id: "linkedin-first-impression", label: "First impression", icon: Eye },
    { id: "linkedin-headline", label: "Headline", icon: PenLine },
    { id: "linkedin-about", label: "About section", icon: InsightSparkleIcon },
    { id: "linkedin-visibility", label: "Search visibility", icon: Search },
    { id: "linkedin-quick-wins", label: "Priority edits", icon: Lightbulb },
] as const;

export function LinkedInReportTOC({ activeId }: LinkedInReportTOCProps) {
    const { selectedId, navRef, buttonRefs, handleScroll } = useReportNavigation(LINKEDIN_TOC_ITEMS, activeId);
    const layoutId = React.useId();
    const reducedMotion = useReducedMotion();

    return (
        <LayoutGroup id={layoutId}>
            <nav
                ref={navRef}
                aria-label="LinkedIn report sections"
                className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {LINKEDIN_TOC_ITEMS.map((item) => {
                    const isActive = selectedId === item.id;
                    return (
                        <button
                            type="button"
                            key={item.id}
                            ref={(element) => { buttonRefs.current[item.id] = element; }}
                            onClick={() => handleScroll(item.id)}
                            aria-current={isActive ? "location" : undefined}
                            className={cn(
                                "focus-ring relative flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-fast ease-snap motion-reduce:transition-none",
                                isActive ? "text-brand" : "text-muted-foreground hover:bg-paper-muted hover:text-foreground"
                            )}
                        >
                            {isActive && (
                                <m.span
                                    aria-hidden="true"
                                    layoutId="linkedin-section-indicator"
                                    className="pointer-events-none absolute inset-0 rounded-lg bg-surface-sky"
                                    transition={reducedMotion ? { duration: 0 } : UI_TRANSITION}
                                />
                            )}
                            <item.icon className="relative size-4" aria-hidden="true" />
                            <span className="relative">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </LayoutGroup>
    );
}
