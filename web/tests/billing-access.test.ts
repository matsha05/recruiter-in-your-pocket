import assert from "node:assert/strict";
import { isDevelopmentPaywallBypassEnabled } from "../lib/billing/access";

const originalNodeEnv = process.env.NODE_ENV;
const originalBypass = process.env.BYPASS_PAYWALL;
const mutableEnv = process.env as Record<string, string | undefined>;

try {
  mutableEnv.NODE_ENV = "production";
  mutableEnv.BYPASS_PAYWALL = "true";
  assert.equal(
    isDevelopmentPaywallBypassEnabled(),
    false,
    "production must ignore the paywall bypass flag"
  );

  mutableEnv.NODE_ENV = "development";
  mutableEnv.BYPASS_PAYWALL = "true";
  assert.equal(isDevelopmentPaywallBypassEnabled(), true);

  mutableEnv.BYPASS_PAYWALL = "false";
  assert.equal(isDevelopmentPaywallBypassEnabled(), false);
} finally {
  if (originalNodeEnv === undefined) delete mutableEnv.NODE_ENV;
  else mutableEnv.NODE_ENV = originalNodeEnv;

  if (originalBypass === undefined) delete mutableEnv.BYPASS_PAYWALL;
  else mutableEnv.BYPASS_PAYWALL = originalBypass;
}

console.log("billing-access tests passed");
