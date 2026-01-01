/**
 * Role Target Icon
 *
 * A precise target mark for role fit and positioning moments.
 * Designed to replace generic target icons in signature sections.
 */

interface IconProps {
    className?: string;
    size?: number;
}

export function RoleTargetIcon({ className = "", size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 3V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 18V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3 12H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M18 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}
