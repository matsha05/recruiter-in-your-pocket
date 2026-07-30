import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Recruiter in Your Pocket: make good work hard to miss";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function OpenGraphImage() {
  const [spaceGrotesk, instrumentSans, instrumentSansSemibold] = await Promise.all([
    readFile(join(process.cwd(), "public", "assets", "fonts", "space-grotesk-bold.ttf")),
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
          background: "#F7F5EF",
          color: "#071722",
          padding: "48px 56px 42px",
          fontFamily: "Instrument Sans",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 24, borderBottom: "1px solid #CCD2D1" }}>
          <div style={{ display: "flex", fontFamily: "Space Grotesk", fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em" }}>
            Recruiter in Your Pocket
          </div>
          <div style={{ display: "flex", color: "#596570", fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Your work, through a recruiter&apos;s eyes
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "stretch", paddingTop: 36 }}>
          <div style={{ width: 650, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingRight: 54 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontFamily: "Space Grotesk", fontSize: 82, lineHeight: 0.96, letterSpacing: "-0.055em", fontWeight: 700 }}>
                Make good work
              </div>
              <div style={{ display: "flex", position: "relative", alignSelf: "flex-start", marginTop: 6, fontFamily: "Space Grotesk", fontSize: 82, lineHeight: 0.96, letterSpacing: "-0.055em", fontWeight: 700 }}>
                hard to miss.
                <div style={{ display: "flex", position: "absolute", left: 6, right: 2, bottom: -12, height: 12, background: "#C8F238" }} />
              </div>
            </div>
            <div style={{ display: "flex", maxWidth: 510, color: "#596570", fontSize: 21, lineHeight: 1.45 }}>
              See what lands, what raises a question, and the first change worth making.
            </div>
          </div>

          <div style={{ width: 438, display: "flex", flexDirection: "column", borderTop: "1px solid #AEB8B7", borderBottom: "1px solid #AEB8B7" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 18px", borderBottom: "1px solid #CCD2D1", color: "#596570", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <span>Example line</span>
              <span>First read</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", padding: "20px 22px", background: "#E8F8FC", borderBottom: "1px solid #CCD2D1" }}>
              <div style={{ display: "flex", color: "#00738F", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Needs context</div>
              <div style={{ display: "flex", marginTop: 10, fontFamily: "Space Grotesk", fontSize: 27, lineHeight: 1.15 }}>
                Led onboarding work across the company, improving productivity.
              </div>
            </div>
            <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", padding: "20px 22px", background: "#F3FAD9" }}>
              <div style={{ display: "flex", color: "#071722", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Grounded rewrite</div>
              <div style={{ display: "flex", marginTop: 10, fontFamily: "Space Grotesk", fontSize: 27, lineHeight: 1.15 }}>
                Rebuilt [program] for [teams or hires], improving [verified outcome].
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 25, color: "#596570", fontSize: 14 }}>
          <span>Evidence. Context. Your next move.</span>
          <span style={{ color: "#00738F", fontWeight: 700 }}>recruiterinyourpocket.com</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Space Grotesk", data: spaceGrotesk, style: "normal", weight: 700 },
        { name: "Instrument Sans", data: instrumentSans, style: "normal", weight: 400 },
        { name: "Instrument Sans", data: instrumentSansSemibold, style: "normal", weight: 600 },
      ],
    }
  );
}
