import assert from "node:assert/strict";
import Module from "node:module";
import { VISIT_ENTRY_PROPERTIES, visitEntry } from "../lib/analyticsPolicy";

// Which channel brought a visit, followed from landing to checkout. Our own links carry
// campaign tags (docs/growth/first-100-users.md); untagged visits keep only the kind of site.

const HOST = "www.recruiterinyourpocket.com";
const tagged = "?utm_source=linkedin&utm_medium=social&utm_campaign=p01-six-seconds&utm_content=post";

assert.deepEqual(visitEntry(tagged, "", HOST), {
  entry_source: "linkedin", entry_medium: "social", entry_campaign: "p01-six-seconds", entry_variant: "post",
});
assert.deepEqual(visitEntry("?utm_source=Acme-Bootcamp&utm_medium=Partner", "", HOST),
  { entry_source: "acme-bootcamp", entry_medium: "partner" }, "labels are lowercased");
assert.deepEqual(visitEntry(tagged, "https://www.linkedin.com/", HOST)?.entry_campaign, "p01-six-seconds",
  "our tag wins over the referrer");

// Someone else's tags, or values that aren't labels, are dropped whole; the referrer decides.
assert.deepEqual(visitEntry("?utm_source=weekly-digest&utm_medium=newsletter", "https://news.example.org/", HOST),
  { entry_source: "other", entry_medium: "referral" });
assert.equal(visitEntry("?utm_source=candidate@example.com&utm_medium=social", "", HOST), null);
assert.equal(visitEntry("?utm_source=https://evil.example&utm_medium=social", "", HOST), null);
assert.deepEqual(visitEntry("?utm_source=reddit&utm_medium=community&utm_campaign=555-123-4567&utm_content=has space", "", HOST),
  { entry_source: "reddit", entry_medium: "community" }, "phone-shaped and free-text labels are dropped");
const everything = visitEntry("?utm_source=google&utm_medium=cpc&utm_campaign=resume-review&utm_term=private-search-terms&gclid=abc123&fbclid=def456", "", HOST);
assert.deepEqual(everything, { entry_source: "google", entry_medium: "cpc", entry_campaign: "resume-review" });
assert(!JSON.stringify(everything).includes("private-search-terms"), "search terms never leave");

// Untagged: the kind of site, never the address or the search.
assert.deepEqual(visitEntry("", "https://www.google.com/search?q=private-search-terms", HOST), { entry_source: "google", entry_medium: "organic" });
assert.deepEqual(visitEntry("", "https://www.google.co.uk/", HOST), { entry_source: "google", entry_medium: "organic" });
assert.deepEqual(visitEntry("", "https://mail.google.com/", HOST), { entry_source: "other", entry_medium: "referral" }, "webmail is not search");
assert.deepEqual(visitEntry("", "https://chatgpt.com/", HOST), { entry_source: "chatgpt", entry_medium: "ai" });
assert.deepEqual(visitEntry("", "https://t.co/", HOST), { entry_source: "x", entry_medium: "social" });
assert.deepEqual(visitEntry("", "https://l.threads.com/", HOST), { entry_source: "threads", entry_medium: "social" });
assert.deepEqual(visitEntry("", "https://out.reddit.com/", HOST), { entry_source: "reddit", entry_medium: "community" });
assert.deepEqual(visitEntry("", "https://lnkd.in/", HOST), { entry_source: "linkedin", entry_medium: "social" });
assert.equal(visitEntry("", "", HOST), null, "a direct visit has no channel");
assert.equal(visitEntry("", "https://www.recruiterinyourpocket.com/research", HOST), null, "our own pages aren't a channel");
assert.equal(visitEntry("", "https://recruiterinyourpocket.com/", HOST), null);
assert.equal(visitEntry("", "not a url", HOST), null);
assert.equal(visitEntry("", "https://checkout.stripe.com/", HOST), null, "returning from checkout isn't a new channel");
assert.equal(visitEntry("", "https://accounts.google.com/", HOST), null, "nor is returning from sign-in");

