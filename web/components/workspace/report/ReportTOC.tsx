"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ReportTOCProps {
    activeId?: string;
}

const REPORT_TOC_ITEMS = [
    { id: "section-first-impression", label: "The read" },
    { id: "section-fixes", label: "Fix these first" },
    { id: "section-keep", label: "Keep these" },
    { id: "section-role", label: "Role direction" },
] as const;

export function ReportTOC({ activeId }: ReportTOCProps) {
    const [visibleId, setVisibleId] = React.useState(REPORT_TOC_ITEMS[0].id as string);
    const navRef = React.useRef<HTMLElement | null>(null);
    const buttonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

    React.useEffect(() => {
        const sections = REPORT_TOC_ITEMS
            .map((item) => document.getElementById(item.id))
            .filter((section): section is HTMLElement => Boolean(section));
        if (!sections.length || typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (visible?.target.id) setVisibleId(visible.target.id);
            },
            { rootMargin: "-22% 0px -66% 0px", threshold: [0.05, 0.2, 0.5] }
        );
        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, []);

    const handleScroll = (id: string) => {
        const element = document.getElementById(id);
        if (!element) return;
        setVisibleId(id);
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        element.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    };

    const selectedId = activeId || visibleId;

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
