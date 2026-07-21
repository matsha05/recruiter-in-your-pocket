import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Route segment config
export const runtime = "nodejs";

// Image metadata - 180x180 for iOS
export const size = {
    width: 180,
    height: 180,
};
export const contentType = "image/png";

// Apple Touch Icon - Lifted Line mark on ink.
export default async function Icon() {
    const spaceGrotesk = await readFile(join(process.cwd(), "public", "assets", "fonts", "space-grotesk-bold.ttf"));
    return new ImageResponse(
        (
            <div
                style={{
                    background: "#071722",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "36px", // iOS rounds corners, but we add subtle rounding
                }}
            >
                <div
                    style={{
                        width: 120,
                        height: 120,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#F7F5EF",
                        fontFamily: "Space Grotesk",
                    }}
                >
                    <span style={{ display: "flex", fontSize: 82, lineHeight: 0.74 }}>R</span>
                    <span style={{ display: "flex", width: 68, height: 7, marginTop: 10, background: "#C8F238" }} />
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [{ name: "Space Grotesk", data: spaceGrotesk, style: "normal", weight: 700 }],
        }
    );
}
