import { hasPdfExportAccess, isPassActive, isUnlimitedPassTier } from "./entitlements";

export type AuthoritativePassAccess = {
  membership: "monthly" | "lifetime" | "credit" | "free";
  canExportPdf: boolean;
  daysLeft?: number;
  paidUsesLeft?: number;
};

export function readAuthoritativePassAccess(
  httpOk: boolean,
  payload: { ok?: unknown; passes?: unknown },
  now: Date = new Date()
): AuthoritativePassAccess {
  if (!httpOk || payload?.ok !== true || !Array.isArray(payload.passes)) {
    throw new Error("Paid pass status is unavailable");
  }
  const canExportPdf = payload.passes.some((pass) => hasPdfExportAccess(pass, now));
  const activePasses = payload.passes.filter((pass) => isPassActive(pass, now));
  const lifetimePass = activePasses.find((pass) => pass.tier === "lifetime");
  if (lifetimePass) return { membership: "lifetime", canExportPdf };

  const monthlyPass = activePasses.find((pass) => pass.tier === "monthly");
  if (monthlyPass) {
    const diffTime = new Date(monthlyPass.expires_at).getTime() - now.getTime();
    return {
      membership: "monthly",
      canExportPdf,
      daysLeft: Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24))),
    };
  }

  const creditPasses = activePasses.filter((pass) => !isUnlimitedPassTier(pass.tier));
  if (creditPasses.length === 0) return { membership: "free", canExportPdf };
  return {
    membership: "credit",
    canExportPdf,
    paidUsesLeft: creditPasses.reduce(
      (sum, pass) => sum + Math.max(0, Number(pass.uses_remaining || 0)),
      0
    ),
  };
}
