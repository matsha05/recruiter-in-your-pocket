export type UnlockConfirmState = "unlocked" | "fulfillment_pending" | "checkout_incomplete" | "not_paid";

export type UnlockConfirmResponse = {
  ok: boolean;
  state: UnlockConfirmState;
  pending?: boolean;
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
  unlocked: "Access unlocked.",
  fulfillment_pending: "Payment received. Finalizing access...",
  checkout_incomplete: "Checkout is not complete yet.",
  not_paid: "Payment is not marked as paid yet.",
};

const UI_TITLES: Record<UnlockUiStatus, string> = {
  checking: "Finalizing your access",
  pending: "Finalizing your access",
  unlocked: "Purchase confirmed",
  error: "Unlock is delayed",
  missing: "Missing confirmation details",
};

const UI_MESSAGES = {
  checking: "Confirming payment and unlocking access...",
  pending: "Payment received. Finalizing access...",
  unlocked: "Your access is active. You can continue in the workspace.",
  missing: "Missing confirmation details.",
  checkout_incomplete: "Checkout is not complete yet. If you closed Stripe early, restart checkout.",
  not_paid: "Payment is not marked as paid yet. Check your receipt or try Restore Access.",
  error: "We could not confirm unlock yet.",
  network: "Still confirming your unlock...",
  timeout: "Payment succeeded, but unlock is still processing. Use Restore Access to sync now.",
};

export function buildConfirmResponse(input: {
  state: UnlockConfirmState;
  status?: string | null;
  message?: string;
  pass?: UnlockConfirmResponse["pass"];
  pending?: boolean;
}): UnlockConfirmResponse {
  const message = input.message ?? CONFIRM_MESSAGES[input.state] ?? UI_MESSAGES.error;
  return {
    ok: input.state === "unlocked",
    state: input.state,
    status: input.status ?? null,
    pending: typeof input.pending === "boolean" ? input.pending : input.state === "fulfillment_pending",
    message,
    pass: input.pass,
  };
}

export function isPendingConfirmResponse(response: UnlockConfirmResponse) {
  return response.pending || response.state === "fulfillment_pending";
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
