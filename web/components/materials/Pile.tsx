"use client";

import type { CSSProperties } from "react";
import { useSeen } from "@/hooks/use-seen";
import { cn } from "@/lib/utils";
import styles from "./Pile.module.css";

/**
 * The pile (Nov 4, 2026): one sheet of paper for each thing counted. The homepage counts 244 applications
 * with eighteen marked green; the close counts them again, pale, with one sheet outlined. The count is always
 * a real number with a source, and the label says it in words for anyone who can't see the sheets.
 */
export function Pile({
    count,
    marked,
    outlined,
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
    return (
        <div
            ref={ref}
            role="img"
            aria-label={label}
            className={cn(styles.field, styles[motion], pale && styles.pale, styles[size], seen && styles.seen, className)}
            style={replyAt ? ({ "--reply-at": replyAt } as CSSProperties) : undefined}
            data-testid={testId}
        >
            {Array.from({ length: count }, (_, index) => (
                <span
                    key={index}
                    className={cn(styles.sheet, markedSet.has(index) && styles.marked, outlined === index && styles.outlined)}
                    style={{ "--i": index } as CSSProperties}
                />
            ))}
        </div>
    );
}
