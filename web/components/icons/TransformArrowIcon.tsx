/**
 * Transform Arrow Icon — "The Quill"
 * 
 * A premium quill/feather icon for "The Red Pen" section.
 * Evokes classic editorial authority, refinement, and craft.
 * 
 * Design: Elegant geometric quill with curved shaft and simplified barbs.
 * 1.5px stroke, smooth curves. Inspired by Linear/Figma iconography.
 */

interface IconProps {
    className?: string;
    size?: number;
}

export function TransformArrowIcon({ className = "", size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Quill shaft — Elegant curve from top-left to bottom-right */}
            <path
                d="M20 4 C16 8 8 16 4 20"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />

            {/* Feather barbs — Left side, 3 strokes radiating outward */}
            <path
                d="M16 5 C14 6 12 5 10 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M13 8 C11 8 9 6 7 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M10 11 C8 10 6 8 4 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />

            {/* Nib tip — Sharp point where ink meets paper */}
            <circle
                cx="4"
                cy="20"
                r="1.5"
                fill="currentColor"
            />
        </svg>
    );
}
