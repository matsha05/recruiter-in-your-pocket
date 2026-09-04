// Checkout may remember a saved-report comparison, never an arbitrary redirect
// or a resume/report payload. The workspace reloads the report with ownership
// and source-trust checks after the buyer returns.
const SAVED_REVISION_RETURN = /^\/workspace\?revision=[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function normalizeCheckoutReturnTo(input: unknown): string | null {
  if (typeof input !== "string") return null;
  // Comparing the whole match also rejects the trailing newline allowed by $.
  return input.match(SAVED_REVISION_RETURN)?.[0] === input ? input : null;
}

function checkoutReturnHref(path: string, input: unknown): string {
  const returnTo = normalizeCheckoutReturnTo(input);
  return returnTo ? `${path}?returnTo=${encodeURIComponent(returnTo)}` : path;
}

export function getCheckoutPricingHref(returnTo: unknown): string {
  return checkoutReturnHref("/pricing", returnTo);
}

export function getCheckoutRestoreHref(returnTo: unknown): string {
  return checkoutReturnHref("/purchase/restore", returnTo);
}
