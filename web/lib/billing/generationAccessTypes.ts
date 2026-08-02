export type GenerationReportKind = "resume_feedback" | "resume_ideas";
export type GenerationAccessTier = "free_full" | "pass_full" | "preview";
export type GenerationEntitlementKind =
  | "free"
  | "pass_credit"
  | "pass_unlimited"
  | "anonymous_free"
  | "bypass";

export type GenerationPassSnapshot = {
  id: string;
  tier: string;
  expires_at: string | null;
  uses_remaining: number;
  created_at?: string | null;
};

export type AnonymousFreeCookieMeta = {
  used: number;
  last_free_ts: string;
  reset_month: string;
};

export type GenerationAccessReservation = {
  access: "full" | "preview";
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
