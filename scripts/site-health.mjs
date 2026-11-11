#!/usr/bin/env node
// What a crawler gets from the deployed site, read from the outside.
//
//   node scripts/site-health.mjs [base-url]          (default https://www.recruiterinyourpocket.com)
//   node scripts/site-health.mjs --json [base-url]
//
// tests/search-foundation.test.ts checks the sitemap, titles and canonicals against the source, and
// scripts/internal-links.mjs counts links on a local build. Neither sees production: a redirect added
// at the host, a header set by the platform, a page that renders empty on the server, a link that
// 404s only once deployed. This fetches /sitemap.xml and /robots.txt from the live site, requests
// every listed page without following redirects, and reports what a search engine would trip on.
//
// Read-only: GET requests, six at a time, nothing submitted. Exit code 1 when anything is flagged.
// Not part of the launch gate or CI, since it needs the network and the deployed site. Run it after
// a deploy and with the monthly read (docs/growth/monthly-measurement.md).

import { readFileSync } from "node:fs";
import { extractLinks, internalPath } from "./internal-links.mjs";

export const DEFAULT_BASE_URL = "https://www.recruiterinyourpocket.com";
/** Roughly what a search result shows before it cuts the title off (web/lib/seo/metadata.ts). */
export const TITLE_LIMIT = 60;
/**
 * A page whose <main> carries less visible text than this in the server HTML is treated as rendering
 * on the client only. A project convention, not a search-engine threshold: the shortest public page
 * is several times longer.
 */
export const MIN_MAIN_TEXT = 200;
const USER_AGENT = "site-health-check";
const CONCURRENCY = 6;

// --- Parsing ------------------------------------------------------------------

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", middot: "·" };

export function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match);
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? "");
  }
  return result;
}

function visibleText(html) {
  return decodeEntities(
    html
      .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " "),
  ).replace(/\s+/g, " ").trim();
}

/** The parts of a page's server HTML that search engines read first. */
export function parsePage(html) {
  const titles = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((match) => visibleText(match[1]));
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => attributes(match[0]));
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => attributes(match[0]));
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => visibleText(match[1]));
  const main = /<main\b[^>]*>([\s\S]*)<\/main>/i.exec(html);
  const jsonLd = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((match) => {
    try {
      JSON.parse(match[1]);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });
  return {
    // The first <title> is the document's; an inline SVG can carry its own further down.
    title: titles[0] ?? null,
    description: metas.find((meta) => meta.name === "description")?.content ?? null,
    robots: metas.filter((meta) => meta.name === "robots" || meta.name === "googlebot").map((meta) => meta.content ?? "").join(", "),
    canonicals: links.filter((link) => (link.rel ?? "").toLowerCase().split(/\s+/).includes("canonical")).map((link) => link.href ?? ""),
    h1,
    hasMain: Boolean(main),
    mainText: main ? visibleText(main[1]).length : 0,
    jsonLd,
  };
}

/** The Disallow and Sitemap lines that apply to every crawler (User-agent: *). */
export function parseRobots(text) {
  const disallow = [];
  const sitemaps = [];
  let agents = [];
  let inRules = false;
  for (const raw of text.split(/\r?\n/)) {
    const lineText = raw.replace(/#.*$/, "").trim();
    const separator = lineText.indexOf(":");
    if (separator === -1) continue;
    const field = lineText.slice(0, separator).trim().toLowerCase();
    const value = lineText.slice(separator + 1).trim();
    if (field === "sitemap") sitemaps.push(value);
    else if (field === "user-agent") {
      if (inRules) agents = [];
      inRules = false;
      agents.push(value.toLowerCase());
    } else if (field === "disallow" || field === "allow") {
      inRules = true;
      if (field === "disallow" && value && agents.includes("*")) disallow.push(value);
    }
  }
  return { disallow, sitemaps };
}

export function blockedBy(path, disallow) {
  return disallow.find((rule) => {
    const pattern = new RegExp(`^${rule.split("*").map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*").replace(/\\\$$/, "$")}`);
    return pattern.test(path);
  }) ?? null;
}

const withoutTrailingSlash = (url) => url.replace(/\/+$/, "");

/**
 * Findings for one sitemap page, from its response alone.
 * `page` is { path, loc, status, location, headers, html } where headers is a plain lower-cased object.
 */
export function checkPage(page, { disallow = [] } = {}) {
  const findings = [];
  const flag = (check, detail) => findings.push({ page: page.path, check, detail });

  const blocked = blockedBy(page.path, disallow);
  if (blocked) flag("robots", `robots.txt disallows it (${blocked})`);

  if (page.status >= 300 && page.status < 400) {
    flag("redirect", `${page.status} to ${page.location ?? "nowhere"}; the sitemap should list where it ends up`);
    return findings;
  }
  if (page.status !== 200) {
    flag("status", `returned ${page.status}`);
    return findings;
  }

  if (/\bnoindex\b/i.test(page.headers?.["x-robots-tag"] ?? "")) flag("noindex", `X-Robots-Tag: ${page.headers["x-robots-tag"]}`);

  const parsed = parsePage(page.html ?? "");
  if (/\bnoindex\b/i.test(parsed.robots)) flag("noindex", `meta robots: ${parsed.robots}`);

  if (parsed.canonicals.length === 0) flag("canonical", "no canonical link");
  else if (parsed.canonicals.length > 1) flag("canonical", `${parsed.canonicals.length} canonical links`);
  else if (withoutTrailingSlash(parsed.canonicals[0]) !== withoutTrailingSlash(page.loc)) flag("canonical", `points at ${parsed.canonicals[0]}`);

  if (!parsed.title) flag("title", "no <title>");
  else if (parsed.title.length > TITLE_LIMIT) flag("title", `${parsed.title.length} characters, over ${TITLE_LIMIT}: "${parsed.title}"`);
  if (!parsed.description) flag("description", "no meta description");

  if (parsed.h1.filter(Boolean).length === 0) flag("content", "no <h1> text in the server HTML");
  if (!parsed.hasMain) flag("content", "no <main> in the server HTML");
  else if (parsed.mainText < MIN_MAIN_TEXT) flag("content", `<main> carries ${parsed.mainText} characters of text in the server HTML`);

  parsed.jsonLd.forEach((block, index) => {
    if (!block.ok) flag("structured-data", `JSON-LD block ${index + 1} does not parse: ${block.error}`);
  });

  return findings;
}

/** Pages that share a title or a description. `rows` is [{ page, title, description }]. */
export function duplicates(rows) {
  const findings = [];
  for (const field of ["title", "description"]) {
    const seen = new Map();
    for (const row of rows) {
      if (!row[field]) continue;
      if (seen.has(row[field])) findings.push({ page: row.page, check: field, detail: `same ${field} as ${seen.get(row[field])}` });
      else seen.set(row[field], row.page);
    }
  }
  return findings;
}

// --- Fetching -----------------------------------------------------------------

async function pooled(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index], index);
    }
  }));
  return results;
}

