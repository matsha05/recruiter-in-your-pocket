// Which pages and report-start clicks the analytics lifecycle records. Pure, so it can be
// tested without a browser; AnalyticsLifecycle applies it after the consent check.

/** Pages whose views count as a "page_viewed" surface. */
export const PAGE_SURFACES: Record<string, string> = {
  "/": "home", "/pricing": "pricing", "/workspace": "workspace",
  "/sample-report": "sample_report", "/research": "research", "/resources": "resources", "/faq": "faq",
};

/** The research article's slug for "research_article_viewed", or null for any other page. */
export function researchArticleSlug(pathname: string): string | null {
  const match = /^\/research\/([a-z0-9-]+)\/?$/.exec(pathname);
  return match ? match[1] : null;
}

const CTA_PAGES = (pathname: string) => pathname === "/" || pathname === "/research" || researchArticleSlug(pathname) !== null;
const CTA_DESTINATIONS = new Set(["/workspace", "/sample-report"]);

/** Pages that show a report: the workspace, a saved report, and the sample. */
const REPORT_PAGES = (pathname: string) => pathname === "/workspace" || pathname === "/sample-report" || /^\/reports\/[^/]+\/?$/.test(pathname);
const RESEARCH_DESTINATION = (destination: string) => destination === "/methodology" || researchArticleSlug(destination) !== null;

/**
 * The "landing_cta_clicked" properties for a click on a marked action, or null when the click
 * isn't one we count. Two directions: from the homepage and research pages toward the report or
 * the sample, and from a report toward the research behind it (report_research_*). A research
 * article's slug comes from "research_article_viewed", so a click into the report carries the
 * placement alone (research_bridge, research_close); a click out of it carries the article's path,
 * never the report's.
 */
export function ctaClick(pathname: string, cta: string | undefined, destination: string): { cta: string; destination: string } | null {
  if (!cta) return null;
  const toReport = CTA_PAGES(pathname) && CTA_DESTINATIONS.has(destination);
  const toResearch = REPORT_PAGES(pathname) && RESEARCH_DESTINATION(destination);
  return toReport || toResearch ? { cta, destination } : null;
}
