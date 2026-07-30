import type { MetadataRoute } from "next";
import { launchFlags } from "@/lib/launch/flags";

const routes = [
  "",
  "/sample-report",
  "/pricing",
  ...(launchFlags.extensionSync ? ["/extension"] : []),
  "/research",
  "/research/ats-myths",
  "/research/automation-and-bias",
  "/research/hiring-discrimination-meta-analysis",
  "/research/how-recruiters-read",
  "/research/how-we-score",
  "/research/human-vs-algorithm",
  "/research/linkedin-visibility",
  "/research/quantifying-impact",
  "/research/referral-advantage",
  "/research/resume-length-myths",
  "/research/salary-history-bans",
  "/research/skills-first-promise-reality",
  "/research/social-screening",
  "/research/spelling-errors-impact",
  "/research/star-method",
  "/research/structured-interviews-why-star",
  "/research/writing-quality-hire-probability",
  "/resources",
  "/resources/tools/comp-calculator",
  "/trust",
  "/security",
  "/privacy",
  "/terms",
  "/methodology",
  "/support",
  "/faq",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://www.recruiterinyourpocket.com${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/sample-report" || route === "/research" || route === "/resources/tools/comp-calculator" ? 0.8 : 0.6,
  }));
}
