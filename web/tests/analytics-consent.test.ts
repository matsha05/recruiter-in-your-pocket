import assert from "node:assert/strict";
import Module from "node:module";

async function main() {
  process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = "true";
  process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = "consent-test-token";
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
  Object.defineProperty(globalThis, "window", { value: new EventTarget(), configurable: true });
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
  const browser = { doNotTrack: null as string | null, globalPrivacyControl: false };
  Object.defineProperty(globalThis, "navigator", { value: browser, configurable: true });
  const calls: { name: string; args: unknown[] }[] = [];
  const record = (name: string) => (...args: unknown[]) => { calls.push({ name, args }); };
  const sdk = {
    init: record("init"), track: record("track"), register: record("register"),
    clear_opt_in_out_tracking: record("clear_opt_out"), opt_out_tracking: record("opt_out"),
    reset: record("reset"), alias: record("alias"), identify: record("identify"),
    people: { set: record("profile"), increment: record("increment"), track_charge: record("charge") },
  };
  const loader = Module as unknown as { _load: (...args: any[]) => any };
  const originalLoad = loader._load;
  let sdkLoads = 0;
  loader._load = function (name, ...args) {
    if (name === "mixpanel-browser") { sdkLoads++; return { __esModule: true, default: sdk }; }
    return originalLoad.call(this, name, ...args);
  };
  const consent = require("../lib/analyticsConsent") as typeof import("../lib/analyticsConsent");
  const { Analytics, identifyUser, resetAnalytics, watchAnalyticsConsent } = require("../lib/analytics") as typeof import("../lib/analytics");
  const unsubscribe = watchAnalyticsConsent();
  const settle = () => new Promise(resolve => setImmediate(resolve));
  const eventNames = () => calls.filter(call => call.name === "track").map(call => call.args[0]);
  try {
    Analytics.track("page_viewed", { surface: "home" });
    identifyUser("test-account"); resetAnalytics();
    await settle();
    assert.equal(sdkLoads, 0, "unknown consent must not even load the vendor");
    consent.setAnalyticsConsent("accepted");
    Analytics.track("landing_cta_clicked", { cta: "old_action" });
    consent.setAnalyticsConsent("declined");
    await settle();
    assert.equal(calls.length, 0, "revocation during import must prevent initialization and pending events");
    consent.setAnalyticsConsent("accepted");
    Analytics.track("page_viewed", { surface: "home", resume_text: "private" });
    resetAnalytics(); // Initial signed-out auth must not discard public page views.
    await settle();
    assert.deepEqual(eventNames(), ["page_viewed"]);
    assert.deepEqual(calls.find(call => call.name === "track")?.args[1], { surface: "home" });
    const config = calls.find(call => call.name === "init")?.args[1] as Record<string, unknown>;
    assert.equal(config.autocapture, false);
    assert.equal(config.track_pageview, false);
    assert.equal(config.record_sessions_percent, 0);
    assert.equal(config.ip, false);
    assert((config.property_blacklist as string[]).includes("$current_url"));
    assert((config.property_blacklist as string[]).includes("mp_keyword"));
    assert((config.property_blacklist as string[]).includes("utm_term"));
    assert((config.property_blacklist as string[]).includes("gclid"));
    identifyUser("signed-out-before-sdk-ready");
    resetAnalytics();
    await settle();
    assert.equal(calls.filter(call => call.name === "identify").length, 0, "logout must cancel a queued identity operation");
    Analytics.track("landing_cta_clicked", { cta: "queued_before_withdrawal" });
    consent.setAnalyticsConsent("declined");
    Analytics.purchaseCompleted(29, "30d", 5); identifyUser("private-id");
    await settle();
    assert.deepEqual(eventNames(), ["page_viewed"]);
    assert.deepEqual(calls.find(call => call.name === "opt_out")?.args[0], { delete_user: false });
    consent.setAnalyticsConsent("accepted");
    Analytics.sampleReportViewed();
    await settle();
    assert.deepEqual(eventNames(), ["page_viewed", "sample_report_viewed"]);
    assert(calls.some(call => call.name === "reset"), "re-consent must start a fresh identifier");
    values.set(consent.ANALYTICS_CONSENT_KEY, "declined");
    const storageEvent = Object.assign(new Event("storage"), { key: consent.ANALYTICS_CONSENT_KEY });
    window.dispatchEvent(storageEvent);
    Analytics.track("page_viewed", { surface: "pricing" }); await settle();
    assert.equal(eventNames().length, 2, "another tab's withdrawal must stop tracking here");
    for (const signal of ["doNotTrack", "globalPrivacyControl"] as const) {
      browser.doNotTrack = signal === "doNotTrack" ? "1" : null;
      browser.globalPrivacyControl = signal === "globalPrivacyControl";
      consent.setAnalyticsConsent("accepted");
      assert.equal(consent.getAnalyticsConsent(), "blocked");
      Analytics.sampleReportViewed(); await settle();
      assert.equal(eventNames().length, 2, `${signal} must override acceptance`);
    }
    browser.doNotTrack = null; browser.globalPrivacyControl = false;
    values.set(consent.ANALYTICS_CONSENT_KEY, "invalid");
    assert.equal(consent.getAnalyticsConsent(), "unknown");
    consent.setAnalyticsConsent("accepted");
    const write = storage.setItem;
    storage.setItem = () => { throw new Error("storage full"); };
    consent.setAnalyticsConsent("declined");
    assert.equal(consent.getAnalyticsConsent(), "declined", "withdrawal must override readable stale acceptance when writes fail");
    assert.notEqual(values.get(consent.ANALYTICS_CONSENT_KEY), "accepted", "a failed withdrawal must remove stale persisted acceptance when possible");
    Analytics.sampleReportViewed(); await settle();
    assert.equal(eventNames().length, 2, "storage write failure must not allow tracking after withdrawal");
    consent.setAnalyticsConsent("accepted");
    assert.equal(consent.getAnalyticsConsent(), "accepted", "acceptance must also work for this page when only writes fail");
    storage.setItem = write;
    consent.setAnalyticsConsent("declined");
    values.set(consent.ANALYTICS_CONSENT_KEY, "accepted");
    window.dispatchEvent(storageEvent);
    assert.equal(consent.getAnalyticsConsent(), "accepted", "restored persistence must clear the temporary choice and follow later cross-tab changes");
    storage.getItem = () => { throw new Error("storage blocked"); };
    storage.setItem = () => { throw new Error("storage blocked"); };
    consent.setAnalyticsConsent("declined");
    assert.equal(consent.getAnalyticsConsent(), "declined", "the choice must still work for this page when storage is blocked");
    console.log("PASS: consent gates SDK loading, events, identity, revenue, races, revocation, browser signals, and restricted storage");
  } finally { unsubscribe(); loader._load = originalLoad; }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
