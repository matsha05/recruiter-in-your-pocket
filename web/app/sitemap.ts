import type { MetadataRoute } from "next";

const routes = [
  "",
  "/workspace",
  "/extension",
  "/reports",
  "/jobs",
  "/research",
  "/guides",
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
    url: `https://recruiterinyourpocket.com${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/workspace" || route === "/research" ? 0.8 : 0.6,
  }));
}
