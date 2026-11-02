import { expect, test } from "@playwright/test";

// What search engines and link previews read from every page in the sitemap.
// Registry, sitemap, and robots rules: tests/search-foundation.test.ts.

const SITE = "https://www.recruiterinyourpocket.com";
const localPath = (url: string) => url.replace(SITE, "") || "/";

// Known gaps in files this audit doesn't own; see
// docs/launch-readiness/search-foundation-audit.md. Remove an entry once it's fixed.
const LONG_TITLE_EXCEPTIONS = new Set<string>();
const NO_IMAGE_ALT_EXCEPTIONS = new Set(["/pricing", "/sample-report"]);
const NO_OG_URL_EXCEPTIONS = new Set(["/resources"]);

type JsonLdNode = Record<string, unknown> & { "@type"?: string };

test.describe("search and sharing foundation", () => {
  test("every sitemap page has its own title, canonical, share card, and valid structured data", async ({ page, request }) => {
    test.setTimeout(300_000);
    const xml = await (await request.get("/sitemap.xml")).text();
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => localPath(match[1]));
    expect(paths.length).toBeGreaterThan(25);

    const titles = new Map<string, string>();
    const descriptions = new Map<string, string>();
    const images = new Set<string>();

    for (const path of paths) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status(), path).toBe(200);

      const read = await page.evaluate(() => {
        const meta = (selector: string) => document.querySelector<HTMLMetaElement>(selector)?.content ?? null;
        return {
          title: document.title,
          description: meta('meta[name="description"]'),
          robots: meta('meta[name="robots"]'),
          canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
          ogUrl: meta('meta[property="og:url"]'),
          ogTitle: meta('meta[property="og:title"]'),
          ogImage: meta('meta[property="og:image"]'),
          ogImageAlt: meta('meta[property="og:image:alt"]'),
          twitterCard: meta('meta[name="twitter:card"]'),
          twitterImage: meta('meta[name="twitter:image"]'),
          jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => script.textContent ?? ""),
          h1: [...document.querySelectorAll("h1")].map((heading) => (heading.textContent ?? "").replace(/\s+/g, " ").trim()),
          imagesWithoutAlt: [...document.querySelectorAll("img:not([alt])")].map((image) => (image as HTMLImageElement).src),
          text: document.body.innerText.replace(/\s+/g, " "),
        };
      });

      // Title and description: present, unique, and short enough to show in full.
      expect.soft(read.title, path).toBeTruthy();
      if (!LONG_TITLE_EXCEPTIONS.has(path)) expect.soft(read.title.length, `${path} title: ${read.title}`).toBeLessThanOrEqual(60);
      expect.soft(titles.get(read.title), `${path} repeats a title`).toBeUndefined();
      titles.set(read.title, path);
      expect.soft(read.description?.length ?? 0, `${path} description`).toBeGreaterThanOrEqual(70);
      expect.soft(read.description?.length ?? 0, `${path} description`).toBeLessThanOrEqual(170);
      expect.soft(descriptions.get(read.description ?? ""), `${path} repeats a description`).toBeUndefined();
      descriptions.set(read.description ?? "", path);

      // One canonical URL, the same one the share card points at, and indexable.
      expect.soft(read.canonical, path).toBe(path === "/" ? SITE : `${SITE}${path}`);
      if (!NO_OG_URL_EXCEPTIONS.has(path)) expect.soft(read.ogUrl?.replace(/\/$/, ""), `${path} og:url`).toBe(read.canonical);
      expect.soft(read.robots ?? "", path).not.toContain("noindex");
      expect.soft(read.ogTitle, path).toBeTruthy();
      expect.soft(read.ogImage, path).toMatch(/^https:\/\/www\.recruiterinyourpocket\.com\//);
      if (!NO_IMAGE_ALT_EXCEPTIONS.has(path)) expect.soft(read.ogImageAlt, path).toBeTruthy();
      expect.soft(read.twitterCard, path).toBe("summary_large_image");
      expect.soft(read.twitterImage, path).toBe(read.ogImage);
      images.add(localPath(read.ogImage ?? ""));

      expect.soft(read.h1, `${path} h1`).toHaveLength(1);
      expect.soft(read.imagesWithoutAlt, `${path} images without alt`).toEqual([]);

      // Structured data parses and describes what the page shows.
      const nodes: JsonLdNode[] = read.jsonLd.flatMap((source) => {
        const data = JSON.parse(source) as JsonLdNode & { "@graph"?: JsonLdNode[] };
        return data["@graph"] ?? [data];
      });
      const types = nodes.map((node) => node["@type"]);
      expect.soft(types, path).toContain("Organization");
      expect.soft(types, path).toContain("WebSite");

      for (const article of nodes.filter((node) => node["@type"] === "Article")) {
        expect.soft(article.headline, `${path} Article headline`).toBe(read.h1[0]);
        expect.soft(article.url, path).toBe(read.canonical);
        expect.soft(String(article.datePublished), path).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect.soft(String(article.dateModified), path).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect.soft((article.author as JsonLdNode).name, path).toBe("Recruiter in Your Pocket");
        expect.soft((article.publisher as JsonLdNode)["@id"], path).toBe(`${SITE}/#organization`);
      }
      if (path.startsWith("/research/") || path.startsWith("/resources/") && path !== "/resources/tools/comp-calculator") {
        expect.soft(types, `${path} is an article`).toContain("Article");
      }
      for (const breadcrumbs of nodes.filter((node) => node["@type"] === "BreadcrumbList")) {
        const items = breadcrumbs.itemListElement as Array<{ position: number; item: string; name: string }>;
        expect.soft(items.map((item) => item.position), path).toEqual(items.map((_, index) => index + 1));
        expect.soft(items[0].item, path).toBe(SITE);
        expect.soft(items.at(-1)?.item, path).toBe(read.canonical);
      }
      // FAQPage only where the questions are on the page.
      for (const faq of nodes.filter((node) => node["@type"] === "FAQPage")) {
        for (const question of faq.mainEntity as Array<{ name: string }>) {
          expect.soft(read.text, `${path} FAQ question isn't visible: ${question.name}`).toContain(question.name);
        }
      }
    }

    for (const image of images) {
      const card = await request.get(image);
      expect.soft(card.status(), image).toBe(200);
      expect.soft(card.headers()["content-type"], image).toBe("image/png");
    }
  });

  test("research articles show the date their structured data and sitemap carry", async ({ page, request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const lastmod = xml.match(/<loc>https:\/\/www\.recruiterinyourpocket\.com\/research\/how-recruiters-read<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/)?.[1];
    expect(lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await page.goto("/research/how-recruiters-read", { waitUntil: "domcontentloaded" });
    await expect(page.locator("header time")).toHaveAttribute("dateTime", lastmod ?? "");
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    await expect(page.locator('meta[property="article:modified_time"]')).toHaveAttribute("content", lastmod ?? "");
  });

  test("old and short URLs reach their page in one redirect", async ({ request }) => {
    const hops: Array<[string, string, number]> = [
      ["/guides", "/resources", 308],
      ["/guides/offer-negotiation", "/resources/offer-negotiation", 308],
      ["/guides/tools/comp-calculator", "/resources/tools/comp-calculator", 308],
      ["/guides/comp-calculator", "/resources/tools/comp-calculator", 308],
      ["/resources/comp-calculator", "/resources/tools/comp-calculator", 308],
      ["/research/how-we-score", "/methodology", 308],
      ["/research/how-people-scan", "/research/how-recruiters-read", 308],
      ["/research/salary-anchors", "/research/salary-history-bans", 308],
    ];
    for (const [from, to, status] of hops) {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status(), from).toBe(status);
      expect(new URL(response.headers().location, "http://local").pathname, from).toBe(to);
      const landing = await request.get(to, { maxRedirects: 0 });
      expect(landing.status(), `${to} should be the final page`).toBe(200);
    }
  });

  test("private and app routes stay out of search while crawlers can read that", async ({ page, request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap: https://www.recruiterinyourpocket.com/sitemap.xml");
    for (const path of ["/workspace", "/auth", "/status", "/purchase/restore"]) {
      expect(robots, `${path} must not be blocked, or crawlers can't see its noindex`).not.toMatch(new RegExp(`^Disallow: ${path}$`, "m"));
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator('meta[name="robots"]'), path).toHaveAttribute("content", /noindex/);
    }
    const missing = await page.goto("/research/not-an-article");
    expect(missing?.status()).toBe(404);
    const missingRobots = await page.locator('meta[name="robots"]').evaluateAll((tags) => tags.map((tag) => tag.getAttribute("content")));
    expect(missingRobots.length).toBeGreaterThan(0);
    expect(missingRobots.every((content) => content?.includes("noindex")), missingRobots.join(" | ")).toBe(true);
  });
});
