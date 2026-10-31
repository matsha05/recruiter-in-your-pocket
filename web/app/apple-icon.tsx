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

// Apple Touch Icon: the R with a highlighter stroke, on ink.
export default async function Icon() {
    const schibsted = await readFile(join(process.cwd(), "public", "fonts", "schibsted-grotesk", "SchibstedGrotesk-ExtraBold.woff"));
    return new ImageResponse(
        (
            <div
                style={{
                    background: "#111513",
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
                        color: "#f4f4f1",
                        fontFamily: "Schibsted Grotesk",
                    }}
                >
                    <span style={{ display: "flex", fontSize: 82, lineHeight: 0.74 }}>R</span>
                    <span style={{ display: "flex", width: 68, height: 7, marginTop: 10, background: "#ffe14d" }} />
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [{ name: "Schibsted Grotesk", data: schibsted, style: "normal", weight: 800 }],
        }
    );
}
