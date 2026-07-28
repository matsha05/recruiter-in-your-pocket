import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReportForPdf } from "../reports/pdf-export";

/**
 * Lifted Line PDF generator
 * 
 * Design principles:
 * 1. Written recruiter verdict before the numeric summary
 * 2. Stable evidence colors instead of traffic-light scoring
 * 3. Space Grotesk for judgment and Instrument Sans for explanation
 * 4. Page-safe sections and printable action checkboxes
 */

function escapeHtml(str: string) {
  return String(str || "")
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const SPACE_GROTESK_TTF = readFileSync(
  join(process.cwd(), "public", "assets", "fonts", "space-grotesk-latin-variable.ttf")
).toString("base64");

const INSTRUMENT_SANS_TTF = readFileSync(
  join(process.cwd(), "public", "assets", "fonts", "instrument-sans-latin-variable.ttf")
).toString("base64");

function getSubscoreBar(value: number | undefined): string {
  if (value === undefined) return "";
  const width = Math.min(99, Math.max(0, value));
  return `<div class="metric-track"><div class="metric-fill" style="width: ${width}%;"></div></div>`;
}

function firstSentence(value: string): string {
  const normalized = String(value || "").trim();
  if (!normalized) return "Your recruiter first read";
  const match = normalized.match(/^(.+?[.!?])(?:\s|$)/);
  const sentence = match?.[1] || normalized;
  return sentence.length > 220 ? `${sentence.slice(0, 217).trimEnd()}...` : sentence;
}

export function renderReportHtml(report: ReportForPdf) {
  const generatedOn =
    typeof report.generated_on === "string" && report.generated_on.trim()
      ? report.generated_on
      : new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const verdict = report.score_comment_short || firstSentence(report.summary);
  const showSummary = report.summary.trim() !== verdict.trim();

  // Checkbox action items
  const checkboxListHtml = (items: string[] = []) =>
    items.map((item) => `<li><span class="checkbox" aria-hidden="true"></span><span>${escapeHtml(item)}</span></li>`).join("");

  const signalListHtml = (items: string[] = [], tone: "lands" | "context") =>
    items.map((item) => `<li><span class="signal-marker ${tone}" aria-hidden="true"></span><span>${escapeHtml(item)}</span></li>`).join("");

  // Top fixes carry the action and the reason together.
  const topFixesHtml = (fixes: ReportForPdf["top_fixes"] = []) =>
    fixes.map((fix, index) => {
      const action = fix?.fix || fix?.text;
      if (!action) return "";
      return `<li class="priority-item">
        <span class="priority-number">${String(index + 1).padStart(2, "0")}</span>
        <span class="priority-copy">
          <strong>${escapeHtml(action)}</strong>
          ${fix.why ? `<span>${escapeHtml(fix.why)}</span>` : ""}
        </span>
      </li>`;
    }).join("");

  // Rewrites with page-break protection
  const rewriteHtml = (rewrites: ReportForPdf["rewrites"] = []) =>
    rewrites
      .map((r, index) => {
        if (!r) return "";
        return `
          <div class="rewrite-card">
            <div class="rewrite-heading">
              <span>Rewrite ${String(index + 1).padStart(2, "0")}</span>
              ${r.label ? `<span>${escapeHtml(r.label)}</span>` : ""}
            </div>
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
            ${r.enhancement_note ? `<div class="note"><strong>Why this is stronger</strong><span>${escapeHtml(r.enhancement_note)}</span></div>` : ""}
          </div>`;
      })
      .join("");

  // Subscores section
  const subscoresHtml = report.subscores ? `
    <div class="subscores-grid">
      <div class="subscore">
        <div class="subscore-label">Story</div>
        <div class="subscore-value">${report.subscores.story ?? "Not scored"}</div>
        ${getSubscoreBar(report.subscores.story)}
      </div>
      <div class="subscore">
        <div class="subscore-label">Impact</div>
        <div class="subscore-value">${report.subscores.impact ?? "Not scored"}</div>
        ${getSubscoreBar(report.subscores.impact)}
      </div>
      <div class="subscore">
        <div class="subscore-label">Clarity</div>
        <div class="subscore-value">${report.subscores.clarity ?? "Not scored"}</div>
        ${getSubscoreBar(report.subscores.clarity)}
      </div>
      <div class="subscore">
        <div class="subscore-label">Readability</div>
        <div class="subscore-value">${report.subscores.readability ?? "Not scored"}</div>
        ${getSubscoreBar(report.subscores.readability)}
      </div>
    </div>
  ` : "";

  // Job alignment uses a teaching surface, not a separate score palette.
  const jobAlignmentHtml = report.job_alignment ? `
    <section class="section alignment-section">
      <div class="section-kicker">Positioning</div>
      <h2>Where you compete</h2>
      
      ${report.job_alignment.role_fit?.best_fit_roles?.length ? `
        <div class="tag-row">
          <span class="tag-label">Best-fit roles</span>
          ${report.job_alignment.role_fit.best_fit_roles.map(r => `<span class="tag">${escapeHtml(r)}</span>`).join("")}
        </div>
      ` : ""}
      
      ${report.job_alignment.role_fit?.stretch_roles?.length ? `
        <div class="tag-row">
          <span class="tag-label">Stretch roles</span>
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
          <span class="meta-item"><strong>Seniority</strong> ${escapeHtml(report.job_alignment.role_fit.seniority_read)}</span>
        ` : ""}
        ${report.job_alignment.role_fit?.company_stage_fit ? `
          <span class="meta-item"><strong>Company stage</strong> ${escapeHtml(report.job_alignment.role_fit.company_stage_fit)}</span>
        ` : ""}
        ${report.job_alignment.role_fit?.industry_signals?.length ? `
          <span class="meta-item"><strong>Industries</strong> ${report.job_alignment.role_fit.industry_signals.map(s => escapeHtml(s)).join(", ")}</span>
        ` : ""}
      </div>
    </section>
  ` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Recruiter first-read report | Recruiter in Your Pocket</title>
  <style>
    @font-face {
      font-family: "Space Grotesk Variable";
      src: url(data:font/ttf;base64,${SPACE_GROTESK_TTF}) format("truetype");
      font-style: normal;
      font-weight: 200 800;
      font-display: block;
    }

    @font-face {
      font-family: "Instrument Sans Variable";
      src: url(data:font/ttf;base64,${INSTRUMENT_SANS_TTF}) format("truetype");
      font-style: normal;
      font-weight: 400 700;
      font-stretch: 75% 100%;
      font-display: block;
    }

    :root {
      --page: #f7f5ef;
      --ink: #071722;
      --muted: #596570;
      --soft: #7c878e;
      --line: #ccd2d1;
      --control-line: #aeb8b7;
      --iris: #00738f;
      --iris-strong: #006784;
      --iris-tint: #d8f4fb;
      --sky: #e8f8fc;
      --sky-strong: #25bfea;
      --proof: #efede7;
      --apricot: #00738f;
      --butter: #c8f238;
      --butter-soft: #f3fad9;
      --white: #ffffff;
    }

    @page {
      size: A4;
      margin: 18mm 17mm 16mm;
      background: var(--page);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html { background: var(--page); }
    
    body {
      font-family: "Instrument Sans Variable", Arial, sans-serif;
      color: var(--ink);
      background: var(--page);
      font-size: 9.5pt;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
      font-variant-numeric: tabular-nums;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--ink);
    }

    .brand-wordmark {
      font-family: "Space Grotesk Variable", Arial, sans-serif;
      color: var(--ink);
      font-size: 18pt;
      font-weight: 470;
      line-height: 1;
      letter-spacing: -0.025em;
      font-optical-sizing: auto;
    }

    .tagline {
      margin-top: 5px;
      font-size: 7.2pt;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.11em;
      font-weight: 680;
    }

    .date {
      font-size: 8pt;
      color: var(--muted);
      text-align: right;
    }

    .hero {
      background: var(--sky);
      border-top: 4px solid var(--iris);
      padding: 22px 24px 21px;
      margin-bottom: 18px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 112px;
      gap: 25px;
      align-items: stretch;
    }

    .section-kicker {
      color: var(--iris-strong);
      font-size: 7.2pt;
      font-weight: 720;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      margin-bottom: 7px;
    }

    h1,
    h2 {
      font-family: "Space Grotesk Variable", Arial, sans-serif;
      font-optical-sizing: auto;
      color: var(--ink);
    }

    h1 {
      font-size: 24pt;
      font-weight: 470;
      line-height: 1.08;
      letter-spacing: -0.025em;
      max-width: 470px;
    }

    .hero-summary {
      color: var(--muted);
      font-size: 9.3pt;
      line-height: 1.58;
      margin-top: 13px;
      max-width: 500px;
    }

    .score-card {
      border-left: 1px solid var(--sky-strong);
      padding-left: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .score-value {
      font-family: "Space Grotesk Variable", Arial, sans-serif;
      font-size: 45pt;
      font-weight: 520;
      line-height: 0.88;
      color: var(--ink);
      letter-spacing: -0.045em;
      font-optical-sizing: auto;
    }

    .score-name {
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.11em;
      color: var(--muted);
      margin-bottom: 10px;
      font-weight: 700;
    }

    .score-band {
      color: var(--iris-strong);
      font-size: 8.2pt;
      line-height: 1.3;
      font-weight: 680;
      margin-top: 9px;
    }

    .score-scale {
      color: var(--soft);
      font-size: 7pt;
      margin-top: 4px;
    }

    .score-note {
      border-top: 1px solid var(--sky-strong);
      color: var(--muted);
      font-size: 7.6pt;
      line-height: 1.45;
      margin-top: 17px;
      padding-top: 10px;
    }

    .score-note strong {
      color: var(--ink);
      font-weight: 680;
    }

    .subscores-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0;
      margin-bottom: 22px;
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .subscore {
      padding: 11px 13px 12px;
      border-right: 1px solid var(--line);
    }

    .subscore:last-child { border-right: 0; }

    .subscore-label {
      font-size: 7pt;
      letter-spacing: 0.08em;
      color: var(--muted);
      font-weight: 680;
      margin-bottom: 3px;
    }

    .subscore-value {
      font-family: "Space Grotesk Variable", Arial, sans-serif;
      font-size: 18pt;
      font-weight: 520;
      line-height: 1.1;
      letter-spacing: -0.02em;
      font-optical-sizing: auto;
    }

    .metric-track {
      height: 3px;
      background: var(--iris-tint);
      margin-top: 7px;
      overflow: hidden;
    }

    .metric-fill {
      height: 100%;
      background: var(--iris);
    }

    .section {
      margin-bottom: 22px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 16px;
      margin-bottom: 11px;
      padding-bottom: 7px;
      border-bottom: 1px solid var(--line);
    }

    h2 {
      font-size: 16pt;
      font-weight: 500;
      line-height: 1.08;
      letter-spacing: -0.018em;
    }

    ul { 
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    li {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      font-size: 8.8pt;
      line-height: 1.48;
      margin-bottom: 8px;
    }

    .checkbox {
      width: 10px;
      height: 10px;
      border: 1.25px solid var(--iris);
      flex: 0 0 10px;
      margin-top: 2px;
    }

    .signal-marker {
      width: 8px;
      height: 8px;
      flex: 0 0 8px;
      margin-top: 3px;
      border-radius: 50%;
    }

    .signal-marker.lands { background: var(--iris); }
    .signal-marker.context { background: var(--apricot); }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 13px;
      margin-bottom: 22px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .signal-panel {
      padding: 16px 17px 13px;
      border-top: 3px solid;
    }

    .signal-panel.lands {
      background: var(--sky);
      border-color: var(--iris);
    }

    .signal-panel.context {
      background: var(--proof);
      border-color: var(--apricot);
    }

    .signal-panel h2 {
      font-size: 14pt;
      margin-bottom: 11px;
    }

    .priority-section {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: baseline;
      column-gap: 13px;
      background: var(--butter-soft);
      border-top: 3px solid var(--butter);
      padding: 12px 17px 8px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .priority-section > .section-kicker {
      margin-bottom: 7px;
    }

    .priority-section > .section-header {
      margin-bottom: 7px;
      padding: 0;
      border: 0;
    }

    .priority-section > .priority-list {
      grid-column: 1 / -1;
    }

    .priority-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 22px;
    }

    .priority-item {
      border-top: 1px solid rgba(164, 117, 0, 0.22);
      padding: 5px 0;
      margin: 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .priority-number {
      color: var(--iris-strong);
      font-size: 7pt;
      font-weight: 720;
      letter-spacing: 0.08em;
      flex: 0 0 20px;
      padding-top: 2px;
    }

    .priority-copy {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .priority-copy strong {
      color: var(--ink);
      font-size: 8.8pt;
      line-height: 1.35;
    }

    .priority-copy span {
      color: var(--muted);
      font-size: 7.8pt;
      line-height: 1.4;
    }

    .rewrite-card {
      background: var(--white);
      border: 1px solid var(--line);
      border-top: 3px solid var(--iris);
      margin-bottom: 9px;
      overflow: hidden;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .rewrite-heading {
      display: flex;
      justify-content: space-between;
      color: var(--muted);
      font-size: 7pt;
      font-weight: 700;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      padding: 6px 11px;
      border-bottom: 1px solid var(--line);
    }
    
    .rewrite-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    
    .col {
      padding: 10px 12px 11px;
    }
    
    .col.original {
      background: var(--proof);
      border-right: 1px solid var(--line);
    }

    .col.better {
      background: var(--sky);
    }
    
    .col-label {
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      margin-bottom: 7px;
      color: var(--muted);
      font-weight: 700;
    }
    
    .content {
      font-size: 9pt;
      color: var(--ink);
      line-height: 1.48;
    }

    .better .content {
      font-family: "Space Grotesk Variable", Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.38;
      font-weight: 480;
      font-optical-sizing: auto;
    }

    .note {
      display: grid;
      grid-template-columns: 112px 1fr;
      gap: 12px;
      padding: 7px 11px 8px;
      background: var(--butter-soft);
      border-top: 1px solid var(--line);
      font-size: 7.8pt;
      color: var(--muted);
    }

    .note strong {
      color: var(--ink);
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }

    .tag-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-bottom: 10px;
    }

    .tag-label {
      font-size: 7.5pt;
      color: var(--muted);
      font-weight: 680;
      margin-right: 4px;
    }

    .tag {
      display: inline-block;
      padding: 3px 7px;
      background: rgba(255, 255, 255, 0.55);
      border: 1px solid var(--sky-strong);
      border-radius: 2px;
      font-size: 7.5pt;
      font-weight: 600;
    }

    .tag-stretch {
      background: transparent;
      border-color: var(--control-line);
    }

    .positioning-suggestion {
      margin: 13px 0;
      padding: 13px 15px;
      background: rgba(255, 255, 255, 0.62);
      border-left: 3px solid var(--iris);
    }

    .positioning-suggestion p {
      font-family: "Space Grotesk Variable", Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.45;
      color: var(--ink);
      font-weight: 470;
      font-optical-sizing: auto;
      margin: 0;
    }

    .alignment-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 13px;
      margin-top: 11px;
      padding-top: 10px;
      border-top: 1px solid var(--sky-strong);
      font-size: 7.6pt;
      color: var(--muted);
    }

    .meta-item {
      display: inline;
    }

    .meta-item strong {
      color: var(--ink);
      margin-right: 4px;
    }

    .alignment-section {
      background: var(--sky);
      border-top: 3px solid var(--iris);
      padding: 17px 19px 15px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    footer {
      margin-top: 28px;
      padding-top: 11px;
      border-top: 1px solid var(--line);
      display: flex;
      justify-content: space-between;
      font-size: 7pt;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <header>
    <div class="brand-block">
      <div class="brand-wordmark">Recruiter in Your Pocket</div>
      <div class="tagline">Private recruiter report</div>
    </div>
    <div class="date">${escapeHtml(generatedOn)}</div>
  </header>

  <section class="hero">
    <div class="hero-grid">
      <div>
        <div class="section-kicker">Recruiter first read</div>
        <h1>${escapeHtml(verdict)}</h1>
        ${showSummary ? `<p class="hero-summary">${escapeHtml(report.summary)}</p>` : ""}
      </div>
      <div class="score-card">
        <div class="score-name">First-read score</div>
        <div class="score-value">${Math.round(report.score || 0)}</div>
        <div class="score-band">${escapeHtml(report.score_label || "Needs more context")}</div>
        <div class="score-scale">out of 99</div>
      </div>
    </div>
    <div class="score-note">
      <strong>What this means:</strong> a quick summary of this document's clarity. It is not an ATS ranking or a prediction about interviews.
    </div>
  </section>

  ${subscoresHtml}

  <div class="two-col">
    <section class="signal-panel lands">
      <div class="section-kicker">Caught attention</div>
      <h2>What lands</h2>
      <ul>${signalListHtml(report.strengths, "lands")}</ul>
    </section>
    <section class="signal-panel context">
      <div class="section-kicker">Needs context</div>
      <h2>What stays unclear</h2>
      <ul>${signalListHtml(report.gaps, "context")}</ul>
    </section>
  </div>

  ${report.top_fixes?.length ? `
    <section class="section priority-section">
      <div class="section-kicker">Evidence-backed priorities</div>
      <div class="section-header"><h2>Start here</h2></div>
      <ul class="priority-list">${topFixesHtml(report.top_fixes)}</ul>
    </section>
  ` : ""}

  ${report.rewrites.length ? `
    <section class="section">
      <div class="section-kicker">Strongest next wording</div>
      <div class="section-header"><h2>Bullet upgrades</h2></div>
      ${rewriteHtml(report.rewrites)}
    </section>
  ` : ""}

  ${Array.isArray(report.missing_wins) && report.missing_wins.length ? `
    <section class="section">
      <div class="section-kicker">Evidence to recover</div>
      <div class="section-header"><h2>Wins that are still hiding</h2></div>
      <ul>${checkboxListHtml(report.missing_wins)}</ul>
    </section>
  ` : ""}

  ${jobAlignmentHtml}

  ${report.next_steps.length ? `
    <section class="section">
      <div class="section-kicker">Working list</div>
      <div class="section-header"><h2>Next steps</h2></div>
      <ul>${checkboxListHtml(report.next_steps)}</ul>
    </section>
  ` : ""}

  <footer>
    <div>Generated by Recruiter in Your Pocket</div>
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
  const html = renderReportHtml(report);

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
    await page.evaluate(() => document.fonts.ready);
    const pdfBuffer = await page.pdf({
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" }
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
