/**
 * Transform Arrow Icon
 * 
 * A custom before/after transformation mark for the rewrite concept.
 * Not a generic arrow - this conveys positive transformation and upgrade.
 * 
 * Design: Curved arrow with gradient stroke, suggesting improvement flow.
 */

interface IconProps {
    className?: string;
    size?: number;
}

export function TransformArrowIcon({ className = "", size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Main transformation arc - sweeps upward */}
            <path
                d="M4 16 C4 10, 10 6, 16 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />

            {/* Arrow head - points to improved state */}
            <path
                d="M13 3 L16 6 L13 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />

            {/* "Before" dot - smaller, muted position */}
            <circle
                cx="4"
                cy="16"
                r="2"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
            />

            {/* "After" dot - filled, elevated position */}
            <circle
                cx="19"
                cy="6"
                r="2"
                fill="currentColor"
            />
        </svg>
    );
}
