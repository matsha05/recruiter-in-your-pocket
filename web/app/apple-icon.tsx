import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata - 180x180 for iOS
export const size = {
    width: 180,
    height: 180,
};
export const contentType = "image/png";

// Apple Touch Icon - PocketMark on Brand Teal
export default function Icon() {
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
                    borderRadius: "36px", // iOS rounds corners, but we add subtle rounding
                }}
            >
                <svg
                    width="120"
                    height="120"
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
            ...size,
        }
    );
}
