import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Recruiter in Your Pocket: see what a recruiter sees";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function OpenGraphImage() {
  const [literataItalic, schibstedRegular, schibstedExtraBold] = await Promise.all([
    readFile(join(process.cwd(), "public", "fonts", "literata", "Literata-Italic.woff")),
    readFile(join(process.cwd(), "public", "fonts", "schibsted-grotesk", "SchibstedGrotesk-Regular.woff")),
    readFile(join(process.cwd(), "public", "fonts", "schibsted-grotesk", "SchibstedGrotesk-ExtraBold.woff")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f4f4f1",
          color: "#111513",
          padding: "48px 56px 42px",
          fontFamily: "Schibsted Grotesk",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 24, borderBottom: "1px solid #dfe0dc" }}>
          {/* The Two Voices wordmark: Schibsted for the name, the recruiter's Literata italic for "in". */}
          <div style={{ display: "flex", alignItems: "baseline", fontFamily: "Schibsted Grotesk", fontSize: 28, fontWeight: 800, letterSpacing: "-0.015em" }}>
            <span>Recruiter</span>
            <span style={{ margin: "0 0.2em", fontFamily: "Literata", fontStyle: "italic", fontWeight: 400, letterSpacing: 0, color: "#1f5a46" }}>in</span>
            <span>Your Pocket</span>
          </div>
          <div style={{ display: "flex", color: "#5a605c", fontSize: 18 }}>
            Your resume, through a recruiter&apos;s eyes
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "stretch", paddingTop: 36 }}>
          <div style={{ width: 650, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingRight: 54 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontFamily: "Schibsted Grotesk", fontSize: 76, lineHeight: 1.0, letterSpacing: "-0.045em", fontWeight: 800 }}>
                See what a
              </div>
              <div style={{ display: "flex", position: "relative", alignSelf: "flex-start", marginTop: 6, fontFamily: "Schibsted Grotesk", fontSize: 76, lineHeight: 1.0, letterSpacing: "-0.045em", fontWeight: 800 }}>
                recruiter sees.
                <div style={{ display: "flex", position: "absolute", left: 0, right: 0, bottom: -10, height: 8, background: "#ffe14d" }} />
              </div>
            </div>
            <div style={{ display: "flex", maxWidth: 580, color: "#5a605c", fontSize: 21, lineHeight: 1.45 }}>
              What you meant isn&apos;t always what they read. See what comes through, what slips past, and what to fix first.
            </div>
          </div>

          <div style={{ width: 438, display: "flex", flexDirection: "column", borderTop: "1px solid #dfe0dc", borderBottom: "1px solid #dfe0dc" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 18px", borderBottom: "1px solid #dfe0dc", color: "#5a605c", fontSize: 16 }}>
              <span>Example line</span>
              <span>A recruiter&apos;s view</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", padding: "20px 22px", background: "#ffffff", borderBottom: "1px solid #dfe0dc" }}>
              <div style={{ display: "flex", color: "#5a605c", fontSize: 16 }}>On the resume</div>
              <div style={{ display: "flex", marginTop: 10, fontSize: 23, lineHeight: 1.3, background: "#ffe14d", padding: "0 4px" }}>
                Introduced monthly renewal-risk reviews across the portfolio.
              </div>
            </div>
            <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", padding: "20px 22px", background: "#fff6c2", border: "1px solid #f2dc6b" }}>
              <div style={{ display: "flex", color: "#6b5400", fontSize: 15, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Critical Miss</div>
              <div style={{ display: "flex", marginTop: 10, fontFamily: "Literata", fontStyle: "italic", fontSize: 25, lineHeight: 1.28, color: "#1f5a46" }}>
                Your best example stops right before the good part. What did you look for, and what changed?
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 25, color: "#5a605c", fontSize: 18 }}>
          <span>Good work deserves a good read.</span>
          <span style={{ color: "#1f5a46", fontWeight: 600 }}>recruiterinyourpocket.com</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Literata", data: literataItalic, style: "italic", weight: 400 },
        { name: "Schibsted Grotesk", data: schibstedRegular, style: "normal", weight: 400 },
        { name: "Schibsted Grotesk", data: schibstedExtraBold, style: "normal", weight: 800 },
      ],
    }
  );
}
