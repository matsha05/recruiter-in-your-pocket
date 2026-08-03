import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReportForPdf } from "../reports/pdf-export";
import { pdfReportStyles } from "./pdf-styles";

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
  const generatedOn = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
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
      const action = fix?.fix;
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
  <style>${pdfReportStyles(SPACE_GROTESK_TTF, INSTRUMENT_SANS_TTF)}</style>
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
        <div class="score-name">Clarity summary</div>
        <div class="score-value">${Math.round(report.score || 0)}<span>/100</span></div>
        <div class="score-band">${escapeHtml(report.score_label || "Needs more context")}</div>
        <div class="score-scale">Not a prediction of interviews or offers.</div>
      </div>
    </div>
    <div class="score-note">
      <strong>What this means:</strong> a quick summary of this document's clarity. It is not an ATS ranking or a prediction of interviews or offers.
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
