"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LayoutGroup, m } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { UI_TRANSITION } from "@/lib/animation";
import { useReportNavigation } from "./useReportNavigation";

interface ReportTOCProps {
    activeId?: string;
    /** Sections the current report actually renders; others are left out of the navigation. */
    hasKeep?: boolean;
    hasRole?: boolean;
    /** The worklist report (Nov 5, 2026) has the write-up, the lines and fit; no Keep section. */
    worklist?: boolean;
}

// On phones the visible text is the short label; the rest of the name is read, not shown, so what a
// voice-control user says ("Fix") is the start of the name the button announces (WCAG 2.5.3).
const REPORT_TOC_ITEMS = [
    { id: "section-first-impression", label: "Overview", mobileLabel: "Overview" },
    { id: "section-fixes", label: "Fix these first", mobileLabel: "Fix" },
    { id: "section-keep", label: "Keep these", mobileLabel: "Keep" },
    { id: "section-role", label: "Role fit", mobileLabel: "Role fit" },
] as const;

const WORKLIST_TOC_ITEMS = [
    { id: "section-first-impression", label: "Overview", mobileLabel: "Overview" },
    { id: "section-fixes", label: "Lines", mobileLabel: "Lines" },
    { id: "section-role", label: "Role fit", mobileLabel: "Role fit" },
] as const;

export function ReportTOC({ activeId, hasKeep = true, hasRole = true, worklist = false }: ReportTOCProps) {
    const items = React.useMemo(
        () => (worklist ? WORKLIST_TOC_ITEMS : REPORT_TOC_ITEMS).filter((item) => (item.id !== "section-keep" || hasKeep) && (item.id !== "section-role" || hasRole)),
        [hasKeep, hasRole, worklist],
    );
    const { selectedId, navRef, buttonRefs, handleScroll } = useReportNavigation(items, activeId);
    const layoutId = React.useId();
    const reducedMotion = useReducedMotion();

    return (
        <LayoutGroup id={layoutId}>
            <nav ref={navRef} aria-label="Resume report sections" className="flex min-w-0 flex-1 items-center gap-x-1 sm:flex-none sm:overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {items.map((item) => {
                    const active = selectedId === item.id;
                    const hiddenRest = item.label.startsWith(item.mobileLabel) ? item.label.slice(item.mobileLabel.length) : ` ${item.label}`;
                    return (
                        <button
                            type="button"
                            ref={(element) => { buttonRefs.current[item.id] = element; }}
                            key={item.id}
                            data-section={item.id}
                            onClick={() => handleScroll(item.id)}
                            aria-current={active ? "location" : undefined}
                            className={cn(
                                "focus-ring relative min-h-11 min-w-11 flex-1 rounded-lg px-1 text-xs font-semibold transition-colors duration-fast ease-snap motion-reduce:transition-none sm:flex-none sm:snap-start sm:px-4 sm:text-sm",
                                active ? "text-brand" : "text-muted-foreground hover:bg-proof hover:text-foreground"
                            )}
                        >
                            {active && (
                                <m.span
                                    aria-hidden="true"
                                    layoutId="report-section-indicator"
                                    className="pointer-events-none absolute inset-0 rounded-lg bg-surface-sky"
                                    transition={reducedMotion ? { duration: 0 } : UI_TRANSITION}
                                />
                            )}
                            <span className="relative sm:hidden">{item.mobileLabel}<span className="sr-only">{hiddenRest}</span></span>
                            <span className="relative hidden sm:inline">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </LayoutGroup>
    );
}
