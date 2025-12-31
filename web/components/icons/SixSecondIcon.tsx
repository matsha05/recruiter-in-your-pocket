/**
 * Six Second Icon
 * 
 * A custom stopwatch/timer glyph representing the first-scan window.
 * Not a generic clock - this conveys urgency and precision.
 * 
 * Design: Minimal stopwatch with emphasized "6" or tick marks suggesting
 * the critical first moments of resume evaluation.
 */

interface IconProps {
    className?: string;
    size?: number;
}

export function SixSecondIcon({ className = "", size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Main dial container */}
            <circle
                cx="12"
                cy="13"
                r="9"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
            />

            {/* Top crown - minimalist */}
            <path
                d="M12 2 L12 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />

            {/* The scan segment - 10% pie slice (0 to 36 degrees) */}
            {/* Center (12,13) -> Top (12,4) -> Arc to approx (17.3, 5.8) */}
            <path
                d="M12 13 L12 4 A 9 9 0 0 1 17.29 5.76 L12 13 Z"
                fill="currentColor"
                opacity="0.2" // Subtle fill for the segment
            />
            {/* Segment border for precision */}
            <path
                d="M12 4 A 9 9 0 0 1 17.29 5.76"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />

            {/* Center dot */}
            <circle
                cx="12"
                cy="13"
                r="1.5"
                fill="currentColor"
            />
        </svg>
    );
}
