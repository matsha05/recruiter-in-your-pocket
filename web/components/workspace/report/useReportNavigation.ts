"use client";

import * as React from "react";

type ReportSection = { id: string };

function getScrollContainer(element: HTMLElement) {
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        if (/(auto|scroll|overlay)/.test(getComputedStyle(parent).overflowY) && parent.scrollHeight > parent.clientHeight) {
            return parent;
        }
    }
    return (document.scrollingElement || document.documentElement) as HTMLElement;
}

/**
 * Where the section tabs end once they are stuck. Before the page scrolls, sticky tabs sit lower in the
 * flow, so measuring them then would aim every jump short of where the tabs end up.
 */
function getNavigationBottom(nav: HTMLElement | null, containerTop: number) {
    const aside = nav?.closest("aside");
    if (!aside) return containerTop;
    const style = getComputedStyle(aside);
    if (style.position === "sticky" || style.position === "fixed") {
        const stuckTop = (style.position === "fixed" ? 0 : containerTop) + (Number.parseFloat(style.top) || 0);
        return stuckTop + aside.getBoundingClientRect().height;
    }
    return aside.getBoundingClientRect().bottom;
}

function getReadingLine(section: HTMLElement, nav: HTMLElement | null, container: HTMLElement) {
    const containerTop = container === document.scrollingElement ? 0 : container.getBoundingClientRect().top;
    const navigationBottom = getNavigationBottom(nav, containerTop);
    const sectionMargin = Number.parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
    return Math.max(navigationBottom, containerTop + sectionMargin);
}

/**
 * `instant` is for landing on a section when the page opens. A smooth scroll that starts while the page is
 * still settling can be cancelled: Framer Motion puts the window back where it measured it whenever an
 * animation measures layout, such as the pass notice's height.
 */
export function scrollToReportSection(id: string, nav: HTMLElement | null, options: { instant?: boolean } = {}) {
    const element = document.getElementById(id);
    if (!element) return false;
    const container = getScrollContainer(element);
    const top = container.scrollTop + element.getBoundingClientRect().top - getReadingLine(element, nav, container);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    container.scrollTo({ top, behavior: options.instant || reducedMotion ? "instant" : "smooth" });
    return true;
}

/** Keep the selected report section aligned with the actual reading position. */
export function useReportNavigation(items: readonly ReportSection[], refreshKey?: string) {
    const [selectedId, setSelectedId] = React.useState(items[0]?.id || "");
    const navRef = React.useRef<HTMLElement | null>(null);
    const buttonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
    // The section the reader last jumped to. At the end of the page the last sections can't scroll up to
    // the reading line, so the jump target (or the last section in view) is current there.
    const jumpTarget = React.useRef<string | null>(null);

    React.useEffect(() => {
        const sections = items
            .map((item) => document.getElementById(item.id))
            .filter((section): section is HTMLElement => Boolean(section));
        if (!sections.length) return;

        let frame = 0;
        const updateCurrentSection = () => {
            frame = 0;
            const container = getScrollContainer(sections[0]);
            let current = sections[0];
            for (const section of sections) {
                // Track section starts, including sections taller than the viewport.
                if (section.getBoundingClientRect().top <= getReadingLine(section, navRef.current, container) + 1) {
                    current = section;
                }
            }
            const viewportBottom = container === document.scrollingElement ? window.innerHeight : container.getBoundingClientRect().bottom;
            const atEnd = container.scrollTop + container.clientHeight >= container.scrollHeight - 2 && container.scrollTop > 0;
            if (atEnd) {
                const inView = sections.filter((section) => section.getBoundingClientRect().top < viewportBottom - 24);
                const target = inView.find((section) => section.id === jumpTarget.current);
                current = target || inView.at(-1) || current;
            } else {
                jumpTarget.current = null;
            }
            setSelectedId(current.id);
        };
        const scheduleUpdate = () => {
            if (!frame) frame = requestAnimationFrame(updateCurrentSection);
        };
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
    }, [items, refreshKey]);

    React.useEffect(() => {
        const nav = navRef.current;
        const button = buttonRefs.current[selectedId];
        if (!nav || !button || nav.scrollWidth <= nav.clientWidth) return;

        // offsetLeft depends on the offset parent; rects also work for nested strips.
        const targetLeft = nav.scrollLeft + button.getBoundingClientRect().left - nav.getBoundingClientRect().left
            - (nav.clientWidth - button.clientWidth) / 2;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        nav.scrollTo({ left: Math.max(0, targetLeft), behavior: reducedMotion ? "instant" : "smooth" });
    }, [selectedId]);

    const handleScroll = (id: string) => {
        jumpTarget.current = id;
        scrollToReportSection(id, navRef.current);
    };

    return { selectedId, navRef, buttonRefs, handleScroll };
}
