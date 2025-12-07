/**
 * services/pdf.js
 * 
 * PDF generation service for resume reports.
 * Handles HTML rendering and Puppeteer-based PDF creation.
 */

/**
 * Validate that a report object has all required fields for PDF export
 */
function validateReportForPdf(report) {
    if (!report || typeof report !== "object") return false;

    const requiredArrays = ["strengths", "gaps", "rewrites", "next_steps"];
    for (const key of requiredArrays) {
        if (!Array.isArray(report[key])) return false;
    }

    if (typeof report.summary !== "string") return false;

    if (typeof report.score !== "number" || !Number.isFinite(report.score)) return false;
    const roundedScore = Math.round(report.score);
    if (roundedScore < 0 || roundedScore > 100) return false;

    const checkStringArray = (arr) =>
        arr.every((item) => typeof item === "string" && item.length <= 1000);

    if (!checkStringArray(report.strengths)) return false;
    if (!checkStringArray(report.gaps)) return false;
    if (!checkStringArray(report.next_steps)) return false;

    if (
        !report.rewrites.every(
            (r) =>
                r &&
                typeof r === "object" &&
                typeof r.label === "string" &&
                typeof r.original === "string" &&
                typeof r.better === "string" &&
                typeof r.enhancement_note === "string"
        )
    ) {
        return false;
    }

    return true;
}

/**
 * Render report data to HTML string for PDF generation
 */
