import assert from "node:assert/strict";
import {
  getCheckoutModeForTier,
  getPassStatus,
  getPassStatusLabel,
  getTierDefaults,
  getTierLabel,
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
  "2026-08-11T12:00:00.000Z",
  "Job Search Pass expires 30 days after fulfillment"
);
assert.equal(getCheckoutModeForTier("30d"), "payment", "Job Search Pass is a one-time payment");
assert.equal(getTierLabel("30d"), "Job Search Pass");
assert.equal(normalizeRequestedTier("pack"), "30d", "legacy pack receipts still normalize safely");
assert.equal(PRICING_PLANS["30d"].price, "$29");
assert.match(PRICING_PLANS["30d"].description, /Five additional reports/);
assert.match(PRICING_PLANS["30d"].description, /compare revisions|applications/);
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
assert.equal(LEGAL_LAST_UPDATED, "September 4, 2026");
assert.match(JOB_SEARCH_PASS_DECISION.freeBoundary, /do not need to pay to see the rest/i);
assert.match(JOB_SEARCH_PASS_DECISION.whenToBuy, /revision to compare or another application to review/i);
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
