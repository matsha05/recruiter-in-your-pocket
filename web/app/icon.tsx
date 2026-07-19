import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

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

// Generate the Lifted Line mark for all sizes.
export default async function Icon({ id }: { id: Promise<string> }) {
    const sizes: Record<string, { size: number; iconSize: number; radius: number }> = {
        small: { size: 32, iconSize: 20, radius: 6 },
        medium: { size: 192, iconSize: 128, radius: 24 },
        large: { size: 512, iconSize: 340, radius: 64 },
    };

    const resolvedId = await id;
    const { size, iconSize, radius } = sizes[resolvedId] || sizes.small;
    const newsreader = await readFile(join(process.cwd(), "public", "assets", "fonts", "newsreader-display-medium.ttf"));

    return new ImageResponse(
        (
            <div
                style={{
                    background: "#4F46E5",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: `${radius}px`,
                }}
            >
                <div
                    style={{
                        width: iconSize,
                        height: iconSize,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FBFAF7",
                        fontFamily: "Newsreader",
                    }}
                >
                    <span style={{ display: "flex", fontSize: iconSize * 0.68, lineHeight: 0.74 }}>R</span>
                    <span style={{ display: "flex", width: iconSize * 0.56, height: Math.max(2, iconSize * 0.055), marginTop: iconSize * 0.08, background: "#F6CF46" }} />
                </div>
            </div>
        ),
        {
            width: size,
            height: size,
            fonts: [{ name: "Newsreader", data: newsreader, style: "normal", weight: 500 }],
        }
    );
}
