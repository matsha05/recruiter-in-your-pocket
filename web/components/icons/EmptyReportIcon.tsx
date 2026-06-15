/**
 * Empty Report Icon
 *
 * A signature empty-state mark for report surfaces. It keeps the product
 * language specific: a resume report is waiting to be scanned, not just a
 * blank file.
 */

interface IconProps {
    className?: string;
    size?: number;
}

export function EmptyReportIcon({ className = "", size = 48 }: IconProps) {
    return (
        <svg
            aria-hidden="true"
            className={className}
            fill="none"
            focusable="false"
            height={size}
            viewBox="0 0 48 48"
            width={size}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M13 5.5h16.5L36 12v29.5H13V5.5Z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.5"
                opacity="0.36"
            />
            <path
                d="M29.5 5.5V12H36"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.5"
                opacity="0.36"
            />
            <path
                d="M18.5 18.5h11"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
                opacity="0.42"
            />
            <path
                d="M18.5 24.5h8.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
                opacity="0.24"
            />
            <path
                d="M18.5 30.5h5.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
                opacity="0.18"
            />
            <path
                d="M27.25 32c1.1-1.9 2.68-3 4.75-3s3.65 1.1 4.75 3c-1.1 1.9-2.68 3-4.75 3s-3.65-1.1-4.75-3Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                opacity="0.56"
            />
            <circle cx="32" cy="32" r="1.45" fill="currentColor" opacity="0.62" />
            <path
                d="M37.25 21.75 38.4 24l2.35 1.15-2.35 1.15-1.15 2.35-1.15-2.35-2.35-1.15L36.1 24l1.15-2.25Z"
                fill="currentColor"
                opacity="0.42"
            />
        </svg>
    );
}
