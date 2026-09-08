import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Recruiter in Your Pocket: make good work hard to miss";
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
            Your work, through a recruiter&apos;s eyes
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "stretch", paddingTop: 36 }}>
          <div style={{ width: 650, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingRight: 54 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontFamily: "Instrument Sans", fontSize: 76, lineHeight: 1.04, letterSpacing: "-0.045em", fontWeight: 400 }}>
                Make good work
              </div>
              <div style={{ display: "flex", position: "relative", alignSelf: "flex-start", marginTop: 6, fontFamily: "Instrument Sans", fontSize: 76, lineHeight: 1.04, letterSpacing: "-0.045em", fontWeight: 400 }}>
                hard to miss.
                <div style={{ display: "flex", position: "absolute", left: 6, right: 2, bottom: -12, height: 2, background: "#00738f" }} />
              </div>
            </div>
            <div style={{ display: "flex", maxWidth: 510, color: "#5f6667", fontSize: 21, lineHeight: 1.45 }}>
              See what lands, what raises a question, and the first change worth making.
            </div>
          </div>

          <div style={{ width: 438, display: "flex", flexDirection: "column", borderTop: "1px solid #dcdedb", borderBottom: "1px solid #dcdedb" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 18px", borderBottom: "1px solid #dcdedb", color: "#5f6667", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <span>Example line</span>
              <span>First read</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", padding: "20px 22px", background: "#fbfaf8", borderBottom: "1px solid #dcdedb" }}>
              <div style={{ display: "flex", color: "#00738F", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Needs context</div>
              <div style={{ display: "flex", marginTop: 10, fontFamily: "Source Serif 4", fontSize: 25, lineHeight: 1.24 }}>
                Led onboarding work across the company, improving productivity.
              </div>
            </div>
            <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", padding: "20px 22px", background: "#e6f3f2" }}>
              <div style={{ display: "flex", color: "#12191b", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Grounded rewrite</div>
              <div style={{ display: "flex", marginTop: 10, fontFamily: "Source Serif 4", fontSize: 25, lineHeight: 1.24 }}>
                Rebuilt [program] for [teams or hires], improving [verified outcome].
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 25, color: "#5f6667", fontSize: 14 }}>
          <span>Evidence. Context. Your next move.</span>
          <span style={{ color: "#00738F", fontWeight: 600 }}>recruiterinyourpocket.com</span>
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
