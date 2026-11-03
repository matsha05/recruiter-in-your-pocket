/**
 * What the confirm route knows about a checkout session:
 *   unlocked             a pass is active for it
 *   fulfillment_pending  paid, the pass is still being written (poll again)
 *   rate_limited         too many checks; poll again after retry_after_ms
 *   checkout_incomplete  Stripe has not completed the session, or it is not ours
 *   not_paid             payment was not confirmed
 *   access_revoked       the purchase was refunded or disputed (terminal)
 *   pass_expired         the pass ran out (terminal)
 */
export type UnlockConfirmState =
  | "unlocked"
  | "fulfillment_pending"
  | "rate_limited"
  | "checkout_incomplete"
  | "not_paid"
  | "access_revoked"
  | "pass_expired";

export type UnlockConfirmResponse = {
  ok: boolean;
  state: UnlockConfirmState;
  pending?: boolean;
  retry_after_ms?: number;
  status?: string | null;
  message: string;
  pass?: {
    id: string;
    tier: string | null;
    expires_at: string | null;
    uses_remaining: number | null;
    active: boolean;
  };
};

export type UnlockUiStatus = "checking" | "pending" | "unlocked" | "error" | "missing";

export type UnlockUiState = {
  status: UnlockUiStatus;
  title: string;
  message: string;
  reason?: string;
};

export type UnlockEvent =
  | { type: "start"; hasSession: boolean }
  | { type: "response"; response: UnlockConfirmResponse }
  | { type: "network_error" }
  | { type: "timeout" };

const CONFIRM_MESSAGES: Record<UnlockConfirmState, string> = {
  unlocked: "Your pass is active.",
  fulfillment_pending: "Payment received. Turning on your pass…",
  rate_limited: "Too many payment checks. We'll check again in a moment.",
  checkout_incomplete: "Checkout is not complete yet.",
  not_paid: "We haven't received payment confirmation yet.",
  access_revoked: "This purchase was refunded or disputed, so it no longer unlocks reports. Contact support if that's wrong.",
  pass_expired: "This pass has expired. Check Billing for your current access.",
};

const UI_TITLES: Record<UnlockUiStatus, string> = {
  checking: "Checking your purchase",
  pending: "Checking your purchase",
  unlocked: "Payment received.",
  error: "We couldn't confirm access",
  missing: "Find your purchase",
};

const UI_MESSAGES = {
  checking: "Checking your payment…",
  pending: "Payment received. Turning on your pass…",
  unlocked: "5 more reports, good for 90 days.",
  missing: "This link doesn't identify a purchase. Use Restore access with the email you entered at checkout.",
  checkout_incomplete: "Checkout is not complete yet. If you closed Stripe early, restart checkout.",
  not_paid: "We haven't received payment confirmation yet. Check your receipt or use Restore access.",
  error: "We couldn't confirm your access yet. Use Restore access or contact support.",
  network: "We couldn't reach the payment service. We're trying again.",
  timeout: "We couldn't confirm your purchase in time. If you received a receipt, use Restore access or contact support before paying again.",
};

const PENDING_STATES: ReadonlySet<UnlockConfirmState> = new Set(["fulfillment_pending", "rate_limited"]);

export function buildConfirmResponse(input: {
  state: UnlockConfirmState;
  status?: string | null;
  message?: string;
  pass?: UnlockConfirmResponse["pass"];
  pending?: boolean;
  retryAfterMs?: number;
}): UnlockConfirmResponse {
  const message = input.message ?? CONFIRM_MESSAGES[input.state] ?? UI_MESSAGES.error;
  const retryAfterMs = Number.isFinite(input.retryAfterMs) && (input.retryAfterMs as number) > 0
    ? Math.round(input.retryAfterMs as number)
    : undefined;
  return {
    ok: input.state === "unlocked",
    state: input.state,
    status: input.status ?? null,
    pending: typeof input.pending === "boolean" ? input.pending : PENDING_STATES.has(input.state),
    ...(retryAfterMs ? { retry_after_ms: retryAfterMs } : {}),
    message,
    pass: input.pass,
  };
}

export function isPendingConfirmResponse(response: UnlockConfirmResponse) {
  return response.pending || PENDING_STATES.has(response.state);
}

/** How long the client should wait before polling again after a pending response. */
export function nextConfirmDelayMs(response: UnlockConfirmResponse, attempt: number): number {
  const backoff = 900 + attempt * 450;
  const retryAfter = typeof response.retry_after_ms === "number" && response.retry_after_ms > 0
    ? response.retry_after_ms
    : 0;
  return Math.min(Math.max(backoff, retryAfter), 30_000);
}

export function getInitialUnlockState(sessionId: string | null): UnlockUiState {
  const hasSession = !!sessionId;
  return transitionUnlockState(
    { status: "checking", title: UI_TITLES.checking, message: UI_MESSAGES.checking },
    { type: "start", hasSession }
  );
}

export function transitionUnlockState(prev: UnlockUiState, event: UnlockEvent): UnlockUiState {
  switch (event.type) {
    case "start":
      if (!event.hasSession) {
        return {
          status: "missing",
          title: UI_TITLES.missing,
          message: UI_MESSAGES.missing,
          reason: "missing_session",
        };
      }
      return {
        status: "checking",
        title: UI_TITLES.checking,
        message: UI_MESSAGES.checking,
      };
    case "response": {
      const response = event.response;
      if (response.ok) {
        return {
          status: "unlocked",
          title: UI_TITLES.unlocked,
          message: UI_MESSAGES.unlocked,
          reason: "unlocked",
        };
      }
      if (isPendingConfirmResponse(response)) {
        return {
          status: "pending",
          title: UI_TITLES.pending,
          message: response.message || UI_MESSAGES.pending,
          reason: response.state,
        };
      }
      if (response.state === "access_revoked" || response.state === "pass_expired") {
        return {
          status: "error",
          title: UI_TITLES.error,
          message: response.message || CONFIRM_MESSAGES[response.state],
          reason: response.state,
        };
      }
      if (response.state === "checkout_incomplete") {
        return {
          status: "error",
          title: UI_TITLES.error,
          message: response.message || UI_MESSAGES.checkout_incomplete,
          reason: response.state,
        };
      }
      if (response.state === "not_paid") {
        return {
          status: "error",
          title: UI_TITLES.error,
          message: response.message || UI_MESSAGES.not_paid,
          reason: response.state,
        };
      }
      return {
        status: "error",
        title: UI_TITLES.error,
        message: response.message || UI_MESSAGES.error,
        reason: response.state,
      };
    }
    case "network_error":
      return {
        status: "pending",
        title: UI_TITLES.pending,
        message: UI_MESSAGES.network,
        reason: "network_error",
      };
    case "timeout":
      return {
        status: "error",
        title: UI_TITLES.error,
        message: UI_MESSAGES.timeout,
        reason: "timeout",
      };
    default:
      return prev;
  }
}
