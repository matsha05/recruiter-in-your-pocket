import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePage, parseRobots, blockedBy, checkPage, duplicates, crawlSite, formatReport, TITLE_LIMIT, MIN_MAIN_TEXT } from '../scripts/site-health.mjs';

// The crawl in scripts/site-health.mjs, run against a site that exists only in this file.
// No request leaves the process: an address the fake site does not serve fails the test.

const ORIGIN = 'https://www.example.test';
const body = 'A recruiter reads the top third of the first page before anything else. '.repeat(4);

function html({ path, title = `Title for ${path}`, description = `Description for ${path}`, canonical = `${ORIGIN}${path === '/' ? '' : path}`, robots, h1 = 'Heading', main = body, links = [], jsonLd = '{"@type":"WebPage"}' } = {}) {
  return `<!doctype html><html><head><title>${title}</title>`
    + (description === null ? '' : `<meta name="description" content="${description}"/>`)
    + (canonical === null ? '' : `<link rel="canonical" href="${canonical}"/>`)
    + (robots ? `<meta name="robots" content="${robots}"/>` : '')
    + `<script type="application/ld+json">${jsonLd}</script></head><body>`
    + `<header class="site-header"><a href="/">Home</a></header>`
    + (main === null ? '' : `<main><h1>${h1}</h1><p>${main}</p>${links.map((href) => `<a href="${href}">link</a>`).join('')}</main>`)
    + `<svg><title>An icon</title></svg></body></html>`;
}

/** A fetch for a fake site: routes maps a path to { status, body, headers } or a string body. */
function site(routes) {
  const requested = [];
  const fetchImpl = async (input, init) => {
    const url = new URL(input);
    assert.equal(url.origin, ORIGIN, `the crawl must stay on the site, requested ${url.href}`);
    assert.equal(init.redirect, 'manual', 'redirects are read, not followed');
    requested.push(url.pathname);
    const route = routes[url.pathname];
    if (route === undefined) return new Response('Not found', { status: 404 });
    if (typeof route === 'string') return new Response(route, { status: 200 });
    return new Response(route.status >= 300 && route.status < 400 ? null : route.body ?? '', { status: route.status ?? 200, headers: route.headers });
  };
  return { fetchImpl, requested };
}

const sitemap = (...paths) => `<urlset>${paths.map((path) => `<url><loc>${ORIGIN}${path === '/' ? '' : path}</loc></url>`).join('')}</urlset>`;
const robotsTxt = `User-Agent: *\nAllow: /\nDisallow: /api/\nDisallow: /internal/\n\nSitemap: ${ORIGIN}/sitemap.xml\n`;

function healthy(extra = {}) {
  return {
    '/robots.txt': robotsTxt,
    '/sitemap.xml': sitemap('/', '/pricing', '/help'),
    '/': html({ path: '/', links: ['/pricing', '/signin', '/api/health', 'https://elsewhere.test/x', 'mailto:a@example.test'] }),
    '/pricing': html({ path: '/pricing', links: ['/help', '/faq'] }),
    '/help': html({ path: '/help' }),
    '/signin': 'Sign in',
    '/faq': { status: 308, headers: { location: '/help' } },
    '/llms.txt': `# Site\n\n- [Pricing](${ORIGIN}/pricing): what it costs.\n- [Help](${ORIGIN}/help): answers.\n`,
    ...extra,
  };
}
const retiredRoutes = [{ source: '/faq', destination: '/help' }];
const checks = (result) => result.findings.map((finding) => `${finding.check} ${finding.page}`).sort();

test('parsePage reads the head, the heading, the main text and the JSON-LD', () => {
  const parsed = parsePage(html({ path: '/pricing', title: 'Pricing &amp; plans', robots: 'index, follow' }));
  assert.equal(parsed.title, 'Pricing & plans', 'the document title, not the icon title further down');
  assert.equal(parsed.description, 'Description for /pricing');
  assert.deepEqual(parsed.canonicals, [`${ORIGIN}/pricing`]);
  assert.equal(parsed.robots, 'index, follow');
  assert.deepEqual(parsed.h1, ['Heading']);
  assert.ok(parsed.hasMain && parsed.mainText > MIN_MAIN_TEXT);
  assert.deepEqual(parsed.jsonLd, [{ ok: true }]);
  // Attribute order and quoting vary between renderers.
  const reordered = parsePage(`<link href='https://a.test/x' rel='canonical'><meta content="Later" name="description">`);
  assert.deepEqual(reordered.canonicals, ['https://a.test/x']);
  assert.equal(reordered.description, 'Later');
});

