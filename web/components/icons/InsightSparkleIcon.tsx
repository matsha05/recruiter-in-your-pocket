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
            {/* Main 4-point star - asymmetric for sophistication */}
            <path
                d="M12 2 L13.5 9 L20 12 L13.5 15 L12 22 L10.5 15 L4 12 L10.5 9 Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill="none"
            />

            {/* Small accent spark - top right */}
            <path
                d="M18 4 L18.5 6 L20 6.5 L18.5 7 L18 9 L17.5 7 L16 6.5 L17.5 6 Z"
                fill="currentColor"
            />

            {/* Small accent spark - bottom left */}
            <circle
                cx="6"
                cy="18"
                r="1"
                fill="currentColor"
            />
        </svg>
    );
}
