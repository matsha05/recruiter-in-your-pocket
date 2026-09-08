/**
 * RIYP wordmark.
 *
 * The reference's stacked mark follows the shared brand sans across the site.
 */

import styles from "./Wordmark.module.css";

interface WordmarkProps {
    className?: string;
    compact?: boolean;
}

export function Wordmark({ className = "", compact = false }: WordmarkProps) {
    return (
        <span
            className={`${styles.wordmark} ${compact ? styles.compact : ""} ${className}`}
            aria-label="Recruiter in Your Pocket"
        >
            Recruiter<br />in your<br />pocket
        </span>
    );
}
