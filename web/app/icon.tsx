import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: "#09090b", // zinc-950 (Studio Black)
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    borderRadius: "6px", // Slight rounding, like an iOS icon or Linear logo
                    fontFamily: "Times New Roman, serif", // Fallback to system serif which looks close enough to Newsreader for a 32px icon
                    fontStyle: "italic",
                }}
            >
                R
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