async function renderReportHtml(report) {
    const generatedOn =
        typeof report.generated_on === "string" && report.generated_on.trim()
            ? report.generated_on
            : new Date().toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
    const escape = (str) =>
        String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    const rewriteHtml = (rewrites = []) =>
        rewrites
            .map((r) => {
                if (!r) return "";
                return `
        <div class="rewrite-row">
          <div class="rewrite-col">
            <div class="label">Original</div>
            <div class="text">${escape(r.original)}</div>
          </div>
          <div class="rewrite-col">
            <div class="label">Better</div>
            <div class="text">${escape(r.better)}</div>
          </div>
          ${r.enhancement_note
                        ? `<div class="enhancement">${escape(r.enhancement_note)}</div>`
                        : ""
                    }
        </div>`;
            })
            .join("");

    const listHtml = (items = []) =>
        items
            .map((item) => `<li>${escape(item)}</li>`)
            .join("");

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Resume Review — Recruiter in Your Pocket</title>
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Manrope:wght@400;500;600&display=swap");
    :root {
      --accent: #3341A6;
      --accent-dark: #26328C;
      --text-main: #0F172A;
      --text-soft: #334155;
      --text-muted: #64748B;
      --wash: #FAF9F6;
      --border-subtle: #d7dae3;
      --space-xs: 6px;
      --space-sm: 10px;
      --space-sm-alt: 12px;
      --space-md: 15px;
      --space-md-alt: 16px;
      --space-lg: 20px;
      --space-xl: 30px;
      --space-xl-alt: 24px;
      --space-2xl: 40px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Manrope", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text-main);
      background: var(--wash);
      padding: var(--space-md);
      font-size: 15px;
      line-height: 1.5;
    }
    .pdf-header {
      max-width: 760px;
      margin: 0 auto var(--space-sm);
      padding: 0 var(--space-sm);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-md-alt);
    }
    .pdf-header-left { display: flex; flex-direction: column; gap: 2px; }
    .pdf-header-title {
      font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text-main);
      text-transform: none;
      line-height: 1.1;
    }
    .pdf-header-subtitle {
      font-size: 12px;
      color: var(--text-muted);
      letter-spacing: 0.01em;
    }
    .pdf-header-right {
      text-align: right;
      font-size: 12px;
      color: var(--text-muted);
      letter-spacing: 0.01em;
    }
    .pdf-report-card {
      max-width: 760px;
      margin: var(--space-sm) auto 0;
      background: #ffffff;
      border: 1px solid rgba(12, 17, 32, 0.08);
      border-radius: 14px;
      padding: var(--space-xl-alt);
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
    }
    .stack-section {
      position: relative;
      padding-left: var(--space-xl-alt);
      margin: var(--space-xl) 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .stack-section::before {
      content: "";
      position: absolute;
      left: 0;
      top: 8px;
      bottom: 8px;
      width: 3px;
      background: linear-gradient(180deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 60%, transparent) 100%);
      border-radius: 999px;
      opacity: 0.7;
    }
    h1, h2 {
      font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.02em;
      margin-bottom: var(--space-sm);
      line-height: 1.25;
    }
    h1 { font-size: 26px; }
    h2 { font-size: 21px; }
    .subtext {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: var(--space-md-alt);
      line-height: 1.6;
      font-weight: 400;
    }
    p {
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: var(--space-md);
      color: var(--text-main);
    }
    ul {
      padding-left: 20px;
      margin-bottom: var(--space-md);
      font-size: 15px;
      line-height: 1.6;
      color: var(--text-main);
    }
    li {
      margin-bottom: var(--space-xs);
      line-height: 1.55;
    }
    .score {
      font-size: 26px;
      font-weight: 800;
      color: var(--accent);
      margin-bottom: var(--space-xs);
      font-family: "Plus Jakarta Sans", system-ui, sans-serif;
      letter-spacing: -0.02em;
    }
    .band {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: var(--space-sm);
    }
    .label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-family: "Plus Jakarta Sans", system-ui, sans-serif;
    }
    .text {
      font-size: 15px;
      color: var(--text-main);
      line-height: 1.55;
    }
    .rewrite-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-md-alt);
      margin-bottom: var(--space-md-alt);
      border-left: 2px solid rgba(12, 17, 32, 0.06);
      padding-left: var(--space-sm-alt);
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .rewrite-col {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }
    .rewrite-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-family: "Plus Jakarta Sans", system-ui, sans-serif;
    }
    .enhancement {
      grid-column: 1 / -1;
      font-size: 13px;
      color: var(--text-muted);
      font-style: italic;
      margin-top: var(--space-xs);
    }
    .footer {
      margin-top: var(--space-xl);
      font-size: 11px;
      color: rgba(100, 116, 139, 0.7);
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="pdf-header">
    <div class="pdf-header-left">
      <div class="pdf-header-title">Recruiter in Your Pocket</div>
      <div class="pdf-header-subtitle">Resume Report</div>
    </div>
    <div class="pdf-header-right">Generated on ${generatedOn}</div>
  </div>

  <div class="pdf-report-card">
    <div class="stack-section">
      <div class="score">Score: ${Math.round(report.score || 0)}/100</div>
      ${report.score_label ? `<div class="band">${escape(report.score_label)}</div>` : ""}
      ${report.score_comment_short ? `<p>${escape(report.score_comment_short)}</p>` : ""}
    </div>

    <div class="stack-section">
      <h2>How your resume reads</h2>
      <p>${escape(report.summary)}</p>
    </div>

    <div class="stack-section">
      <h2>What's working</h2>
      <div class="subtext">Strengths that show up clearly.</div>
      <ul>${listHtml(report.strengths)}</ul>
    </div>

    <div class="stack-section">
      <h2>What's harder to see</h2>
      <div class="subtext">Parts of your impact that don't come through as strongly.</div>
      <ul>${listHtml(report.gaps)}</ul>
    </div>

    <div class="stack-section">
      <h2>Stronger phrasing you can use</h2>
      <div class="subtext">Original / Better pairs.</div>
      ${rewriteHtml(report.rewrites)}
    </div>

    ${Array.isArray(report.missing_wins) && report.missing_wins.length
            ? `<div class="stack-section">
            <h2>Missing wins</h2>
            <ul>${listHtml(report.missing_wins)}</ul>
          </div>`
            : ""
        }

    <div class="stack-section">
      <h2>Next steps</h2>
      <div class="subtext">Simple fixes you can make this week.</div>
      <ul>${listHtml(report.next_steps)}</ul>
    </div>

    <div class="footer">Created with Recruiter in Your Pocket — recruiterinyourpocket.com</div>
  </div>
</body>
</html>
`;
}

/**
 * Create PDF generation function with injected dependencies
 * @param {Object} deps - Dependencies (puppeteer, chromium, logLine, env flags)
 * @returns {Function} generatePdfBuffer function
 */
function createPdfGenerator(deps) {
    const {
        puppeteer,
        chromium,
        isVercel,
        isServerless,
        logLine
    } = deps;

    /**
     * Generate PDF buffer from report data
     * @param {Object} report - Validated report object
     * @returns {Buffer} PDF file buffer
     */
    async function generatePdfBuffer(report) {
        const html = await renderReportHtml(report);
        let browser;
        try {
            // Enhanced launch args for production/serverless environments
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

            // Additional args for serverless environments
            if (isServerless) {
                launchArgs.push("--single-process");
            }

            let browserOptions;

            // For Vercel, use @sparticuz/chromium
            if (isVercel && chromium) {
                // Set Chromium flags for Vercel (if method exists)
                if (typeof chromium.setGraphicsMode === 'function') {
                    chromium.setGraphicsMode(false);
                }

                // Get Chromium executable path
                const executablePath = await chromium.executablePath();

                // Enhanced args for Vercel to handle missing libraries
                const chromiumArgs = [
                    ...chromium.args,
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-software-rasterizer',
                    '--disable-extensions',
                    '--single-process'
                ];

                browserOptions = {
                    args: chromiumArgs,
                    defaultViewport: chromium.defaultViewport,
                    executablePath: executablePath,
                    headless: chromium.headless,
                    timeout: 30000
                };
            } else {
                // For local development or other platforms
                browserOptions = {
                    headless: "new",
                    args: launchArgs,
                    timeout: 30000
                };

                if (process.env.CHROME_EXECUTABLE_PATH) {
                    browserOptions.executablePath = process.env.CHROME_EXECUTABLE_PATH;
                }
            }

            browser = await puppeteer.launch(browserOptions);
            const page = await browser.newPage();

            // Set reasonable timeouts
            page.setDefaultTimeout(30000);
            page.setDefaultNavigationTimeout(30000);

            // Set viewport for consistent rendering
            if (!isVercel || !chromium) {
                await page.setViewport({ width: 1200, height: 1600 });
            }

            // Load HTML content
            await page.setContent(html, {
                waitUntil: "networkidle0",
                timeout: 30000
            });

            // Generate PDF with timeout
            const pdfBuffer = await Promise.race([
                page.pdf({
                    format: "A4",
                    printBackground: true,
                    displayHeaderFooter: false,
                    margin: {
                        top: "18mm",
                        right: "16mm",
                        bottom: "18mm",
                        left: "16mm"
                    }
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("PDF generation timeout")), 30000)
                )
            ]);

            return pdfBuffer;
        } catch (err) {
            // Enhanced error logging
            logLine(
                {
                    level: "error",
                    msg: "pdf_generation_error",
                    error: err.message,
                    stack: err.stack,
                    isServerless: Boolean(
                        process.env.VERCEL ||
                        process.env.AWS_LAMBDA_FUNCTION_NAME ||
                        process.env.FUNCTION_NAME
                    ),
                    chromePath: process.env.CHROME_EXECUTABLE_PATH || "default"
                },
                true
            );
            throw err;
        } finally {
            if (browser) {
                try {
                    await browser.close();
                } catch (closeErr) {
                    logLine(
                        {
                            level: "warn",
                            msg: "browser_close_error",
                            error: closeErr.message
                        },
                        false
                    );
                }
            }
        }
    }

    return generatePdfBuffer;
}

/**
 * Create PDF export router with injected dependencies
 * @param {Object} deps - Dependencies from app.js
 * @returns {express.Router}
 */
function createPdfRouter(deps) {
    const express = require("express");
    const {
        rateLimitPdf,
        validateReportForPdf: validateFn,
        generatePdfBuffer,
        logLine
    } = deps;

    // Use injected validateReportForPdf or fall back to local implementation
    const validate = validateFn || validateReportForPdf;

    const router = express.Router();

    router.post("/export-pdf", rateLimitPdf, (req, res) => {
        (async () => {
            try {
                const payload = req.body?.report || req.body || {};
                if (!validate(payload)) {
                    return res.status(400).json({
                        ok: false,
                        errorCode: "INVALID_PAYLOAD",
                        message: "Report data is incomplete. Try exporting again after a successful run."
                    });
                }
                const pdfBuffer = await generatePdfBuffer(payload);
                if (!pdfBuffer || pdfBuffer.length === 0) {
                    logLine(
                        {
                            level: "error",
                            msg: "export_pdf_failed",
                            error: "PDF buffer is empty",
                            reqId: req.reqId
                        },
                        true
                    );
                    return res.status(500).json({
                        ok: false,
                        errorCode: "EXPORT_FAILED",
                        message: "PDF isn't ready right now. Give it another try."
                    });
                }
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", 'attachment; filename="resume-review.pdf"');
                return res.end(pdfBuffer);
            } catch (err) {
                logLine(
                    {
                        level: "error",
                        msg: "export_pdf_failed",
                        reqId: req.reqId,
                        error: err.message,
                        stack: err.stack,
                        errorCode: err.code || "EXPORT_FAILED"
                    },
                    true
                );

                // Provide more specific error messages based on error type
                let userMessage = "PDF isn't ready right now. Give it another try.";
                let errorCode = "EXPORT_FAILED";

                if (err.message.includes("timeout") || err.message.includes("Timeout")) {
                    userMessage = "PDF took too long to generate. Try again.";
                    errorCode = "EXPORT_TIMEOUT";
                } else if (err.message.includes("launch") || err.message.includes("browser")) {
                    userMessage = "PDF isn't available right now. Try again in a moment.";
                    errorCode = "EXPORT_SERVICE_UNAVAILABLE";
                } else if (err.message.includes("ENOENT") || err.message.includes("executable")) {
                    userMessage = "PDF isn't set up properly. Contact support if this keeps happening.";
                    errorCode = "EXPORT_CONFIG_ERROR";
                }

                return res.status(500).json({
                    ok: false,
                    errorCode,
                    message: userMessage
                });
            }
        })();
    });

    return router;
}

module.exports = {
    validateReportForPdf,
    renderReportHtml,
    createPdfGenerator,
    createPdfRouter
};
