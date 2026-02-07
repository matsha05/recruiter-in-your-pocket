"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { usePaymentConfirmation } from "@/hooks/usePaymentConfirmation";
import { saveUnlockContext, type UnlockSection } from "@/lib/unlock/unlockContext";

export default function PurchaseConfirmedClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const tier = searchParams.get("tier");
  const source = searchParams.get("source");
  const unlock = searchParams.get("unlock");

  const { state, attempt, sessionSuffix } = usePaymentConfirmation({
    sessionId,
    tier,
    source,
  });

  const unlockLabel = useMemo(() => {
    const map: Record<UnlockSection, string> = {
      evidence_ledger: "Evidence Ledger",
      bullet_upgrades: "The Red Pen",
      missing_wins: "Missing Wins",
      job_alignment: "Role Positioning",
      export_pdf: "Export",
    };
    if (!unlock) return null;
    return map[unlock as UnlockSection] || null;
  }, [unlock]);

  useEffect(() => {
    if (!unlock) return;
    const normalized = unlock.trim().toLowerCase() as UnlockSection;
    const allowed: UnlockSection[] = [
      "evidence_ledger",
      "bullet_upgrades",
      "missing_wins",
      "job_alignment",
      "export_pdf",
    ];
    if (!allowed.includes(normalized)) return;
    saveUnlockContext({ section: normalized });
  }, [unlock]);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-background px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-xl border border-border/50 bg-card p-8 md:p-10">
        <div className="flex items-center gap-3">
          {state.status === "unlocked" && <CheckCircle2 className="h-6 w-6 text-success" />}
          {(state.status === "checking" || state.status === "pending") && (
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          )}
          {(state.status === "error" || state.status === "missing") && (
            <AlertTriangle className="h-6 w-6 text-warning" />
          )}
          <h1 className="font-display text-3xl tracking-tight text-foreground">{state.title}</h1>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">{state.message}</p>

        {unlockLabel && state.status !== "missing" && (
          <p className="mt-3 text-xs text-muted-foreground">
            We saved your place in <span className="text-foreground font-medium">{unlockLabel}</span>.
          </p>
        )}

        {state.status !== "missing" && (
          <p className="mt-3 text-xs text-muted-foreground">
            Attempt {attempt || 1} · Session <span className="font-mono">{sessionSuffix}</span>
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {state.status === "unlocked" ? (
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
          {state.status === "error" && (
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
