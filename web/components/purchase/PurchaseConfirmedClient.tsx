"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { usePaymentConfirmation } from "@/hooks/usePaymentConfirmation";
import { saveUnlockContext, type UnlockSection } from "@/lib/unlock/unlockContext";
import Footer from "@/components/landing/Footer";

/** Paper shadow matching all Editor's Desk cards */
const paperShadow =
  "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)";

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
    <>
      <main className="bg-paper px-6 pb-16 pt-28 text-slate-900 selection:bg-brand/15 md:pt-36">
        <div className="mx-auto max-w-2xl">
          <div
            className="rounded-2xl bg-white p-8 md:p-10"
            style={{ boxShadow: paperShadow }}
          >
            <div className="flex items-center gap-3">
              {state.status === "unlocked" && <CheckCircle2 className="h-6 w-6 text-emerald-600" />}
              {(state.status === "checking" || state.status === "pending") && (
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              )}
              {(state.status === "error" || state.status === "missing") && (
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              )}
              <h1
                className="font-display text-slate-900"
                style={{
                  fontSize: "clamp(1.6rem, 4vw, 2rem)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                  fontWeight: 400,
                }}
              >
                {state.title}
              </h1>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-500">{state.message}</p>

            {unlockLabel && state.status !== "missing" && (
              <p className="mt-3 text-xs text-slate-400">
                We saved your place in <span className="text-slate-700 font-medium">{unlockLabel}</span>.
              </p>
            )}

            {state.status !== "missing" && (
              <p className="mt-3 text-xs text-slate-400">
                Attempt {attempt || 1} · Session <span className="font-mono">{sessionSuffix}</span>
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {state.status === "unlocked" ? (
                <Link
                  href="/workspace"
                  className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Open Workspace
                </Link>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Check Again
                </button>
              )}

              <Link
                href="/purchase/restore"
                className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Restore Access
              </Link>
              <Link
                href="/settings/billing"
                className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Billing Settings
              </Link>
              {state.status === "error" && (
                <Link
                  href="/pricing"
                  className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Back to Pricing
                </Link>
              )}
            </div>

            <p className="mt-8 text-xs text-slate-400">
              Need help now? Email{" "}
              <Link href="mailto:support@recruiterinyourpocket.com" className="underline underline-offset-2 text-slate-500 hover:text-slate-700">
                support@recruiterinyourpocket.com
              </Link>
              {" "}and include your checkout email.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
