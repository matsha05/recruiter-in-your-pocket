/**
 * Principal Recruiter Icon
 * 
 * A sophisticated avatar mark representing the "Principal Recruiter" persona.
 * Not a generic user icon - this conveys expertise and authority.
 * 
 * Design: Abstract head silhouette with a subtle "eye" detail,
 * suggesting the evaluative gaze of a senior recruiter.
 */

interface IconProps {
    className?: string;
    size?: number;
}

export function PrincipalRecruiterIcon({ className = "", size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Head/Shoulders Silhouette - Abstract & Professional */}
            {/* Shoulders */}
            <path
                d="M4 21 C4 17.134 7.13401 14 11 14 H13 C16.866 14 20 17.134 20 21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            {/* Head - Circle for geometric purity */}
            <circle
                cx="12"
                cy="8"
                r="5"
                stroke="currentColor"
                strokeWidth="1.5"
            />

            {/* Focus/Authority Indicator - Abstract "Eye" or "Lens" */}
            {/* Instead of a face, imply a "verified" or "expert" badge detail */}
            <circle
                cx="15.5"
                cy="11.5"
                r="3"
                fill="currentColor"
                stroke="white" // Knockout effect (assuming white bg, or transparent)
                strokeWidth="2"
            />
            {/* Checkmark inside the badge - implies "Decision Maker" */}
            <path
                d="M14.5 11.5 L15.2 12.2 L17 10.4"
                stroke="white" // This would need to be background color ideally, but stroke works for knockout
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-background" // Attempt to use CSS class for knockout color if possible, fallback to white/bg
                style={{ stroke: 'var(--background)' }}
            />
        </svg>
    );
}
