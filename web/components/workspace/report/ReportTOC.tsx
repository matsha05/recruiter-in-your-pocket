"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ReportTOCProps {
    activeId?: string;
}

const REPORT_TOC_ITEMS = [
    { id: "section-first-impression", label: "Overview" },
    { id: "section-fixes", label: "Fix these first" },
    { id: "section-keep", label: "Keep these" },
    { id: "section-role", label: "Role fit" },
] as const;

function getScrollContainer(element: HTMLElement) {
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        if (/(auto|scroll|overlay)/.test(getComputedStyle(parent).overflowY) && parent.scrollHeight > parent.clientHeight) {
            return parent;
        }
    }
    return (document.scrollingElement || document.documentElement) as HTMLElement;
}

function getReadingLine(section: HTMLElement, nav: HTMLElement | null, container: HTMLElement) {
    const containerTop = container === document.scrollingElement ? 0 : container.getBoundingClientRect().top;
    const navigationBottom = nav?.closest("aside")?.getBoundingClientRect().bottom || containerTop;
    const sectionMargin = Number.parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
    return Math.max(navigationBottom, containerTop + sectionMargin);
}

export function ReportTOC({ activeId }: ReportTOCProps) {
    const [visibleId, setVisibleId] = React.useState(REPORT_TOC_ITEMS[0].id as string);
    const navRef = React.useRef<HTMLElement | null>(null);
    const buttonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

    React.useEffect(() => {
        const sections = REPORT_TOC_ITEMS
            .map((item) => document.getElementById(item.id))
            .filter((section): section is HTMLElement => Boolean(section));
        if (!sections.length) return;

        let frame = 0;
        const updateCurrentSection = () => {
            frame = 0;
            const container = getScrollContainer(sections[0]);
            let current = sections[0];
            for (const section of sections) {
                // Use every section's start, including sections taller than the viewport.
                // One pixel accounts for subpixel rounding at the scroll destination.
                if (section.getBoundingClientRect().top <= getReadingLine(section, navRef.current, container) + 1) {
                    current = section;
                }
            }
            setVisibleId(current.id);
        };
        const scheduleUpdate = () => {
            if (!frame) frame = requestAnimationFrame(updateCurrentSection);
        };
        // Capture scrolls from both the workspace panel and normal page layouts.
        window.addEventListener("scroll", scheduleUpdate, { capture: true, passive: true });
        window.addEventListener("resize", scheduleUpdate);
        const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleUpdate);
        sections.forEach((section) => resizeObserver?.observe(section));
        if (navRef.current) resizeObserver?.observe(navRef.current);
        scheduleUpdate();
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", scheduleUpdate, true);
            window.removeEventListener("resize", scheduleUpdate);
            resizeObserver?.disconnect();
        };
    }, [activeId]);

    const handleScroll = (id: string) => {
        const element = document.getElementById(id);
        if (!element) return;
        const container = getScrollContainer(element);
        const top = container.scrollTop + element.getBoundingClientRect().top - getReadingLine(element, navRef.current, container);
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        container.scrollTo({ top, behavior: reducedMotion ? "instant" : "smooth" });
    };

    const selectedId = visibleId;

    React.useEffect(() => {
        const nav = navRef.current;
        const button = buttonRefs.current[selectedId];
        if (!nav || !button || nav.scrollWidth <= nav.clientWidth) return;

        const targetLeft = button.offsetLeft - (nav.clientWidth - button.clientWidth) / 2;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        nav.scrollTo({ left: Math.max(0, targetLeft), behavior: reducedMotion ? "auto" : "smooth" });
    }, [selectedId]);

    return (
        <nav ref={navRef} aria-label="Resume report sections" className="mx-auto grid w-full grid-cols-2 gap-x-1 py-1 sm:flex sm:items-center sm:overflow-x-auto sm:py-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {REPORT_TOC_ITEMS.map((item) => {
                const active = selectedId === item.id;
                return (
                    <button
                        type="button"
                        ref={(element) => { buttonRefs.current[item.id] = element; }}
                        key={item.id}
                        onClick={() => handleScroll(item.id)}
                        aria-current={active ? "location" : undefined}
                        className={cn(
                            "focus-ring relative min-h-11 w-full rounded-sm px-2 text-xs font-semibold transition-colors sm:min-h-14 sm:w-auto sm:shrink-0 sm:snap-start sm:px-4 sm:text-base",
                            active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {item.label}
                        <span className={cn("absolute inset-x-3 bottom-0 h-0.5 bg-citron transition-opacity duration-150", active ? "opacity-100" : "opacity-0")} />
                    </button>
                );
            })}
        </nav>
    );
}
