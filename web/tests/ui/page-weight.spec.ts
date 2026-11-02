import { gzipSync } from "node:zlib";
import { expect, test } from "@playwright/test";

// First-load JavaScript budget for pages that are mostly text. It counts every
// script the server-rendered HTML references, gzipped, so a library pulled back
// into the root layout or the public header (Supabase, the command palette,
// Sentry Replay, motion features, sonner, React Query, the account menu) fails
// here instead of shipping on every page. Scripts loaded after hydration or on
// demand are not counted. The budget is about 5% over the heaviest page,
// /pricing at 326 KB in a local production build on November 2, 2026.
const TEXT_PAGE_BUDGET_KB = 342;
const TEXT_PAGES = ["/", "/pricing", "/research", "/research/how-recruiters-read", "/privacy", "/status"];

test.describe("first-load JavaScript budget", () => {
  for (const pathname of TEXT_PAGES) {
    test(`${pathname} stays within the text-page budget`, async ({ request }) => {
      const html = await (await request.get(pathname)).text();
      const scripts = [...new Set(html.match(/\/_next\/static\/[^"'\s]+\.js/g) ?? [])];
      expect(scripts.length, "the page references its scripts").toBeGreaterThan(0);

      let gzipBytes = 0;
      for (const script of scripts) {
        const response = await request.get(script);
        expect(response.ok(), `${script} loads`).toBe(true);
        gzipBytes += gzipSync(await response.body(), { level: 9 }).length;
      }

      const kilobytes = Math.round(gzipBytes / 1024);
      expect(kilobytes, `${pathname} loads ${kilobytes} KB of gzipped JavaScript`).toBeLessThanOrEqual(TEXT_PAGE_BUDGET_KB);
    });
  }
});
