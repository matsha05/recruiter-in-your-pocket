import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReportForPdf, WorklistForPdf } from "../reports/pdf-export";
import { criticalCountHeading, fixLabel, fixPlanHeadingForCount, missingFromResume, readCriticalMisses, TIGHTENING_HEADING } from "../reports/report-presentation";
import { marginNoteFromFix } from "../reports/revised-line";
import { SCORE_BANDS, WORKLIST_BANDS, reportTone, scoreBandIndex, worklistBandIndex } from "../reports/score-band";
import { hasRoleSection, POSTING_MISSING_HOW, POSTING_MISSING_LABEL, screenerNote, screenerTitle, worklistLevelParts, worklistReadFor } from "../reports/worklist-presentation";
import { pdfReportStyles } from "./pdf-styles";

/**
 * Alpine report PDF generator
 * 
 * Design principles:
 * 1. The same document as the web report: Verdict and score band, then the marked lines
 * 2. Stable evidence colors instead of traffic-light scoring; the number appears only in comparisons
 * 3. Literata for the recruiter's voice, Schibsted Grotesk for everything else
 * 4. Page-safe sections and printable action checkboxes
 */

function escapeHtml(str: string) {
  return String(str || "")
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const fontBase64 = (...segments: string[]) => readFileSync(join(process.cwd(), "public", "fonts", ...segments)).toString("base64");
const PDF_FONTS = {
  voice: fontBase64("literata", "Literata-Variable.woff2"),
  // The wordmark's italic "in" (direction C, Two Voices): a real italic, not a synthesized slant.
  voiceItalic: fontBase64("literata", "Literata-Italic.woff"),
  ui: fontBase64("schibsted-grotesk", "SchibstedGrotesk-Variable.woff2"),
};

function firstSentence(value: string): string {
  const normalized = String(value || "").trim();
  if (!normalized) return "Your resume report";
  const match = normalized.match(/^(.+?[.!?])(?:\s|$)/);
  const sentence = match?.[1] || normalized;
  return sentence.length > 220 ? `${sentence.slice(0, 217).trimEnd()}...` : sentence;
}

/** The example's bracketed blanks in the candidate's blue, or the filled line when the person answered. */
function exampleHtml(card: WorklistForPdf["cards"][number]) {
  if (card.filled) return `<div class="card-example"><span class="blank-filled">${escapeHtml(card.filled)}</span><div class="card-example-note">Your line, with the blanks filled from your answers.</div></div>`;
  if (!card.example) return "";
  const html = escapeHtml(card.example).replace(/\[([^\]]*)\]/gu, (_, label: string) => `<span class="blank">[${label}]</span>`);
  return `<div class="card-example">${html}</div>`;
}

