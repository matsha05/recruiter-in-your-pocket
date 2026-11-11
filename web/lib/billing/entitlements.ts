import { isValidSubscriptionPeriodEndUnix } from "./subscriptionPeriod";

export type RequestedPricingTier =
  | "monthly"
  | "lifetime"
  | "24h"
  | "30d"
  | "90d";

export type StoredPassTier =
  | "monthly"
  | "lifetime"
  | "single_use"
  | "30d"
  | "90d";

export type PassLike = {
  tier?: string | null;
  expires_at?: string | null;
  uses_remaining?: number | null;
  revoked_at?: string | null;
  revocation_reason?: string | null;
};

export type PassStatus = "active" | "used" | "expired" | "revoked" | "invalid";

const UNLIMITED_PASS_TIERS = new Set<string>(["monthly", "lifetime"]);
/** How long the Job Search Pass runs from purchase. */
export const JOB_SEARCH_PASS_DAYS = 90;
const PAID_PASS_TIERS = new Set<string>(["monthly", "lifetime", "single_use", "30d", "90d"]);

export function normalizeRequestedTier(input: unknown): RequestedPricingTier | null {
  if (typeof input !== "string") return null;
  const raw = input.trim().toLowerCase();

  if (
    raw === "monthly" ||
    raw === "lifetime" ||
    raw === "24h" ||
    raw === "30d" ||
    raw === "90d"
  ) {
    return raw as RequestedPricingTier;
  }

  // Legacy aliases
  if (raw === "single") return "24h";
  if (raw === "pack") return "30d";

  return null;
}

export function resolveRequestedTierFromSession(input: {
  metadataTier?: unknown;
  passTier?: unknown;
  mode?: string | null;
}): RequestedPricingTier {
  const metadataTier = normalizeRequestedTier(input.metadataTier);
  if (metadataTier) return metadataTier;

  const passTierRaw = typeof input.passTier === "string"
    ? input.passTier.trim().toLowerCase()
    : "";

  if (passTierRaw === "monthly") return "monthly";
  if (passTierRaw === "lifetime") return "lifetime";
  if (passTierRaw === "30d") return "30d";
  if (passTierRaw === "90d") return "90d";
  if (passTierRaw === "single_use") return "24h";

  return input.mode === "subscription" ? "monthly" : "lifetime";
}

export function toStoredPassTier(tier: RequestedPricingTier): StoredPassTier {
  if (tier === "24h") return "single_use";
  return tier;
}

export function isUnlimitedPassTier(tier: string | null | undefined): boolean {
  if (!tier) return false;
  return UNLIMITED_PASS_TIERS.has(tier);
}

export function getPassStatus(pass: PassLike | null | undefined, now = new Date()): PassStatus {
  if (!pass?.tier || !pass?.expires_at) return "invalid";
  if (pass.revoked_at) return "revoked";

  const expiresAt = Date.parse(pass.expires_at);
  if (Number.isNaN(expiresAt)) return "invalid";
  if (expiresAt <= now.getTime()) return "expired";

  if (isUnlimitedPassTier(pass.tier)) return "active";

  return Number(pass.uses_remaining || 0) > 0 ? "active" : "used";
}

export function getPassStatusLabel(pass: PassLike | null | undefined, now = new Date()): string {
  const status = getPassStatus(pass, now);
  if (status === "active") return "Active";
  if (status === "used") return "Used";
  if (status === "expired") return "Expired";
  if (status === "revoked") {
    const reason = pass?.revocation_reason?.toLowerCase() || "";
    if (reason.includes("refund")) return "Refunded";
    if (reason.includes("dispute")) return "Disputed";
    return "Revoked";
  }
  return "Unavailable";
}

/**
 * Posting reads last for the pass's term, not its report count (Nov 10, 2026): a pass whose five reports are
 * spent still reads an already-read resume against a posting until it expires. A revoked, refunded or expired
 * pass doesn't.
 */
export function passIncludesPostingReads(pass: PassLike | null | undefined, now = new Date()): boolean {
  const status = getPassStatus(pass, now);
  return status === "active" || status === "used";
}

export function isPassActive(pass: PassLike | null | undefined, now = new Date()): boolean {
  return getPassStatus(pass, now) === "active";
}

/**
 * The PDF is free for every signed-in report (Matt, M2, November 2, 2026): the pass is for
 * re-checks and job comparisons; the PDF is how a report reaches a coach, a friend or a printer.
 * Anonymous reports are not stored, so there is nothing to export until the reader signs in.
 */
export function hasPdfExportAccess(viewer: { userId?: string | null } | null | undefined): boolean {
  return Boolean(viewer?.userId);
}

/** Whether a tier is one of the paid passes, for restore and labels. */
export function isPaidPassTier(tier: string | null | undefined): boolean {
  return Boolean(tier && PAID_PASS_TIERS.has(tier));
}

export function shouldConsumePassCredit(pass: PassLike | null | undefined): boolean {
  if (!pass?.tier) return false;
  if (isUnlimitedPassTier(pass.tier)) return false;
  return Number(pass.uses_remaining || 0) > 0;
}

export function getNextUsesRemaining(pass: PassLike): number {
  if (isUnlimitedPassTier(pass.tier || null)) return Number(pass.uses_remaining || 0);
  return Math.max(0, Number(pass.uses_remaining || 0) - 1);
}

export function getTierLabel(tier: string | null | undefined): string {
  if (tier === "monthly") return "Monthly plan";
  if (tier === "lifetime") return "Lifetime access";
  if (tier === "30d") return "Job Search Pass";
  if (tier === "90d") return "Extended pack";
  return "Single report";
}

export function getCheckoutModeForTier(tier: RequestedPricingTier): "subscription" | "payment" {
  return tier === "monthly" ? "subscription" : "payment";
}

export function getTierDefaults(
  tier: StoredPassTier,
  options?: { subscriptionPeriodEndUnix?: number | null; now?: Date }
): { usesRemaining: number; expiresAt: string } {
  const now = options?.now || new Date();
  const nowMs = now.getTime();

  if (tier === "monthly") {
    if (!isValidSubscriptionPeriodEndUnix(options?.subscriptionPeriodEndUnix)) {
      throw new Error("A verified subscription billing period is required for monthly access");
    }
    return {
      usesRemaining: 9_999,
      expiresAt: new Date(options.subscriptionPeriodEndUnix * 1000).toISOString()
    };
  }

  if (tier === "lifetime") {
    return {
      usesRemaining: 999_999,
      expiresAt: new Date(nowMs + 50 * 365 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  // The Job Search Pass. Its tier id stays "30d" (stored rows, Stripe metadata and the "pack" alias
  // all carry it); its length is 90 days since November 2, 2026 (Matt, M4): a job search runs months.
  if (tier === "30d") {
    return {
      usesRemaining: 5,
      expiresAt: new Date(nowMs + JOB_SEARCH_PASS_DAYS * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  if (tier === "90d") {
    return {
      usesRemaining: 15,
      expiresAt: new Date(nowMs + 90 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  return {
    usesRemaining: 1,
    expiresAt: new Date(nowMs + 365 * 24 * 60 * 60 * 1000).toISOString()
  };
}
