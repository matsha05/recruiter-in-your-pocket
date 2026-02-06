"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Analytics } from "@/lib/analytics";
import { saveUnlockContext, type UnlockSection } from "@/lib/unlock/unlockContext";

type ConfirmState = "checking" | "unlocked" | "pending" | "error" | "missing";

export default function PurchaseConfirmedClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const tier = searchParams.get("tier");
  const source = searchParams.get("source");
  const unlock = searchParams.get("unlock");

  const [state, setState] = useState<ConfirmState>(sessionId ? "checking" : "missing");
  const [message, setMessage] = useState("Confirming payment and unlocking access...");
  const [attempt, setAttempt] = useState(0);

  const unlockLabel = useMemo(() => {
    const map: Record<UnlockSection, string> = {
      evidence_ledger: "Evidence Ledger",
      bullet_upgrades: "The Red Pen",
      missing_wins: "Missing Wins",
      job_alignment: "Role Positioning",
      export_pdf: "Export"
    };
    if (!unlock) return null;
    return map[unlock as UnlockSection] || null;
  }, [unlock]);

  const title = useMemo(() => {
    if (state === "unlocked") return "Purchase confirmed";
    if (state === "pending" || state === "checking") return "Finalizing your access";
    if (state === "missing") return "Missing confirmation details";
    return "Unlock is delayed";
  }, [state]);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    const maxAttempts = 10;
    const startedAt = Date.now();

    const confirm = async () => {
      Analytics.track("unlock_confirm_started", {
        source: source || "unknown",
        tier: tier || "unknown"
      });

      for (let i = 0; i < maxAttempts; i++) {
        if (cancelled) return;

        setAttempt(i + 1);
        try {
          const res = await fetch("/api/billing/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId })
          });
          const data = await res.json();

          if (cancelled) return;

          if (data?.ok) {
            setState("unlocked");
            setMessage("Your access is active. You can continue in the workspace.");
            Analytics.track("checkout_completed", {
              source: source || "unknown",
              tier: data?.pass?.tier || tier || "unknown",
              attempt: i + 1,
              session_suffix: sessionId.slice(-8)
            });
            Analytics.track("unlock_confirm_succeeded", {
              tier: data?.pass?.tier || tier || "unknown",
              attempt: i + 1
            });
            Analytics.unlockConfirmCompleted("success", Date.now() - startedAt);
            return;
          }

          if (data?.pending) {
            setState("pending");
            setMessage(data?.message || "Payment received. Finalizing access...");
            await new Promise((resolve) => setTimeout(resolve, 900 + i * 450));
            continue;
          }

          if (data?.state === "checkout_incomplete") {
            setState("error");
            setMessage("Checkout is not complete yet. If you closed Stripe early, restart checkout.");
          } else if (data?.state === "not_paid") {
            setState("error");
            setMessage("Payment is not marked as paid yet. Check your receipt or try Restore Access.");
          } else {
            setState("error");
            setMessage(data?.message || "We could not confirm unlock yet.");
          }
          Analytics.track("unlock_confirm_failed", { reason: data?.state || "unknown" });
          Analytics.unlockConfirmCompleted("error", Date.now() - startedAt);
          return;
        } catch {
          if (cancelled) return;
          setState("pending");
          setMessage("Still confirming your unlock...");
          await new Promise((resolve) => setTimeout(resolve, 1200 + i * 450));
        }
      }

      if (!cancelled) {
        setState("error");
        setMessage("Payment succeeded, but unlock is still processing. Use Restore Access to sync now.");
        Analytics.track("unlock_confirm_failed", { reason: "timeout" });
        Analytics.unlockConfirmCompleted("error", Date.now() - startedAt);
      }
    };

    void confirm();

    return () => {
      cancelled = true;
    };
  }, [sessionId, source, tier]);

  useEffect(() => {
    if (!unlock) return;
    const normalized = unlock.trim().toLowerCase() as UnlockSection;
    const allowed: UnlockSection[] = [
      "evidence_ledger",
      "bullet_upgrades",
      "missing_wins",
      "job_alignment",
      "export_pdf"
    ];
    if (!allowed.includes(normalized)) return;
    saveUnlockContext({ section: normalized });
  }, [unlock]);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-background px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-xl border border-border/50 bg-card p-8 md:p-10">
        <div className="flex items-center gap-3">
          {state === "unlocked" && <CheckCircle2 className="h-6 w-6 text-success" />}
          {(state === "checking" || state === "pending") && <Loader2 className="h-6 w-6 animate-spin text-brand" />}
          {(state === "error" || state === "missing") && <AlertTriangle className="h-6 w-6 text-warning" />}
          <h1 className="font-display text-3xl tracking-tight text-foreground">{title}</h1>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">{message}</p>

        {unlockLabel && state !== "missing" && (
          <p className="mt-3 text-xs text-muted-foreground">
            We saved your place in <span className="text-foreground font-medium">{unlockLabel}</span>.
          </p>
        )}

        {state !== "missing" && (
          <p className="mt-3 text-xs text-muted-foreground">
            Attempt {attempt || 1} · Session <span className="font-mono">{sessionId?.slice(-10) || "unknown"}</span>
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {state === "unlocked" ? (
            <Link href="/workspace" className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90">
              Open Workspace
            </Link>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
            >
              <RefreshCw className="h-4 w-4" />
              Check Again
            </button>
          )}

          <Link href="/purchase/restore" className="rounded border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50">
            Restore Access
          </Link>
          <Link href="/settings/billing" className="rounded border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50">
            Billing Settings
          </Link>
          {state === "error" && (
            <Link href="/pricing" className="rounded border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50">
              Back to Pricing
            </Link>
          )}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Need help now? Email{" "}
          <Link href="mailto:support@recruiterinyourpocket.com" className="underline underline-offset-2">
            support@recruiterinyourpocket.com
          </Link>
          {" "}and include your checkout email.
        </p>
      </div>
    </main>
  );
}
