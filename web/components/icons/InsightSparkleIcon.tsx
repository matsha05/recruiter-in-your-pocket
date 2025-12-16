/**
 * Insight Sparkle Icon
 * 
 * A custom "sparkle" mark representing AI insights, tips, and premium features.
 * Replaces the generic Lucide Sparkles icon.
 * 
 * Design: A refined, asymmetric 3-point star with subtle rays,
 * conveying precision and clarity rather than generic "magic."
 */

interface IconProps {
    className?: string;
    size?: number;
}

export function InsightSparkleIcon({ className = "", size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Main North Star - Concave curves for sharpness */}
            <path
                d="M12 2 L14 9 L21 12 L14 15 L12 22 L10 15 L3 12 L10 9 L12 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill="none"
            />

            {/* Single Satellite Spark - Top Right hierarchy */}
            <path
                d="M18 4 L19 6 L21 7 L19 8 L18 10 L17 8 L15 7 L17 6 Z"
                fill="currentColor" // Solid fill for contrast
            />

            {/* Removed bottom left circle for cleaner "single insight" metaphor */}
        </svg>
    );
}
