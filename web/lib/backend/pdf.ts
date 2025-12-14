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

  const listHtml = (items: string[] = []) => items.map((i) => `<li><span>${escapeHtml(i)}</span></li>`).join("");

  const rewriteHtml = (rewrites: ReportForPdf["rewrites"] = []) =>
    rewrites
      .map((r) => {
        if (!r) return "";
        return `
            <div class="rewrite-card">
              <div class="rewrite-grid">
                <div class="col original">
                    <div class="col-label">Original</div>
                    <div class="content">${escapeHtml(r.original)}</div>
                </div>
                <div class="col better">
                    <div class="col-label">Studio Rewrite</div>
                    <div class="content">${escapeHtml(r.better)}</div>
                </div>
              </div>
              ${r.enhancement_note ? `<div class="note"><strong>Why this works:</strong> ${escapeHtml(r.enhancement_note)}</div>` : ""}
            </div>`;
      })
      .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Studio Report — Recruiter in Your Pocket</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap');
    
    :root {
      /* Studio Tokens */
      --foreground: #1a1a1a;
      --muted: #666666;
      --border: #e5e5e5;
      --surface: #ffffff;
      --wash: #fafafa;
      
      /* Signals */
      --moss: #22c55e;
      --moss-bg: #f0fdf4;
      --rose: #e11d48;
      --rose-bg: #fff1f2;
      --gold: #d97706;
      --gold-bg: #fffbeb;
      --brand: #1a1a1a;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: "Inter", sans-serif;
      color: var(--foreground);
      background: var(--surface);
      font-size: 14px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    /* Layout */
    .page-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }

    /* Header */
    header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 30px;
    }

    .brand {
      font-family: "Newsreader", serif;
      font-size: 24px;
      font-weight: 500;
      color: var(--brand);
      margin-bottom: 8px;
    }

    .meta {
      font-size: 11px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 500;
    }

    /* Sections */
    h2 {
      font-family: "Newsreader", serif;
      font-size: 20px;
      font-weight: 500;
      color: var(--foreground);
      margin-bottom: 16px;
      margin-top: 32px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    h2::after {
        content: "";
        flex: 1;
        height: 1px;
        background: var(--border);
        opacity: 0.5;
    }

    p { margin-bottom: 16px; color: #444; }

    /* Score Block */
    .score-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--wash);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 32px;
    }
    
    .score-value {
        font-family: "Newsreader", serif;
        font-size: 48px;
        font-weight: 500;
        line-height: 1;
        color: var(--brand);
    }
    
    .score-label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--muted);
        margin-top: 8px;
    }

    .score-summary {
        flex: 1;
        margin-left: 32px;
        font-size: 15px;
        color: #333;
    }

    /* Lists */
    ul { list-style: none; }
    li {
        margin-bottom: 10px;
        padding-left: 20px;
        position: relative;
    }
    
    .strengths li::before {
        content: "✓";
        position: absolute;
        left: 0;
        color: var(--moss);
        font-weight: bold;
    }

    .gaps li::before {
        content: "!";
        position: absolute;
        left: 0;
        color: var(--gold);
        font-weight: bold;
    }

    /* Grid for Strengths/Gaps */
    .analysis-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
        margin-bottom: 32px;
    }

    /* Rewrites */
    .rewrite-card {
        background: #fff;
        border: 1px solid var(--border);
        border-radius: 8px;
        margin-bottom: 24px;
        overflow: hidden;
    }
    
    .rewrite-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        border-bottom: 1px solid var(--border);
    }
    
    .col {
        padding: 20px;
    }
    
    .col.original {
        background: var(--wash);
        border-right: 1px solid var(--border);
    }
    
    .col-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 8px;
        color: var(--muted);
        font-weight: 600;
    }
    
    .content {
        font-size: 14px;
        color: #333;
    }

    .note {
        padding: 16px 20px;
        background: var(--moss-bg);
        font-size: 13px;
        color: #14532d;
    }

    /* Footer */
    footer {
        text-align: center;
        margin-top: 60px;
        padding-top: 20px;
        border-top: 1px solid var(--border);
        font-size: 10px;
        color: var(--muted);
        font-family: "Newsreader", serif;
        font-style: italic;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <header>
      <div class="brand">Recruiter in Your Pocket</div>
      <div class="meta">Official Studio Report • ${escapeHtml(generatedOn)}</div>
    </header>

    <div class="score-container">
        <div>
            <div class="score-value">${Math.round(report.score || 0)}</div>
            <div class="score-label">Recruiter Impact Score</div>
        </div>
        <div class="score-summary">
            ${escapeHtml(report.summary)}
        </div>
    </div>

    <div class="analysis-grid">
        <div>
             <h2>What's Working</h2>
             <ul class="strengths">${listHtml(report.strengths)}</ul>
        </div>
        <div>
             <h2>Missed Opportunities</h2>
             <ul class="gaps">${listHtml(report.gaps)}</ul>
        </div>
    </div>

    <h2>The Work (Suggested Edits)</h2>
    ${rewriteHtml(report.rewrites)}

    ${Array.isArray(report.missing_wins) && report.missing_wins.length
      ? `<h2>Undersold Wins</h2><ul>${listHtml(report.missing_wins)}</ul>`
      : ""}

    <h2>Next Steps</h2>
    <ul class="gaps">${listHtml(report.next_steps)}</ul>

    <footer>
        Generated by the Studio AI • recruiterinyourpocket.com
    </footer>
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

