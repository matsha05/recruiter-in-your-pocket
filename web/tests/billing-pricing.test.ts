import assert from "node:assert/strict";
import {
  getCheckoutModeForTier,
  getPassStatus,
  getPassStatusLabel,
  getTierDefaults,
  getTierLabel,
  JOB_SEARCH_PASS_DAYS,
  normalizeRequestedTier,
} from "../lib/billing/entitlements";
import { FREE_REPORT_ENTITLEMENT, JOB_SEARCH_PASS_DECISION, PRICING_PLANS } from "../lib/billing/pricing";
import { LEGAL_LAST_UPDATED, TRUST_PROMISES } from "../lib/legal/dataHandling";

const now = new Date("2026-07-12T12:00:00.000Z");
const jobSearchPass = getTierDefaults("30d", { now });
const legacyExtendedPass = getTierDefaults("90d", { now });

assert.equal(jobSearchPass.usesRemaining, 5, "Job Search Pass includes five reports");
assert.equal(
  jobSearchPass.expiresAt,
  "2026-10-10T12:00:00.000Z",
  "Job Search Pass expires 90 days after fulfillment (Matt, M4, Nov 2, 2026)"
);
assert.equal(JOB_SEARCH_PASS_DAYS, 90);
// Every place that states the pass length says 90 days; nothing still says 30.
for (const [label, text] of [
  ["pricing terms", JOB_SEARCH_PASS_DECISION.terms],
  ["pricing period", PRICING_PLANS["30d"].period],
  ["pricing features", PRICING_PLANS["30d"].features.map(({ text }) => text).join(" ")],
  ["trust promises", TRUST_PROMISES.join(" ")],
] as const) {
  assert.match(text, /90 days/u, `${label} states the 90-day pass`);
  assert.doesNotMatch(text, /30 days|30-day|thirty/iu, `${label} no longer says 30 days`);
}
assert.ok(!PRICING_PLANS["30d"].features.some(({ text }) => /PDF/iu.test(text)), "the PDF is no longer sold with the pass");
assert.ok(PRICING_PLANS.free.features.some(({ text }) => /PDF export/u.test(text)), "the free plan names the PDF for signed-in reports");
assert.equal(getCheckoutModeForTier("30d"), "payment", "Job Search Pass is a one-time payment");
assert.equal(getTierLabel("30d"), "Job Search Pass");
assert.equal(normalizeRequestedTier("pack"), "30d", "legacy pack receipts still normalize safely");
assert.equal(PRICING_PLANS["30d"].price, "$29");
// The re-check compares versions; it never claims a line was fixed (the comparison says a line came off the list).
assert.ok(PRICING_PLANS["30d"].features.some(({ text }) => /which lines came off the list/.test(text)));
assert.ok(!PRICING_PLANS["30d"].features.some(({ text }) => /\bfixed\b/i.test(text)), "pricing must not promise a fix");
assert.match(FREE_REPORT_ENTITLEMENT.promise, /first complete report is free/i);
assert.match(FREE_REPORT_ENTITLEMENT.promise, /no card required/i);
assert.match(FREE_REPORT_ENTITLEMENT.boundary, /repeat use across browsers or shared networks/i);
assert.match(FREE_REPORT_ENTITLEMENT.boundary, /daily capacity limits/i);
assert.doesNotMatch(FREE_REPORT_ENTITLEMENT.boundary, /device|monthly/i);
assert.match(FREE_REPORT_ENTITLEMENT.anonymousBoundary, /one free report per calendar month/i);
assert.match(FREE_REPORT_ENTITLEMENT.anonymousBoundary, /repeat use across browsers or shared networks/i);
assert.match(FREE_REPORT_ENTITLEMENT.anonymousBoundary, /daily capacity limits/i);
assert.ok(
  TRUST_PROMISES.includes(`${FREE_REPORT_ENTITLEMENT.promise} ${FREE_REPORT_ENTITLEMENT.boundary}`),
  "the public trust checklist must state the bounded free entitlement",
);
assert.equal(LEGAL_LAST_UPDATED, "November 2, 2026");
assert.match(JOB_SEARCH_PASS_DECISION.freeBoundary, /nothing is held back/i);
assert.match(JOB_SEARCH_PASS_DECISION.whenToBuy, /checking your revision, or tailoring your resume/i);
assert.match(JOB_SEARCH_PASS_DECISION.terms, /no automatic renewal/i);
assert.equal(JOB_SEARCH_PASS_DECISION.cta, "Get 5 more reports · $29");
assert.equal(
  legacyExtendedPass.expiresAt,
  "2026-10-10T12:00:00.000Z",
  "legacy 90-day access must not be silently extended to a year",
);

const futureExpiry = "2026-08-11T12:00:00.000Z";
assert.equal(getPassStatus({ tier: "30d", uses_remaining: 2, expires_at: futureExpiry }, now), "active");
assert.equal(getPassStatus({ tier: "30d", uses_remaining: 0, expires_at: futureExpiry }, now), "used");
assert.equal(getPassStatus({ tier: "30d", uses_remaining: 2, expires_at: "2026-07-11T12:00:00.000Z" }, now), "expired");
assert.equal(
  getPassStatusLabel({
    tier: "30d",
    uses_remaining: 2,
    expires_at: futureExpiry,
    revoked_at: "2026-07-12T13:00:00.000Z",
    revocation_reason: "refund_created",
  }, now),
  "Refunded",
);

console.log("billing pricing contracts passed");
