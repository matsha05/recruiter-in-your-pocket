/**
 * Pocket Mark
 * 
 * A custom brand mark/ligature for "Pocket" that can be used
 * as a favicon-size glyph or wordmark accent.
 * 
 * Design: Abstract "P" that suggests a pocket/fold, with the
 * negative space creating implied depth.
 */

interface IconProps {
    className?: string;
    size?: number;
}

export function PocketMark({ className = "", size = 24 }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Outer container - rounded rectangle suggesting "pocket" */}
            <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="4"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
            />

            {/* Inner fold line - the "pocket" detail */}
            <path
                d="M4 10 L20 10"
                stroke="currentColor"
                strokeWidth="1.5"
            />

            {/* Abstract "P" form - Geometric Refinement */}
            {/* Stem */}
            <path
                d="M9 13.5 L9 17"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            {/* Bowl - Perfect Arc */}
            <path
                d="M9 13.5 H12 C13.6569 13.5 15 14.8431 15 16.5 C15 16.7761 14.7761 17 14.5 17 H9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
}
