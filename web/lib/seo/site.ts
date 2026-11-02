// One place for the site's identity in search and on shared links. The site is
// anonymous by design: no Person entity, founder name, or profile link.

export const SITE_URL = "https://www.recruiterinyourpocket.com";
export const SITE_NAME = "Recruiter in Your Pocket";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Section names used in breadcrumbs, matching the visible navigation. */
export const SECTION_NAMES = {
  "/research": "Research",
  "/resources": "After the offer",
} as const;

/** Matches the canonical tag Next.js renders, so the homepage has no trailing slash. */
export function absoluteUrl(path: string) {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/** Search engines read this as the publisher and author of every page. */
export const organizationReference = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
} as const;

export const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      ...organizationReference,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/icon-512.png`,
        width: 512,
        height: 512,
      },
      email: "support@recruiterinyourpocket.com",
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      inLanguage: "en-US",
      publisher: { "@id": ORGANIZATION_ID },
    },
  ],
};

export type Breadcrumb = { name: string; path: string };

export function breadcrumbStructuredData(trail: Breadcrumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** JSON for a script tag: "<" is escaped so page text can never close the tag. */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