async function get(fetchImpl, url, { text = true } = {}) {
  try {
    const response = await fetchImpl(url, { redirect: "manual", headers: { "user-agent": USER_AGENT, accept: "text/html,*/*" } });
    const headers = Object.fromEntries([...response.headers.entries()].map(([name, value]) => [name.toLowerCase(), value]));
    const location = headers.location ? new URL(headers.location, url).href : null;
    const body = text && response.status === 200 ? await response.text() : (await response.body?.cancel?.(), null);
    return { status: response.status, headers, location, body };
  } catch (error) {
    return { status: 0, headers: {}, location: null, body: null, error: error.message };
  }
}

/**
 * Crawl the deployed site. Returns { base, pages, rows, findings, linksChecked }.
 * `retiredRoutes` is the routes array from web/lib/seo/retired-routes.json.
 */
export async function crawlSite(baseUrl = DEFAULT_BASE_URL, { fetchImpl = fetch, retiredRoutes = [], concurrency = CONCURRENCY } = {}) {
  const origin = new URL(baseUrl).origin;
  const findings = [];
  const flag = (page, check, detail) => findings.push({ page, check, detail });
  const at = (path) => new URL(path, origin).href;

  // robots.txt
  const robotsResponse = await get(fetchImpl, at("/robots.txt"));
  let robots = { disallow: [], sitemaps: [] };
  if (robotsResponse.status !== 200) flag("/robots.txt", "status", robotsResponse.error ?? `returned ${robotsResponse.status}`);
  else {
    robots = parseRobots(robotsResponse.body);
    if (!robots.sitemaps.some((entry) => new URL(entry, origin).pathname === "/sitemap.xml")) flag("/robots.txt", "robots", "names no /sitemap.xml");
  }

  // sitemap.xml
  const sitemapResponse = await get(fetchImpl, at("/sitemap.xml"));
  if (sitemapResponse.status !== 200) {
    flag("/sitemap.xml", "status", sitemapResponse.error ?? `returned ${sitemapResponse.status}`);
    return { base: origin, pages: [], rows: [], findings, linksChecked: 0 };
  }
  const locs = [...sitemapResponse.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((entry) => decodeEntities(entry[1].trim()));
  if (locs.length === 0) flag("/sitemap.xml", "sitemap", "lists no pages");
  const otherHosts = locs.filter((loc) => new URL(loc).origin !== origin);
  if (otherHosts.length) flag("/sitemap.xml", "sitemap", `${otherHosts.length} of ${locs.length} URLs are on another host, such as ${otherHosts[0]}`);
  const pathOf = (loc) => new URL(loc).pathname.replace(/\/+$/, "") || "/";
  const listedTwice = locs.filter((loc, index) => locs.indexOf(loc) !== index);
  if (listedTwice.length) flag("/sitemap.xml", "sitemap", `lists ${listedTwice[0]} more than once`);
  const sitemapPaths = new Set(locs.map(pathOf));

  // Every listed page.
  const pages = await pooled([...new Set(locs)], concurrency, async (loc) => {
    const path = pathOf(loc);
    const response = await get(fetchImpl, at(path));
    return { path, loc, status: response.status, location: response.location, headers: response.headers, html: response.body, error: response.error };
  });
  const rows = [];
  const linkedFrom = new Map(); // internal path -> first page that links it
  for (const page of pages) {
    if (page.error) flag(page.path, "status", `request failed: ${page.error}`);
    else findings.push(...checkPage(page, { disallow: robots.disallow }));
    const parsed = page.html ? parsePage(page.html) : null;
    rows.push({ page: page.path, status: page.status, title: parsed?.title ?? null, description: parsed?.description ?? null, mainText: parsed?.mainText ?? 0 });
    for (const link of page.html ? extractLinks(page.html) : []) {
      const target = internalPath(link.href, origin);
      if (target && !sitemapPaths.has(target) && !linkedFrom.has(target)) linkedFrom.set(target, page.path);
    }
  }
  findings.push(...duplicates(rows));

  // Internal links that leave the sitemap: each resolves, in one hop at most.
  // A link to a page robots.txt blocks is not fetched; a crawler would not fetch it either.
  const targets = [...linkedFrom.keys()].filter((path) => !blockedBy(path, robots.disallow));
  await pooled(targets, concurrency, async (path) => {
    const from = linkedFrom.get(path);
    const first = await get(fetchImpl, at(path), { text: false });
    if (first.status === 200) return;
    if (first.status >= 300 && first.status < 400 && first.location) {
      const second = await get(fetchImpl, first.location, { text: false });
      if (second.status === 200) return;
      const detail = second.status >= 300 && second.status < 400
        ? `redirects more than once: ${first.status} to ${first.location}, then ${second.status} to ${second.location}`
        : `redirects to ${first.location}, which returned ${second.error ?? second.status}`;
      flag(path, "link", `linked from ${from}; ${detail}`);
      return;
    }
    flag(path, "link", `linked from ${from}; ${first.error ? `request failed: ${first.error}` : `returned ${first.status}`}`);
  });

  // Retired pages redirect once, permanently, to the page that replaced them.
  await pooled(retiredRoutes, concurrency, async (route) => {
    const response = await get(fetchImpl, at(route.source), { text: false });
    const landed = response.location ? new URL(response.location).pathname.replace(/\/+$/, "") || "/" : null;
    if (![301, 308].includes(response.status)) flag(route.source, "retired", `should redirect permanently to ${route.destination}; returned ${response.error ?? response.status}`);
    else if (landed !== route.destination) flag(route.source, "retired", `redirects to ${response.location}, not ${route.destination}`);
    else if (!sitemapPaths.has(route.destination)) flag(route.source, "retired", `redirects to ${route.destination}, which is not in the sitemap`);
  });

  // llms.txt names only pages in the sitemap.
  const llms = await get(fetchImpl, at("/llms.txt"));
  if (llms.status !== 200) flag("/llms.txt", "status", llms.error ?? `returned ${llms.status}`);
  else {
    for (const match of llms.body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
      const url = new URL(match[1]);
      if (url.origin !== origin && !otherHosts.length) flag("/llms.txt", "llms", `links another host: ${match[1]}`);
      else if (!sitemapPaths.has(url.pathname.replace(/\/+$/, "") || "/")) flag("/llms.txt", "llms", `links ${url.pathname}, which is not in the sitemap`);
    }
  }

  return { base: origin, pages: pages.map((page) => page.path), rows, findings, linksChecked: targets.length };
}

export function formatReport({ base, rows, findings, linksChecked }) {
  const lines = [`${rows.length} pages in /sitemap.xml at ${base}; ${linksChecked} other internal links followed`, "", "status  title  desc  main   page"];
  for (const row of [...rows].sort((a, b) => a.page.localeCompare(b.page))) {
    lines.push(`${String(row.status).padStart(6)}  ${String(row.title?.length ?? "-").padStart(5)}  ${String(row.description?.length ?? "-").padStart(4)}  ${String(row.mainText).padStart(5)}  ${row.page}`);
  }
  lines.push("", findings.length ? `${findings.length} finding${findings.length === 1 ? "" : "s"}:` : "No findings.");
  for (const finding of [...findings].sort((a, b) => a.check.localeCompare(b.check) || a.page.localeCompare(b.page))) {
    lines.push(`  [${finding.check}] ${finding.page}: ${finding.detail}`);
  }
  return lines.join("\n");
}

const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isMain) {
  const args = process.argv.slice(2);
  const baseUrl = args.find((arg) => !arg.startsWith("--")) ?? DEFAULT_BASE_URL;
  const retiredRoutes = JSON.parse(readFileSync(new URL("../web/lib/seo/retired-routes.json", import.meta.url), "utf8")).routes;
  try {
    const result = await crawlSite(baseUrl, { retiredRoutes });
    console.log(args.includes("--json") ? JSON.stringify(result, null, 2) : formatReport(result));
    process.exitCode = result.findings.length ? 1 : 0;
  } catch (error) {
    console.error(`site health: ${error.message}`);
    process.exitCode = 2;
  }
}
