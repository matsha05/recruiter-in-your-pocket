import assert from "node:assert/strict";
import Module from "node:module";
import { ctaClick, PAGE_SURFACES, researchArticleSlug } from "../lib/analyticsSurfaces";
import { sanitizeAnalyticsEvent } from "../lib/analyticsPolicy";

// Research pages: which article was read, and which report action was clicked. Both stay
// inside the analytics policy and only reach the vendor after the visitor accepts analytics.

assert.equal(researchArticleSlug("/research/how-recruiters-read"), "how-recruiters-read");
assert.equal(researchArticleSlug("/research/how-recruiters-read/"), "how-recruiters-read");
assert.equal(researchArticleSlug("/research"), null, "the hub is a page_viewed surface, not an article");
assert.equal(researchArticleSlug("/research/a/b"), null);
assert.equal(researchArticleSlug("/reports/0b9f3c1e-0000-4000-8000-000000000000"), null);
assert.equal(researchArticleSlug("/resources/offer-negotiation"), null);
assert.equal(PAGE_SURFACES["/research"], "research");

assert.deepEqual(ctaClick("/research/ats-myths", "research_bridge", "/workspace"), { cta: "research_bridge", destination: "/workspace" });
assert.deepEqual(ctaClick("/research/ats-myths", "research_close", "/workspace"), { cta: "research_close", destination: "/workspace" });
assert.deepEqual(ctaClick("/research", "research_report", "/workspace"), { cta: "research_report", destination: "/workspace" });
assert.deepEqual(ctaClick("/", "hero_report", "/workspace"), { cta: "hero_report", destination: "/workspace" }, "the homepage keeps its clicks");
assert.equal(ctaClick("/pricing", "header_report", "/workspace"), null, "other pages stay out until they're added on purpose");
assert.equal(ctaClick("/research/ats-myths", "research_bridge", "/pricing"), null, "only report and sample destinations count");
assert.equal(ctaClick("/research/ats-myths", undefined, "/workspace"), null);

// The policy keeps the slug and drops anything else.
assert.deepEqual(
  sanitizeAnalyticsEvent("research_article_viewed", { slug: "how-recruiters-read", url: "https://www.recruiterinyourpocket.com/research/how-recruiters-read" }),
  { name: "research_article_viewed", properties: { slug: "how-recruiters-read" } },
);
assert.deepEqual(
  sanitizeAnalyticsEvent("landing_cta_clicked", ctaClick("/research/ats-myths", "research_bridge", "/workspace") ?? {}),
  { name: "landing_cta_clicked", properties: { cta: "research_bridge", destination: "/workspace" } },
);

async function consentGate() {
  process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = "true";
  process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = "research-test-token";
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "window", { value: new EventTarget(), configurable: true });
  Object.defineProperty(globalThis, "localStorage", {
    value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) },
    configurable: true,
  });
  Object.defineProperty(globalThis, "navigator", { value: { doNotTrack: null, globalPrivacyControl: false }, configurable: true });
  const tracked: unknown[][] = [];
  const noop = () => undefined;
  const sdk = { init: noop, register: noop, clear_opt_in_out_tracking: noop, opt_out_tracking: noop, reset: noop, track: (...args: unknown[]) => { tracked.push(args); } };
  const loader = Module as unknown as { _load: (...args: any[]) => any };
  const originalLoad = loader._load;
  loader._load = function (name, ...args) {
    if (name === "mixpanel-browser") return { __esModule: true, default: sdk };
    return originalLoad.call(this, name, ...args);
  };
  const consent = require("../lib/analyticsConsent") as typeof import("../lib/analyticsConsent");
  const { Analytics, watchAnalyticsConsent } = require("../lib/analytics") as typeof import("../lib/analytics");
  const unsubscribe = watchAnalyticsConsent();
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  try {
    Analytics.researchArticleViewed("how-recruiters-read");
    await settle();
    assert.equal(tracked.length, 0, "no research events before the visitor chooses");
    consent.setAnalyticsConsent("declined");
    Analytics.researchArticleViewed("how-recruiters-read");
    await settle();
    assert.equal(tracked.length, 0, "no research events after the visitor declines");
    consent.setAnalyticsConsent("accepted");
    Analytics.researchArticleViewed("how-recruiters-read");
    Analytics.track("landing_cta_clicked", ctaClick("/research/how-recruiters-read", "research_bridge", "/workspace") ?? {});
    await settle();
    assert.deepEqual(tracked, [
      ["research_article_viewed", { slug: "how-recruiters-read" }],
      ["landing_cta_clicked", { cta: "research_bridge", destination: "/workspace" }],
    ]);
  } finally {
    unsubscribe();
    loader._load = originalLoad;
  }
}

consentGate()
  .then(() => console.log("PASS: research article views and report clicks are allowlisted and wait for consent"))
  .catch((error) => { console.error(error); process.exitCode = 1; });
