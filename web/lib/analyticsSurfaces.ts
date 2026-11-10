// Which pages and report-start clicks the analytics lifecycle records. Pure, so it can be
// tested without a browser; AnalyticsLifecycle applies it after the consent check.

/** Pages whose views count as a "page_viewed" surface. */
export const PAGE_SURFACES: Record<string, string> = {
  "/": "home", "/pricing": "pricing", "/workspace": "workspace",
  "/sample-report": "sample_report", "/research": "research", "/resources": "resources", "/help": "help",
  "/compare": "compare",
};

/** The research article's slug for "research_article_viewed", or null for any other page. */
export function researchArticleSlug(pathname: string): string | null {
  const match = /^\/research\/([a-z0-9-]+)\/?$/.exec(pathname);
  return match ? match[1] : null;
}

/** The comparison page's slug (the other tool's name, e.g. "jobscan") for "comparison_viewed", or null. */
export function comparisonSlug(pathname: string): string | null {
  const match = /^\/compare\/([a-z0-9-]+)\/?$/.exec(pathname);
  return match ? match[1] : null;
}

// The pages whose report buttons we count: the homepage, the research hub and articles, and the
// compare hub and pages. The compare pages are the AEO bet (docs/growth/2026-11-aeo-and-internal-linking.md),
// so a report started from one has to be attributable to it.
const CTA_PAGES = (pathname: string) =>
  pathname === "/" || pathname === "/research" || researchArticleSlug(pathname) !== null || pathname === "/compare" || comparisonSlug(pathname) !== null;
const CTA_DESTINATIONS = new Set(["/workspace", "/sample-report"]);
// A belief page hands off to a guide or an article where the report doesn't fit (The offer, Referrals; Nov 10, 2026),
// so that click counts too.
const GUIDE_DESTINATION = (pathname: string, destination: string) =>
  researchArticleSlug(pathname) !== null && (destination.startsWith("/resources/") || researchArticleSlug(destination) !== null);

/** Pages that show a report: the workspace, a saved report, and the sample. */
const REPORT_PAGES = (pathname: string) => pathname === "/workspace" || pathname === "/sample-report" || /^\/reports\/[^/]+\/?$/.test(pathname);
const RESEARCH_DESTINATION = (destination: string) => destination === "/methodology" || researchArticleSlug(destination) !== null;

/**
 * The "landing_cta_clicked" properties for a click on a marked action, or null when the click
 * isn't one we count. Two directions: from the homepage, research and compare pages toward the
 * report or the sample, and from a report toward the research behind it (report_research_*). A
 * research article's or comparison's slug comes from its own view event, so a click into the
 * report carries the placement alone (research_bridge, compare_close); a click out of it carries
 * the article's path, never the report's.
 */
export function ctaClick(pathname: string, cta: string | undefined, destination: string): { cta: string; destination: string } | null {
  if (!cta) return null;
  const toReport = CTA_PAGES(pathname) && (CTA_DESTINATIONS.has(destination) || GUIDE_DESTINATION(pathname, destination));
  const toResearch = REPORT_PAGES(pathname) && RESEARCH_DESTINATION(destination);
  return toReport || toResearch ? { cta, destination } : null;
}
