"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowClockwise, ArrowRight } from "@phosphor-icons/react";
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

  const { state, sessionSuffix } = usePaymentConfirmation({
    sessionId,
    tier,
    source,
  });

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

  const isProblem = state.status === "error" || state.status === "missing";
  const hasPaidAccess = Boolean(user?.membership && user.membership !== "free");
  const paymentConfirmed = state.status === "unlocked";
  const checkingAccountAccess = paymentConfirmed && (
    authLoading || entitlementRefreshing || Boolean(user && !accountCheckComplete)
  );
  const accountReady = paymentConfirmed && !checkingAccountAccess && hasPaidAccess;
  // The title is the state; the line under it says what that means for this account.
  const pageTitle = !paymentConfirmed ? state.title
    : checkingAccountAccess ? "Checking your account"
    : accountReady ? "You’re in! Five more reads."
    : "Paid. One step left.";
  const confirmationMessage = !paymentConfirmed ? state.message
    : checkingAccountAccess ? "Your payment is confirmed. We’re checking access for your account."
    : accountReady ? "5 more reports, good for 90 days."
    : user ? "Your payment is confirmed, but this account does not show the pass yet."
    : "Your payment is confirmed. Sign in with your checkout email to use the pass.";

  return (
    <>
      <div
        data-visual-anchor="purchase-confirmed"
        className="bg-background px-4 pb-20 pt-28 text-foreground selection:bg-brand/15 sm:px-6 md:pt-36"
      >
        <section className="mx-auto max-w-form" aria-labelledby="purchase-confirmed-title">
          <header className="border-b border-border pb-8" role="status" aria-live="polite">
            <h1
              id="purchase-confirmed-title"
              className="max-w-xl text-balance font-sans text-title"
            >
              {pageTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">{confirmationMessage}</p>
            {isProblem && state.status !== "missing" && sessionSuffix ? (
              <p className="mt-3 text-sm text-muted-foreground">Confirmation reference {sessionSuffix}. Include it if you write to us.</p>
            ) : null}
          </header>

          <div className="flex flex-col gap-3 py-8 sm:flex-row sm:flex-wrap">
            {checkingAccountAccess ? (
              <Button type="button" variant="primary" disabled isLoading>
                Refreshing access…
              </Button>
            ) : state.status === "unlocked" && hasPaidAccess ? (
              <Button asChild variant="primary">
                <Link href={workspaceHref}>{returnTo ? "Compare my revision" : "Back to my report"} <ArrowRight className="size-4" weight="bold" /></Link>
              </Button>
            ) : state.status === "unlocked" && user ? (
              <Button asChild variant="primary">
                <Link href={restoreHref}>Verify purchase access <ArrowRight className="size-4" weight="bold" /></Link>
              </Button>
            ) : state.status === "unlocked" ? (
              <Button asChild variant="primary">
                <Link href={`/auth?next=${encodeURIComponent(workspaceHref)}&from=paywall`}>Sign in to use your pass <ArrowRight className="size-4" weight="bold" /></Link>
              </Button>
            ) : (
              <Button type="button" variant="primary" onClick={() => window.location.reload()}>
                <ArrowClockwise className="size-4" weight="bold" /> Check again
              </Button>
            )}

            {accountReady ? null : (
              <Button asChild variant="secondary">
                <Link href={restoreHref}>Restore access</Link>
              </Button>
            )}
            <Button asChild variant="quiet">
              <Link href="/settings/billing">Billing settings</Link>
            </Button>
            {state.status === "error" ? (
              <Button asChild variant="quiet">
                <Link href={getCheckoutPricingHref(returnTo)}>Back to pricing</Link>
              </Button>
            ) : null}
          </div>

          <p className="border-t border-line pt-6 text-sm text-muted-foreground">
            Need help? Email{" "}
            <a href="mailto:support@recruiterinyourpocket.com" className="font-medium text-foreground riyp-link">
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
