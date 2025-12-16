/**
 * Hidden Gem Icon
 * 
 * A premium "unearthed treasure" icon for the "Missing Wins" section.
 * Evokes discovery, hidden value, and revealing potential.
 * 
 * Design: Geometric diamond/gem shape with subtle sparkle accent.
 * 1.5px stroke, sharp facets. Inspired by Figma's asset iconography.
 */

interface IconProps {
    className?: string;
    size?: number;
}

export function HiddenGemIcon({ className = "", size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Diamond outline — Classic gem shape */}
            {/* Top facet */}
            <path
                d="M12 3 L20 9 L12 21 L4 9 Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill="none"
            />

            {/* Top edge — Crown of the gem */}
            <path
                d="M4 9 L20 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />

            {/* Center facet lines — Internal reflections */}
            <path
                d="M8 9 L12 21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.5"
            />
            <path
                d="M16 9 L12 21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.5"
            />

            {/* Sparkle accent — Top right, implies value */}
            <path
                d="M18 4 L19 5 L20 4 L19 3 Z"
                fill="currentColor"
            />
        </svg>
    );
}
