const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

/**
 * Local-only escape hatch for development and automated testing. A production
 * deployment must never turn a leaked or stale environment flag into free access.
 */
export function isDevelopmentPaywallBypassEnabled() {
  if (process.env.NODE_ENV === "production") return false;
  return TRUE_VALUES.has(String(process.env.BYPASS_PAYWALL || "").trim().toLowerCase());
}