function renderWorklistHtml(report: ReportForPdf, worklist: WorklistForPdf) {
  const generatedOn = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  const bandIndex = Math.max(0, worklistBandIndex(report.score));
  const band = WORKLIST_BANDS[bandIndex];
  const work = worklist.cards.filter((card) => card.kind !== "keep");
  const heading = work.length === 0 ? "Nothing here needs work." : "Lines that need work.";
  const cardHtml = (card: WorklistForPdf["cards"][number]) => {
    const keep = card.kind === "keep";
    const quoted = card.kind === "line" || card.kind === "keep";
    const line = quoted
      ? `<div class="card-line${keep ? " ink" : ""}">${keep ? escapeHtml(card.line) : `<span class="miss-mark">${escapeHtml(card.line)}</span>`}</div>`
      : `<div class="card-statement">${escapeHtml(card.line)}</div>`;
    return `<div class="card${keep ? " keep" : ""}">
        <div class="card-where">${keep ? "Don't touch this one" : escapeHtml(card.where)}${keep ? '<span class="card-where-quiet">Write the others like it.</span>' : ""}</div>
        ${line}
        <div class="pen-note">${escapeHtml(card.cannot_tell)}</div>
        ${!keep && card.question ? `<div class="card-question">${escapeHtml(card.question)}</div>` : ""}
        ${keep ? "" : exampleHtml(card)}
      </div>`;
  };
  const fit = worklist.fit;
  // Without a posting, where else the experience points, after the cards; with one, its fit is in the first pass.
  const fitHtml = hasRoleSection(worklist) ? `
    <section class="section alignment-section">
      <div class="section-kicker">Role fit</div>
      <h2>Roles your experience points toward</h2>
      ${fit.note ? `<div class="positioning-suggestion"><p>${escapeHtml(fit.note)}</p></div>` : ""}
      ${fit.roles.length ? `<div class="tag-row"><span class="tag-label">Roles to consider</span>${fit.roles.map((role) => `<span class="tag">${escapeHtml(role)}</span>`).join("")}</div>` : ""}
    </section>` : "";

  // The first pass, as on the web report (Nov 7, 2026): a line written to screening software, then which job,
  // what level and the posting, each with its reason, then the posting's fit.
  const read = worklistReadFor(worklist);
  const level = worklistLevelParts(read.level, read.role);
  const screener = worklist.screener_text ?? [];
  const sortCell = (question: string, answer: string, why?: string | null) =>
    `<div><div class="sort-q">${escapeHtml(question)}</div><div class="sort-a">${escapeHtml(answer)}</div>${why ? `<div class="sort-why">${escapeHtml(why)}</div>` : ""}</div>`;
  const firstPassHtml = read.role || level || screener.length ? `
    <div class="first-pass">
      ${screener.length ? `<div class="stop">
        <div class="stop-title">${escapeHtml(screenerTitle(screener.length > 1))}</div>
        ${screener.map((finding) => `<div class="stop-line">${escapeHtml(finding.excerpt)}</div>`).join("")}
        <div class="stop-note">${escapeHtml(screenerNote(screener))}</div>
      </div>` : ""}
      ${read.role || level ? `<div class="sort">
        ${read.role ? sortCell("Which job is this for?", read.role, fit.why) : ""}
        ${level ? sortCell("What level?", level.level, level.because) : ""}
        ${read.hasPosting ? sortCell("Your posting", read.postingRole || "The job you added") : ""}
      </div>` : ""}
      ${read.hasPosting && (fit.note || fit.posting.missing.length) ? `<div class="posting-fit">
        ${fit.note ? `<p class="note">${escapeHtml(fit.note)}</p>` : ""}
        ${fit.posting.missing.length ? `<div class="label">${escapeHtml(POSTING_MISSING_LABEL)}</div><ul>${fit.posting.missing.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><div class="how">${escapeHtml(POSTING_MISSING_HOW)}</div>` : ""}
      </div>` : ""}
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Resume report | Recruiter in Your Pocket</title>
  <style>${pdfReportStyles(PDF_FONTS)}</style>
</head>
<body>
  <header>
    <div class="brand-block">
      <div class="brand-wordmark">Recruiter <span class="brand-in">in</span> Your Pocket</div>
      <div class="tagline">Resume report</div>
    </div>
    <div class="date">${escapeHtml(generatedOn)}</div>
  </header>

  <section class="hero">
    <div class="score-row">
      <div class="score">${report.score}</div>
      <div class="band">
        <div class="band-name">${escapeHtml(band.name)}</div>
        <div class="band-scale">${WORKLIST_BANDS.map((_, index) => `<span class="band-bar${index === bandIndex ? " current" : ""}"></span>`).join("")}</div>
        <div class="band-anchor">${escapeHtml(band.anchor)}</div>
      </div>
    </div>
    <h1>${escapeHtml(worklist.verdict)}</h1>
    ${firstPassHtml}
    <div class="write-up">${worklist.write_up.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
    <div class="score-note">The band is what a recruiter would do with your resume after one pass; the number says where in the band you sit. Neither predicts interviews or offers.${worklist.lifted_by_employer ? " A recent employer recruiters know on sight moved this resume up one band." : ""}</div>
  </section>

  <section class="section priority-section">
    <div class="section-kicker">${work.length === 0 ? "Before you send it" : "Lines that need work"}</div>
    <div class="section-header"><h2>${escapeHtml(heading)}</h2>${work.length === 0 ? '<p class="count-lead">Send it. Then read it against the posting you\'re going for.</p>' : ""}</div>
    ${worklist.cards.map(cardHtml).join("")}
    ${work.length > 0 ? '<p class="unlisted">Lines not listed are fine as written.</p>' : ""}
  </section>

  ${fitHtml}

  <footer>
    <div>A recruiter&rsquo;s review criteria, applied by AI. Every fact in an example is your resume&rsquo;s or yours; the blanks are yours to fill.</div>
    <div style="white-space: nowrap">recruiterinyourpocket.com</div>
  </footer>
</body>
</html>`;
}

