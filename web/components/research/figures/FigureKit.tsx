"use client";

// The figure kit draws research figures in the product's own hand: paper sheets, a recruiter's green-pen
// notes, and one yellow highlighter on the thing that matters. Data marks stay quiet; the note and the
// highlight carry the point. See docs/design-system.md, "Figures".
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/** True once the element has scrolled into view (always true when motion is reduced). */
export function useSeen<T extends Element>(threshold = 0.35) {
    const ref = useRef<T>(null);
    const reduced = useReducedMotion();
    const [seen, setSeen] = useState(false);
    useEffect(() => {
        if (reduced) {
            setSeen(true);
            return;
        }
        const node = ref.current;
        if (!node || typeof IntersectionObserver === "undefined") {
            setSeen(true);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setSeen(true);
                observer.disconnect();
            }
        }, { threshold });
        observer.observe(node);
        return () => observer.disconnect();
    }, [reduced, threshold]);
    return { ref, seen };
}

/** The highlighter. Sweeps in once, the way the recruiter marks the Critical Miss. */
export function Mark({ children, seen = true, className }: { children: ReactNode; seen?: boolean; className?: string }) {
    return (
        <span
            className={cn(
                "bg-no-repeat px-0.5 [box-decoration-break:clone] [background-image:linear-gradient(hsl(var(--highlight)),hsl(var(--highlight)))] [background-position:0_88%] transition-[background-size] duration-slow ease-snap motion-reduce:transition-none",
                seen ? "[background-size:100%_46%]" : "[background-size:0%_46%]",
                className,
            )}
        >
            {children}
        </span>
    );
}

/** A recruiter's margin note: Literata italic in pen, with an optional leader rule. */
export function PenNote({ children, className, leader = "left" }: { children: ReactNode; className?: string; leader?: "left" | "top" | "none" }) {
    return (
        <p
            className={cn(
                "max-w-[30ch] font-serif text-[1.03rem] italic leading-[1.42] text-[hsl(var(--pen))]",
                leader === "left" && "border-l border-[hsl(var(--pen))] pl-3",
                leader === "top" && "border-t border-[hsl(var(--pen))] pt-2",
                className,
            )}
        >
            {children}
        </p>
    );
}

/** A resume sheet at thumbnail size: a page with a name bar and three lines. */
function SheetGlyph({ tone }: { tone: "pen" | "quiet" | "mark" }) {
    const page = tone === "pen" ? "border-[hsl(var(--pen))] bg-[hsl(var(--pen))]" : tone === "mark" ? "border-[hsl(var(--miss-line))] bg-[hsl(var(--highlight))]" : "border-[hsl(var(--text-strong)/0.14)] bg-card";
    const ink = tone === "pen" ? "bg-[hsl(var(--background)/0.75)]" : "bg-[hsl(var(--text-strong)/0.16)]";
    return (
        <span className={cn("flex aspect-[3/4] w-full flex-col gap-[12%] rounded-[2px] border px-[16%] pt-[18%]", page)} aria-hidden="true">
            <span className={cn("h-[8%] w-[60%] rounded-full", ink)} />
            <span className={cn("h-[5%] w-full rounded-full opacity-70", ink)} />
            <span className={cn("h-[5%] w-[85%] rounded-full opacity-70", ink)} />
        </span>
    );
}

export type UnitTone = "pen" | "quiet" | "mark" | "faint";

/**
 * A grid of units (resume sheets or dots), one per item. `toneAt(i)` colors each unit.
 * Units reveal in reading order once seen, so the count is felt, not just read.
 */
export function UnitGrid({
    count,
    columns,
    toneAt,
    shape = "dot",
    seen = true,
    className,
}: {
    count: number;
    columns: number;
    toneAt: (index: number) => UnitTone;
    shape?: "dot" | "sheet";
    seen?: boolean;
    className?: string;
}) {
    const dot: Record<UnitTone, string> = {
        pen: "bg-[hsl(var(--pen))]",
        mark: "bg-[hsl(var(--highlight))] ring-1 ring-inset ring-[hsl(var(--brass)/0.55)]",
        quiet: "bg-[hsl(var(--text-strong)/0.2)]",
        faint: "bg-[hsl(var(--text-strong)/0.08)]",
    };
    return (
        <div
            className={cn("grid", shape === "sheet" ? "gap-[3px] sm:gap-1" : "gap-[3px]", className)}
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            aria-hidden="true"
        >
            {Array.from({ length: count }, (_, index) => {
                const tone = toneAt(index);
                return (
                    <span
                        key={index}
                        className="transition-opacity duration-slow ease-snap motion-reduce:transition-none"
                        style={{ opacity: seen ? 1 : 0.15, transitionDelay: seen ? `${Math.min(index, 120) * 4}ms` : "0ms" }}
                    >
                        {shape === "sheet" ? (
                            <SheetGlyph tone={tone === "pen" ? "pen" : tone === "mark" ? "mark" : "quiet"} />
                        ) : (
                            <span className={cn("block aspect-square w-full rounded-full", dot[tone])} />
                        )}
                    </span>
                );
            })}
        </div>
    );
}

/** A big number with a small unit, in the display face. */
export function Figure({ value, unit, className }: { value: ReactNode; unit?: ReactNode; className?: string }) {
    return (
        <span className={cn("font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl", className)}>
            {value}
            {unit ? <span className="ml-1 text-sm font-semibold tracking-normal text-muted-foreground">{unit}</span> : null}
        </span>
    );
}

/** Legend key that matches a UnitGrid tone. */
export function Key({ tone, children, shape = "dot" }: { tone: UnitTone; children: ReactNode; shape?: "dot" | "sheet" }) {
    const swatch: Record<UnitTone, string> = {
        pen: "bg-[hsl(var(--pen))]",
        mark: "bg-[hsl(var(--highlight))] ring-1 ring-inset ring-[hsl(var(--brass)/0.55)]",
        quiet: "bg-[hsl(var(--text-strong)/0.2)]",
        faint: "bg-[hsl(var(--text-strong)/0.08)]",
    };
    return (
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className={cn("shrink-0", shape === "sheet" ? "h-3.5 w-2.5 rounded-[2px] border border-[hsl(var(--text-strong)/0.14)]" : "h-3 w-3 rounded-full", swatch[tone])} aria-hidden="true" />
            {children}
        </span>
    );
}
