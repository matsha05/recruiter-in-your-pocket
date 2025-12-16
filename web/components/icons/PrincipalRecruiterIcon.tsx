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
            {/* Head silhouette - rounded square, not circle (more sophisticated) */}
            <rect
                x="4"
                y="3"
                width="16"
                height="18"
                rx="4"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
            />

            {/* Left eye - evaluative, asymmetric */}
            <circle
                cx="9"
                cy="10"
                r="1.5"
                fill="currentColor"
            />

            {/* Right eye - slightly different, suggests depth */}
            <circle
                cx="15"
                cy="10"
                r="1.5"
                fill="currentColor"
            />

            {/* Subtle brow line - conveys scrutiny */}
            <path
                d="M7 7.5 L11 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M13 7 L17 7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />

            {/* Neutral expression line - serious, professional */}
            <path
                d="M9 15.5 L15 15.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}
