import type { MetadataRoute } from "next";
import { launchFlags } from "@/lib/launch/flags";

const routes = [
  "",
  "/workspace",
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
  "/trust",
  "/security",
  "/privacy",
  "/terms",
  "/methodology",
  "/status",
  "/faq",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((route) => ({
    url: `https://www.recruiterinyourpocket.com${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/workspace" || route === "/research" ? 0.8 : 0.6,
  }));
}
