import { hasPdfExportAccess, isPassActive, isUnlimitedPassTier, passIncludesPostingReads } from "./entitlements";

export type AuthoritativePassAccess = {
  membership: "monthly" | "lifetime" | "credit" | "free";
  canExportPdf: boolean;
  daysLeft?: number;
  paidUsesLeft?: number;
  /** A pass still in its term, with or without reports left: posting reads on an already-read resume are included. */
  postingReads: boolean;
};

export function readAuthoritativePassAccess(
  httpOk: boolean,
  payload: { ok?: unknown; passes?: unknown },
  now: Date = new Date()
): AuthoritativePassAccess {
  if (!httpOk || payload?.ok !== true || !Array.isArray(payload.passes)) {
    throw new Error("Paid pass status is unavailable");
  }
  // /api/passes answers only a signed-in account, and every signed-in report can be exported.
  const canExportPdf = hasPdfExportAccess({ userId: "signed-in" });
  const postingReads = payload.passes.some((pass) => passIncludesPostingReads(pass, now));
  const activePasses = payload.passes.filter((pass) => isPassActive(pass, now));
  const lifetimePass = activePasses.find((pass) => pass.tier === "lifetime");
  if (lifetimePass) return { membership: "lifetime", canExportPdf, postingReads };

  const monthlyPass = activePasses.find((pass) => pass.tier === "monthly");
  if (monthlyPass) {
    const diffTime = new Date(monthlyPass.expires_at).getTime() - now.getTime();
    return {
      membership: "monthly",
      canExportPdf,
      postingReads,
      daysLeft: Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24))),
    };
  }

  const creditPasses = activePasses.filter((pass) => !isUnlimitedPassTier(pass.tier));
  if (creditPasses.length === 0) return { membership: "free", canExportPdf, postingReads };
  return {
    membership: "credit",
    canExportPdf,
    postingReads,
    paidUsesLeft: creditPasses.reduce(
      (sum, pass) => sum + Math.max(0, Number(pass.uses_remaining || 0)),
      0
    ),
  };
}
