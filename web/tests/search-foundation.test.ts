import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import Module from "node:module";
import path from "node:path";

// The sitemap, robots, and SEO helpers, checked against the route files on disk.
// The rendered pages are checked by tests/ui/search-foundation.spec.ts.

type RuntimeModule = typeof Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};
const runtimeModule = Module as RuntimeModule;
const originalLoad = runtimeModule._load;
runtimeModule._load = function loadAliases(request, parent, isMain) {
  return originalLoad(request.startsWith("@/") ? path.join(process.cwd(), request.slice(2)) : request, parent, isMain);
};

const root = process.cwd();
const appDir = path.join(root, "app");

try {
  const { PUBLIC_PAGES, shareImageUrl } = require("../lib/seo/public-pages");
  const { categories } = require("../components/research/ResearchHubData");
  const { articleStructuredData } = require("../lib/seo/structured-data");
  const { SITE_URL, siteStructuredData, serializeJsonLd, breadcrumbStructuredData } = require("../lib/seo/site");
  const { SEARCH_TITLE_LIMIT } = require("../lib/seo/metadata");
  const sitemap = require("../app/sitemap").default;
  const robots = require("../app/robots").default;

  type Page = { path: string; updated: string; published?: string; card?: string };
  const pages = PUBLIC_PAGES as Page[];
  const today = new Date().toISOString().slice(0, 10);

  // --- Route files -----------------------------------------------------------
  function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const full = path.join(dir, name);
      return statSync(full).isDirectory() ? walk(full) : [full];
    });
  }
  const routeOf = (file: string) => {
    const segments = path.relative(appDir, path.dirname(file)).split(path.sep).filter((segment) => segment && !/^\(.*\)$/.test(segment));
    return `/${segments.join("/")}`;
  };
  const pageFiles = new Map<string, string>();
  for (const file of walk(appDir).filter((file) => file.endsWith(`${path.sep}page.tsx`))) {
    pageFiles.set(routeOf(file), file);
  }
  const isNoindex = (file: string) => {
    for (let dir = path.dirname(file); dir.startsWith(appDir); dir = path.dirname(dir)) {
      for (const candidate of [path.join(dir, "page.tsx"), path.join(dir, "layout.tsx")]) {
        if (!existsSync(candidate)) continue;
        if (candidate.endsWith("page.tsx") && candidate !== file) continue;
        const source = readFileSync(candidate, "utf8");
        if (source.includes("PRIVATE_ROUTE_ROBOTS") || /index:\s*false/.test(source)) return true;
      }
    }
    return false;
  };
  const isRedirectStub = (file: string) => /\b(permanentRedirect|redirect)\(/.test(readFileSync(file, "utf8"));

  // Every listed page is a real, indexable page.
  const paths = pages.map((page) => page.path);
  assert.equal(new Set(paths).size, paths.length, "PUBLIC_PAGES lists a path twice");
  for (const page of pages) {
    const file = pageFiles.get(page.path);
    assert.ok(file, `${page.path} has no page.tsx`);
    assert.ok(!isRedirectStub(file), `${page.path} only redirects; list where it redirects to instead`);
    assert.ok(!isNoindex(file), `${page.path} is noindex but listed in the sitemap`);
  }

  // Every indexable public page is listed. /guides/* redirects to /resources/* in next.config.mjs.
  for (const [route, file] of pageFiles) {
    if (!/\((marketing|editorial)\)/.test(file)) continue;
    if (route.startsWith("/guides") || isRedirectStub(file) || isNoindex(file)) continue;
    assert.ok(paths.includes(route), `${route} is public and indexable but missing from PUBLIC_PAGES (lib/seo/public-pages.ts)`);
  }

  // --- Dates -----------------------------------------------------------------
  const isDay = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
  for (const page of pages) {
    assert.ok(isDay(page.updated), `${page.path} updated "${page.updated}" isn't YYYY-MM-DD`);
    assert.ok(page.updated <= today, `${page.path} is dated in the future`);
    if (page.published) {
      assert.ok(isDay(page.published), `${page.path} published "${page.published}" isn't YYYY-MM-DD`);
      assert.ok(page.published <= page.updated, `${page.path} was updated before it was published`);
    }
    if (page.path.startsWith("/research/") || page.path.startsWith("/resources/")) {
      assert.ok(page.published, `${page.path} is an article or guide and needs a published date`);
    }
  }

  // --- Sitemap and robots ----------------------------------------------------
  const entries = sitemap() as Array<{ url: string; lastModified?: string }>;
  const listed = pages;
  assert.deepEqual(
    entries.map((entry) => entry.url).sort(),
    listed.map((page) => (page.path === "/" ? SITE_URL : `${SITE_URL}${page.path}`)).sort(),
    "the sitemap and PUBLIC_PAGES disagree",
  );
  for (const entry of entries) {
    const page = listed.find((candidate) => (candidate.path === "/" ? SITE_URL : `${SITE_URL}${candidate.path}`) === entry.url);
    assert.equal(entry.lastModified, page?.updated, `${entry.url} lastmod isn't its content date`);
    assert.ok(!entry.url.endsWith("/"), `${entry.url} has a trailing slash; canonical URLs don't`);
  }

  const rules = robots() as { rules: Array<{ disallow: string[] }>; sitemap: string };
  assert.equal(rules.sitemap, `${SITE_URL}/sitemap.xml`);
  for (const rule of rules.rules) {
    for (const blocked of rule.disallow) {
      for (const page of pages) {
        assert.ok(!page.path.startsWith(blocked), `robots.txt blocks ${page.path}`);
      }
    }
    // noindex only works where crawlers may fetch the page.
    for (const privateRoute of ["/auth", "/signin", "/reports", "/settings", "/purchase/restore"]) {
      assert.ok(!rule.disallow.some((blocked) => privateRoute.startsWith(blocked)), `robots.txt hides the noindex on ${privateRoute}`);
    }
  }

  // --- Share cards -----------------------------------------------------------
  const hub = categories.flatMap((category: { articles: Array<{ id: string; href: string; question: string }> }) => category.articles);
  for (const page of pages) {
    const answer = hub.find((article: { href: string }) => article.href === page.path);
    if (answer) assert.equal(page.card, answer.id, `${page.path} answers "${answer.id}" on the hub; share that card`);
    if (page.card) {
      assert.ok(answer && answer.id === page.card, `${page.path} names card "${page.card}", which isn't its hub answer`);
      assert.equal(shareImageUrl(page.path), `/og/research/${page.card}`);
    }
  }

  // --- Titles and descriptions in pageMetadata() calls -------------------------
  const seen = new Map<string, string>();
  const seenDescriptions = new Map<string, string>();
  for (const [route, file] of pageFiles) {
    for (const source of [file, path.join(path.dirname(file), "layout.tsx")].filter(existsSync).map((candidate) => readFileSync(candidate, "utf8"))) {
      const call = source.match(/pageMetadata\(\{([\s\S]*?)\}\)/);
      if (!call) continue;
      const constant = source.match(/const PATH = "([^"]+)"/)?.[1];
      const pathValue = call[1].match(/path:\s*(PATH|"[^"]+")/)?.[1];
      const declaredPath = pathValue === "PATH" ? constant : pathValue && JSON.parse(pathValue);
      assert.equal(declaredPath, route, `${route} declares canonical ${declaredPath}`);
      const title = JSON.parse(call[1].match(/title:\s*("(?:[^"\\]|\\.)*")/)?.[1] ?? '""');
      const descriptionLiteral = call[1].match(/description:\s*("(?:[^"\\]|\\.)*")/)?.[1]
        ?? source.match(/const description = ("(?:[^"\\]|\\.)*")/)?.[1];
      const description = JSON.parse(descriptionLiteral ?? '""');
      assert.ok(title.length > 0 && title.length <= SEARCH_TITLE_LIMIT, `${route} title is ${title.length} characters: "${title}"`);
      assert.ok(description.length >= 70 && description.length <= 160, `${route} description is ${description.length} characters`);
      assert.ok(!/résumé/i.test(title + description), `${route}: write "resume" without accents`);
      // A research article's search title, hub question, and H1 are one string (the H1 reads the hub).
      const hubQuestion = route.startsWith("/research/") ? hub.find((article: { href: string }) => article.href === route)?.question : undefined;
      if (route.startsWith("/research/")) assert.equal(title, hubQuestion, `${route}: the search title must be the hub question`);
      assert.ok(!seen.has(title), `${route} and ${seen.get(title)} share the title "${title}"`);
      assert.ok(!seenDescriptions.has(description), `${route} and ${seenDescriptions.get(description)} share a description`);
      seen.set(title, route);
      seenDescriptions.set(description, route);
    }
  }
  assert.ok(seen.size >= 25, `expected pageMetadata() on most public pages, found ${seen.size}`);

  // --- Links to research articles take their title from the hub -----------------
  // A related-reading entry like { title: "…", href: "/research/…" } drifts the moment the article's
  // question changes. Lists title research links with hubLink(href) instead (ResearchHubData.ts).
  const sourceRoots = ["app", "components", "lib"].map((dir) => path.join(process.cwd(), dir));
  const sourceFiles = sourceRoots.flatMap((dir) => walk(dir)).filter((file) => /\.tsx?$/.test(file) && !file.endsWith("ResearchHubData.ts"));
  for (const file of sourceFiles) {
    const source = readFileSync(file, "utf8");
    for (const entry of source.matchAll(/\{[^{}]*href:\s*["'](\/research\/[a-z0-9-]+)["'][^{}]*\}/g)) {
      assert.ok(!/\btitle:\s*["'`]/.test(entry[0]), `${path.relative(process.cwd(), file)}: title the link to ${entry[1]} with hubLink("${entry[1]}"), not a typed string`);
    }
  }
  const { hubLink } = require("../components/research/ResearchHubData");
  for (const article of hub.filter((entry: { href: string }) => entry.href.startsWith("/research/"))) {
    assert.equal(hubLink(article.href).title, article.question, `${article.href}: related links must use the article's question`);
  }

  // --- Structured data -------------------------------------------------------
  const roundTrip = (data: unknown) => JSON.parse(serializeJsonLd(data));
  assert.ok(!serializeJsonLd({ text: "</script><script>" }).includes("<"), "JSON-LD must escape <");

  const site = roundTrip(siteStructuredData);
  const organization = site["@graph"].find((node: { "@type": string }) => node["@type"] === "Organization");
  const website = site["@graph"].find((node: { "@type": string }) => node["@type"] === "WebSite");
  assert.equal(organization.name, "Recruiter in Your Pocket");
  assert.match(organization.logo.url, /^https:\/\/www\.recruiterinyourpocket\.com\/.+\.png$/);
  assert.equal(organization.founder["@id"], `${SITE_URL}/#matt-shaw`, "the founder must point at the homepage's Person");
  assert.equal(website.publisher["@id"], organization["@id"]);

  for (const page of pages.filter((candidate) => candidate.published)) {
    const graph = roundTrip(articleStructuredData({
      path: page.path,
      headline: "Headline",
      description: "Description",
      trail: [{ name: "Section", path: "/research" }, { name: "Headline", path: page.path }],
      citations: [{ title: "A source", publisher: "A journal", href: "https://doi.org/10.0/x" }],
    }))["@graph"];
    const article = graph.find((node: { "@type": string }) => node["@type"] === "Article");
    const breadcrumbs = graph.find((node: { "@type": string }) => node["@type"] === "BreadcrumbList");
    assert.equal(article.url, `${SITE_URL}${page.path}`);
    assert.equal(article.datePublished, page.published);
    assert.equal(article.dateModified, page.updated);
    assert.equal(article.author.name, "Recruiter in Your Pocket");
    assert.equal(article.publisher["@id"], organization["@id"]);
    assert.match(article.image, /^https:\/\/www\.recruiterinyourpocket\.com\//);
    assert.deepEqual(breadcrumbs.itemListElement.map((item: { position: number }) => item.position), [1, 2, 3]);
    assert.equal(breadcrumbs.itemListElement.at(-1).item, `${SITE_URL}${page.path}`);
  }
  assert.equal(breadcrumbStructuredData([]).itemListElement[0].item, SITE_URL);

  console.log(`search foundation: ${pages.length} public pages, ${seen.size} titles checked`);
} finally {
  runtimeModule._load = originalLoad;
}
