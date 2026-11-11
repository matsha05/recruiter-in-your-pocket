// Where a plain sign-in lands (Nov 11, 2026). Someone who signs in from the header, with nowhere in particular
// to go back to, came for one of two things: their saved reports, or their first report. So a person with a saved
// report lands on My reports, which opens with the latest one, and everyone else lands on the upload page.
// Sign-ins that started somewhere (saving a report, checkout, settings) carry their own destination and never
// come through here.

export type SignInLanding = "/reports" | "/workspace";

/** How long the check may take before sign-in stops waiting and uses the upload page. */
export const SIGN_IN_LANDING_TIMEOUT_MS = 2500;

/**
 * Asks for the person's newest saved report, right after verification has set the session. Any failure, a slow
 * answer, or an empty list lands on the upload page, which is where everyone landed before: the check can make
 * the landing better and can never block or break a sign-in.
 */
export async function signInLanding(fetchImpl: typeof fetch = fetch, timeoutMs: number = SIGN_IN_LANDING_TIMEOUT_MS): Promise<SignInLanding> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl("/api/reports?limit=1", { credentials: "same-origin", cache: "no-store", signal: controller.signal });
    if (!response.ok) return "/workspace";
    const data = (await response.json()) as { ok?: unknown; reports?: unknown } | null;
    return data?.ok === true && Array.isArray(data.reports) && data.reports.length > 0 ? "/reports" : "/workspace";
  } catch {
    return "/workspace";
  } finally {
    clearTimeout(timer);
  }
}
