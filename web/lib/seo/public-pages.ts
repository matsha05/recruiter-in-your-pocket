import retiredRoutes from "./retired-routes.json";
// Every page we want in search. The sitemap is built from this list, and
// articles take their published and updated dates from it.
//
// `updated` is the day the page's content last changed in a way a reader would
// notice: a corrected claim, a new section, a changed price or policy. Styling,
// refactors, and class renames don't count. Bump it in the same change as the
// content, never to the build date. `published` is the day the URL first went
// live (from git history). `card` names the Research hub answer whose share
// card the page uses (app/og/research/[id]/route.tsx).
//
// /extension is left out: it is noindex until the Chrome Web Store listing is
// public (app/(marketing)/extension/page.tsx). Add it here when it launches.

export type PublicPage = {
  path: string;
  /** YYYY-MM-DD */
  updated: string;
  /** YYYY-MM-DD, for articles and guides. */
  published?: string;
  /** The page's answer on the Research hub, shared as its card. */
  card?: string;
};

export const PUBLIC_PAGES: readonly PublicPage[] = [
  { path: "/", updated: "2026-11-02" },
  { path: "/sample-report", updated: "2026-11-01" },
  { path: "/pricing", updated: "2026-11-02" },
  { path: "/methodology", updated: "2026-11-02", published: "2026-01-02", card: "how-we-score" },

  { path: "/research", updated: "2026-11-01" },
  // Every article was corrected against its sources on Nov 1, 2026 (#35).
  { path: "/research/ats-myths", updated: "2026-11-01", published: "2025-12-10", card: "ats-myths" },
  { path: "/research/automation-and-bias", updated: "2026-11-01", published: "2025-12-15", card: "automation-and-bias" },
  { path: "/research/gaps-and-pivots", updated: "2026-11-02", published: "2026-10-31", card: "gaps-and-pivots" },
  { path: "/research/hiring-discrimination-meta-analysis", updated: "2026-11-02", published: "2025-12-15", card: "hiring-discrimination-meta-analysis" },
  { path: "/research/how-recruiters-read", updated: "2026-11-02", published: "2025-12-10", card: "how-recruiters-read" },
  { path: "/research/human-vs-algorithm", updated: "2026-11-02", published: "2025-12-15", card: "human-vs-algorithm" },
  { path: "/research/linkedin-visibility", updated: "2026-11-02", published: "2025-12-28", card: "linkedin-visibility" },
  { path: "/research/quantifying-impact", updated: "2026-11-01", published: "2025-12-17", card: "quantifying-impact" },
  { path: "/research/referral-advantage", updated: "2026-11-02", published: "2025-12-17", card: "referral-advantage" },
  { path: "/research/resume-length-myths", updated: "2026-11-01", published: "2025-12-17", card: "resume-length-myths" },
  { path: "/research/salary-history-bans", updated: "2026-11-02", published: "2025-12-15", card: "salary-history-bans" },
  { path: "/research/skills-first-promise-reality", updated: "2026-11-01", published: "2026-01-01", card: "skills-first-promise-reality" },
  { path: "/research/social-screening", updated: "2026-11-01", published: "2026-01-01", card: "social-screening" },
  { path: "/research/spelling-errors-impact", updated: "2026-11-02", published: "2025-12-15", card: "spelling-errors-impact" },
  { path: "/research/star-method", updated: "2026-11-01", published: "2025-12-17", card: "star-method" },
  { path: "/research/who-you-are", updated: "2026-11-01", published: "2026-10-31", card: "who-you-are" },
  { path: "/research/writing-quality-hire-probability", updated: "2026-11-01", published: "2026-01-01", card: "writing-quality-hire-probability" },

  { path: "/resources", updated: "2026-11-01" },
  { path: "/resources/offer-negotiation", updated: "2026-11-01", published: "2025-12-15", card: "offer-negotiation" },
  { path: "/resources/tech-offer-negotiation", updated: "2026-11-01", published: "2026-01-01", card: "tech-offer-negotiation" },
  { path: "/resources/tools/comp-calculator", updated: "2026-10-31", published: "2026-01-01", card: "comp-calculator" },

  // /trust and /security redirect to /privacy, /faq and /support to /help (lib/seo/retired-routes.json).
  { path: "/privacy", updated: "2026-11-02" },
  // Folded into Privacy and Help on Nov 2, 2026 (Matt's M6). Engine adds the redirects in next.config.mjs;
  // until then the routes still render, out of the sitemap. Delete them with the routes.
  { path: "/terms", updated: "2026-11-02" },
  { path: "/help", updated: "2026-11-03" },
];

/** The site card (app/opengraph-image.tsx), for pages without an answer card. */
export const SITE_SHARE_IMAGE_URL = "/opengraph-image?v=20261101";

export function shareImageUrl(path: string) {
  const { card } = publicPage(path);
  return card ? `/og/research/${card}` : SITE_SHARE_IMAGE_URL;
}

export function publicPage(path: string): PublicPage {
  const page = PUBLIC_PAGES.find((candidate) => candidate.path === path);
  if (page) return page;
  // A retired page (lib/seo/retired-routes.json) stays buildable until its file is removed: it carries
  // its destination's dates and card, and it is out of the sitemap because it is not in PUBLIC_PAGES.
  const retired = (retiredRoutes.routes as Array<{ source: string; destination: string }>).find((route) => route.source === path);
  const destination = retired && PUBLIC_PAGES.find((candidate) => candidate.path === retired.destination);
  if (destination) return { ...destination, path };
  throw new Error(`${path} is not in PUBLIC_PAGES (web/lib/seo/public-pages.ts).`);
}
