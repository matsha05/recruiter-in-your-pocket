import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./Pen.module.css";

/**
 * The green pen (Nov 4, 2026): the recruiter's hand. It underlines at reading pace, circles once, points with
 * an arrow and writes in the margin. The marker is the other hand, laid under a line a recruiter would miss.
 * Each mark takes `drawn` from its section (`useSeen`) so that it is made once, on scroll-in; under reduced
 * motion every mark is simply there. The red ink exists for one circle on the site, the decision on the homepage.
 */

export function PenUnderline({ drawn, duration = 5000, delay = 400, className, style }: { drawn: boolean; duration?: number; delay?: number; className?: string; style?: CSSProperties }) {
    return (
        <span className={cn(styles.underline, drawn && styles.drawn, className)} style={{ "--pen-duration": `${duration}ms`, "--pen-delay": `${delay}ms`, ...style } as CSSProperties} aria-hidden="true">
            <span className={styles.underlineInk} />
        </span>
    );
}

export function PenCircle({ children, drawn, ink = "pen", delay = 0, className }: { children: ReactNode; drawn: boolean; ink?: "pen" | "reject"; delay?: number; className?: string }) {
    return (
        <span className={cn(styles.circled, drawn && styles.drawn, ink === "reject" && styles.reject, className)} style={{ "--pen-delay": `${delay}ms` } as CSSProperties}>
            {children}
            <svg className={styles.circle} viewBox="0 0 120 48" preserveAspectRatio="none" aria-hidden="true">
                <path d="M 18 18 C 20 4, 64 -2, 96 6 C 122 12, 124 36, 98 44 C 66 53, 14 52, 6 36 C 1 25, 10 14, 26 12" />
            </svg>
        </span>
    );
}

export function PenArrow({ drawn, delay = 0, className }: { drawn: boolean; delay?: number; className?: string }) {
    return (
        <svg className={cn(styles.arrow, drawn && styles.drawn, className)} style={{ "--pen-delay": `${delay}ms` } as CSSProperties} viewBox="0 0 120 24" aria-hidden="true">
            <path d="M118 14 C 96 16, 68 4, 10 9" />
            <path d="M21 2.5 L9 9 L20 16.5" />
        </svg>
    );
}

export function PenNote({ children, className, as: Tag = "p" }: { children: ReactNode; className?: string; as?: "p" | "span" | "div" }) {
    return <Tag className={cn(styles.note, className)}>{children}</Tag>;
}

/** Two rough passes of the marker under the ink. The parent is positioned; `filterId` must be unique on the page. */
export function MarkerStroke({ drawn, dim = false, filterId }: { drawn: boolean; dim?: boolean; filterId: string }) {
    return (
        <svg className={cn(styles.marker, drawn && styles.drawn, dim && styles.dim)} viewBox="0 0 400 20" preserveAspectRatio="none" aria-hidden="true">
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
    );
}
