import assert from "node:assert/strict";
import crypto from "node:crypto";

delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;
delete process.env.KV_REST_API_URL;
delete process.env.KV_REST_API_TOKEN;
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "launch-signals-test-secret";

const sentry = require("@sentry/nextjs");
const counted: Array<{ name: string; value: number; attributes: Record<string, string> }> = [];
sentry.metrics.count = (name: string, value: number, options: { attributes: Record<string, string> }) => {
  counted.push({ name, value, attributes: options.attributes });
};

const {
  classifyReportFailure,
  confirmStepFor,
  latencyBucketFor,
  recordLaunchSignal,
  restoreStepFor,
  sanitizeLaunchSignal,
} = require("../lib/observability/launchSignals") as typeof import("../lib/observability/launchSignals");
const { anonymousGenerationAccessBackend } =
  require("../lib/billing/anonymousGenerationAccess") as typeof import("../lib/billing/anonymousGenerationAccess");
const { reserveGenerationAccess } =
  require("../lib/billing/generationAccess") as typeof import("../lib/billing/generationAccess");
const { getCurrentMonthKey } = require("../lib/backend/freeCookie") as typeof import("../lib/backend/freeCookie");
const { browserTraceSampleRate, isKeyJourneyRoute } =
  require("../lib/observability/browserTracesSampler") as typeof import("../lib/observability/browserTracesSampler");
const { paidJourneyHealth } = require("../lib/launch/paidJourneyHealth") as typeof import("../lib/launch/paidJourneyHealth");

const hash = () => crypto.randomBytes(32).toString("hex");

