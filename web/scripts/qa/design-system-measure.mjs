// Rendered type, button, and measure audit (Highlighter 1.1).
// Usage: npm run qa:design-system -- --measure http://127.0.0.1:3100 [--routes /,/pricing] [--json out.json]
// Loads public routes at 1440 and 390 px and fails when rendered text leaves the type roles, a weight
// outside 400/600/800 appears, the ink primary action has more than one build per size, or running prose
// in a reading rail sets more than the measure budget.
import fs from "node:fs";
import { STYLE_BUDGETS } from "./design-system-budgets.mjs";

export const DEFAULT_ROUTES = [
  "/", "/pricing", "/sample-report", "/workspace", "/research", "/research/how-recruiters-read",
  "/research/quantifying-impact", "/research/spelling-errors-impact", "/research/referral-advantage",
  "/research/writing-quality-hire-probability", "/guides", "/guides/offer-negotiation", "/guides/tools/comp-calculator",
  "/methodology", "/trust", "/privacy", "/terms", "/security", "/faq", "/support", "/status", "/auth", "/this-page-does-not-exist",
];

// Every rendered size comes from a role step in app/globals.css (whole pixels only).
export const ROLE_SIZES = [13, 14, 16, 18, 20, 24, 28, 32, 36, 44, 48, 64, 72];
export const RUNTIME_BUDGETS = {
  textStyles: 40,
  primaryBuildsPerSize: 1,
};

