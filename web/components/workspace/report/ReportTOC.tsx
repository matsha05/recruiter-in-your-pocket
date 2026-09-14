"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LayoutGroup, m } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { UI_TRANSITION } from "@/lib/animation";
import { useReportNavigation } from "./useReportNavigation";

interface ReportTOCProps {
    activeId?: string;
}

const REPORT_TOC_ITEMS = [
    { id: "section-first-impression", label: "Overview", mobileLabel: "Overview" },
    { id: "section-fixes", label: "Fix these first", mobileLabel: "Fixes" },
    { id: "section-keep", label: "Keep these", mobileLabel: "Keep" },
    { id: "section-role", label: "Role fit", mobileLabel: "Role fit" },
] as const;

export function ReportTOC({ activeId }: ReportTOCProps) {
    const { selectedId, navRef, buttonRefs, handleScroll } = useReportNavigation(REPORT_TOC_ITEMS, activeId);
    const layoutId = React.useId();
    const reducedMotion = useReducedMotion();

    return (
        <LayoutGroup id={layoutId}>
            <nav ref={navRef} aria-label="Resume report sections" className="mx-auto grid w-full grid-cols-4 gap-x-1 sm:flex sm:items-center sm:overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {REPORT_TOC_ITEMS.map((item) => {
                    const active = selectedId === item.id;
                    return (
                        <button
                            type="button"
                            ref={(element) => { buttonRefs.current[item.id] = element; }}
                            key={item.id}
                            onClick={() => handleScroll(item.id)}
                            aria-label={item.label}
                            aria-current={active ? "location" : undefined}
                            className={cn(
                                "focus-ring relative min-h-11 w-full rounded-lg px-1 text-xs font-semibold transition-colors duration-fast ease-snap motion-reduce:transition-none sm:w-auto sm:shrink-0 sm:snap-start sm:px-4 sm:text-sm",
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
                            <span className="relative sm:hidden">{item.mobileLabel}</span>
                            <span className="relative hidden sm:inline">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </LayoutGroup>
    );
}
