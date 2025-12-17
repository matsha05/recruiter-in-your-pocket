import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "nodejs";

// Image sizes for all required icons
export function generateImageMetadata() {
    return [
        {
            contentType: "image/png",
            size: { width: 32, height: 32 },
            id: "small",
        },
        {
            contentType: "image/png",
            size: { width: 192, height: 192 },
            id: "medium",
        },
        {
            contentType: "image/png",
            size: { width: 512, height: 512 },
            id: "large",
        },
    ];
}

// Generate icons for all sizes
export default function Icon({ id }: { id: string }) {
    const sizes: Record<string, { size: number; iconSize: number; radius: number }> = {
        small: { size: 32, iconSize: 20, radius: 6 },
        medium: { size: 192, iconSize: 128, radius: 24 },
        large: { size: 512, iconSize: 340, radius: 64 },
    };

    const { size, iconSize, radius } = sizes[id] || sizes.small;

    return new ImageResponse(
        (
            <div
                style={{
                    background: "#0D9488", // Brand teal
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: `${radius}px`,
                }}
            >
                <svg
                    width={iconSize}
                    height={iconSize}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* PocketMark - Outer container */}
                    <rect
                        x="4"
                        y="4"
                        width="16"
                        height="16"
                        rx="4"
                        stroke="white"
                        strokeWidth="1.5"
                        fill="none"
                    />

                    {/* Pocket fold line */}
                    <path
                        d="M4 10 L20 10"
                        stroke="white"
                        strokeWidth="1.5"
                    />

                    {/* Abstract P - Stem */}
                    <path
                        d="M9 13.5 L9 17"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    {/* Abstract P - Bowl */}
                    <path
                        d="M9 13.5 H12 C13.6569 13.5 15 14.8431 15 16.5 C15 16.7761 14.7761 17 14.5 17 H9"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        fill="none"
                    />
                </svg>
            </div>
        ),
        {
            width: size,
            height: size,
        }
    );
}
