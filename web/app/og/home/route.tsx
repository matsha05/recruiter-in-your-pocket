import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-static";

const ink = "#111513";
const muted = "#5a605c";
const line = "#dfe0dc";
const pen = "#1f5a46";

const font = (...path: string[]) => readFile(join(process.cwd(), "public", "fonts", ...path));

/**
 * The homepage's share card tells the same story as its hero: someone got the
 * call, and beside it sits an ordinary resume with a note you can't quite read.
 */
export async function GET() {
  const [literataItalic, sourceSerif, schibstedRegular, schibstedExtraBold] = await Promise.all([
    font("literata", "Literata-Italic.woff"),
    font("source-serif-4", "SourceSerif4-Regular.ttf"),
    font("schibsted-grotesk", "SchibstedGrotesk-Regular.woff"),
    font("schibsted-grotesk", "SchibstedGrotesk-ExtraBold.woff"),
  ]);

  const head = (label: string) => (
    <div style={{ display: "flex", marginTop: 14, borderBottom: `1px solid ${ink}`, fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase" }}>
      {label}
    </div>
  );
  const bullet = (text: string) => (
    <div style={{ display: "flex", marginTop: 5 }}>
      <span style={{ width: 14 }}>•</span>
      <span style={{ flex: 1 }}>{text}</span>
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f4f4f1", color: ink, fontFamily: "Schibsted Grotesk", overflow: "hidden" }}>
        <div style={{ width: 640, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "52px 0 46px 64px" }}>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em" }}>Recruiter in Your Pocket</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.045em" }}>They called</div>
            <div style={{ display: "flex", marginTop: 4, fontSize: 76, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.045em" }}>someone back.</div>
            <div style={{ display: "flex", marginTop: 4, fontSize: 76, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.045em" }}>It wasn&rsquo;t you.</div>
            <div style={{ display: "flex", marginTop: 28, maxWidth: 560, color: muted, fontSize: 26, lineHeight: 1.4 }}>
              See what a recruiter sees on your resume.
            </div>
          </div>
          <div style={{ display: "flex", color: pen, fontSize: 22, fontWeight: 800 }}>recruiterinyourpocket.com</div>
        </div>

        <div style={{ position: "relative", display: "flex", flex: 1 }}>
          {/* An ordinary resume, set in a document serif and cut off by the frame. */}
          <div
            style={{
              position: "absolute",
              top: 58,
              left: 24,
              width: 470,
              height: 640,
              display: "flex",
              flexDirection: "column",
              border: `1px solid ${line}`,
              borderRadius: 10,
              background: "#ffffff",
              padding: "34px 36px",
              color: "#2b2f2d",
              fontFamily: "Source Serif",
              fontSize: 16,
              lineHeight: 1.45,
              transform: "rotate(-1.2deg)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", fontSize: 22, letterSpacing: "0.08em", textTransform: "uppercase" }}>Jordan A. Miller</div>
            <div style={{ display: "flex", justifyContent: "center", color: muted, fontSize: 14 }}>Denver, CO · jmiller@example.com</div>
            {head("Objective")}
            <div style={{ display: "flex", marginTop: 5 }}>Results-driven, detail-oriented professional seeking a challenging role where I can utilize my skills.</div>
            {head("Experience")}
            <div style={{ display: "flex", marginTop: 5 }}>Customer Success Manager, Northwind Analytics</div>
            {bullet("Responsible for managing customer relationships and renewals")}
            {bullet("Managed 32 B2B SaaS accounts with $2.4M in annual recurring revenue")}
            {bullet("Introduced monthly renewal-risk reviews across the portfolio")}
            {bullet("Team player with excellent communication skills")}
          </div>

          {/* The verdict exists. You just can't read it. */}
          <div
            style={{
              position: "absolute",
              top: 296,
              left: 150,
              width: 320,
              display: "flex",
              flexDirection: "column",
              border: "1px solid #f2dc6b",
              borderRadius: 4,
              background: "#fffbe6",
              padding: "22px 24px 24px",
              transform: "rotate(2.4deg)",
              boxShadow: "0 12px 28px rgba(17, 21, 19, 0.10)",
            }}
          >
            <div style={{ position: "absolute", top: -14, left: 38, width: 18, height: 46, border: "3px solid rgba(90, 96, 92, 0.6)", borderBottomColor: "transparent", borderRadius: 9 }} />
            <div style={{ display: "flex", color: pen, fontFamily: "Literata", fontStyle: "italic", fontSize: 19 }}>Recruiter&rsquo;s note</div>
            <div style={{ display: "flex", marginTop: 8, color: "transparent", fontFamily: "Literata", fontStyle: "italic", fontSize: 24, lineHeight: 1.4, textShadow: `0 0 11px ${pen}` }}>
              Solid book of business, but the best example stops right before the good part.
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Literata", data: literataItalic, style: "italic", weight: 400 },
        { name: "Source Serif", data: sourceSerif, style: "normal", weight: 400 },
        { name: "Schibsted Grotesk", data: schibstedRegular, style: "normal", weight: 400 },
        { name: "Schibsted Grotesk", data: schibstedExtraBold, style: "normal", weight: 800 },
      ],
    },
  );
}
