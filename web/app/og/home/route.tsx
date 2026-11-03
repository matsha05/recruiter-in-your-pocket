import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { JORDAN_EXAMPLE } from "@/lib/marketing/jordan-example";

export const runtime = "nodejs";
export const dynamic = "force-static";

const ink = "#111513";
const muted = "#5a605c";
const line = "#dfe0dc";
const pen = "#1f5a46";
const redPen = "#b4261d";

const font = (...path: string[]) => readFile(join(process.cwd(), "public", "fonts", ...path));

/**
 * The homepage's share card tells the same story as its hero: someone got the
 * call, and over an ordinary resume sits the recruiter's screen: the decision,
 * and a note you can't read.
 */
export async function GET() {
  const [literataItalic, literataRegular, schibstedRegular, schibstedSemibold, schibstedExtraBold] = await Promise.all([
    font("literata", "Literata-Italic.woff"),
    font("literata", "Literata-Regular.woff"),
    font("schibsted-grotesk", "SchibstedGrotesk-Regular.woff"),
    font("schibsted-grotesk", "SchibstedGrotesk-Semibold.woff"),
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
          {/* The Two Voices wordmark: Schibsted for the name, the recruiter's Literata italic for "in". */}
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 28, fontWeight: 800, letterSpacing: "-0.015em" }}>
            <span>Recruiter</span>
            <span style={{ margin: "0 0.2em", fontFamily: "Literata", fontStyle: "italic", fontWeight: 400, letterSpacing: 0, color: pen }}>in</span>
            <span>Your Pocket</span>
          </div>
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
          {/* An ordinary resume, set in the one serif the system has (Literata, upright) and cut off by the frame. */}
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
              fontFamily: "Literata",
              fontStyle: "normal",
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

          {/* The other side of the screen: the decision, and the note only the hiring team can read. */}
          <div
            style={{
              position: "absolute",
              top: 150,
              left: 104,
              width: 416,
              display: "flex",
              flexDirection: "column",
              border: `1px solid ${line}`,
              borderRadius: 16,
              background: "#ffffff",
              padding: "20px 24px 18px",
              fontSize: 17,
              transform: "rotate(1.4deg)",
            }}
          >
            <div style={{ display: "flex", color: muted }}>Customer Success Manager · Req 4471</div>
            <div style={{ display: "flex", marginTop: 12, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>Jordan A. Miller</div>
            <div style={{ display: "flex", color: muted }}>Applied 9 days ago</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: "12px 0", borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}`, color: muted }}>
              <span>Stage</span>
              <span style={{ display: "flex", borderRadius: 999, background: "rgba(180, 38, 29, 0.08)", padding: "5px 14px", color: redPen, fontWeight: 600 }}>Not moving forward</span>
            </div>
            <div style={{ display: "flex", marginTop: 16, color: muted }}>Reviewer note · hiring team only</div>
            <div style={{ display: "flex", marginTop: 6, color: "transparent", fontFamily: "Literata", fontStyle: "italic", fontSize: 21, lineHeight: 1.4, textShadow: `0 0 13px ${pen}` }}>
              {JORDAN_EXAMPLE.note}
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
        { name: "Literata", data: literataRegular, style: "normal", weight: 400 },
        { name: "Schibsted Grotesk", data: schibstedRegular, style: "normal", weight: 400 },
        { name: "Schibsted Grotesk", data: schibstedSemibold, style: "normal", weight: 600 },
        { name: "Schibsted Grotesk", data: schibstedExtraBold, style: "normal", weight: 800 },
      ],
    },
  );
}
