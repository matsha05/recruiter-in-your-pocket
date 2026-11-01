/**
 * RIYP wordmark: direction C, "Two Voices" (Matt, Nov 1, 2026). The name is set in Schibsted Grotesk
 * ExtraBold, and "in" is Literata Italic in the green pen, the recruiter's voice. The letters are outlines
 * (components/icons/wordmark-paths.ts), so the mark never waits on a web font. Ink follows the text color;
 * the pen follows the --pen token, so dark mode and inverted bands carry it automatically.
 */

import { WORDMARK } from "./wordmark-paths";
import styles from "./Wordmark.module.css";

interface WordmarkProps {
    className?: string;
    /** The signed-in app header: the one-line name a step smaller. */
    compact?: boolean;
    /** Headers stack the name on two lines below 640px; the footer and menus keep one line. */
    stackOnPhones?: boolean;
}

function Lockup({ shape, className }: { shape: keyof typeof WORDMARK; className: string }) {
    const { viewBox, lines } = WORDMARK[shape];
    const [, , width, height] = viewBox.split(" ").map(Number);
    return (
        <svg className={className} viewBox={viewBox} width={width} height={height} role="img" aria-label="Recruiter in Your Pocket">
            {lines.map((line, index) => (
                <g key={index} transform={`translate(${line.x} ${line.y})`}>
                    {line.paths.map((path, pathIndex) => (
                        <path key={pathIndex} d={path.d} fill="currentColor" className={path.voice === "pen" ? styles.pen : undefined} />
                    ))}
                </g>
            ))}
        </svg>
    );
}

export function Wordmark({ className = "", compact = false, stackOnPhones = false }: WordmarkProps) {
    return (
        <span
            className={`${styles.wordmark} ${compact ? styles.compact : ""} ${stackOnPhones ? styles.stackOnPhones : ""} ${className}`}
            data-wordmark=""
        >
            <Lockup shape="line" className={styles.line} />
            {stackOnPhones ? <Lockup shape="stacked" className={styles.stacked} /> : null}
        </span>
    );
}
