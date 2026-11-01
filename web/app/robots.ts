import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

// Only routes that are never pages are blocked here. Account, report, sign-in, and
// purchase pages stay crawlable so search engines can read their noindex tag:
// a page blocked in robots.txt can still be indexed from links, without it.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/internal/", "/playground/", "/monitoring"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
