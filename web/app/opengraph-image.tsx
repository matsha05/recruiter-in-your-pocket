import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { JORDAN_EXAMPLE } from "@/lib/marketing/jordan-example";

export const alt = "Recruiter in Your Pocket: see what a recruiter sees";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

const ink = "#111513";
const muted = "#5a605c";
const pen = "#1f5a46";
const paper = "#fefefc";
const documentInk = "#1b1b1b";
const ghost = "#6f6f6c";
const edge = "rgba(27, 27, 27, 0.2)";
const marker = "rgba(255, 225, 77, 0.6)";

/**
 * The site's share card (Nov 4, 2026): the clipping. One line cut out of Jordan's resume on its own strip of
 * paper, the lines around it fading, the marker across it, and the recruiter's note in the margin, under the
 * homepage's own line. The same object the homepage, the methodology page and the report use.
 */
export default async function OpenGraphImage() {
  const [literataItalic, schibstedRegular, schibstedSemibold, schibstedExtraBold] = await Promise.all([
    readFile(join(process.cwd(), "public", "fonts", "literata", "Literata-Italic.woff")),
    readFile(join(process.cwd(), "public", "fonts", "schibsted-grotesk", "SchibstedGrotesk-Regular.woff")),
    readFile(join(process.cwd(), "public", "fonts", "schibsted-grotesk", "SchibstedGrotesk-Semibold.woff")),
    readFile(join(process.cwd(), "public", "fonts", "schibsted-grotesk", "SchibstedGrotesk-ExtraBold.woff")),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#f4f4f1", color: ink, padding: "52px 64px 46px", fontFamily: "Schibsted Grotesk" }}>
        {/* The Two Voices wordmark: Schibsted for the name, the recruiter's Literata italic for "in". */}
        <div style={{ display: "flex", alignItems: "baseline", fontSize: 28, fontWeight: 800, letterSpacing: "-0.015em" }}>
          <span>Recruiter</span>
          <span style={{ margin: "0 0.2em", fontFamily: "Literata", fontStyle: "italic", fontWeight: 400, letterSpacing: 0, color: pen }}>in</span>
          <span>Your Pocket</span>
        </div>

        <div style={{ display: "flex", marginTop: 44, fontSize: 60, fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.04em" }}>
          Here&rsquo;s the note Jordan never saw.
        </div>

        {/* The clipping: the strip, the marker, the note. */}
        <div style={{ display: "flex", alignItems: "flex-start", marginTop: 46 }}>
          <div style={{ width: 700, display: "flex", flexDirection: "column", padding: "18px 34px 20px", background: paper, color: documentInk, fontFamily: "Georgia, serif", fontSize: 24, lineHeight: 1.5, boxShadow: `0 0 0 1px ${edge}, 0 18px 28px -22px rgba(27, 27, 27, 0.28)` }}>
            <div style={{ display: "flex", color: ghost, opacity: 0.45, whiteSpace: "nowrap", overflow: "hidden" }}>Managed 32 B2B SaaS accounts with $2.4M in annual recurring revenue</div>
            <div style={{ display: "flex", marginTop: 4, marginBottom: 4 }}>
              <span style={{ display: "flex", padding: "0 6px", background: marker }}>{JORDAN_EXAMPLE.line}</span>
            </div>
            <div style={{ display: "flex", color: ghost, opacity: 0.45, whiteSpace: "nowrap", overflow: "hidden" }}>Ran quarterly business reviews with customer leadership teams</div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", marginLeft: 28, marginTop: 22 }}>
            <div style={{ display: "flex", width: 40, height: 2, marginTop: 16, background: pen, opacity: 0.6 }} />
            <div style={{ display: "flex", marginLeft: 12, width: 290, fontFamily: "Literata", fontStyle: "italic", fontSize: 23, lineHeight: 1.35, color: pen }}>
              {JORDAN_EXAMPLE.note}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: muted, fontSize: 18 }}>
          <span>Fictional example. Jordan is made up; the note is the kind a recruiter writes.</span>
          <span style={{ color: pen, fontWeight: 600 }}>recruiterinyourpocket.com</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Literata", data: literataItalic, style: "italic", weight: 400 },
        { name: "Schibsted Grotesk", data: schibstedRegular, style: "normal", weight: 400 },
        { name: "Schibsted Grotesk", data: schibstedSemibold, style: "normal", weight: 600 },
        { name: "Schibsted Grotesk", data: schibstedExtraBold, style: "normal", weight: 800 },
      ],
    }
  );
}
