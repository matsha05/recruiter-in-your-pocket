import assert from "node:assert/strict";
import {
  createEmptyOffer,
  getFourYearComponents,
  getFourYearTotal,
  getYearBreakdown,
  isComparableOffer,
  isVestingScheduleValid,
} from "../lib/compensation-model";

const backloaded = {
  ...createEmptyOffer("backloaded"),
  baseSalary: 100_000,
  bonusPercent: 10,
  stockTotal: 100_000,
  vestingSchedule: [0, 33, 33, 34],
};

assert.equal(getYearBreakdown(backloaded, 1).stock, 0, "A valid 0% vesting year must remain 0%");
assert.equal(getYearBreakdown(backloaded, 1).total, 110_000);
assert.equal(getYearBreakdown(backloaded, 2).stock, 33_000);
assert.equal(getFourYearComponents(backloaded).modeledEquity, 100_000);
assert.equal(getFourYearTotal(backloaded), 540_000);

assert.equal(isVestingScheduleValid([0, 33, 33, 34]), true);
assert.equal(isVestingScheduleValid([25, 25, 25, 20]), false);
assert.equal(isVestingScheduleValid([25, 25, 25]), false);
assert.equal(isVestingScheduleValid([0, 33.3, 33.3, 33.4]), true);
assert.equal(isVestingScheduleValid([25, 25, 25, 24.99]), false);

const fractionalBonus = { ...backloaded, bonusPercent: 12.5 };
assert.equal(getYearBreakdown(fractionalBonus, 1).bonus, 12_500);
assert.equal(getFourYearTotal(fractionalBonus), 550_000);

const invalidEquityOffer = {
  ...backloaded,
  vestingSchedule: [25, 25, 25, 20],
};
assert.equal(isComparableOffer(invalidEquityOffer), false, "Invalid equity schedules must not be ranked");

const cashOnlyOffer = {
  ...invalidEquityOffer,
  stockTotal: 0,
};
assert.equal(isComparableOffer(cashOnlyOffer), true, "An unused vesting schedule must not block a cash-only offer");

const growthCase = {
  ...createEmptyOffer("growth"),
  baseSalary: 1,
  stockTotal: 100,
  vestingSchedule: [0, 0, 0, 100],
  stockGrowth: 10,
};
assert.ok(Math.abs(getYearBreakdown(growthCase, 4).stock - 133.1) < 0.0001);

console.log("compensation model tests passed");