for (const property of VISIT_ENTRY_PROPERTIES) {
  assert(!/(?:id|email|name|text|content|resume|job_description)/i.test(property), `${property} cannot look like an identity or content key`);
}

async function consentAndCarryThrough() {
  process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = "true";
  process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = "entry-test-token";
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "window", { value: new EventTarget(), configurable: true });
  Object.defineProperty(globalThis, "localStorage", {
    value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) },
    configurable: true,
  });
  Object.defineProperty(globalThis, "navigator", { value: { doNotTrack: null, globalPrivacyControl: false }, configurable: true });

  // A stand-in for the SDK's super properties: register_once keeps the first value it sees.
  let superProperties: Record<string, unknown> = {};
  const tracked: [string, Record<string, unknown>][] = [];
  const noop = () => undefined;
  const sdk = {
    init: noop, clear_opt_in_out_tracking: noop, opt_out_tracking: noop,
    register: (props: Record<string, unknown>) => { superProperties = { ...superProperties, ...props }; },
    register_once: (props: Record<string, unknown>) => { superProperties = { ...props, ...superProperties }; },
    reset: () => { superProperties = {}; },
    track: (name: string, props: Record<string, unknown>) => { tracked.push([name, { ...superProperties, ...props }]); },
    people: { increment: noop, set: noop, track_charge: noop },
  };
  const loader = Module as unknown as { _load: (...args: any[]) => any };
  const originalLoad = loader._load;
  loader._load = function (name, ...args) {
    if (name === "mixpanel-browser") return { __esModule: true, default: sdk };
    return originalLoad.call(this, name, ...args);
  };
  const consent = require("../lib/analyticsConsent") as typeof import("../lib/analyticsConsent");
  const { Analytics, noteVisitEntry, watchAnalyticsConsent } = require("../lib/analytics") as typeof import("../lib/analytics");
  const unsubscribe = watchAnalyticsConsent();
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  const entryOf = (props: Record<string, unknown>) => Object.fromEntries(VISIT_ENTRY_PROPERTIES.filter((key) => key in props).map((key) => [key, props[key]]));
  try {
    noteVisitEntry("?utm_source=reddit&utm_medium=community&utm_campaign=r-resumes", "https://out.reddit.com/", HOST);
    // A second note in the same page load can't replace the channel that brought them.
    noteVisitEntry("?utm_source=linkedin&utm_medium=social", "", HOST);
    Analytics.reportStarted(false);
    await settle();
    assert.equal(tracked.length, 0, "nothing before the visitor chooses");
    consent.setAnalyticsConsent("declined");
    Analytics.reportStarted(false);
    await settle();
    assert.equal(tracked.length, 0, "nothing after the visitor declines");
    assert.deepEqual(superProperties, {}, "the channel isn't stored after a decline");

    consent.setAnalyticsConsent("accepted");
    Analytics.track("page_viewed", { surface: "home" });
    Analytics.reportStarted(false);
    Analytics.reportCompleted(74);
    Analytics.checkoutStarted("30d", 29);
    Analytics.track("checkout_completed", { source: "purchase_return", tier: "30d", attempt: 1 });
    await settle();
    const expected = { entry_source: "reddit", entry_medium: "community", entry_campaign: "r-resumes" };
    assert.deepEqual(tracked.map(([name]) => name), ["page_viewed", "report_started", "report_completed", "checkout_started", "checkout_completed"]);
    for (const [name, props] of tracked) assert.deepEqual(entryOf(props), expected, `${name} carries the channel`);

    consent.setAnalyticsConsent("declined");
    const count = tracked.length;
    Analytics.reportStarted(false);
    await settle();
    assert.equal(tracked.length, count, "withdrawal stops the funnel");
  } finally {
    unsubscribe();
    loader._load = originalLoad;
  }
}

consentAndCarryThrough()
  .then(() => console.log("PASS: a visit's channel is allowlisted, waits for consent, and rides from landing to checkout"))
  .catch((error) => { console.error(error); process.exitCode = 1; });
