/**
 * Six Second Icon
 * 
 * A custom stopwatch/timer glyph representing the "6 seconds" scanning concept.
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
            {/* Main dial - slightly elongated for sophistication */}
            <circle
                cx="12"
                cy="13"
                r="9"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
            />

            {/* Top button/crown */}
            <path
                d="M12 2 L12 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />

            {/* Side button */}
            <path
                d="M18.5 5.5 L20 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />

            {/* Hour hand pointing to ~1 o'clock (6 seconds) */}
            <path
                d="M12 13 L12 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />

            {/* Second hand - swept to the 6 second position */}
            <path
                d="M12 13 L16 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />

            {/* Center dot */}
            <circle
                cx="12"
                cy="13"
                r="1"
                fill="currentColor"
            />

            {/* Tick marks - only at key positions for minimalism */}
            <path d="M12 5 L12 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <path d="M19 13 L18 13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <path d="M6 13 L5 13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <path d="M12 20 L12 21" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
    );
}
