import assert from "node:assert/strict";
import { freeCookieOptions } from "../lib/backend/freeCookie";
import { getScoreLabel } from "../lib/score-utils";

assert.equal(
  freeCookieOptions().maxAge,
  365 * 24 * 60 * 60,
  "cookie maxAge must be expressed in seconds"
);

assert.equal(getScoreLabel(85), "Clear and specific");
assert.equal(getScoreLabel(84), "Mostly clear");
assert.equal(getScoreLabel(70), "Mostly clear");
assert.equal(getScoreLabel(69), "Needs more context");

console.log("backend-contracts tests passed");
