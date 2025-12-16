/**
 * Empty Report Icon
 * 
 * A custom empty state illustration for when no reports exist.
 * Not a generic clipboard - this conveys the potential of insights waiting.
 * 
 * Design: Abstract document with subtle "scan lines" suggesting
 * the analysis that's about to happen.
 */

interface IconProps {
    className?: string;
    size?: number;
}

export function EmptyReportIcon({ className = "", size = 48 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Document base */}
            <rect
                x="8"
                y="4"
                width="32"
                height="40"
                rx="4"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                opacity="0.3"
            />

            {/* Folded corner detail */}
            <path
                d="M32 4 L40 12 L32 12 L32 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill="none"
                opacity="0.3"
            />

            {/* Scan lines - dashed, suggesting pending analysis */}
            <path
                d="M14 18 L34 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="4 2"
                opacity="0.2"
            />
            <path
                d="M14 24 L30 24"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="4 2"
                opacity="0.15"
            />
            <path
                d="M14 30 L26 30"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="4 2"
                opacity="0.1"
            />

            {/* Focus circle - the "eye" about to analyze */}
            <circle
                cx="24"
                cy="24"
                r="8"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                opacity="0.4"
            />

            {/* Center dot - awaiting activation */}
            <circle
                cx="24"
                cy="24"
                r="2"
                fill="currentColor"
                opacity="0.3"
            />
        </svg>
    );
}
