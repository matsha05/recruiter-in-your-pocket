/**
 * RIYP wordmark.
 *
 * The wordmark uses Space Grotesk, the Lifted Line display voice, while remaining
 * quiet enough to coexist with dense product navigation.
 */

interface WordmarkProps {
    className?: string;
}

export function Wordmark({ className = "" }: WordmarkProps) {
    return (
        <span
            className={`inline-flex h-auto items-center whitespace-nowrap font-display text-[1.125rem] font-medium leading-none tracking-[-0.035em] ${className}`}
            aria-label="Recruiter in Your Pocket"
        >
            Recruiter in Your Pocket
        </span>
    );
}
