import { publicPage, shareImageUrl } from "./public-pages";
import {
  WEBSITE_ID,
  absoluteUrl,
  breadcrumbStructuredData,
  organizationReference,
  type Breadcrumb,
} from "./site";

type Citation = { title: string; publisher?: string; href?: string };

type ArticleInput = {
  path: string;
  /** The visible headline (the page's h1). */
  headline: string;
  description: string;
  /** Breadcrumbs after Home, ending with this page. */
  trail: Breadcrumb[];
  citations?: Citation[];
};

/**
 * Article plus BreadcrumbList for a research article or guide. The pages carry
 * no personal byline, so the author is the organization; dates come from
 * PUBLIC_PAGES, the same dates the page shows.
 */
export function articleStructuredData({ path, headline, description, trail, citations }: ArticleInput) {
  const page = publicPage(path);
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline,
        description,
        url,
        mainEntityOfPage: url,
        image: absoluteUrl(shareImageUrl(path)),
        inLanguage: "en-US",
        datePublished: page.published ?? page.updated,
        dateModified: page.updated,
        author: organizationReference,
        publisher: organizationReference,
        isPartOf: { "@id": WEBSITE_ID },
        ...(citations?.length
          ? {
              citation: citations.map((source) => ({
                "@type": "CreativeWork",
                name: source.title,
                ...(source.publisher ? { publisher: source.publisher } : {}),
                ...(source.href ? { url: source.href } : {}),
              })),
            }
          : {}),
      },
      breadcrumbStructuredData(trail),
    ],
  };
}

/** "November 2026", the way the page shows an updated date. */
export function formatMonth(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}
