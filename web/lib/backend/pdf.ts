import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";

/**
 * Editorial-Grade PDF Generator
 * 
 * Design principles:
 * 1. Wide margins (25mm) for pen annotations
 * 2. Checkboxes on action items for physical tick-off
 * 3. Self-explanatory context header
 * 4. Page breaks between major sections
 * 5. Vector branding (inline SVG)
 */

export type ReportForPdf = {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  rewrites: Array<{ label?: string; original: string; better: string; enhancement_note?: string }>;
  next_steps: string[];
  score_label?: string;
  score_comment_short?: string;
  generated_on?: string;
  missing_wins?: string[];
  subscores?: { impact?: number; clarity?: number; story?: number; readability?: number };
  top_fixes?: Array<{ fix?: string; text?: string; why?: string }>;
  job_alignment?: {
    positioning_suggestion?: string;
    role_fit?: {
      best_fit_roles?: string[];
      stretch_roles?: string[];
      seniority_read?: string;
      industry_signals?: string[];
      company_stage_fit?: string;
    };
  };
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

// PocketMark logo SVG for PDF header - inline for reliability
const POCKET_MARK_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 8px;">
  <rect x="4" y="4" width="16" height="16" rx="4" stroke="#0d9488" stroke-width="1.5" fill="none"/>
  <path d="M4 10 L20 10" stroke="#0d9488" stroke-width="1.5"/>
  <path d="M9 13.5 L9 17" stroke="#0d9488" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M9 13.5 H12 C13.6569 13.5 15 14.8431 15 16.5 C15 16.7761 14.7761 17 14.5 17 H9" stroke="#0d9488" stroke-width="1.5" stroke-linecap="round" fill="none"/>
</svg>`;

// Combined brand header with logo + wordmark
const BRAND_HEADER = `<span style="display: inline-flex; align-items: center;">${POCKET_MARK_SVG}<span style="font-family: 'Fraunces', Georgia, serif; font-size: 18pt; font-weight: 500; letter-spacing: -0.02em;">Recruiter in Your Pocket</span></span>`;

function getScoreColor(score: number): string {
  if (score >= 85) return "#22c55e"; // --success (green)
  if (score >= 70) return "#d97706"; // --warning (amber)
  return "#dc2626"; // --destructive (red)
}

function getSubscoreBar(value: number | undefined): string {
  if (value === undefined) return "";
  const color = getScoreColor(value);
  const width = Math.min(100, Math.max(0, value));
  return `<div style="height: 4px; background: #e5e5e5; border-radius: 2px; margin-top: 4px;">
    <div style="height: 100%; width: ${width}%; background: ${color}; border-radius: 2px;"></div>
  </div>`;
}

export async function renderReportHtml(report: ReportForPdf) {
  const generatedOn =
    typeof report.generated_on === "string" && report.generated_on.trim()
      ? report.generated_on
      : new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  const scoreColor = getScoreColor(report.score);

  // Checkbox action items
  const checkboxListHtml = (items: string[] = []) =>
    items.map((i) => `<li><span class="checkbox">☐</span> ${escapeHtml(i)}</li>`).join("");

  // Regular list items
  const listHtml = (items: string[] = []) =>
    items.map((i) => `<li><span>${escapeHtml(i)}</span></li>`).join("");

  // Top fixes with checkboxes
  const topFixesHtml = (fixes: ReportForPdf["top_fixes"] = []) =>
    fixes.map((f) => f?.fix || f?.text ? `<li><span class="checkbox">☐</span> ${escapeHtml(f.fix || f.text || "")}</li>` : "").join("");

  // Rewrites with page-break protection
  const rewriteHtml = (rewrites: ReportForPdf["rewrites"] = []) =>
    rewrites
      .map((r) => {
        if (!r) return "";
        return `
          <div class="rewrite-card">
            <div class="rewrite-grid">
              <div class="col original">
                <div class="col-label">Before</div>
                <div class="content">${escapeHtml(r.original)}</div>
              </div>
              <div class="col better">
                <div class="col-label">After</div>
                <div class="content">${escapeHtml(r.better)}</div>
              </div>
            </div>
            ${r.enhancement_note ? `<div class="note"><strong>Why:</strong> ${escapeHtml(r.enhancement_note)}</div>` : ""}
          </div>`;
      })
      .join("");

  // Subscores section
  const subscoresHtml = report.subscores ? `
    <div class="subscores-grid">
      <div class="subscore">
        <div class="subscore-label">Story</div>
        <div class="subscore-value">${report.subscores.story ?? "—"}</div>
        ${getSubscoreBar(report.subscores.story)}
      </div>
      <div class="subscore">
        <div class="subscore-label">Impact</div>
        <div class="subscore-value">${report.subscores.impact ?? "—"}</div>
        ${getSubscoreBar(report.subscores.impact)}
      </div>
      <div class="subscore">
        <div class="subscore-label">Clarity</div>
        <div class="subscore-value">${report.subscores.clarity ?? "—"}</div>
        ${getSubscoreBar(report.subscores.clarity)}
      </div>
      <div class="subscore">
        <div class="subscore-label">Readability</div>
        <div class="subscore-value">${report.subscores.readability ?? "—"}</div>
        ${getSubscoreBar(report.subscores.readability)}
      </div>
    </div>
  ` : "";

  // Job alignment section - comprehensive version matching web report
  const jobAlignmentHtml = report.job_alignment ? `
    <section class="section">
      <h2>Where You Compete</h2>
      
      ${report.job_alignment.role_fit?.best_fit_roles?.length ? `
        <div class="tag-row">
          <span class="tag-label">Best Fit Roles:</span>
          ${report.job_alignment.role_fit.best_fit_roles.map(r => `<span class="tag">${escapeHtml(r)}</span>`).join("")}
        </div>
      ` : ""}
      
      ${report.job_alignment.role_fit?.stretch_roles?.length ? `
        <div class="tag-row">
          <span class="tag-label">Stretch Roles:</span>
          ${report.job_alignment.role_fit.stretch_roles.map(r => `<span class="tag tag-stretch">${escapeHtml(r)}</span>`).join("")}
        </div>
      ` : ""}
      
      ${report.job_alignment.positioning_suggestion ? `
        <div class="positioning-suggestion">
          <p>${escapeHtml(report.job_alignment.positioning_suggestion)}</p>
        </div>
      ` : ""}
      
      <div class="alignment-meta">
        ${report.job_alignment.role_fit?.seniority_read ? `
          <span class="meta-item"><strong>Seniority:</strong> ${escapeHtml(report.job_alignment.role_fit.seniority_read)}</span>
        ` : ""}
        ${report.job_alignment.role_fit?.company_stage_fit ? `
          <span class="meta-item"><strong>Company Stage:</strong> ${escapeHtml(report.job_alignment.role_fit.company_stage_fit)}</span>
        ` : ""}
        ${report.job_alignment.role_fit?.industry_signals?.length ? `
          <span class="meta-item"><strong>Industries:</strong> ${report.job_alignment.role_fit.industry_signals.map(s => escapeHtml(s)).join(" · ")}</span>
        ` : ""}
      </div>
    </section>
  ` : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Resume Audit — Recruiter in Your Pocket</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600&family=Geist+Mono&display=swap');
    
    :root {
      /* Aligned with site's globals.css */
      --foreground: #121212; /* Matches 0 0% 7% */
      --muted: #6b7280; /* Slate-500 */
      --border: #e5e7eb; /* Matches input */
      --surface: #ffffff;
      --wash: #fafafa; /* Matches background */
      --brand: #0d9488; /* Teal-600 - site's brand */
      --success: #22c55e; /* Green for good scores */
      --success-bg: #f0fdf4;
      --warning: #d97706; /* Amber for medium scores */
      --destructive: #dc2626; /* Red for low scores */
    }

    @page {
      size: A4;
      margin: 25mm;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: "Inter", -apple-system, sans-serif;
      color: var(--foreground);
      background: var(--surface);
      font-size: 11pt;
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
    }

    /* Header */
    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--foreground);
    }

    .brand-block {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .brand-wordmark {
      color: var(--foreground);
    }

    .tagline {
      font-size: 9pt;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 500;
    }

    .date {
      font-size: 9pt;
      color: var(--muted);
      text-align: right;
    }

    /* Context Intro */
    .intro {
      background: var(--wash);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 16px 20px;
      margin-bottom: 28px;
      font-size: 10pt;
      color: var(--muted);
    }

    /* Score Block */
    .score-block {
      display: flex;
      gap: 32px;
      margin-bottom: 28px;
      padding-bottom: 28px;
      border-bottom: 1px solid var(--border);
    }

    .score-main {
      text-align: center;
      min-width: 100px;
    }

    .score-value {
      font-family: "Fraunces", Georgia, serif;
      font-size: 54pt;
      font-weight: 600;
      line-height: 1.1;
      color: ${scoreColor};
      letter-spacing: -0.02em;
    }

    .score-label {
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
      margin-top: 8px;
      font-weight: 600;
    }

    .score-summary {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .recruiter-note {
      font-family: "Fraunces", Georgia, serif;
      font-size: 13pt;
      font-style: italic;
      color: var(--foreground);
      border-left: 3px solid ${scoreColor};
      padding-left: 16px;
      margin-bottom: 12px;
      line-height: 1.5;
    }

    .summary-text {
      font-size: 10pt;
      color: var(--muted);
      line-height: 1.6;
    }

    /* Subscores */
    .subscores-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 28px;
      padding-bottom: 28px;
      border-bottom: 1px solid var(--border);
    }

    .subscore {
      text-align: center;
    }

    .subscore-label {
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
      font-weight: 600;
      margin-bottom: 4px;
    }

    .subscore-value {
      font-family: "Fraunces", Georgia, serif;
      font-size: 22pt;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    /* Sections */
    .section {
      margin-bottom: 24px;
      page-break-inside: avoid;
    }

    h2 {
      font-family: "Fraunces", Georgia, serif;
      font-size: 13pt;
      font-weight: 500;
      color: var(--foreground);
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
      letter-spacing: -0.01em;
    }

    /* Lists */
    ul { 
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    li {
      margin-bottom: 8px;
      padding-left: 0;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 10pt;
    }

    .checkbox {
      font-size: 12pt;
      line-height: 1.2;
      color: var(--muted);
    }
    
    .strengths li::before {
      content: "✓";
      color: var(--moss);
      font-weight: bold;
      margin-right: 8px;
    }

    .gaps li::before {
      content: "!";
      color: var(--gold);
      font-weight: bold;
      margin-right: 8px;
    }

    /* Two-column grid */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 28px;
    }

    /* Rewrites */
    .rewrite-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      margin-bottom: 16px;
      overflow: hidden;
      page-break-inside: avoid;
    }
    
    .rewrite-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    
    .col {
      padding: 14px 16px;
    }
    
    .col.original {
      background: var(--wash);
      border-right: 1px solid var(--border);
    }
    
    .col-label {
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 6px;
      color: var(--muted);
      font-weight: 600;
    }
    
    .content {
      font-size: 10pt;
      color: var(--foreground);
      line-height: 1.5;
    }

    .note {
      padding: 12px 16px;
      background: var(--moss-bg);
      font-size: 9pt;
      color: #14532d;
      border-top: 1px solid var(--border);
    }

    /* Tags */
    .tag-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .tag-label {
      font-size: 9pt;
      color: var(--muted);
      font-weight: 500;
    }

    .tag {
      display: inline-block;
      padding: 4px 10px;
      background: var(--wash);
      border: 1px solid var(--border);
      border-radius: 4px;
      font-size: 9pt;
      font-weight: 500;
    }

    .seniority-read {
      font-size: 10pt;
      color: var(--foreground);
      font-style: italic;
    }

    .tag-stretch {
      background: transparent;
      border-style: dashed;
    }

    .positioning-suggestion {
      margin: 16px 0;
      padding: 16px;
      background: var(--wash);
      border-left: 3px solid var(--brand);
      border-radius: 0 4px 4px 0;
    }

    .positioning-suggestion p {
      font-size: 10pt;
      line-height: 1.6;
      color: var(--foreground);
      margin: 0;
    }

    .alignment-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border);
      font-size: 9pt;
      color: var(--muted);
    }

    .meta-item {
      display: inline;
    }

    .meta-item strong {
      color: var(--foreground);
    }

    /* Footer */
    footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <header>
    <div class="brand-block">
      <div class="brand-wordmark">${BRAND_HEADER}</div>
      <div class="tagline">Confidential Resume Audit</div>
    </div>
    <div class="date">${escapeHtml(generatedOn)}</div>
  </header>

  <div class="intro">
    <strong>How to use this document:</strong> This is what a recruiter sees in the first 6 seconds. 
    Use the checkboxes to track your fixes. Share with a mentor for feedback.
  </div>

  <div class="score-block">
    <div class="score-main">
      <div class="score-value">${Math.round(report.score || 0)}</div>
      <div class="score-label">${escapeHtml(report.score_label || "Recruiter Impact Score")}</div>
    </div>
    <div class="score-summary">
      <div class="summary-text">${escapeHtml(report.summary)}</div>
    </div>
  </div>

  ${subscoresHtml}

  <div class="two-col">
    <div class="section">
      <h2>What's Working</h2>
      <ul class="strengths">${listHtml(report.strengths)}</ul>
    </div>
    <div class="section">
      <h2>Missed Opportunities</h2>
      <ul class="gaps">${listHtml(report.gaps)}</ul>
    </div>
  </div>

  ${report.top_fixes?.length ? `
    <section class="section">
      <h2>Priority Fixes</h2>
      <ul>${topFixesHtml(report.top_fixes)}</ul>
    </section>
  ` : ""}

  <section class="section">
    <h2>The Work — Bullet Upgrades</h2>
    ${rewriteHtml(report.rewrites)}
  </section>

  ${Array.isArray(report.missing_wins) && report.missing_wins.length ? `
    <section class="section">
      <h2>Undersold Wins</h2>
      <ul>${checkboxListHtml(report.missing_wins)}</ul>
    </section>
  ` : ""}

  ${jobAlignmentHtml}

  <section class="section">
    <h2>Next Steps</h2>
    <ul>${checkboxListHtml(report.next_steps)}</ul>
  </section>

  <footer>
    <div>Generated by Recruiter in Your Pocket Studio</div>
    <div>recruiterinyourpocket.com</div>
  </footer>
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
      margin: { top: "25mm", right: "25mm", bottom: "25mm", left: "25mm" }
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
