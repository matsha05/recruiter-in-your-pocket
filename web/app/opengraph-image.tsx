import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Recruiter in Your Pocket: make good work hard to miss";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function OpenGraphImage() {
  const [newsreader, instrumentSans, instrumentSansSemibold] = await Promise.all([
    readFile(join(process.cwd(), "public", "assets", "fonts", "newsreader-display-medium.ttf")),
    readFile(join(process.cwd(), "public", "assets", "fonts", "instrument-sans-regular.ttf")),
    readFile(join(process.cwd(), "public", "assets", "fonts", "instrument-sans-semibold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FBFAF7",
          color: "#171827",
          padding: "48px 56px 42px",
          fontFamily: "Instrument Sans",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 24, borderBottom: "1px solid #D8D3CA" }}>
          <div style={{ display: "flex", fontFamily: "Newsreader", fontSize: 28, fontWeight: 600, letterSpacing: "-0.04em" }}>
            Recruiter in Your Pocket
          </div>
          <div style={{ display: "flex", color: "#5D5964", fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Your work, through a recruiter&apos;s eyes
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "stretch", paddingTop: 36 }}>
          <div style={{ width: 650, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingRight: 54 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontFamily: "Newsreader", fontSize: 82, lineHeight: 0.96, letterSpacing: "-0.055em", fontWeight: 550 }}>
                Make good work
              </div>
              <div style={{ display: "flex", position: "relative", alignSelf: "flex-start", marginTop: 6, fontFamily: "Newsreader", fontSize: 82, lineHeight: 0.96, letterSpacing: "-0.055em", fontWeight: 550 }}>
                hard to miss.
                <div style={{ display: "flex", position: "absolute", left: 6, right: 2, bottom: -12, height: 8, background: "#4F46E5" }} />
              </div>
            </div>
            <div style={{ display: "flex", maxWidth: 510, color: "#5D5964", fontSize: 21, lineHeight: 1.45 }}>
              See what lands, what raises a question, and the first change worth making.
            </div>
          </div>

          <div style={{ width: 438, display: "flex", flexDirection: "column", borderTop: "1px solid #AAA4B0", borderBottom: "1px solid #AAA4B0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 18px", borderBottom: "1px solid #D8D3CA", color: "#5D5964", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <span>Example line</span>
              <span>First read</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", padding: "20px 22px", background: "#FBE4D6", borderBottom: "1px solid #D8D3CA" }}>
              <div style={{ display: "flex", color: "#7A4E36", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Needs context</div>
              <div style={{ display: "flex", marginTop: 10, fontFamily: "Newsreader", fontSize: 27, lineHeight: 1.15 }}>
                Led onboarding work across the company, improving productivity.
              </div>
            </div>
            <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", padding: "20px 22px", background: "#DCECFF" }}>
              <div style={{ display: "flex", color: "#3730A3", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Stronger and specific</div>
              <div style={{ display: "flex", marginTop: 10, fontFamily: "Newsreader", fontSize: 27, lineHeight: 1.15 }}>
                Cut ramp time from 6 to 4 weeks for 25 new hires a week across Sales and Support.
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 25, color: "#5D5964", fontSize: 14 }}>
          <span>Evidence. Context. Your next move.</span>
          <span style={{ color: "#3730A3", fontWeight: 700 }}>recruiterinyourpocket.com</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: newsreader, style: "normal", weight: 600 },
        { name: "Instrument Sans", data: instrumentSans, style: "normal", weight: 400 },
        { name: "Instrument Sans", data: instrumentSansSemibold, style: "normal", weight: 600 },
      ],
    }
  );
}
