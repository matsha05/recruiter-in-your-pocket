import type { Metadata } from "next";
import { publicPage } from "./public-pages";
import { shareImageForPath } from "./share-cards";
import { SITE_NAME, absoluteUrl } from "./site";

const TITLE_SUFFIX = ` | ${SITE_NAME}`;
/** Roughly what a search result shows before it cuts the title off. */
export const SEARCH_TITLE_LIMIT = 60;

type PageMetadataInput = {
  path: string;
  /** The question or topic the page answers, as someone would search for it. */
  title: string;
  description: string;
  /** Articles and guides carry their published and updated dates. */
  type?: "website" | "article";
};

/**
 * Title, description, canonical URL, and share card for a public page. The
 * site name is added to the title only when the whole title still fits in a
 * search result; search engines show the site name on its own line anyway.
 */
export function pageMetadata({ path, title, description, type = "website" }: PageMetadataInput): Metadata {
  const page = publicPage(path);
  const image = shareImageForPath(path);
  const images = [{ url: image.url, width: 1200, height: 630, alt: image.alt }];

  return {
    title: (title + TITLE_SUFFIX).length <= SEARCH_TITLE_LIMIT ? title : { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      locale: "en_US",
      title,
      description,
      images,
      ...(type === "article"
        ? { publishedTime: page.published, modifiedTime: page.updated }
        : {}),
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}
