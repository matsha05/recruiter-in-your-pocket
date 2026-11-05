import { expect, test } from "@playwright/test";

// The internal link graph is the map of what the site says matters: the research articles are the
// evidence behind the report, so each one has to be cited from inside other pages' text, not only
// from the nav, the footer, and the hub. scripts/internal-links.mjs is the crawler; this turns it
// into a gate; tests/research-links.test.ts checks the article sources. Plan and the November 4, 2026 baseline (15 of 17 articles had 2 to 7 inbound links,
// none from a sibling's text): docs/growth/2026-11-aeo-and-internal-linking.md.

/** Inbound links from other pages' bodies (not the header, footer, or a menu) that every public page needs. */
const MIN_BODY_INBOUND = 4;

/** The site frame: reached from every page's header or footer, and not something an article would cite. */
const FRAME_PAGES = ["/", "/privacy", "/terms", "/help"];

type SummaryShape = {
  rows: Array<{ page: string; body: number; chrome: number; from: string[] }>;
  orphans: string[];
  everywhere: string[];
};

async function crawlSite(baseURL: string): Promise<SummaryShape> {
  const { crawl, summarize } = await import("../../../scripts/internal-links.mjs");
  return summarize(await crawl(baseURL));
}

test.describe("internal links", () => {
  test("every public page is cited from the text of at least four other pages", async ({ baseURL }) => {
    test.setTimeout(180_000);
    const summary = await crawlSite(baseURL!);

    expect(summary.rows.length, "the sitemap lists the public pages").toBeGreaterThan(20);
    expect(summary.orphans, "no page is an orphan").toEqual([]);

    for (const frame of FRAME_PAGES) {
      expect(summary.everywhere, `${frame} is linked from every page's header or footer`).toContain(frame);
    }

    const short = summary.rows
      .filter((row) => !FRAME_PAGES.includes(row.page) && row.body < MIN_BODY_INBOUND)
      .map((row) => `${row.page}: ${row.body} body inbound (from ${row.from.join(", ") || "nowhere"})`);
    expect(short, `pages with fewer than ${MIN_BODY_INBOUND} inbound links outside the nav and footer`).toEqual([]);
  });
});
