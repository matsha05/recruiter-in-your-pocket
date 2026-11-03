import type { MetadataRoute } from "next";
import { PUBLIC_PAGES } from "@/lib/seo/public-pages";
import { absoluteUrl } from "@/lib/seo/site";

// lastmod is the date the page's content last changed, recorded in PUBLIC_PAGES.
// Never the build date: a sitemap that says everything changed today gets ignored.
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.filter((page) => !page.retired).map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: page.updated,
  }));
}
