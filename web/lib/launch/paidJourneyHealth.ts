import "server-only";

import { isLaunchFlagEnabled } from "./flags";
import { areNewPurchasesDisabled } from "./serverFlags";
import { isGenerationPaused } from "../operations/generationBudget";

export type PaidJourneyHealth = {
  ok: boolean;
  purchases: "open" | "paused";
  reports: "open" | "paused";
};

/**
 * Whether the operator switches let a visitor buy a pass and run a report.
 * A Sentry uptime check watches this so a switch left on (as the purchase
 * switch was for days in October 2026) pages someone even with no traffic.
 */
export function paidJourneyHealth({
  billingUnlock = isLaunchFlagEnabled("billingUnlock"),
  env = process.env,
}: {
  billingUnlock?: boolean;
  env?: Record<string, string | undefined>;
} = {}): PaidJourneyHealth {
  const purchases = !billingUnlock || areNewPurchasesDisabled(env) ? "paused" : "open";
  const reports = isGenerationPaused(env) ? "paused" : "open";
  return { ok: purchases === "open" && reports === "open", purchases, reports };
}
