import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import styles from "./LiftedTrace.module.css";

export interface LiftedTraceItem {
    label: string;
    detail?: string;
}

interface LiftedTraceProps {
    items: LiftedTraceItem[];
    progress?: number;
    activeIndex?: number;
    ariaLabel: string;
    compact?: boolean;
    className?: string;
}

type TraceStyle = CSSProperties & {
    "--trace-count": number;
    "--trace-segment-progress"?: number;
};

export function LiftedTrace({
    items,
    progress,
    activeIndex = 0,
    ariaLabel,
    compact = false,
    className,
}: LiftedTraceProps) {
    const count = Math.max(items.length, 1);
    const resolvedProgress = Math.min(
        100,
        Math.max(0, progress ?? ((Math.min(activeIndex, count - 1) + 0.5) / count) * 100),
    );
    const segmentSize = 100 / count;

    return (
        <ol
            aria-label={ariaLabel}
            className={cn(styles.trace, compact && styles.compact, className)}
            style={{ "--trace-count": count } as TraceStyle}
        >
            {items.map((item, index) => {
                const segmentStart = index * segmentSize;
                const segmentProgress = Math.min(1, Math.max(0, (resolvedProgress - segmentStart) / segmentSize));
                const state = segmentProgress >= 1 ? "complete" : segmentProgress > 0 ? "active" : "future";

                return (
                    <li
                        key={`${item.label}-${index}`}
                        className={styles.item}
                        data-state={state}
                        aria-current={state === "active" ? "step" : undefined}
                        style={{ "--trace-segment-progress": segmentProgress } as TraceStyle}
                    >
                        <span className={styles.segment} aria-hidden="true" />
                        <div className={styles.meta}>
                            <span className={styles.index} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                            <span className={styles.label}>{item.label}</span>
                        </div>
                        {item.detail ? <p className={styles.detail}>{item.detail}</p> : null}
                    </li>
                );
            })}
        </ol>
    );
}
