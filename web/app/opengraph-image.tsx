import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Recruiter in Your Pocket: see what a recruiter sees";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function OpenGraphImage() {
  const [sourceSerif, instrumentSans, instrumentSansSemibold] = await Promise.all([
    readFile(join(process.cwd(), "public", "fonts", "source-serif-4", "SourceSerif4-Regular.ttf")),
    readFile(join(process.cwd(), "public", "fonts", "instrument-sans", "InstrumentSans-Regular.ttf")),
    readFile(join(process.cwd(), "public", "fonts", "instrument-sans", "InstrumentSans-Semibold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f6f3ef",
          color: "#12191b",
          padding: "48px 56px 42px",
          fontFamily: "Instrument Sans",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 24, borderBottom: "1px solid #dcdedb" }}>
          <div style={{ display: "flex", fontFamily: "Instrument Sans", fontSize: 28, fontWeight: 600, letterSpacing: "-0.04em" }}>
            Recruiter in Your Pocket
          </div>
          <div style={{ display: "flex", color: "#5f6667", fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Your resume, through a recruiter&apos;s eyes
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "stretch", paddingTop: 36 }}>
          <div style={{ width: 650, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingRight: 54 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontFamily: "Instrument Sans", fontSize: 76, lineHeight: 1.04, letterSpacing: "-0.045em", fontWeight: 400 }}>
                See what a
              </div>
              <div style={{ display: "flex", position: "relative", alignSelf: "flex-start", marginTop: 6, fontFamily: "Instrument Sans", fontSize: 76, lineHeight: 1.04, letterSpacing: "-0.045em", fontWeight: 400 }}>
                recruiter sees.
                <div style={{ display: "flex", position: "absolute", left: 6, right: 2, bottom: -12, height: 2, background: "#1e3a34" }} />
              </div>
            </div>
            <div style={{ display: "flex", maxWidth: 580, color: "#5f6667", fontSize: 21, lineHeight: 1.45 }}>
              What you meant isn&apos;t always what they read. See what comes through, what slips past, and what to fix first.
            </div>
          </div>

          <div style={{ width: 438, display: "flex", flexDirection: "column", borderTop: "1px solid #dcdedb", borderBottom: "1px solid #dcdedb" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 18px", borderBottom: "1px solid #dcdedb", color: "#5f6667", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <span>Example line</span>
              <span>A recruiter&apos;s view</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", padding: "20px 22px", background: "#fbfaf8", borderBottom: "1px solid #dcdedb" }}>
              <div style={{ display: "flex", color: "#5f6667", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>On the resume</div>
              <div style={{ display: "flex", marginTop: 10, fontSize: 23, lineHeight: 1.3, background: "#f1ddaf", padding: "0 4px" }}>
                Introduced monthly renewal-risk reviews across the portfolio.
              </div>
            </div>
            <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", padding: "20px 22px", background: "#fbfaf8", borderLeft: "3px solid #8a4a0f" }}>
              <div style={{ display: "flex", color: "#8a4a0f", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Critical Miss</div>
              <div style={{ display: "flex", marginTop: 10, fontFamily: "Source Serif 4", fontSize: 25, lineHeight: 1.28, color: "#1e3a34" }}>
                Your best example stops right before the good part. Did renewals go up?
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 25, color: "#5f6667", fontSize: 14 }}>
          <span>Good work deserves a good read.</span>
          <span style={{ color: "#1e3a34", fontWeight: 600 }}>recruiterinyourpocket.com</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Source Serif 4", data: sourceSerif, style: "normal", weight: 400 },
        { name: "Instrument Sans", data: instrumentSans, style: "normal", weight: 400 },
        { name: "Instrument Sans", data: instrumentSansSemibold, style: "normal", weight: 600 },
      ],
    }
  );
}
