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

// Apple Touch Icon - Lifted Line mark on iris.
export default async function Icon() {
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
                        color: "#FBFAF7",
                        fontFamily: "Newsreader",
                    }}
                >
                    <span style={{ display: "flex", fontSize: 82, lineHeight: 0.74 }}>R</span>
                    <span style={{ display: "flex", width: 68, height: 7, marginTop: 10, background: "#F6CF46" }} />
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [{ name: "Newsreader", data: newsreader, style: "normal", weight: 500 }],
        }
    );
}
