"use client";

import { useId, type ReactNode } from "react";
import { useSeen } from "@/hooks/use-seen";
import { cn } from "@/lib/utils";
import { Paper } from "./Paper";
import { MarkerStroke, PenArrow, PenNote } from "./Pen";
import styles from "./Clipping.module.css";

/**
 * A clipping (Nov 4, 2026): one line cut out of a resume, on its own strip of paper, with the lines around it
 * fading off the edge. The marker takes the line and the recruiter's note sits in the margin beside it with the
 * pen's arrow. The two marks are made when the clipping comes into view; under reduced motion they are simply
 * there. The line is always a real line from a real (or labelled fictional) resume.
 */
export function Clipping({
    line,
    note,
    above,
    below,
    caption,
    dim = false,
    className,
}: {
    line: string;
    note?: ReactNode;
    above?: string;
    below?: string;
    caption?: string;
    dim?: boolean;
    className?: string;
}) {
    const { ref, seen } = useSeen<HTMLElement>(0.6);
    const filterId = `marker-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

    return (
        <figure ref={ref} className={cn(styles.figure, seen && styles.marked, dim && styles.dim, className)} aria-label={caption ?? `A line from the resume: ${line}`} data-marked={seen || undefined}>
            {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
            <Paper kind="strip" className={styles.strip} aria-hidden="true">
                {above && <p className={cn(styles.ghost, styles.ghostTop)}>{above}</p>}
                <p className={styles.row}>
                    <span className={styles.line}>
                        <MarkerStroke drawn={seen} dim={dim} filterId={filterId} />
                        {line}
                    </span>
                </p>
                {below && <p className={cn(styles.ghost, styles.ghostBottom)}>{below}</p>}
            </Paper>
            {note && (
                <div className={styles.note}>
                    <PenArrow drawn={seen} delay={980} className={styles.arrow} />
                    <PenNote>{note}</PenNote>
                </div>
            )}
            <p className="sr-only">The line: {line}</p>
        </figure>
    );
}
