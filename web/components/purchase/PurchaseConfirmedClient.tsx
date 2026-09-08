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
import { getCheckoutPricingHref, getCheckoutRestoreHref, normalizeCheckoutReturnTo } from "@/lib/billing/checkoutReturn";

export default function PurchaseConfirmedClient() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const refreshedEntitlementRef = useRef(false);
  const [entitlementRefreshing, setEntitlementRefreshing] = useState(false);
  const [accountCheckComplete, setAccountCheckComplete] = useState(false);
  const searchParams = useSearchParams();
  const getSearchParam = searchParams.get.bind(searchParams);
  const sessionId = getSearchParam("session_id");
  const tier = getSearchParam("tier");
  const source = getSearchParam("source");
  const unlock = getSearchParam("unlock");
  const returnTo = normalizeCheckoutReturnTo(getSearchParam("returnTo"));
  const workspaceHref = returnTo || "/workspace";
  const restoreHref = getCheckoutRestoreHref(returnTo);

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
    void refreshUser().finally(() => {
      setEntitlementRefreshing(false);
      setAccountCheckComplete(true);
    });
  }, [authLoading, refreshUser, state.status, user]);

  const isWaiting = state.status === "checking" || state.status === "pending";
  const isProblem = state.status === "error" || state.status === "missing";
  const hasPaidAccess = Boolean(user?.membership && user.membership !== "free");
  const paymentConfirmed = state.status === "unlocked";
  const checkingAccountAccess = paymentConfirmed && (
    authLoading || entitlementRefreshing || Boolean(user && !accountCheckComplete)
  );
  const accountReady = paymentConfirmed && !checkingAccountAccess && hasPaidAccess;
  const statusLabel = isWaiting ? "Confirming with Stripe"
    : checkingAccountAccess ? "Checking account access"
    : accountReady ? "Access confirmed"
    : paymentConfirmed ? "Payment confirmed"
    : "Needs attention";
  const confirmationMessage = !paymentConfirmed ? state.message
    : checkingAccountAccess ? "Your payment is confirmed. We’re checking access for your account."
    : accountReady ? "Your account has paid access. You can return to your report."
    : user ? "Your payment is confirmed, but this account does not show the pass yet."
    : "Your payment is confirmed. Sign in with your checkout email to use the pass.";
  const nextStepLabel = !paymentConfirmed ? "Next step"
    : checkingAccountAccess ? "Checking your account"
    : accountReady ? "Ready when you are"
    : user ? "Verify account access"
    : "Sign in to continue";

  return (
    <>
      <div
        data-visual-anchor="purchase-confirmed"
        className="bg-background px-4 pb-20 pt-16 text-foreground selection:bg-brand/15 sm:px-6 sm:pt-20"
      >
        <section className="mx-auto max-w-form" aria-labelledby="purchase-confirmed-title">
          <header className="grid gap-6 border-b border-border pb-8">
            <div>
              <p className="text-eyebrow uppercase text-muted-foreground">Payment</p>
              <div className="mt-5 flex items-center gap-3 text-sm font-medium text-foreground" role="status" aria-live="polite">
                {state.status === "unlocked" ? <CheckCircle className="size-5 text-brand" weight="duotone" /> : null}
                {isWaiting ? <CircleNotch className="size-5 animate-spin text-brand" weight="bold" /> : null}
                {isProblem ? <Warning className="size-5 text-warning" weight="duotone" /> : null}
                <span>{statusLabel}</span>
              </div>
            </div>
            <div>
              <h1
                id="purchase-confirmed-title"
                className="max-w-xl text-balance font-sans text-3xl font-normal tracking-tight sm:text-workspace-title"
              >
                {state.title}
              </h1>
              <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-muted-foreground">{confirmationMessage}</p>
            </div>
          </header>

          <div className="grid gap-5 py-8">
            <div className="text-sm leading-6 text-muted-foreground">
              {unlockLabel && state.status !== "missing" ? (
                <p>
                  We kept your place in <span className="font-medium text-foreground">{unlockLabel}</span>.
                </p>
              ) : null}
              {state.status !== "missing" ? (
                <p className="mt-3 text-xs">
                  Confirmation reference {sessionSuffix || "pending"}
                  {attempt > 1 ? ` · check ${attempt}` : ""}
                </p>
              ) : null}
            </div>

            <div className="min-w-0 rounded-2xl border border-border bg-card p-6 sm:rounded-3xl sm:p-8">
              <p className="text-sm font-medium text-foreground">
                {nextStepLabel}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {checkingAccountAccess ? (
                  <Button type="button" variant="brand" size="lg" disabled isLoading>
                    Refreshing access…
                  </Button>
                ) : state.status === "unlocked" && hasPaidAccess ? (
                  <Button asChild variant="brand" size="lg">
                    <Link href={workspaceHref}>{returnTo ? "Compare my revision" : "Open workspace"} <ArrowRight className="size-4" weight="bold" /></Link>
                  </Button>
                ) : state.status === "unlocked" && user ? (
                  <Button asChild variant="brand" size="lg">
                    <Link href={restoreHref}>Verify purchase access <ArrowRight className="size-4" weight="bold" /></Link>
                  </Button>
                ) : state.status === "unlocked" ? (
                  <Button asChild variant="brand" size="lg">
                    <Link href={`/auth?next=${encodeURIComponent(workspaceHref)}&from=paywall`}>Sign in to use your pass <ArrowRight className="size-4" weight="bold" /></Link>
                  </Button>
                ) : (
                  <Button type="button" variant="brand" size="lg" onClick={() => window.location.reload()}>
                    <ArrowClockwise className="size-4" weight="bold" /> Check again
                  </Button>
                )}

                <Button asChild variant="outline" size="lg">
                  <Link href={restoreHref}>Restore access</Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link href="/settings/billing">Billing settings</Link>
                </Button>
                {state.status === "error" ? (
                  <Button asChild variant="ghost" size="lg">
                    <Link href={getCheckoutPricingHref(returnTo)}>Back to pricing</Link>
                  </Button>
                ) : null}
              </div>
              {paymentConfirmed && !checkingAccountAccess && !user ? (
                <p className="mt-5 rounded-xl bg-brand/5 px-4 py-4 text-sm leading-6 text-muted-foreground">
                  Sign in with the email used at checkout to use this pass. A passwordless sign-in email may already be in your inbox.
                </p>
              ) : null}
              {paymentConfirmed && !checkingAccountAccess && user && !hasPaidAccess ? (
                <p className="mt-5 rounded-xl border border-warning/30 bg-warning/5 px-4 py-4 text-sm leading-6 text-muted-foreground">
                  Payment is confirmed, but this signed-in account does not show the pass yet. Verify access using the checkout email before running another report.
                </p>
              ) : null}
            </div>
          </div>

          <p className="border-t border-line pt-6 text-sm leading-6 text-muted-foreground">
            Need help? Email{" "}
            <a href="mailto:support@recruiterinyourpocket.com" className="font-medium text-foreground underline decoration-brand/40 underline-offset-4 hover:text-brand">
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
