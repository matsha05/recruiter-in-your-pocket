/**
 * Pocket Mark
 * 
 * Shield-pocket monogram used at compact sizes.
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
            viewBox="0 0 32 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M3 3H29V24.5L16 33L3 24.5V3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="miter"
                fill="none"
            />
            <text
                x="16"
                y="23"
                fill="currentColor"
                fontFamily="Space Grotesk Variable, sans-serif"
                fontSize="17"
                fontWeight="650"
                textAnchor="middle"
            >R</text>
        </svg>
    );
}