test('robots.txt rules for every crawler are read; rules for one named crawler are not', () => {
  const robots = parseRobots(`# comment\nUser-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nUser-agent: Bingbot\nDisallow: /api/ # private\nDisallow: /*.json$\nDisallow:\nSitemap: ${ORIGIN}/sitemap.xml`);
  assert.deepEqual(robots.disallow, ['/api/', '/*.json$']);
  assert.deepEqual(robots.sitemaps, [`${ORIGIN}/sitemap.xml`]);
  assert.equal(blockedBy('/api/health', robots.disallow), '/api/');
  assert.equal(blockedBy('/apiary', robots.disallow), null);
  assert.equal(blockedBy('/data/feed.json', robots.disallow), '/*.json$');
  assert.equal(blockedBy('/data/feed.json.html', robots.disallow), null);
});

test('a healthy site has no findings, and blocked or external links are not fetched', async () => {
  const { fetchImpl, requested } = site(healthy());
  const result = await crawlSite(ORIGIN, { fetchImpl, retiredRoutes });
  assert.deepEqual(result.findings, []);
  assert.deepEqual(result.pages.sort(), ['/', '/help', '/pricing']);
  assert.equal(result.linksChecked, 2, '/signin and /faq leave the sitemap and are followed');
  assert.ok(!requested.includes('/api/health'), 'a link robots.txt blocks is not requested');
  assert.match(formatReport(result), /3 pages in \/sitemap\.xml[\s\S]*No findings\./);
});

test('each page-level problem is flagged with the page it is on', () => {
  const page = (overrides, response = {}) => ({ path: '/pricing', loc: `${ORIGIN}/pricing`, status: 200, headers: {}, html: html({ path: '/pricing', ...overrides }), ...response });
  const only = (input, options) => checkPage(input, options).map((finding) => finding.check);

  assert.deepEqual(only(page({})), []);
  assert.deepEqual(only(page({}, { status: 404 })), ['status']);
  assert.deepEqual(only(page({}, { status: 308, location: `${ORIGIN}/plans` })), ['redirect']);
  assert.deepEqual(only(page({}, { headers: { 'x-robots-tag': 'noindex, nofollow' } })), ['noindex']);
  assert.deepEqual(only(page({ robots: 'noindex' })), ['noindex']);
  assert.deepEqual(only(page({ canonical: null })), ['canonical']);
  assert.deepEqual(only(page({ canonical: `${ORIGIN}/` })), ['canonical']);
  assert.deepEqual(only(page({ canonical: `${ORIGIN}/pricing/` })), [], 'a trailing slash is the same page');
  assert.deepEqual(only(page({ title: 'x'.repeat(TITLE_LIMIT) })), []);
  assert.deepEqual(only(page({ title: 'x'.repeat(TITLE_LIMIT + 1) })), ['title']);
  assert.deepEqual(only(page({ title: '' })), ['title']);
  assert.deepEqual(only(page({ description: null })), ['description']);
  assert.deepEqual(only(page({ h1: '' })), ['content']);
  assert.deepEqual(only(page({ main: 'Loading' })), ['content'], 'a page that renders on the client only');
  assert.deepEqual(only(page({ main: null })), ['content', 'content'], 'no heading and no main');
  assert.deepEqual(only(page({ jsonLd: '{"@type": }' })), ['structured-data']);
  assert.deepEqual(only(page({}), { disallow: ['/pric'] }), ['robots']);

  const [finding] = checkPage(page({ canonical: `${ORIGIN}/plans` }));
  assert.deepEqual(finding, { page: '/pricing', check: 'canonical', detail: `points at ${ORIGIN}/plans` });
});

test('two pages with one title or one description are flagged once, on the second', () => {
  const found = duplicates([
    { page: '/a', title: 'Same', description: 'One' },
    { page: '/b', title: 'Same', description: 'Two' },
    { page: '/c', title: 'Other', description: 'Two' },
    { page: '/d', title: null, description: null },
    { page: '/e', title: null, description: null },
  ]);
  assert.deepEqual(found, [
    { page: '/b', check: 'title', detail: 'same title as /a' },
    { page: '/c', check: 'description', detail: 'same description as /b' },
  ]);
});

test('broken links, redirect chains and links to a failing page are flagged with where they came from', async () => {
  const { fetchImpl } = site(healthy({
    '/': html({ path: '/', links: ['/gone', '/chain', '/dead-end', '/faq'] }),
    '/chain': { status: 307, headers: { location: '/chain-2' } },
    '/chain-2': { status: 307, headers: { location: '/help' } },
    '/dead-end': { status: 308, headers: { location: '/missing' } },
  }));
  const result = await crawlSite(ORIGIN, { fetchImpl, retiredRoutes });
  assert.deepEqual(checks(result), ['link /chain', 'link /dead-end', 'link /gone']);
  const detail = (path) => result.findings.find((finding) => finding.page === path).detail;
  assert.equal(detail('/gone'), 'linked from /; returned 404');
  assert.match(detail('/chain'), /^linked from \/; redirects more than once: 307 to .*\/chain-2, then 307 to .*\/help$/);
  assert.match(detail('/dead-end'), /redirects to .*\/missing, which returned 404$/);
});

