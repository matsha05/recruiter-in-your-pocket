import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-static";

const ink = "#111513";
const muted = "#5a605c";
const pen = "#1f5a46";
const paper = "#fefefc";
const edge = "rgba(27, 27, 27, 0.2)";

const font = (...path: string[]) => readFile(join(process.cwd(), "public", "fonts", ...path));

/** The same eighteen sheets that turn green on the homepage (components/landing/home/PileHero.tsx). */
const PILE = 244;
const REPLIED = new Set([3, 17, 29, 41, 58, 66, 83, 97, 104, 121, 139, 150, 168, 177, 193, 206, 222, 238]);

/**
 * The homepage's share card tells the same story as its first screen (Nov 4, 2026): the pile. 244 sheets of
 * paper for one job, eighteen of them green, and the number of people who never found out why.
 */
export async function GET() {
  const [literataItalic, schibstedRegular, schibstedSemibold, schibstedExtraBold] = await Promise.all([
    font("literata", "Literata-Italic.woff"),
    font("schibsted-grotesk", "SchibstedGrotesk-Regular.woff"),
    font("schibsted-grotesk", "SchibstedGrotesk-Semibold.woff"),
    font("schibsted-grotesk", "SchibstedGrotesk-ExtraBold.woff"),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f4f4f1", color: ink, fontFamily: "Schibsted Grotesk", overflow: "hidden" }}>
        <div style={{ width: 600, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "52px 0 46px 64px" }}>
          {/* The Two Voices wordmark: Schibsted for the name, the recruiter's Literata italic for "in". */}
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 28, fontWeight: 800, letterSpacing: "-0.015em" }}>
            <span>Recruiter</span>
            <span style={{ margin: "0 0.2em", fontFamily: "Literata", fontStyle: "italic", fontWeight: 400, letterSpacing: 0, color: pen }}>in</span>
            <span>Your Pocket</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 66, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em" }}>244 people</div>
            <div style={{ display: "flex", marginTop: 6, fontSize: 66, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em" }}>applied for the</div>
            <div style={{ display: "flex", marginTop: 6, fontSize: 66, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em" }}>job you wanted.</div>
            <div style={{ display: "flex", marginTop: 26, maxWidth: 520, color: muted, fontSize: 24, lineHeight: 1.4 }}>
              Eighteen got called back. The other 226 have no idea why the recruiter passed.
            </div>
          </div>
          <div style={{ display: "flex", color: pen, fontSize: 22, fontWeight: 800 }}>recruiterinyourpocket.com</div>
        </div>

        {/* The pile: 244 sheets, eighteen green, laid out as on the page. */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", padding: "0 56px 0 16px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, width: 528 }}>
            {Array.from({ length: PILE }, (_, index) => (
              <div
                key={index}
                style={{
                  width: 22,
                  height: 28,
                  borderRadius: 2,
                  background: REPLIED.has(index) ? pen : paper,
                  boxShadow: REPLIED.has(index) ? `0 0 0 0.5px ${pen}` : `0 0 0 0.5px ${edge}`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Literata", data: literataItalic, style: "italic", weight: 400 },
        { name: "Schibsted Grotesk", data: schibstedRegular, style: "normal", weight: 400 },
        { name: "Schibsted Grotesk", data: schibstedSemibold, style: "normal", weight: 600 },
        { name: "Schibsted Grotesk", data: schibstedExtraBold, style: "normal", weight: 800 },
      ],
    },
  );
}
