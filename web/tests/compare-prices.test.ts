import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Module from "node:module";
import path from "node:path";

// The comparison pages quote each tool's own pricing page as it read on PRICES_CHECKED
// (components/compare/comparisons.tsx), and every page shows that date. Prices change, so the
// date has a shelf life: when it is older than MAX_AGE_DAYS this fails until someone rereads
// the seven pricing pages and moves the date, whether or not a price moved. Plan:
// docs/growth/2026-11-aeo-and-internal-linking.md, phase 5.

type RuntimeModule = typeof Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};
const runtimeModule = Module as RuntimeModule;
const originalLoad = runtimeModule._load;
runtimeModule._load = function loadAliases(request, parent, isMain) {
  return originalLoad(request.startsWith("@/") ? path.join(process.cwd(), request.slice(2)) : request, parent, isMain);
};

/** How long a quoted price stands before the pages must be reread. A quarter: the tools here change plans a few times a year. */
const MAX_AGE_DAYS = 90;

try {
  const source = readFileSync(path.join(process.cwd(), "components/compare/comparisons.tsx"), "utf8");
  const checked = source.match(/^export const PRICES_CHECKED = "(\d{4}-\d{2}-\d{2})";$/m)?.[1];
  assert.ok(checked, "comparisons.tsx exports PRICES_CHECKED as YYYY-MM-DD");

  const today = new Date().toISOString().slice(0, 10);
  const ageDays = Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${checked}T00:00:00Z`)) / 86_400_000);
  assert.ok(ageDays >= 0, `PRICES_CHECKED ${checked} is in the future`);
  assert.ok(
    ageDays <= MAX_AGE_DAYS,
    `the compare pages quote prices read ${ageDays} days ago, on ${checked}. Reread each tool's pricing page (the links in comparisons.tsx), fix any price that moved, set PRICES_CHECKED to today, and bump the /compare pages' updated dates in lib/seo/public-pages.ts.`,
  );

  // Each comparison cites a pricing page of its own, and the hub lists exactly the pages that exist.
  const blocks = source.split(/^\s+slug: "/m).slice(1);
  const slugs = blocks.map((block) => block.slice(0, block.indexOf('"')));
  assert.ok(slugs.length >= 7, `expected at least seven comparisons, found ${slugs.length}`);
  for (const [index, block] of blocks.entries()) {
    assert.ok(/href: "https:\/\/[^"]+"/.test(block), `${slugs[index]} cites no pricing page in its sources`);
  }

  const { PUBLIC_PAGES } = require("../lib/seo/public-pages") as { PUBLIC_PAGES: Array<{ path: string; updated: string }> };
  const comparePages = PUBLIC_PAGES.filter((page) => page.path.startsWith("/compare/"));
  assert.deepEqual(
    comparePages.map((page) => page.path).sort(),
    slugs.map((slug) => `/compare/${slug}`).sort(),
    "PUBLIC_PAGES and comparisons.tsx disagree about which comparison pages exist",
  );
  // Every compare page prints the date, so moving it is a visible change on each of them.
  for (const page of [...comparePages, ...PUBLIC_PAGES.filter((candidate) => candidate.path === "/compare")]) {
    assert.ok(page.updated >= checked, `${page.path} was updated ${page.updated}, before the prices were reread on ${checked}; bump it in lib/seo/public-pages.ts`);
  }

  console.log(`compare prices: read ${ageDays} day(s) ago on ${checked}, ${slugs.length} comparisons, ${MAX_AGE_DAYS}-day limit`);
} finally {
  runtimeModule._load = originalLoad;
}
