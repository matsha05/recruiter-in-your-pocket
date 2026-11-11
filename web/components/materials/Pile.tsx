"use client";

import { useEffect, type CSSProperties } from "react";
import { useSeen } from "@/hooks/use-seen";
import { cn } from "@/lib/utils";
import styles from "./Pile.module.css";

/**
 * The pile (Nov 4, 2026): one sheet of paper for each thing counted. The homepage counts 244 applications
 * with eighteen marked green; the close counts them again, pale, with one sheet outlined. The count is always
 * a real number with a source, and the label says it in words for anyone who can't see the sheets.
 */
/** How far the light reaches from the lit sheet, in sheets. */
const SPOT_REACH = 4.6;

export function Pile({
    count,
    marked,
    outlined,
    spotlit,
    motion = "still",
    pale = false,
    size = "md",
    replyAt,
    label,
    className,
    testId,
}: {
    count: number;
    /** Indices of the sheets the pen marks green. */
    marked?: Iterable<number>;
    /** The index of the one sheet that takes an ink outline when the pile is in view. */
    outlined?: number;
    /**
     * The index of the one sheet a light finds when the pile is in view (the close, Nov 11, 2026): it turns
     * paper white, the sheets near it catch some of the light, and the rest of the pile falls back.
     */
    spotlit?: number;
    /** `arrive`: the sheets come in one by one from first paint (the hero). `still`: simply there. */
    motion?: "arrive" | "still";
    pale?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    /** When the marked sheets turn green, for `arrive`; defaults to after the pile is in. */
    replyAt?: string;
    label: string;
    className?: string;
    testId?: string;
}) {
    const { ref, seen } = useSeen<HTMLDivElement>(0.5);
    const markedSet = new Set(marked ?? []);

    // How much of the light each sheet catches: its distance from the lit sheet, measured on the page, since the
    // pile wraps to whatever width it has. Set once laid out, and again when the pile's width changes.
    useEffect(() => {
        const field = ref.current;
        if (spotlit === undefined || !field) return;
        const measure = () => {
            const sheets = Array.from(field.children) as HTMLElement[];
            const lit = sheets[spotlit];
            if (!lit) return;
            const pitch = lit.offsetWidth + parseFloat(getComputedStyle(field).columnGap || "0");
            if (!pitch) return;
            for (const sheet of sheets) {
                const distance = Math.hypot(sheet.offsetLeft - lit.offsetLeft, sheet.offsetTop - lit.offsetTop) / pitch;
                sheet.style.setProperty("--lit", Math.max(0, 1 - distance / SPOT_REACH).toFixed(3));
            }
        };
        measure();
        if (typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver(measure);
        observer.observe(field);
        return () => observer.disconnect();
    }, [ref, spotlit, count]);
    return (
        <div
            ref={ref}
            role="img"
            aria-label={label}
            className={cn(styles.field, styles[motion], pale && styles.pale, styles[size], spotlit !== undefined && styles.spot, seen && styles.seen, className)}
            style={replyAt ? ({ "--reply-at": replyAt } as CSSProperties) : undefined}
            data-testid={testId}
        >
            {Array.from({ length: count }, (_, index) => (
                <span
                    key={index}
                    className={cn(styles.sheet, markedSet.has(index) && styles.marked, outlined === index && styles.outlined, spotlit === index && styles.spotlit)}
                    style={{ "--i": index } as CSSProperties}
                />
            ))}
        </div>
    );
}
