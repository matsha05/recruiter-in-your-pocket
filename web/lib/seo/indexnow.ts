import type { PublicPage } from "./public-pages";
import { SITE_URL, absoluteUrl } from "./site";

// IndexNow tells Bing (and the engines that share its feed) that a page is new
// or changed, so it is crawled the day it ships instead of whenever the crawler
// next comes by. Google does not take part; it reads the sitemap.
//
// The key is public by design: the engine checks that the same value is served
// at KEY_LOCATION (web/public/<key>.txt) to confirm we own the host.
export const INDEXNOW_KEY = "5672f6e8b78423ad6b0c562bfebd8469";
export const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/** What was last told to the engines: each page's path and its `updated` date. */
export type SubmittedPages = Record<string, string>;

/**
 * The pages the engines haven't been told about: new paths, and paths whose
 * `updated` date differs from the one last submitted. An unchanged page is
 * never sent twice; the protocol asks for changes only.
 */
export function pagesToSubmit(pages: readonly PublicPage[], submitted: SubmittedPages): PublicPage[] {
  return pages.filter((page) => submitted[page.path] !== page.updated);
}

export function submittedAfter(pages: readonly PublicPage[]): SubmittedPages {
  return Object.fromEntries(pages.map((page) => [page.path, page.updated]));
}

export function indexNowBody(pages: readonly PublicPage[]) {
  return {
    host: new URL(SITE_URL).host,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: pages.map((page) => absoluteUrl(page.path)),
  };
}

export type IndexNowResult = { ok: true; status: number } | { ok: false; status: number | null };

/** One POST for the whole list. 200 and 202 both mean the list was taken. */
export async function submitToIndexNow(
  pages: readonly PublicPage[],
  fetcher: typeof fetch = fetch,
  timeoutMs = 8000,
): Promise<IndexNowResult> {
  try {
    const response = await fetcher(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(indexNowBody(pages)),
      signal: AbortSignal.timeout(timeoutMs),
    });
    return response.status === 200 || response.status === 202
      ? { ok: true, status: response.status }
      : { ok: false, status: response.status };
  } catch {
    return { ok: false, status: null };
  }
}
