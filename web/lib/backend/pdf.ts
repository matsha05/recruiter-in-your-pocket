import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";

export type ReportForPdf = {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  rewrites: Array<{ label: string; original: string; better: string; enhancement_note: string }>;
  next_steps: string[];
  score_label?: string;
  score_comment_short?: string;
  generated_on?: string;
  missing_wins?: string[];
};

export function validateReportForPdf(report: any): report is ReportForPdf {
  if (!report || typeof report !== "object") return false;
  const requiredArrays = ["strengths", "gaps", "rewrites", "next_steps"];
  for (const key of requiredArrays) if (!Array.isArray(report[key])) return false;
  if (typeof report.summary !== "string") return false;
  if (typeof report.score !== "number" || !Number.isFinite(report.score)) return false;
  const rounded = Math.round(report.score);
  if (rounded < 0 || rounded > 100) return false;
  return true;
}

function escapeHtml(str: string) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function renderReportHtml(report: ReportForPdf) {
  const generatedOn =
    typeof report.generated_on === "string" && report.generated_on.trim()
      ? report.generated_on
      : new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  const listHtml = (items: string[] = []) => items.map((i) => `<li>${escapeHtml(i)}</li>`).join("");

  const rewriteHtml = (rewrites: ReportForPdf["rewrites"] = []) =>
    rewrites
      .map((r) => {
        if (!r) return "";
        return `
<div class="rewrite-row">
  <div class="rewrite-col">
    <div class="label">Original</div>
    <div class="text">${escapeHtml(r.original)}</div>
  </div>
  <div class="rewrite-col">
    <div class="label">Better</div>
    <div class="text">${escapeHtml(r.better)}</div>
  </div>
  ${r.enhancement_note ? `<div class="enhancement">${escapeHtml(r.enhancement_note)}</div>` : ""}
</div>`;
      })
      .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Resume Review — Recruiter in Your Pocket</title>
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Manrope:wght@400;500;600&display=swap");
    :root {
      --accent: #3341A6;
      --text-main: #0F172A;
      --text-muted: #64748B;
      --wash: #FAF9F6;
      --border-subtle: #d7dae3;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Manrope", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text-main);
      background: var(--wash);
      padding: 16px;
      font-size: 15px;
      line-height: 1.5;
    }
    .pdf-header {
      max-width: 760px;
      margin: 0 auto 10px;
      padding: 0 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .pdf-header-title {
      font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
    }
    .pdf-header-subtitle { font-size: 12px; color: var(--text-muted); }
    .pdf-header-right { text-align: right; font-size: 12px; color: var(--text-muted); }
    .card {
      max-width: 760px;
      margin: 10px auto 0;
      background: #fff;
      border: 1px solid rgba(12, 17, 32, 0.08);
      border-radius: 14px;
      padding: 24px;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
    }
    h2 {
      font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
      font-size: 21px;
      font-weight: 700;
      margin-bottom: 10px;
      letter-spacing: -0.02em;
    }
    p { margin-bottom: 15px; }
    ul { padding-left: 20px; margin-bottom: 15px; }
    li { margin-bottom: 6px; }
    .score { font-family: "Plus Jakarta Sans", system-ui, sans-serif; font-size: 26px; font-weight: 800; color: var(--accent); }
    .band { font-size: 12px; color: var(--text-muted); margin-top: 6px; }
    .section { margin: 20px 0; padding-left: 18px; border-left: 3px solid rgba(51, 65, 166, 0.35); }
    .label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; font-family: "Plus Jakarta Sans", system-ui, sans-serif; }
    .text { font-size: 15px; color: var(--text-main); line-height: 1.55; }
    .rewrite-row { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; margin-bottom: 16px; padding-left: 12px; border-left: 2px solid rgba(12,17,32,0.06); break-inside: avoid; }
    .rewrite-col { display: flex; flex-direction: column; gap: 6px; }
    .enhancement { grid-column: 1 / -1; font-size: 13px; color: var(--text-muted); font-style: italic; }
    .footer { margin-top: 20px; font-size: 11px; color: rgba(100,116,139,0.7); text-align: center; }
  </style>
</head>
<body>
  <div class="pdf-header">
    <div>
      <div class="pdf-header-title">Recruiter in Your Pocket</div>
      <div class="pdf-header-subtitle">Resume Report</div>
    </div>
    <div class="pdf-header-right">Generated on ${escapeHtml(generatedOn)}</div>
  </div>

  <div class="card">
    <div class="section">
      <div class="score">Score: ${Math.round(report.score || 0)}/100</div>
      ${report.score_label ? `<div class="band">${escapeHtml(report.score_label)}</div>` : ""}
      ${report.score_comment_short ? `<p>${escapeHtml(report.score_comment_short)}</p>` : ""}
    </div>

    <div class="section">
      <h2>How your resume reads</h2>
      <p>${escapeHtml(report.summary)}</p>
    </div>

    <div class="section">
      <h2>What's working</h2>
      <ul>${listHtml(report.strengths)}</ul>
    </div>

    <div class="section">
      <h2>What's harder to see</h2>
      <ul>${listHtml(report.gaps)}</ul>
    </div>

    <div class="section">
      <h2>Stronger phrasing you can use</h2>
      ${rewriteHtml(report.rewrites)}
    </div>

    ${Array.isArray(report.missing_wins) && report.missing_wins.length
      ? `<div class="section"><h2>Missing wins</h2><ul>${listHtml(report.missing_wins)}</ul></div>`
      : ""}

    <div class="section">
      <h2>Next steps</h2>
      <ul>${listHtml(report.next_steps)}</ul>
    </div>

    <div class="footer">Created with Recruiter in Your Pocket</div>
  </div>
</body>
</html>`;
}

function isServerlessEnv() {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.FUNCTION_NAME ||
      process.env.RAILWAY_ENVIRONMENT ||
      process.env.RENDER
  );
}

export async function generatePdfBuffer(report: ReportForPdf): Promise<Buffer> {
  const html = await renderReportHtml(report);

  const isServerless = isServerlessEnv();
  const isVercel = Boolean(process.env.VERCEL);

  const launchArgs = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--disable-extensions",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding"
  ];
  if (isServerless) launchArgs.push("--single-process");

  const useChromium = isVercel || (isServerless && process.env.USE_SPARTICUZ_CHROMIUM === "true");

  const browser = useChromium
    ? await puppeteerCore.launch({
        args: [...chromium.args, ...launchArgs],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        timeout: 30000
      })
    : await puppeteer.launch({
        headless: true,
        args: launchArgs,
        timeout: 30000
      });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    if (!useChromium) {
      await page.setViewport({ width: 1200, height: 1600 });
    }

    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: "18mm", right: "16mm", bottom: "18mm", left: "16mm" }
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

