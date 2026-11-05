export type GenerationReportKind = "resume_feedback" | "resume_ideas";
export type GenerationAccessTier = "free_full" | "pass_full" | "preview";
export type GenerationEntitlementKind =
  | "free"
  | "pass_credit"
  | "pass_unlimited"
  | "anonymous_free"
  | "bypass"
  /** A second read of a not-ready page written from the person's answers (ask-first): no reservation, nothing spent. */
  | "rebuild";

export type GenerationPassSnapshot = {
  id: string;
  tier: string;
  expires_at: string | null;
  uses_remaining: number;
  created_at?: string | null;
};

export type AnonymousFreeCookieMeta = {
  used: number;
  last_free_ts: string | null;
  reset_month: string;
};

/**
 * Why the free-report gate refused a request. "cookie": this browser's signed
 * cookie already records a free report. "identity": the ledger records one for
 * this browser's anonymous id. "network": another browser on the same network
 * used the allowance. "hold": a generation on this id or network is still in
 * flight. "account": a signed-in account without a free report or pass.
 */
export type FreeGateReason = "cookie" | "identity" | "network" | "hold" | "account" | "unknown";

export type GenerationAccessReservation = {
  access: "full" | "preview";
  freeGate?: FreeGateReason;
  accessTier: GenerationAccessTier;
  entitlementKind: GenerationEntitlementKind | null;
  reservationId: string | null;
  userId: string | null;
  activePass: GenerationPassSnapshot | null;
  freeUsesRemaining: number;
  anonymousCookieMeta: AnonymousFreeCookieMeta | null;
  anonymousIdentityHash: string | null;
  anonymousShadowHash?: string | null;
  anonymousMonthKey: string | null;
  recoveredReportId?: string | null;
  operationId?: string | null;
};

export type GenerationReleaseReason =
  | "provider_error"
  | "provider_timeout"
  | "validation_error"
  | "client_disconnect"
  | "delivery_error"
  | "internal_error";

type RpcError = { code?: string; message?: string } | null;

export type GenerationAccessRpcClient = {
  rpc(
    functionName: string,
    args: Record<string, unknown>
  ): PromiseLike<{ data: unknown; error: RpcError }>;
};