test('a sitemap page that redirects, fails or duplicates another is flagged', async () => {
  const { fetchImpl } = site(healthy({
    '/sitemap.xml': sitemap('/', '/pricing', '/help', '/old', '/broken'),
    '/old': { status: 308, headers: { location: '/help' } },
    '/broken': { status: 500, body: 'error' },
    '/help': html({ path: '/help', title: 'Title for /pricing' }),
  }));
  const result = await crawlSite(ORIGIN, { fetchImpl, retiredRoutes });
  assert.deepEqual(checks(result), ['redirect /old', 'status /broken', 'title /help']);
  assert.match(formatReport(result), /3 findings:/);
});

test('retired pages must redirect once, permanently, to a listed page', async () => {
  const routes = [
    { source: '/faq', destination: '/help' },
    { source: '/support', destination: '/help' },
    { source: '/trust', destination: '/privacy' },
    { source: '/security', destination: '/privacy' },
    { source: '/temp', destination: '/help' },
  ];
  const { fetchImpl } = site(healthy({
    '/support': html({ path: '/support' }),
    '/trust': { status: 308, headers: { location: '/help' } },
    '/security': { status: 308, headers: { location: '/privacy' } },
    '/temp': { status: 307, headers: { location: '/help' } },
  }));
  const result = await crawlSite(ORIGIN, { fetchImpl, retiredRoutes: routes });
  assert.deepEqual(checks(result), ['retired /security', 'retired /support', 'retired /temp', 'retired /trust']);
  const detail = (path) => result.findings.find((finding) => finding.page === path).detail;
  assert.match(detail('/support'), /returned 200$/);
  assert.match(detail('/trust'), /not \/privacy$/);
  assert.match(detail('/security'), /not in the sitemap$/);
  assert.match(detail('/temp'), /returned 307$/);
});

test('robots.txt, the sitemap and llms.txt are checked as files', async () => {
  const blocked = await crawlSite(ORIGIN, { ...site(healthy({ '/robots.txt': 'User-agent: *\nDisallow: /api/\nDisallow: /help\n' })) });
  assert.deepEqual(checks(blocked), ['robots /help', 'robots /robots.txt']);

  const llms = await crawlSite(ORIGIN, { ...site(healthy({ '/llms.txt': `- [Workspace](${ORIGIN}/workspace): private.\n- [Away](https://elsewhere.test/page): not ours.\n` })) });
  assert.deepEqual(checks(llms), ['llms /llms.txt', 'llms /llms.txt']);

  const missing = await crawlSite(ORIGIN, { ...site(healthy({ '/llms.txt': undefined, '/robots.txt': undefined })) });
  // With no robots.txt nothing is blocked, so the link to /api/health is followed and found missing.
  assert.deepEqual(checks(missing), ['link /api/health', 'status /llms.txt', 'status /robots.txt']);

  const otherHost = await crawlSite(ORIGIN, { ...site(healthy({ '/sitemap.xml': `<urlset><url><loc>https://example.test/pricing</loc></url><url><loc>https://example.test/pricing</loc></url></urlset>` })) });
  assert.ok(checks(otherHost).includes('sitemap /sitemap.xml'));
  assert.match(otherHost.findings[0].detail, /2 of 2 URLs are on another host/);
  assert.ok(otherHost.findings.some((finding) => /more than once/.test(finding.detail)));
  assert.ok(otherHost.findings.some((finding) => finding.check === 'canonical' && finding.page === '/pricing'), 'the canonical is compared with the URL the sitemap lists');

  const noSitemap = await crawlSite(ORIGIN, { ...site({ '/robots.txt': robotsTxt }) });
  assert.deepEqual(checks(noSitemap), ['status /sitemap.xml']);
  assert.deepEqual(noSitemap.pages, []);
});

test('a request that fails is a finding, not a crash', async () => {
  const { fetchImpl } = site(healthy());
  const flaky = async (input, init) => {
    if (new URL(input).pathname === '/pricing') throw new Error('socket hang up');
    return fetchImpl(input, init);
  };
  const result = await crawlSite(ORIGIN, { fetchImpl: flaky, retiredRoutes });
  assert.deepEqual(checks(result), ['status /pricing']);
  assert.equal(result.findings[0].detail, 'request failed: socket hang up');
});