async function main() {
  // The schema is closed: unknown signals, attributes and values never leave RIYP.
  assert.equal(sanitizeLaunchSignal("riyp.report.viewed", { outcome: "completed" }), null);
  assert.deepEqual(
    sanitizeLaunchSignal("riyp.report.outcome", {
      outcome: "failed",
      failure: "validation",
      error_code: "OPENAI_RESPONSE_SHAPE_INVALID",
      mode: "resume",
      viewer: "anonymous",
      has_jd: "yes",
      endpoint: "stream",
      latency_bucket: "60to120",
      email: "person@example.com",
      report_id: "3f2b9c1e-7d4a-4c1b-9e2f-1a2b3c4d5e6f",
    }),
    {
      name: "riyp.report.outcome",
      attributes: {
        outcome: "failed",
        failure: "validation",
        error_code: "OPENAI_RESPONSE_SHAPE_INVALID",
        mode: "resume",
        viewer: "anonymous",
        has_jd: "yes",
        endpoint: "stream",
        latency_bucket: "60to120",
      },
    },
  );
  // The wait is recorded only as one of four buckets; a raw millisecond value never leaves.
  assert.deepEqual(
    sanitizeLaunchSignal("riyp.report.outcome", { outcome: "completed", latency_bucket: "87412" })?.attributes,
    { outcome: "completed" },
  );
  const t0 = 1_700_000_000_000;
  assert.equal(latencyBucketFor(t0, t0), "lt30");
  assert.equal(latencyBucketFor(t0, t0 + 29_999), "lt30");
  assert.equal(latencyBucketFor(t0, t0 + 30_000), "30to60");
  assert.equal(latencyBucketFor(t0, t0 + 59_999), "30to60");
  assert.equal(latencyBucketFor(t0, t0 + 60_000), "60to120");
  assert.equal(latencyBucketFor(t0, t0 + 119_999), "60to120");
  assert.equal(latencyBucketFor(t0, t0 + 120_000), "gt120");
  assert.equal(latencyBucketFor(t0, t0 + 600_000), "gt120");
  assert.equal(latencyBucketFor(t0 + 5_000, t0), "lt30", "a clock that moved backwards still yields a bucket");
  for (const bucket of ["lt30", "30to60", "60to120", "gt120"]) {
    assert.equal(sanitizeLaunchSignal("riyp.report.outcome", { latency_bucket: bucket })?.attributes.latency_bucket, bucket);
  }
  assert.deepEqual(
    sanitizeLaunchSignal("riyp.report.outcome", {
      outcome: "maybe",
      error_code: "person@example.com",
      has_jd: true,
    })?.attributes,
    {},
    "unlisted values, free text and non-strings are dropped",
  );
  assert.deepEqual(
    sanitizeLaunchSignal("riyp.checkout.step", { step: "checkout_started", source: "https://evil.example" })?.attributes,
    { step: "checkout_started" },
  );

  // Failure kinds follow the generation release reasons.
  assert.equal(classifyReportFailure({ code: "OPENAI_RESPONSE_SHAPE_INVALID" }), "validation");
  assert.equal(classifyReportFailure({ code: "OPENAI_RESPONSE_PARSE_ERROR" }), "validation");
  assert.equal(classifyReportFailure({ code: "OPENAI_TIMEOUT", name: "AbortError" }), "timeout");
  assert.equal(classifyReportFailure({ code: "OPENAI_NETWORK_ERROR" }), "provider");
  assert.equal(classifyReportFailure({ code: "OPENAI_HTTP_ERROR" }), "provider");
  assert.equal(classifyReportFailure({ code: "CLIENT_CANCELED" }), "canceled");
  assert.equal(classifyReportFailure({ name: "AbortError" }), "canceled");
  assert.equal(classifyReportFailure({ code: "GENERATION_PAUSED" }), "paused");
  assert.equal(classifyReportFailure({ code: "GENERATION_BUDGET_EXHAUSTED" }), "paused");
  assert.equal(classifyReportFailure({ code: "RECOVERY_STORAGE_REQUIRED" }), "precondition");
  assert.equal(classifyReportFailure({ code: "ACCESS_DEPENDENCY_UNAVAILABLE" }), "access");
  assert.equal(classifyReportFailure({ code: "REPORT_PERSISTENCE_FAILED" }), "persistence");
  assert.equal(classifyReportFailure({ code: "INTERNAL_SERVER_ERROR" }), "other");
  assert.equal(classifyReportFailure(null), "other");

  // Billing responses map to funnel steps; polls and sign-in prompts are not steps.
  assert.equal(confirmStepFor(200, { state: "unlocked" }), "confirm_unlocked");
  assert.equal(confirmStepFor(202, { state: "fulfillment_pending" }), null);
  assert.equal(confirmStepFor(409, { state: "checkout_incomplete" }), "confirm_incomplete");
  assert.equal(confirmStepFor(402, { state: "not_paid" }), "confirm_incomplete");
  assert.equal(confirmStepFor(503, { state: "checkout_incomplete" }), "confirm_failed");
  assert.equal(confirmStepFor(429, { state: "fulfillment_pending" }), null);
  assert.equal(restoreStepFor(200, { restored: 1, active_after: 1 }), "restore_restored");
  assert.equal(restoreStepFor(200, { restored: 0, active_after: 1 }), "restore_already_active");
  assert.equal(restoreStepFor(200, { restored: 0, active_after: 0 }), "restore_none");
  assert.equal(restoreStepFor(401, { restored: 0 }), null);
  assert.equal(restoreStepFor(429, { restored: 0 }), null);
  assert.equal(restoreStepFor(503, { restored: 0 }), "restore_failed");

  // Recording works outside a request, sends one unsampled count, and logs without tripping the PII guard.
  const logged: string[] = [];
  const originalLog = console.log;
  const originalError = console.error;
  console.log = (line: string) => { logged.push(line); };
  console.error = (line: string) => { logged.push(line); };
  try {
    recordLaunchSignal("riyp.free_gate.check", {
      result: "blocked", reason: "network", first_attempt: "yes", viewer: "anonymous",
    });
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
  assert.deepEqual(counted, [{
    name: "riyp.free_gate.check",
    value: 1,
    attributes: { result: "blocked", reason: "network", first_attempt: "yes", viewer: "anonymous" },
  }]);
  assert.equal(logged.length, 1);
  const record = JSON.parse(logged[0]);
  assert.equal(record.msg, "launch.signal");
  assert.equal(record.signal.metric, "riyp.free_gate.check");

  // The ledger names why it refused, without changing who it refuses.
  const monthKey = getCurrentMonthKey();
  const first = { identityHash: hash(), shadowHash: hash(), monthKey, reservationId: crypto.randomUUID() };
  assert.deepEqual(await anonymousGenerationAccessBackend.reserveWithReason(first), { reserved: true });
  assert.deepEqual(
    await anonymousGenerationAccessBackend.reserveWithReason({ ...first, reservationId: crypto.randomUUID() }),
    { reserved: false, refusal: "hold" },
    "a generation still in flight holds both keys",
  );
  assert.equal(await anonymousGenerationAccessBackend.commit(first), true);

  const sameBrowserNewNetwork = { ...first, shadowHash: hash(), reservationId: crypto.randomUUID() };
  assert.deepEqual(
    await anonymousGenerationAccessBackend.reserveWithReason(sameBrowserNewNetwork),
    { reserved: false, refusal: "identity" },
  );
  assert.equal(
    await anonymousGenerationAccessBackend.reserve({ ...sameBrowserNewNetwork, reservationId: crypto.randomUUID() }),
    false,
    "the boolean reserve still refuses, and the refusal copied the commit to the new network",
  );

  const newBrowserSameNetwork = { ...first, identityHash: hash(), reservationId: crypto.randomUUID() };
  assert.deepEqual(
    await anonymousGenerationAccessBackend.reserveWithReason(newBrowserSameNetwork),
    { reserved: false, refusal: "network" },
  );
  assert.deepEqual(
    await anonymousGenerationAccessBackend.reserveWithReason({ ...newBrowserSameNetwork, reservationId: crypto.randomUUID() }),
    { reserved: false, refusal: "identity" },
    "after the copy, that browser's own id records the report too",
  );

  // Reservations carry the gate reason to the route.
  const freshMeta = { used: 0, last_free_ts: null, reset_month: monthKey, needs_reset: false };
  const usedMeta = { ...freshMeta, used: 1, last_free_ts: new Date().toISOString() };
  const cookieBlocked = await reserveGenerationAccess({
    userId: null, admin: null, reportKind: "resume_feedback", bypass: false, freeMeta: usedMeta,
    anonymousIdentityHash: hash(), anonymousShadowHash: hash(),
  });
  assert.equal(cookieBlocked.access, "preview");
  assert.equal(cookieBlocked.freeGate, "cookie");
  const networkBlocked = await reserveGenerationAccess({
    userId: null, admin: null, reportKind: "resume_feedback", bypass: false, freeMeta: freshMeta,
    anonymousIdentityHash: hash(), anonymousShadowHash: first.shadowHash,
  });
  assert.equal(networkBlocked.access, "preview");
  assert.equal(networkBlocked.freeGate, "network", "a first attempt blocked by a shared network is visible");
  const allowed = await reserveGenerationAccess({
    userId: null, admin: null, reportKind: "resume_feedback", bypass: false, freeMeta: freshMeta,
    anonymousIdentityHash: hash(), anonymousShadowHash: hash(),
  });
  assert.equal(allowed.access, "full");
  assert.equal(allowed.freeGate, undefined);

  // Key paid-journey routes keep every trace; other pages keep the base sample.
  for (const route of ["/", "/workspace", "/reports/[id]", "/reports/abc", "/pricing", "/auth", "/purchase/confirmed", "/sample-report"]) {
    assert.equal(isKeyJourneyRoute(route), true, route);
  }
  for (const route of ["/research", "/research/how-recruiters-read", "/privacy", "/pricing-old", "/authors"]) {
    assert.equal(isKeyJourneyRoute(route), false, route);
  }
  const rates = { baseRate: 0.1, keyRouteRate: 1 };
  assert.equal(browserTraceSampleRate({ ...rates, op: "pageload", name: "/pricing", consent: "unknown" }), 1);
  assert.equal(browserTraceSampleRate({ ...rates, op: "navigation", name: "/reports/[id]", currentPathname: "/", consent: "accepted" }), 1);
  assert.equal(browserTraceSampleRate({ ...rates, op: "pageload", name: "/research", consent: "unknown" }), 0.1);
  assert.equal(
    browserTraceSampleRate({ ...rates, op: "ui.interaction.click", name: "body > button", currentPathname: "/workspace", consent: "unknown" }),
    1,
    "interactions (INP) use the page they happen on",
  );
  assert.equal(browserTraceSampleRate({ ...rates, op: "pageload", name: "/research", consent: "unknown", parentSampled: true }), 1);
  assert.equal(browserTraceSampleRate({ ...rates, op: "pageload", name: "/research", consent: "unknown", parentSampled: false }), 0);
  assert.equal(browserTraceSampleRate({ ...rates, op: "pageload", name: "/pricing", consent: "declined" }), 0);
  assert.equal(browserTraceSampleRate({ ...rates, op: "pageload", name: "/pricing", consent: "blocked", parentSampled: true }), 0);

  // The uptime check fails while either operator switch is on.
  assert.deepEqual(paidJourneyHealth({ billingUnlock: true, env: {} }), { ok: true, purchases: "open", reports: "open" });
  assert.deepEqual(
    paidJourneyHealth({ billingUnlock: true, env: { RIYP_DISABLE_NEW_PURCHASES: "true" } }),
    { ok: false, purchases: "paused", reports: "open" },
  );
  assert.deepEqual(
    paidJourneyHealth({ billingUnlock: true, env: { RIYP_DISABLE_NEW_PURCHASES: "false", RIYP_DISABLE_GENERATION: "1" } }),
    { ok: false, purchases: "open", reports: "paused" },
  );
  assert.equal(paidJourneyHealth({ billingUnlock: false, env: {} }).purchases, "paused");

  console.log("launch signals: ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
