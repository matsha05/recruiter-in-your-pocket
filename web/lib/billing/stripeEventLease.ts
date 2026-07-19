import "server-only";

export type StripeEventRpcClient = {
  rpc(
    functionName: string,
    args: Record<string, unknown>
  ): Promise<{ data: unknown; error: { message?: string; code?: string } | null }>;
};

export type StripeEventClaim = {
  claimed: boolean;
  leaseToken: string | null;
  reason: string;
};

type ClaimInput = {
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  requestId: string;
  leaseSeconds?: number;
  leaseToken?: string;
};

function rpcError(operation: string, error: { message?: string; code?: string } | null): Error {
  const code = error?.code ? ` (${error.code})` : "";
  return new Error(`${operation} failed${code}: ${error?.message || "unknown database error"}`);
}

function scalarBoolean(data: unknown): boolean {
  if (typeof data === "boolean") return data;
  if (Array.isArray(data) && typeof data[0] === "boolean") return data[0];
  return false;
}

export async function claimStripeEvent(
  admin: StripeEventRpcClient,
  input: ClaimInput
): Promise<StripeEventClaim> {
  const leaseToken = input.leaseToken || crypto.randomUUID();
  const { data, error } = await admin.rpc("claim_stripe_event", {
    p_event_id: input.eventId,
    p_event_type: input.eventType,
    p_payload: input.payload,
    p_request_id: input.requestId,
    p_lease_token: leaseToken,
    p_lease_seconds: input.leaseSeconds || 300,
  });

  if (error) throw rpcError("Stripe event claim", error);
  const result = Array.isArray(data) ? data[0] : data;
  if (!result || typeof result !== "object") {
    throw new Error("Stripe event claim returned an invalid result");
  }

  const record = result as Record<string, unknown>;
  const claimed = record.claimed === true;
  return {
    claimed,
    leaseToken: claimed ? leaseToken : null,
    reason: typeof record.reason === "string" ? record.reason : "unknown",
  };
}

export async function completeStripeEvent(
  admin: StripeEventRpcClient,
  eventId: string,
  leaseToken: string
): Promise<void> {
  const { data, error } = await admin.rpc("complete_stripe_event", {
    p_event_id: eventId,
    p_lease_token: leaseToken,
  });
  if (error) throw rpcError("Stripe event completion", error);
  if (!scalarBoolean(data)) throw new Error("Stripe event lease was lost before completion");
}

export async function rejectStripeEvent(
  admin: StripeEventRpcClient,
  eventId: string,
  leaseToken: string,
  reason: string
): Promise<void> {
  const { data, error } = await admin.rpc("reject_stripe_event", {
    p_event_id: eventId,
    p_lease_token: leaseToken,
    p_reason: reason.slice(0, 500),
  });
  if (error) throw rpcError("Stripe event rejection", error);
  if (!scalarBoolean(data)) throw new Error("Stripe event lease was lost before rejection");
}

export async function failStripeEvent(
  admin: StripeEventRpcClient,
  eventId: string,
  leaseToken: string,
  error: unknown
): Promise<void> {
  const message = error instanceof Error ? error.message : "Webhook processing failed";
  const { data, error: rpcFailure } = await admin.rpc("fail_stripe_event", {
    p_event_id: eventId,
    p_lease_token: leaseToken,
    p_error: message.slice(0, 500),
  });
  if (rpcFailure) throw rpcError("Stripe event failure update", rpcFailure);
  if (!scalarBoolean(data)) throw new Error("Stripe event lease was lost before failure update");
}