export function renderReportHtml(report: ReportForPdf) {
  if (report.worklist) return renderWorklistHtml(report, report.worklist);
  const generatedOn = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  // Same order as the web report: the Verdict and score band, then the marked lines, Critical Miss first.
  const verdict = report.first_impression || report.score_comment_short || firstSentence(report.summary);
  const verdictReason = report.score_comment_short && report.score_comment_short !== verdict ? report.score_comment_short : "";
  const fixes = (report.top_fixes || []).filter((fix) => fix?.fix).slice(0, 3);
  const misses = readCriticalMisses({ top_fixes: fixes, more_critical: report.more_critical });
  // The same tone rule as the web report: a clear page with one miss gets the question, not a count.
  const tone = reportTone(report.score, misses);
  const countHeading = criticalCountHeading(misses, tone);
  const ready = tone === "ready" && misses.count === 1;
  const bandIndex = Math.max(0, scoreBandIndex(report.score));
  const band = SCORE_BANDS[bandIndex];
  const [keepFirst, ...keepRest] = report.strengths || [];

  // Checkbox action items
  const checkboxListHtml = (items: string[] = []) =>
    items.map((item) => `<li><span class="checkbox" aria-hidden="true"></span><span>${escapeHtml(item)}</span></li>`).join("");

  const signalListHtml = (items: string[] = [], tone: "lands" | "context") =>
    items.map((item) => `<li><span class="signal-marker ${tone}" aria-hidden="true"></span><span>${escapeHtml(item)}</span></li>`).join("");

  // Each marked line: the candidate's words on the left, the recruiter's note in the margin, as on the web.
  const markedRowHtml = (fix: NonNullable<ReportForPdf["top_fixes"]>[number], index: number) => {
    const miss = index < misses.count;
    const label = fixLabel(index, misses, tone, fixes.length);
    const questions = fix.questions || [];
    const line = escapeHtml(fix.line || "");
    // An absence ("No summary section present") is shown as what's missing; nothing is quoted or marked.
    const missing = missingFromResume(fix.line || "");
    return `<div class="marked-row">
        <div>
          ${fix.section ? `<div class="marked-section">${escapeHtml(fix.section)}</div>` : ""}
          ${missing ? `<div class="marked-missing${miss ? " miss" : ""}">${escapeHtml(missing)}</div>`
            : miss ? `<div class="marked-line"><span class="miss-mark">${line}</span></div>` : `<div class="marked-line ink">${line}</div>`}
          ${fix.revised ? `<div class="marked-revised"><div class="marked-revised-label">Your revised line</div><div class="marked-revised-text">${escapeHtml(fix.revised)}</div><div class="marked-revised-note">Built from your line and your answers.</div></div>` : ""}
        </div>
        <div>
          <div class="marked-label${miss ? " miss" : ""}">${label}</div>
          ${index === 0 && !countHeading ? `<div class="marked-definition">The one thing to fix first</div>` : ""}
          <div class="pen-note">${escapeHtml(marginNoteFromFix(fix.fix || ""))}</div>
          ${fix.why ? `<div class="marked-why">${escapeHtml(fix.why)}</div>` : ""}
          ${questions.length ? `<div class="marked-questions"><div class="marked-questions-label">What to add</div>${questions.map((question) => `<div class="marked-question">${escapeHtml(question)}</div>`).join("")}</div>` : ""}
        </div>
      </div>`;
  };

  // Rewrites with page-break protection
  const rewriteHtml = (rewrites: ReportForPdf["rewrites"] = []) =>
    rewrites
      .map((r, index) => {
        if (!r) return "";
        const isTemplate = /\[[^\]]+\]/.test(r.better);
        const noteHtml = r.enhancement_note ? `<div class="note"><strong>${isTemplate ? "Details to add" : "Before you use this"}</strong><span>${escapeHtml(r.enhancement_note)}</span></div>` : "";
        return `
          <div class="rewrite-card">
            <div class="rewrite-heading">
              <span>Line ${String(index + 1).padStart(2, "0")}</span>
              ${r.label ? `<span>${escapeHtml(r.label)}</span>` : ""}
            </div>
            ${isTemplate ? noteHtml : ""}
            <div class="rewrite-grid">
              <div class="col original">
                <div class="col-label">Original</div>
                <div class="content">${escapeHtml(r.original)}</div>
              </div>
              <div class="col better">
                <div class="col-label">${isTemplate ? "Draft template" : "Suggested wording"}</div>
                <div class="content">${escapeHtml(r.better)}</div>
              </div>
            </div>
            ${isTemplate ? "" : noteHtml}
          </div>`;
      })
      .join("");



  // Job alignment uses a teaching surface, not a separate score palette.
  const jobAlignmentHtml = report.job_alignment ? `
    <section class="section alignment-section">
      <div class="section-kicker">Role fit</div>
      <h2>Roles to consider</h2>
      
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
  <title>Resume report | Recruiter in Your Pocket</title>
  <style>${pdfReportStyles(PDF_FONTS)}</style>
</head>
<body>
  <header>
    <div class="brand-block">
      <div class="brand-wordmark">Recruiter <span class="brand-in">in</span> Your Pocket</div>
      <div class="tagline">Resume report</div>
    </div>
    <div class="date">${escapeHtml(generatedOn)}</div>
  </header>

  <section class="hero">
    <div class="verdict-label">Verdict</div>
    <h1>${escapeHtml(verdict)}</h1>
    ${verdictReason ? `<p class="hero-summary">${escapeHtml(verdictReason)}</p>` : ""}
    <div class="band">
      <div class="band-name">${escapeHtml(band.name)}</div>
      <div class="band-scale">${SCORE_BANDS.map((_, index) => `<span class="band-bar${index === bandIndex ? " current" : ""}"></span>`).join("")}</div>
      <div class="band-anchor">${escapeHtml(band.anchor)}</div>
    </div>
    <div class="score-note">How clearly your resume shows your work today. It doesn't predict interviews or offers.</div>
  </section>

  ${fixes.length ? `
    <section class="section priority-section">
      <div class="section-kicker">${ready ? "Before you send it" : "Fix these first"}</div>
      ${countHeading
        ? `<div class="section-header count-head"><h2>${escapeHtml(countHeading.title)}</h2><p class="count-lead">${escapeHtml(countHeading.lead)}</p></div>`
        : `<div class="section-header"><h2>${escapeHtml(fixPlanHeadingForCount(fixes.length))}</h2></div>`}
      ${fixes.slice(0, misses.count).map((fix, index) => markedRowHtml(fix, index)).join("")}
      ${report.structural_gaps?.length ? `<div class="page-note gap"><div class="page-note-label">Before the bullets</div>${report.structural_gaps.map((gap) => `<p>${escapeHtml(gap)}</p>`).join("")}</div>` : ""}
      ${keepFirst ? `<div class="page-note"><div class="page-note-label">Keep this one</div><p>${escapeHtml(keepFirst)}</p></div>` : ""}
      ${ready && fixes.length > 1 ? `<div class="section-header"><h2>${escapeHtml(TIGHTENING_HEADING)}</h2></div>` : ""}
      ${fixes.slice(misses.count).map((fix, offset) => markedRowHtml(fix, offset + misses.count)).join("")}
    </section>
  ` : ""}

  ${keepRest.length || (!fixes.length && keepFirst) ? `
  <section class="signal-panel lands keep-section">
    <div class="section-kicker">Keep these</div>
    <h2>Keep these. They&rsquo;re working.</h2>
    <ul>${signalListHtml(fixes.length ? keepRest : report.strengths, "lands")}</ul>
  </section>
  ` : ""}

  ${report.rewrites.length ? `
    <section class="section">
      <div class="section-kicker">More from your resume</div>
      <div class="section-header"><h2>More lines worth a second look.</h2></div>
      ${report.rewrites.some((rewrite) => /\[[^\]]+\]/.test(rewrite.better)) ? '<div class="note"><strong>About the brackets</strong><span>Fill in the brackets with your own facts before you use a draft.</span></div>' : ""}
      ${rewriteHtml(report.rewrites)}
    </section>
  ` : ""}

  ${jobAlignmentHtml}

  <div style="break-inside: avoid; page-break-inside: avoid;">
  ${report.next_steps.length ? `
    <section class="section">
      <div class="section-kicker">Working list</div>
      <div class="section-header"><h2>Next steps</h2></div>
      <ul>${checkboxListHtml(report.next_steps)}</ul>
    </section>
  ` : ""}

  <footer>
    <div>A recruiter&rsquo;s review criteria, applied by AI. Check every suggested detail against what you actually did.</div>
    <div style="white-space: nowrap">recruiterinyourpocket.com</div>
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
      defaultViewport: { width: 1200, height: 1600 },
      executablePath: await chromium.executablePath(),
      headless: "shell",
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

    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 30000 });
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
