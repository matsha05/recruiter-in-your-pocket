/**
 * Signal Radar Icon
 * 
 * A premium radar/gauge icon for the "Signal Analysis" section.
 * Evokes data visualization, precision metrics, and analytical depth.
 * 
 * Design: Geometric radar sweep with concentric arcs and a focal point.
 * 1.5px stroke, clean circles. Inspired by Linear's dashboard iconography.
 */

interface IconProps {
    className?: string;
    size?: number;
}

export function SignalRadarIcon({ className = "", size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Outer ring — Full circle container */}
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
            />

            {/* Middle ring — Second data ring */}
            <circle
                cx="12"
                cy="12"
                r="6"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                opacity="0.6"
            />

            {/* Inner ring — Core data ring */}
            <circle
                cx="12"
                cy="12"
                r="2"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                opacity="0.3"
            />

            {/* Radar sweep line — Points to top-right (high signal) */}
            <path
                d="M12 12 L18 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />

            {/* Signal blip — The detected signal point */}
            <circle
                cx="16"
                cy="8"
                r="1.5"
                fill="currentColor"
            />
        </svg>
    );
}
