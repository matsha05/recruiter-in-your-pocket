"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowClockwise,
  ArrowRight,
  CheckCircle,
  CircleNotch,
  Warning,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { usePaymentConfirmation } from "@/hooks/usePaymentConfirmation";
import { saveUnlockContext, scheduleCheckoutWorkspaceExpiry, type UnlockSection } from "@/lib/unlock/unlockContext";
import Footer from "@/components/landing/Footer";
import { useAuth } from "@/components/providers/AuthProvider";

export default function PurchaseConfirmedClient() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const refreshedEntitlementRef = useRef(false);
  const [entitlementRefreshing, setEntitlementRefreshing] = useState(false);
  const searchParams = useSearchParams();
  const getSearchParam = searchParams.get.bind(searchParams);
  const sessionId = getSearchParam("session_id");
  const tier = getSearchParam("tier");
  const source = getSearchParam("source");
  const unlock = getSearchParam("unlock");

  const { state, attempt, sessionSuffix } = usePaymentConfirmation({
    sessionId,
    tier,
    source,
  });

  const unlockLabel = useMemo(() => {
    const map: Record<UnlockSection, string> = {
      evidence_ledger: "Evidence behind the review",
      bullet_upgrades: "Suggested rewrites",
      missing_wins: "Details to add",
      job_alignment: "Fit for the role",
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

  useEffect(() => {
    scheduleCheckoutWorkspaceExpiry();
  }, []);

  useEffect(() => {
    if (
      state.status !== "unlocked" ||
      authLoading ||
      !user ||
      refreshedEntitlementRef.current
    ) return;
    refreshedEntitlementRef.current = true;
    setEntitlementRefreshing(true);
    void refreshUser().finally(() => setEntitlementRefreshing(false));
  }, [authLoading, refreshUser, state.status, user]);

  const isWaiting = state.status === "checking" || state.status === "pending";
  const isProblem = state.status === "error" || state.status === "missing";
  const hasPaidAccess = Boolean(user?.membership && user.membership !== "free");

  return (
    <>
      <div
        data-visual-anchor="purchase-confirmed"
        className="bg-paper px-5 pb-20 pt-28 text-foreground selection:bg-brand/15 md:px-8 md:pt-36"
      >
        <section className="mx-auto max-w-[64rem]" aria-labelledby="purchase-confirmed-title">
          <header className="grid gap-8 border-b border-line pb-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase riyp-track-012 text-brand">Payment</p>
              <div className="mt-5 flex items-center gap-3 text-sm font-semibold text-foreground" role="status" aria-live="polite">
                {state.status === "unlocked" ? <CheckCircle className="size-5 text-brand" weight="duotone" /> : null}
                {isWaiting ? <CircleNotch className="size-5 animate-spin text-brand" weight="bold" /> : null}
                {isProblem ? <Warning className="size-5 text-warning" weight="duotone" /> : null}
                <span>{isWaiting ? "Confirming with Stripe" : state.status === "unlocked" ? "Access confirmed" : "Needs attention"}</span>
              </div>
            </div>
            <div>
              <h1
                id="purchase-confirmed-title"
                className="max-w-[16ch] text-balance font-display text-[clamp(3rem,7vw,6.5rem)] riyp-weight-520 leading-[0.92] tracking-[-0.05em] riyp-stretch-90"
              >
                {state.title}
              </h1>
              <p className="mt-5 max-w-[40rem] text-pretty text-lg leading-8 text-muted-foreground">{state.message}</p>
            </div>
          </header>

          <div className="grid gap-8 py-9 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div className="text-sm leading-6 text-muted-foreground">
              {unlockLabel && state.status !== "missing" ? (
                <p>
                  We kept your place in <span className="font-semibold text-foreground">{unlockLabel}</span>.
                </p>
              ) : null}
              {state.status !== "missing" ? (
                <p className="mt-3 text-xs">
                  Confirmation reference {sessionSuffix || "pending"}
                  {attempt > 1 ? ` · check ${attempt}` : ""}
                </p>
              ) : null}
            </div>

            <div className="border-y border-line bg-surface-sky/45 px-5 py-6 sm:px-7 sm:py-7">
              <p className="text-xs font-semibold uppercase riyp-track-010 text-brand">
                {state.status === "unlocked" ? "Ready when you are" : "Next step"}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {state.status === "unlocked" && (authLoading || entitlementRefreshing) ? (
                  <Button type="button" variant="brand" size="lg" disabled isLoading>
                    Refreshing access…
                  </Button>
                ) : state.status === "unlocked" && hasPaidAccess ? (
                  <Button asChild variant="brand" size="lg">
                    <Link href="/workspace">Open the studio <ArrowRight className="size-4" weight="bold" /></Link>
                  </Button>
                ) : state.status === "unlocked" && user ? (
                  <Button asChild variant="brand" size="lg">
                    <Link href="/purchase/restore">Verify purchase access <ArrowRight className="size-4" weight="bold" /></Link>
                  </Button>
                ) : state.status === "unlocked" ? (
                  <Button asChild variant="brand" size="lg">
                    <Link href="/auth?next=%2Fworkspace&from=paywall">Sign in to use your pass <ArrowRight className="size-4" weight="bold" /></Link>
                  </Button>
                ) : (
                  <Button type="button" variant="brand" size="lg" onClick={() => window.location.reload()}>
                    <ArrowClockwise className="size-4" weight="bold" /> Check again
                  </Button>
                )}

                <Button asChild variant="outline" size="lg">
                  <Link href="/purchase/restore">Restore access</Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link href="/settings/billing">Billing settings</Link>
                </Button>
                {state.status === "error" ? (
                  <Button asChild variant="ghost" size="lg">
                    <Link href="/pricing">Back to pricing</Link>
                  </Button>
                ) : null}
              </div>
              {state.status === "unlocked" && !authLoading && !entitlementRefreshing && !user ? (
                <p className="mt-4 border-l-2 border-cyan-bright px-3 text-sm leading-6 text-muted-foreground">
                  Sign in with the email used at checkout to use this pass. A passwordless sign-in email may already be in your inbox.
                </p>
              ) : null}
              {state.status === "unlocked" && !authLoading && !entitlementRefreshing && user && !hasPaidAccess ? (
                <p className="mt-4 border-l-2 border-warning px-3 text-sm leading-6 text-muted-foreground">
                  Payment is confirmed, but this signed-in account does not show the pass yet. Verify access using the checkout email before running another report.
                </p>
              ) : null}
            </div>
          </div>

          <p className="border-t border-line pt-6 text-sm leading-6 text-muted-foreground">
            Need help? Email{" "}
            <a href="mailto:support@recruiterinyourpocket.com" className="font-semibold text-foreground underline decoration-brand/40 underline-offset-4 hover:text-brand">
              support@recruiterinyourpocket.com
            </a>{" "}
            from the address used at checkout.
          </p>
        </section>
      </div>
      <Footer />
    </>
  );
}
