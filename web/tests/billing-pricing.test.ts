import assert from "node:assert/strict";
import {
  getCheckoutModeForTier,
  getTierDefaults,
  getTierLabel,
  normalizeRequestedTier,
} from "../lib/billing/entitlements";
import { PRICING_PLANS } from "../lib/billing/pricing";

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
assert.match(PRICING_PLANS["30d"].description, /Five more complete reports/);
assert.equal(
  legacyExtendedPass.expiresAt,
  "2026-10-10T12:00:00.000Z",
  "legacy 90-day access must not be silently extended to a year",
);

console.log("billing pricing contracts passed");
