/**
 * Every lifetime in the anonymous free-report ledger, named once with the
 * reason for its value. The ledger itself is documented at the top of
 * `anonymousGenerationAccess.ts`. This module has no imports so the browser
 * recovery client can share the same numbers as the server.
 */

/**
 * How long a reservation (a generation that has not reported back) holds the
 * free slot before it is treated as abandoned and the slot opens again.
 *
 * A report route may run for up to five minutes (`maxDuration = 300`) and the
 * provider call is capped at ninety seconds, so fifteen minutes is the longest
 * a report can be in flight plus a margin for retries. The signed-in ledger in
 * Postgres uses the same fifteen minutes (`INTERVAL '15 minutes'` in migrations
 * 012 and 021); a test keeps the two in step so a killed function frees an
 * anonymous visitor and an account holder at the same moment.
 */
export const ANONYMOUS_HOLD_TTL_SECONDS = 15 * 60;

/** The SQL spelling of the same hold, asserted against the migrations. */
export const GENERATION_HOLD_SQL_INTERVAL = "15 minutes";

/**
 * How long a committed entry (a report that was minted) stays in the ledger.
 *
 * Ledger keys are scoped to a calendar month, so an entry only has to outlive
 * the month it belongs to. Forty days covers the longest month plus clock
 * drift between the server that wrote it and the one that reads it; after
 * that the key is garbage, not a decision.
 */
export const ANONYMOUS_COMMITTED_TTL_SECONDS = 40 * 24 * 60 * 60;

/**
 * How long a completed anonymous report can be brought back by the browser
 * that generated it, and the lifetime of the signed tombstone that replaces
 * it once it has been saved to an account.
 *
 * Twenty-four hours is the promise made in the save prompt ("this browser can
 * still bring the report back for up to 24 hours"). The browser-side marker,
 * the Redis envelope, and the tombstone all use this one number so none of
 * them can outlive or undercut the others.
 */
export const ANONYMOUS_RECOVERY_TTL_SECONDS = 24 * 60 * 60;
export const ANONYMOUS_RECOVERY_TTL_MS = ANONYMOUS_RECOVERY_TTL_SECONDS * 1000;
