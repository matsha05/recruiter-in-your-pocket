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
};

const UNLIMITED_PASS_TIERS = new Set<string>(["monthly", "lifetime"]);

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

export function toStoredPassTier(tier: RequestedPricingTier): StoredPassTier {
  if (tier === "24h") return "single_use";
  return tier;
}

export function isUnlimitedPassTier(tier: string | null | undefined): boolean {
  if (!tier) return false;
  return UNLIMITED_PASS_TIERS.has(tier);
}

export function isPassActive(pass: PassLike | null | undefined, now = new Date()): boolean {
  if (!pass?.tier || !pass?.expires_at) return false;

  const expiresAt = Date.parse(pass.expires_at);
  if (Number.isNaN(expiresAt) || expiresAt <= now.getTime()) return false;

  if (isUnlimitedPassTier(pass.tier)) return true;

  return Number(pass.uses_remaining || 0) > 0;
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
  if (tier === "monthly") return "Full Access Monthly";
  if (tier === "lifetime") return "Lifetime Access";
  if (tier === "30d") return "Active Job Search Pack";
  if (tier === "90d") return "Extended Pack";
  return "Quick Check";
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
    const fallback = nowMs + 31 * 24 * 60 * 60 * 1000;
    const periodEndMs = (options?.subscriptionPeriodEndUnix || 0) * 1000;
    return {
      usesRemaining: 9_999,
      expiresAt: new Date(periodEndMs > nowMs ? periodEndMs : fallback).toISOString()
    };
  }

  if (tier === "lifetime") {
    return {
      usesRemaining: 999_999,
      expiresAt: new Date(nowMs + 50 * 365 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  if (tier === "30d") {
    return {
      usesRemaining: 5,
      expiresAt: new Date(nowMs + 365 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  if (tier === "90d") {
    return {
      usesRemaining: 15,
      expiresAt: new Date(nowMs + 365 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  return {
    usesRemaining: 1,
    expiresAt: new Date(nowMs + 365 * 24 * 60 * 60 * 1000).toISOString()
  };
}
