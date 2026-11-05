#!/usr/bin/env node
// The site's internal link graph, measured from a running server.
//
//   node scripts/internal-links.mjs [base-url]       (default http://localhost:3000)
//   node scripts/internal-links.mjs --json [base-url]
//
// Fetches /sitemap.xml, follows every internal href on each listed page, and counts the inbound
// links per page. Links inside the site header, the footer, and any menu <nav> are counted separately,
// so the "body" count is the editorial map: which page cites which, from its own text. The report
// lists orphans (no body inbound at all) and the pages linked from everywhere (the chrome).
// tests/ui/internal-links.spec.ts turns the same crawl into a gate. Plan and the November 4, 2026
// baseline: docs/growth/2026-11-aeo-and-internal-linking.md.

const CHROME_SELECTORS = {
  // Opening tags whose subtree is site chrome. Matched on the tag name plus an attribute test.
  header: (attrs) => /\bclass="[^"]*\bsite-header\b/.test(attrs),
  footer: () => true,
  // Menus are chrome; a breadcrumb is the page's own trail and counts as a body link.
  nav: (attrs) => !/\baria-label="[^"]*breadcrumb/i.test(attrs),
};

/** Every <a href> in the HTML, with whether it sits inside the site's chrome (header, footer, nav). */
export function extractLinks(html) {
  const links = [];
  const stack = []; // open chrome elements, by tag name
  const tagPattern = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g;
  let match;
  while ((match = tagPattern.exec(html)) !== null) {
    const [, closing, rawName, attrs] = match;
    const name = rawName.toLowerCase();
    if (name in CHROME_SELECTORS) {
      if (closing) {
        const open = stack.lastIndexOf(name);
        if (open !== -1) stack.splice(open, 1);
      } else if (!attrs.endsWith("/") && CHROME_SELECTORS[name](attrs)) {
        stack.push(name);
      } else if (!attrs.endsWith("/")) {
        // A plain <header> inside an article: track it so its closing tag doesn't pop the site header.
        stack.push(`${name}:plain`);
      }
      continue;
    }
    if (name === "a" && !closing) {
      const href = /\bhref="([^"]*)"/.exec(attrs)?.[1];
      if (href) links.push({ href: decodeEntities(href), inChrome: stack.some((entry) => !entry.endsWith(":plain")) });
    }
  }
  return links;
}

function decodeEntities(value) {
  return value.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
}

/** Path for an internal href, or null for external, mailto, hash-only, and non-page links. */
export function internalPath(href, origin) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return null;
  let url;
  try {
    url = new URL(href, origin);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  let pathname = url.pathname.replace(/\/+$/, "") || "/";
  return pathname;
}

export async function readSitemap(baseUrl, fetchImpl = fetch) {
  const response = await fetchImpl(new URL("/sitemap.xml", baseUrl));
  if (!response.ok) throw new Error(`GET /sitemap.xml returned ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((entry) => new URL(entry[1].trim()).pathname.replace(/\/+$/, "") || "/");
}

/**
 * Crawl the sitemap's pages and count inbound links per page.
 * Returns { pages, inbound } where inbound[path] = { body: Set<fromPath>, chrome: Set<fromPath> }.
 */
export async function crawl(baseUrl, { fetchImpl = fetch, pages } = {}) {
  const origin = new URL(baseUrl).origin;
  const sitemapPages = pages ?? (await readSitemap(baseUrl, fetchImpl));
  const inbound = new Map(sitemapPages.map((page) => [page, { body: new Set(), chrome: new Set() }]));
  const outbound = new Map();
  const failures = [];

  await Promise.all(sitemapPages.map(async (page) => {
    const response = await fetchImpl(new URL(page, origin), { headers: { accept: "text/html" } });
    if (!response.ok) {
      failures.push(`${page} returned ${response.status}`);
      return;
    }
    const html = await response.text();
    const seen = new Set();
    for (const link of extractLinks(html)) {
      const target = internalPath(link.href, origin);
      if (!target || target === page) continue;
      if (!inbound.has(target)) inbound.set(target, { body: new Set(), chrome: new Set() });
      inbound.get(target)[link.inChrome ? "chrome" : "body"].add(page);
      seen.add(target);
    }
    outbound.set(page, seen);
  }));

  if (failures.length) throw new Error(`Crawl failed:\n${failures.join("\n")}`);
  return { pages: sitemapPages, inbound, outbound };
}

export function summarize({ pages, inbound }) {
  const rows = pages.map((page) => {
    const counts = inbound.get(page);
    return { page, body: counts.body.size, chrome: counts.chrome.size, from: [...counts.body].sort() };
  });
  const orphans = rows.filter((row) => row.body === 0 && row.chrome === 0).map((row) => row.page);
  const everywhere = rows.filter((row) => row.chrome >= pages.length - 1).map((row) => row.page);
  return { rows: rows.sort((a, b) => a.body - b.body || a.page.localeCompare(b.page)), orphans, everywhere };
}

const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isMain) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const baseUrl = args.find((arg) => !arg.startsWith("--")) ?? "http://localhost:3000";
  const result = await crawl(baseUrl);
  const summary = summarize(result);
  if (json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(`${result.pages.length} pages in /sitemap.xml at ${baseUrl}\n`);
    console.log("body  chrome  page");
    for (const row of summary.rows) console.log(`${String(row.body).padStart(4)}  ${String(row.chrome).padStart(6)}  ${row.page}`);
    console.log(`\nOrphans (no inbound links at all): ${summary.orphans.length ? summary.orphans.join(", ") : "none"}`);
    console.log(`Linked from every page (nav or footer): ${summary.everywhere.length ? summary.everywhere.join(", ") : "none"}`);
  }
}