function collect() {
  const visible = (el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    const style = getComputedStyle(el);
    return style.visibility !== "hidden" && style.display !== "none";
  };
  // Illustrations are hidden from assistive technology and may draw their own document type; the wordmark
  // is outlined SVG, not text.
  const exempt = (el) => el.closest("[aria-hidden='true'], svg, script, style, noscript, template, .site-wordmark, [data-wordmark]");
  const canvas = document.createElement("canvas").getContext("2d");
  const styles = [];
  const primaries = [];
  const prose = [];
  for (const el of document.body.querySelectorAll("*")) {
    if (!visible(el) || exempt(el)) continue;
    const ownText = [...el.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent).join("").trim();
    const style = getComputedStyle(el);
    if (ownText) {
      styles.push({
        family: style.fontFamily.split(",")[0].replace(/["']/g, "").trim(),
        size: style.fontSize, weight: style.fontWeight, leading: style.lineHeight,
        text: ownText.slice(0, 48), tag: el.tagName.toLowerCase(),
      });
    }
    const tag = el.tagName.toLowerCase();
    if ((tag === "a" || tag === "button") && /^rgb\(17, 21, 19\)$/.test(style.backgroundColor)) {
      const rect = el.getBoundingClientRect();
      if (rect.height >= 40) primaries.push({ h: Math.round(rect.height), size: style.fontSize, weight: style.fontWeight, color: style.color, radius: style.borderTopLeftRadius, text: (el.textContent || "").trim().slice(0, 40) });
    }
    if (tag === "p" && el.closest("main") && !el.closest("figure, table, aside, [data-measure-exempt]")) {
      const text = (el.textContent || "").trim();
      if (text.length >= 160) {
        canvas.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const advance = canvas.measureText(text).width / text.length;
        const width = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        const inRail = Boolean(el.closest(".riyp-prose, .max-w-reading"));
        prose.push({ cpl: Math.round(width / advance), size: style.fontSize, text: text.slice(0, 60), advanceEm: advance / parseFloat(style.fontSize), inRail });
      }
    }
  }
  return { styles, primaries, prose };
}

export async function measureSite(base, routes = DEFAULT_ROUTES, widths = [1440, 390]) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const pages = [];
  try {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      await context.addInitScript(() => { try { localStorage.setItem("riyp:analytics-consent:v1", "declined"); } catch { /* storage may be blocked */ } });
      for (const route of routes) {
        const page = await context.newPage();
        try {
          await page.goto(base + route, { waitUntil: "networkidle", timeout: 90000 });
          await page.evaluate(async () => {
            for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((resolve) => setTimeout(resolve, 40)); }
            window.scrollTo(0, 0);
          });
          await page.waitForTimeout(500);
          pages.push({ route, width, ...(await page.evaluate(collect)) });
        } catch (error) {
          pages.push({ route, width, error: String(error.message).slice(0, 160) });
        } finally {
          await page.close();
        }
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
  return pages;
}

export function evaluateMeasurements(pages) {
  const errors = [];
  const loaded = pages.filter((page) => !page.error);
  for (const page of pages.filter((page) => page.error)) errors.push(`${page.route} @${page.width}: ${page.error}`);
  const styles = loaded.flatMap((page) => page.styles.map((style) => ({ ...style, route: page.route, width: page.width })));
  const key = (s) => `${s.family}|${s.size}|${s.weight}|${s.leading}`;
  const distinct = new Map();
  for (const style of styles) if (!distinct.has(key(style))) distinct.set(key(style), style);
  const sizes = new Map();
  for (const style of styles) if (!sizes.has(style.size)) sizes.set(style.size, style);
  const offScale = [...sizes.values()].filter((style) => !ROLE_SIZES.includes(Number(parseFloat(style.size).toFixed(2))));
  for (const style of offScale) errors.push(`Off-scale size ${style.size}: ${style.route} @${style.width} <${style.tag}> "${style.text}"`);
  const weights = new Set(styles.map((style) => style.weight));
  for (const weight of weights) if (!["400", "600", "800"].includes(weight)) {
    const example = styles.find((style) => style.weight === weight);
    errors.push(`Weight ${weight}: ${example.route} @${example.width} <${example.tag}> "${example.text}"`);
  }
  if (distinct.size > RUNTIME_BUDGETS.textStyles) errors.push(`${distinct.size} distinct text styles exceed the budget of ${RUNTIME_BUDGETS.textStyles}.`);

  const primaries = loaded.flatMap((page) => page.primaries.map((button) => ({ ...button, route: page.route, width: page.width })));
  const builds = new Map();
  for (const button of primaries) {
    const build = `${button.size}|${button.weight}|${button.color}|${button.radius}`;
    if (!builds.has(button.h)) builds.set(button.h, new Map());
    if (!builds.get(button.h).has(build)) builds.get(button.h).set(build, button);
  }
  for (const [height, variants] of builds) {
    if (![44, 48, 60].includes(height)) {
      const example = [...variants.values()][0];
      errors.push(`Primary action at ${height}px (sizes are 44/48/60): ${example.route} @${example.width} "${example.text}"`);
    }
    if (variants.size > RUNTIME_BUDGETS.primaryBuildsPerSize) errors.push(`${variants.size} builds of the ${height}px primary action: ${[...variants.keys()].join(" ; ")}`);
  }

  const prose = loaded.flatMap((page) => page.prose.map((p) => ({ ...p, route: page.route, width: page.width })));
  // A paragraph inside a shared reading rail must fit the measure. Paragraphs a page lays out on its own are
  // reported so the page can move them onto the rail (audit item 3.6).
  const wide = prose.filter((p) => p.width === 1440 && p.cpl > STYLE_BUDGETS.proseMeasure);
  const warnings = [];
  for (const p of wide) {
    const line = `Prose at ${p.cpl} characters per line (budget ${STYLE_BUDGETS.proseMeasure}): ${p.route} "${p.text}"`;
    (p.inRail ? errors : warnings).push(line);
  }

  const advances = prose.filter((p) => p.size === "18px").map((p) => p.advanceEm);
  return {
    errors,
    warnings,
    summary: {
      routes: loaded.length,
      textStyles: distinct.size,
      fontSizes: [...sizes.keys()].sort((a, b) => parseFloat(a) - parseFloat(b)),
      weights: [...weights].sort(),
      sizeLeadingPairs: new Set(styles.map((s) => `${s.size}/${s.leading}`)).size,
      primaryBuilds: [...builds.entries()].map(([height, variants]) => `${height}px x${variants.size}`),
      prose: { paragraphs: prose.filter((p) => p.width === 1440).length, overInRail: wide.filter((p) => p.inRail).length, overOutsideRail: wide.filter((p) => !p.inRail).length, maxCpl: Math.max(0, ...prose.filter((p) => p.width === 1440).map((p) => p.cpl)) },
      proseAdvanceEm: advances.length ? Number((advances.reduce((a, b) => a + b, 0) / advances.length).toFixed(3)) : null,
    },
  };
}

export async function runMeasure(argv) {
  const at = (flag) => (argv.includes(flag) ? argv[argv.indexOf(flag) + 1] : undefined);
  const base = at("--measure");
  const routes = at("--routes")?.split(",") ?? DEFAULT_ROUTES;
  const pages = await measureSite(base, routes);
  const result = evaluateMeasurements(pages);
  const out = at("--json");
  if (out) fs.writeFileSync(out, JSON.stringify(pages));
  return result;
}
