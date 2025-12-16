import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = "image/png";

// Image generation - PocketMark Icon with Brand Teal
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
                    borderRadius: "6px",
                }}
            >
                <svg
                    width="20"
                    height="20"
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

                    {/* Abstract P - vertical stem */}
                    <path
                        d="M9 14 L9 17"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />

                    {/* Abstract P - bowl */}
                    <path
                        d="M9 14 C9 14, 12 13, 14 14 C16 15, 15 17, 12 17 L9 17"
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
