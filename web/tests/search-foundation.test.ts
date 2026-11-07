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

  // Retired pages (lib/seo/retired-routes.json) redirect once their destination exists; an active
  // source stays out of the sitemap, and one whose destination is not built yet stays a live page.
  const retired = require("../lib/seo/retired-routes.json").routes as Array<{ source: string; destination: string }>;
  const activeRedirects = retired.filter((route) => pageFiles.has(route.destination));
  const nextConfig = readFileSync(path.join(root, "next.config.mjs"), "utf8");
  assert.ok(nextConfig.includes("./lib/seo/retired-routes.json") && nextConfig.includes("...activeRetiredRedirects"), "next.config.mjs applies the retired routes");
  for (const route of retired) {
    assert.ok(route.source.startsWith("/") && route.destination.startsWith("/") && route.source !== route.destination, `${route.source} -> ${route.destination}`);
    assert.ok(!retired.some((other) => other.source === route.destination), `${route.destination} must not itself be retired: one hop only`);
  }
  for (const route of activeRedirects) {
    assert.ok(!pages.some((page) => page.path === route.source), `${route.source} redirects to ${route.destination}: remove it from PUBLIC_PAGES (lib/seo/public-pages.ts)`);
  }
  const redirectsAway = (route: string) => activeRedirects.some((item) => item.source === route);

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
    if (route.startsWith("/guides") || redirectsAway(route) || isRedirectStub(file) || isNoindex(file)) continue;
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

  // --- Each article opens with its hub row's verdict ------------------------------
  // The hub row and the article's opening are one object (article-standard.md, Nov 6, 2026): the opening's
  // first sentence is the row's verdict, verbatim, followed by at most two sentences, 35 words in all.
  // The rendered opening is checked by tests/ui/research-surface.spec.ts; this reads the `answer` prop.
  const OPENING_WORD_LIMIT = 35;
  const entities: Record<string, string> = { rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", amp: "&", apos: "'", quot: '"', nbsp: " " };
  const openingText = (source: string) => {
    const jsx = source.match(/\banswer=\{\s*<>([\s\S]*?)<\/>\s*\}/)?.[1];
    if (!jsx) return null;
    return jsx
      .replace(/\{"\s*"\}/g, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/&([a-z]+);/g, (match, name: string) => entities[name] ?? match)
      .replace(/\s+/g, " ")
      .trim();
  };
  let openingsChecked = 0;
  for (const article of hub.filter((entry: { href: string }) => entry.href.startsWith("/research/"))) {
    const file = pageFiles.get(article.href);
    assert.ok(file, `${article.href} has no page.tsx`);
    const source = readFileSync(file, "utf8");
    if (!source.includes("<AnswerArticle")) continue;
    const opening = openingText(source);
    assert.ok(opening, `${article.href}: the answer prop must be a fragment of plain text (answer={<>…</>})`);
    const { verdict } = article as { verdict?: string };
    assert.ok(verdict, `${article.href} has no verdict on the hub`);
    assert.ok(opening.startsWith(`${verdict} `) || opening === verdict, `${article.href}: the opening must start with the hub verdict "${verdict}", got "${opening.slice(0, 80)}"`);
    const words = opening.split(" ").length;
    assert.ok(words <= OPENING_WORD_LIMIT, `${article.href}: the opening is ${words} words; the limit is ${OPENING_WORD_LIMIT}`);
    const sentencesAfterVerdict = opening.slice(verdict.length).split(/(?<=[.!?])\s+(?=\S)/).filter((sentence) => sentence.trim()).length;
    assert.ok(sentencesAfterVerdict <= 2, `${article.href}: the opening carries ${sentencesAfterVerdict} sentences after the verdict; at most two`);
    openingsChecked += 1;
  }
  assert.ok(openingsChecked >= 16, `expected every research article to open with its verdict, checked ${openingsChecked}`);

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
  assert.equal(organization.founder, undefined, "the site is anonymous: the Organization names no founder");
  assert.ok(!site["@graph"].some((node: { "@type": string }) => node["@type"] === "Person"), "the site graph has no Person");
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

  // --- Hub lists and llms.txt ------------------------------------------------
  const { itemListStructuredData } = require("../lib/seo/structured-data");
  const { hubAnswers } = require("../components/research/ResearchHubData");
  const list = roundTrip(itemListStructuredData("/research", "Questions", hubAnswers.map((article: { question: string; href: string }) => ({ name: article.question, path: article.href }))));
  assert.equal(list["@type"], "ItemList");
  assert.equal(list.numberOfItems, hubAnswers.length);
  assert.deepEqual(list.itemListElement.map((item: { position: number }) => item.position), hubAnswers.map((_: unknown, index: number) => index + 1));
  for (const item of list.itemListElement) {
    assert.ok(paths.includes(item.url.replace(SITE_URL, "")), `the research ItemList names ${item.url}, which is not a public page`);
  }
  assert.throws(() => itemListStructuredData("/research", "Questions", [{ name: "Gone", path: "/research/not-a-page" }]), /not in PUBLIC_PAGES/);

  const { llmsText } = require("../lib/seo/llms");
  const compareStubs = pages.filter((page) => page.path.startsWith("/compare/")).map((page) => ({ title: page.path, path: page.path, summary: "What it sells." }));
  const llms = llmsText({ comparisons: compareStubs, pricesRead: "November 4, 2026" }) as string;
  assert.ok(llms.startsWith("# Recruiter in Your Pocket\n\n> "), "llms.txt opens with the site name and a one-line summary");
  const linked = [...llms.matchAll(/\]\((https:\/\/www\.recruiterinyourpocket\.com[^)]*)\)/g)].map((match) => match[1].replace(SITE_URL, "") || "/");
  for (const linkedPath of linked) {
    assert.ok(paths.includes(linkedPath), `llms.txt links ${linkedPath}, which is not a public page`);
  }
  for (const page of pages.filter((candidate) => /^\/(research|resources|compare)\//.test(candidate.path) || candidate.path === "/methodology")) {
    assert.ok(linked.includes(page.path), `llms.txt leaves out ${page.path}`);
  }
  assert.equal(new Set(linked).size, linked.length, "llms.txt lists a page twice");
  for (const article of hubAnswers) {
    assert.ok(llms.includes(`: ${article.answer} Updated `), `llms.txt should carry the hub answer for ${article.href}`);
  }
  assert.ok(!/résumé/i.test(llms), 'llms.txt: write "resume" without accents');
  assert.ok(!llms.includes("/workspace") && !llms.includes("/auth"), "llms.txt points at no private route");

  console.log(`search foundation: ${pages.length} public pages, ${seen.size} titles checked, llms.txt lists ${linked.length}`);
} finally {
  runtimeModule._load = originalLoad;
}
