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
    const isCompact = size <= 20;
    const strokeWidth = isCompact ? 1.9 : 1.5;
    const outlineOpacity = isCompact ? 0.76 : 0.36;
    const primaryOpacity = isCompact ? 0.86 : 0.56;
    const secondaryOpacity = isCompact ? 0.66 : 0.42;
    const quietOpacity = isCompact ? 0.44 : 0.24;
    const whisperOpacity = isCompact ? 0.32 : 0.18;

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
                strokeWidth={strokeWidth}
                opacity={outlineOpacity}
            />
            <path
                d="M29.5 5.5V12H36"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth={strokeWidth}
                opacity={outlineOpacity}
            />
            <path
                d="M18.5 18.5h11"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth={strokeWidth}
                opacity={secondaryOpacity}
            />
            <path
                d="M18.5 24.5h8.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth={strokeWidth}
                opacity={quietOpacity}
            />
            <path
                d="M18.5 30.5h5.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth={strokeWidth}
                opacity={whisperOpacity}
            />
            <path
                d="M27.25 32c1.1-1.9 2.68-3 4.75-3s3.65 1.1 4.75 3c-1.1 1.9-2.68 3-4.75 3s-3.65-1.1-4.75-3Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={strokeWidth}
                opacity={primaryOpacity}
            />
            <circle cx="32" cy="32" r="1.45" fill="currentColor" opacity={isCompact ? 0.9 : 0.62} />
            <path
                d="M37.25 21.75 38.4 24l2.35 1.15-2.35 1.15-1.15 2.35-1.15-2.35-2.35-1.15L36.1 24l1.15-2.25Z"
                fill="currentColor"
                opacity={secondaryOpacity}
            />
        </svg>
    );
}
