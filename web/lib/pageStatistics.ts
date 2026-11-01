import type { ConsentState } from "./analyticsConsent";

/**
 * Basic, cookieless page statistics (Vercel Web Analytics). They count unless the
 * visitor declined analytics in Privacy choices or the browser asks not to be
 * tracked (Do Not Track or Global Privacy Control, reported as "blocked").
 */
export function allowsPageStatistics(consent: ConsentState): boolean {
    return consent !== "declined" && consent !== "blocked";
}

// Campaign tags explain where visitors came from; nothing else in a query string is kept.
const KEPT_QUERY_PARAMS = new Set(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"]);

// Report, session, and message ids are private: long hex or UUIDs, digit runs, or long tokens.
// Ids always carry a digit; readable slugs such as "spelling-errors-impact" do not.
const PRIVATE_SEGMENT = /^(?=[^/]*\d)(?:[0-9a-f-]{16,}|\d{4,}|[A-Za-z0-9_-]{20,})$/i;

/** The page address with private ids and query values removed before anything is sent. */
export function scrubPageUrl(rawUrl: string): string {
    let url: URL;
    try {
        url = new URL(rawUrl);
    } catch {
        return rawUrl;
    }
    const path = url.pathname
        .split("/")
        .map((segment) => (PRIVATE_SEGMENT.test(segment) ? "[id]" : segment))
        .join("/");
    const kept = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
        if (KEPT_QUERY_PARAMS.has(key.toLowerCase())) kept.set(key, value);
    });
    const query = kept.toString();
    return `${url.origin}${path}${query ? `?${query}` : ""}`;
}
