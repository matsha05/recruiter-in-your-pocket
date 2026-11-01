import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { categories } from "@/components/research/ResearchHubData";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const dynamicParams = false;

const ground = "#f4f4f1";
const ink = "#111513";
const muted = "#5a605c";
const line = "#dfe0dc";
const pen = "#1f5a46";

const font = (...path: string[]) => readFile(join(process.cwd(), "public", "fonts", ...path));

const answers = categories.flatMap((category) => category.articles.map((article) => ({ article, category })));

export function generateStaticParams() {
  return answers.map(({ article }) => ({ id: article.id }));
}

/**
 * A research article, guide, or the methodology shares the question it answers
 * on the Research hub, with the hub's one-line answer in the recruiter's voice.
 * The text is the hub's own, so the card never says more than the page.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = answers.find(({ article }) => article.id === id);
  if (!entry) return new Response("Not found", { status: 404 });
  const { article, category } = entry;

  const [literataItalic, schibstedRegular, schibstedSemibold, schibstedExtraBold] = await Promise.all([
    font("literata", "Literata-Italic.woff"),
    font("schibsted-grotesk", "SchibstedGrotesk-Regular.woff"),
    font("schibsted-grotesk", "SchibstedGrotesk-Semibold.woff"),
    font("schibsted-grotesk", "SchibstedGrotesk-ExtraBold.woff"),
  ]);

  const label = article.href.startsWith("/research/")
    ? `Research · ${category.title}`
    : article.href === "/methodology" ? "How the report works" : category.title;
  const questionSize = article.question.length > 34 ? 64 : 76;
  const answerSize = article.answer.length > 120 ? 28 : 32;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: ground,
          color: ink,
          padding: "48px 56px 42px",
          fontFamily: "Schibsted Grotesk",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 24, borderBottom: `1px solid ${line}` }}>
          {/* The Two Voices wordmark: Schibsted for the name, the recruiter's Literata italic for "in". */}
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 28, fontWeight: 800, letterSpacing: "-0.015em" }}>
            <span>Recruiter</span>
            <span style={{ margin: "0 0.2em", fontFamily: "Literata", fontStyle: "italic", fontWeight: 400, letterSpacing: 0, color: pen }}>in</span>
            <span>Your Pocket</span>
          </div>
          <div style={{ display: "flex", color: pen, fontSize: 16, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {label}
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", maxWidth: 1000 }}>
          <div style={{ display: "flex", fontSize: questionSize, lineHeight: 1.04, letterSpacing: "-0.04em", fontWeight: 800 }}>
            {article.question}
          </div>
          <div style={{ display: "flex", marginTop: 30, fontFamily: "Literata", fontStyle: "italic", fontSize: answerSize, lineHeight: 1.36, color: pen }}>
            {article.answer}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24, borderTop: `1px solid ${line}`, color: muted, fontSize: 18 }}>
          <span style={{ display: "flex", maxWidth: 760 }}>{article.title}</span>
          <span style={{ color: pen, fontWeight: 600 }}>recruiterinyourpocket.com</span>
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
