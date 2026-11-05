// Types for scripts/internal-links.mjs, for the Playwright gate in web/tests/ui/internal-links.spec.ts.

export type InboundCounts = { body: Set<string>; chrome: Set<string> };

export type CrawlResult = {
  pages: string[];
  inbound: Map<string, InboundCounts>;
  outbound: Map<string, Set<string>>;
};

export type Summary = {
  rows: Array<{ page: string; body: number; chrome: number; from: string[] }>;
  orphans: string[];
  everywhere: string[];
};

export function extractLinks(html: string): Array<{ href: string; inChrome: boolean }>;
export function internalPath(href: string, origin: string): string | null;
export function readSitemap(baseUrl: string, fetchImpl?: typeof fetch): Promise<string[]>;
export function crawl(baseUrl: string, options?: { fetchImpl?: typeof fetch; pages?: string[] }): Promise<CrawlResult>;
export function summarize(result: CrawlResult): Summary;
