"use client";

import { useEffect, useMemo, useState } from "react";
import { Analytics } from "@/lib/analytics";
import {
  getInitialUnlockState,
  isPendingConfirmResponse,
  transitionUnlockState,
  type UnlockConfirmResponse,
  type UnlockUiState,
} from "@/lib/billing/unlockStateMachine";

type UsePaymentConfirmationOptions = {
  sessionId: string | null;
  tier?: string | null;
  source?: string | null;
  maxAttempts?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function usePaymentConfirmation({
  sessionId,
  tier,
  source,
  maxAttempts = 10,
}: UsePaymentConfirmationOptions) {
  const [state, setState] = useState<UnlockUiState>(() => getInitialUnlockState(sessionId));
  const [attempt, setAttempt] = useState(0);

  const sessionSuffix = useMemo(() => {
    if (!sessionId) return "unknown";
    return sessionId.slice(-10);
  }, [sessionId]);

  useEffect(() => {
    setState(getInitialUnlockState(sessionId));
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    const startedAt = Date.now();

    const confirm = async () => {
      Analytics.track("unlock_confirm_started", {
        source: source || "unknown",
        tier: tier || "unknown",
      });

      for (let i = 0; i < maxAttempts; i++) {
        if (cancelled) return;

        setAttempt(i + 1);
        try {
          const res = await fetch("/api/billing/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
          const data = (await res.json()) as UnlockConfirmResponse;

          if (cancelled) return;

          setState((prev) => transitionUnlockState(prev, { type: "response", response: data }));

          if (data?.ok) {
            Analytics.track("checkout_completed", {
              source: source || "unknown",
              tier: data?.pass?.tier || tier || "unknown",
              attempt: i + 1,
              session_suffix: sessionId.slice(-8),
            });
            Analytics.track("unlock_confirm_succeeded", {
              tier: data?.pass?.tier || tier || "unknown",
              attempt: i + 1,
            });
            Analytics.unlockConfirmCompleted("success", Date.now() - startedAt);
            return;
          }

          if (isPendingConfirmResponse(data)) {
            await sleep(900 + i * 450);
            continue;
          }

          Analytics.track("unlock_confirm_failed", { reason: data?.state || "unknown" });
          Analytics.unlockConfirmCompleted("error", Date.now() - startedAt);
          return;
        } catch {
          if (cancelled) return;
          setState((prev) => transitionUnlockState(prev, { type: "network_error" }));
          await sleep(1200 + i * 450);
        }
      }

      if (!cancelled) {
        setState((prev) => transitionUnlockState(prev, { type: "timeout" }));
        Analytics.track("unlock_confirm_failed", { reason: "timeout" });
        Analytics.unlockConfirmCompleted("error", Date.now() - startedAt);
      }
    };

    void confirm();

    return () => {
      cancelled = true;
    };
  }, [sessionId, source, tier, maxAttempts]);

  return {
    state,
    attempt,
    sessionSuffix,
  };
}
