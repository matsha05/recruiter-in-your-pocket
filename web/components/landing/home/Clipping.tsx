"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./Clipping.module.css";

/**
 * A clipping: one line cut out of a resume, on its own strip of paper, with the lines around it fading off
 * the edge. The marker takes the line and the recruiter's note sits in the margin beside it. The two marks
 * are made when the clipping comes into view; under reduced motion they are simply there.
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
    const ref = useRef<HTMLElement>(null);
    const [marked, setMarked] = useState(false);
    const filterId = `marker-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setMarked(true); return; }
        const node = ref.current;
        if (!node) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry?.isIntersecting) { setMarked(true); observer.disconnect(); }
        }, { threshold: 0.6 });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <figure ref={ref} className={cn(styles.figure, marked && styles.marked, dim && styles.dim, className)} data-marked={marked || undefined}>
            {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
            <div className={styles.strip} aria-hidden="true">
                {above && <p className={cn(styles.ghost, styles.ghostTop)}>{above}</p>}
                <p className={styles.row}>
                    <span className={styles.line}>
                        <svg className={styles.stroke} viewBox="0 0 400 20" preserveAspectRatio="none" aria-hidden="true">
                            <defs>
                                <filter id={filterId} x="-5%" y="-40%" width="110%" height="180%">
                                    <feTurbulence type="fractalNoise" baseFrequency="0.035 0.9" numOctaves="1" seed="7" result="n" />
                                    <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
                                </filter>
                            </defs>
                            <g filter={`url(#${filterId})`}>
                                <path className={styles.pass} d="M-2 11 C 70 8, 150 13, 230 10 S 350 8, 403 11" />
                                <path className={styles.passTwo} d="M2 9 C 90 12, 180 7, 260 11 S 360 12, 398 9" />
                            </g>
                        </svg>
                        {line}
                    </span>
                </p>
                {below && <p className={cn(styles.ghost, styles.ghostBottom)}>{below}</p>}
            </div>
            {note && (
                <div className={styles.note}>
                    <svg className={styles.arrow} viewBox="0 0 120 24" aria-hidden="true">
                        <path d="M118 14 C 96 16, 68 4, 10 9" />
                        <path d="M21 2.5 L9 9 L20 16.5" />
                    </svg>
                    <p>{note}</p>
                </div>
            )}
            <p className="sr-only">The line: {line}</p>
        </figure>
    );
}
