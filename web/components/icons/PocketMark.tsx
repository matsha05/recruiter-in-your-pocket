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

            {/* Abstract "P" form using negative space */}
            <path
                d="M9 14 L9 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M9 14 C9 14, 12 13, 14 14 C16 15, 15 17, 12 17 L9 17"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
}
