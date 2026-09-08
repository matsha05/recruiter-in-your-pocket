"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowClockwise,
  ArrowRight,
  ArrowSquareOut,
  CircleNotch,
  Receipt,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { Analytics } from "@/lib/analytics";
import Footer from "@/components/landing/Footer";
import { getCheckoutRestoreHref, normalizeCheckoutReturnTo } from "@/lib/billing/checkoutReturn";
import { ClientActionError, getClientActionError } from "@/lib/client-action-error";

type ReceiptItem = {
  id: string;
  number: string | null;
  status: string | null;
  amount_paid: number;
  currency: string | null;
  created_at: string;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
};

function formatAmount(cents: number, currency: string | null) {
  const amount = (Number(cents || 0) / 100).toFixed(2);
  return `${currency?.toUpperCase() || "USD"} ${amount}`;
}

export default function PurchaseRestoreClient() {
  const searchParams = useSearchParams();
  const getSearchParam = searchParams.get.bind(searchParams);
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const [isRestoring, setIsRestoring] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isReceiptsLoading, setIsReceiptsLoading] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState(false);
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [receiptsState, setReceiptsState] = useState<"idle" | "loaded" | "error">("idle");
  const [receiptsMessage, setReceiptsMessage] = useState<string | null>(null);

  const billingUpdated = getSearchParam("billing") === "updated";
  const returnTo = normalizeCheckoutReturnTo(getSearchParam("returnTo"));
  const workspaceHref = returnTo || "/workspace";
  const signInHref = returnTo
    ? `/auth?from=paywall&next=${encodeURIComponent(getCheckoutRestoreHref(returnTo))}`
    : "/auth?from=paywall&next=/purchase/restore";
  const signedIn = Boolean(user?.email);

  const header = useMemo(() => {
    if (authLoading) return "Checking your account.";
    if (!signedIn) return "Sign in to restore your purchase.";
    return "Restore your purchase.";
  }, [authLoading, signedIn]);

  async function handleRestore() {
    setIsRestoring(true);
    setRestoreMessage(null);
    setRestoreError(false);
    try {
      Analytics.track("billing_restore_requested", { source: "purchase_restore_page" });
      const res = await fetch("/api/billing/restore", { method: "POST" });
      const data = await res.json();
      if (!data?.ok) throw new ClientActionError(data?.message, "We couldn’t restore your pass. Try again or contact support.");
      await refreshUser();
      setRestoreMessage(data.message || "The purchase check is complete.");
      Analytics.track("billing_restore_succeeded", { restored: data.restored || 0 });
      toast.success(data.restored > 0 ? "Access restored" : "Access check complete");
    } catch (err: any) {
      const message = getClientActionError(err, "We couldn’t restore your pass. Try again or contact support.");
      toast.error(message);
      setRestoreMessage(message);
      setRestoreError(true);
    } finally {
      setIsRestoring(false);
    }
  }

  async function handleOpenPortal() {
    setIsPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnTo: "restore" }),
      });
      const data = await res.json();
      if (!data?.ok || !data?.url) throw new ClientActionError(data?.message, "Stripe billing couldn’t open. Please try again.");
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(getClientActionError(err, "Stripe billing couldn’t open. Please try again."));
    } finally {
      setIsPortalLoading(false);
    }
  }

  async function handleLoadReceipts() {
    setIsReceiptsLoading(true);
    setReceiptsMessage(null);
    try {
      const res = await fetch("/api/billing/receipts");
      const data = await res.json();
      if (!data?.ok) throw new ClientActionError(data?.message, "We couldn’t load your receipts. Please try again.");
      const nextReceipts = Array.isArray(data.receipts) ? data.receipts : [];
      setReceipts(nextReceipts);
      setReceiptsState("loaded");
      setReceiptsMessage(nextReceipts.length === 0
        ? "No receipts were found for this account. If you paid with another email, sign in with that email and restore access first."
        : null);
    } catch (err: any) {
      const message = getClientActionError(err, "We couldn’t load your receipts. Please try again.");
      setReceiptsState("error");
      setReceiptsMessage(message);
      toast.error(message);
    } finally {
      setIsReceiptsLoading(false);
    }
  }

  return (
    <>
      <div
        data-visual-anchor="purchase-restore"
        className="bg-background px-4 pb-20 pt-16 text-foreground selection:bg-brand/15 sm:px-6 sm:pt-20"
      >
        <section className="mx-auto max-w-form" aria-labelledby="purchase-restore-title">
          <header className="grid gap-6 border-b border-border pb-8">
            <div>
              <p className="text-eyebrow uppercase text-muted-foreground">Billing help</p>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                Use the email address you used at checkout. We’ll check your payment with Stripe and restore any missing pass.
              </p>
            </div>
            <div>
              <h1
                id="purchase-restore-title"
                className="max-w-xl text-balance font-sans text-3xl font-normal tracking-tight sm:text-workspace-title"
              >
                {header}
              </h1>
              <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-muted-foreground">
                Find a missing pass, view receipts, or manage billing through Stripe.
              </p>
            </div>
          </header>

          {(billingUpdated || restoreMessage) ? (
            <div
              role={restoreError ? "alert" : "status"}
              className={`mt-7 rounded-xl border px-5 py-4 text-sm leading-6 ${restoreError ? "border-destructive bg-error-surface text-destructive" : "border-brand/20 bg-brand/5 text-foreground"}`}
            >
              {restoreMessage || "Billing settings updated."}
            </div>
          ) : null}

          <div className="grid gap-5 py-8">
            <div className="text-sm leading-6 text-muted-foreground">
              {authLoading ? (
                <p role="status">Checking which account you’re signed in to.</p>
              ) : signedIn ? (
                <p>Signed in as <span className="break-all font-medium text-foreground">{user?.email}</span></p>
              ) : (
                <p>Sign in with your checkout email so we can find your purchase.</p>
              )}
            </div>

            <div className="min-w-0 rounded-2xl border border-border bg-card p-6 sm:rounded-3xl sm:p-8">
              <p className="text-sm font-medium text-foreground">Choose what you need</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {authLoading ? (
                  <Button type="button" variant="brand" size="lg" disabled isLoading>
                    Checking account…
                  </Button>
                ) : !signedIn ? (
                  <>
                    <Button asChild variant="brand" size="lg">
                      <Link href={signInHref}>Sign in <ArrowRight className="size-4" weight="bold" /></Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href={workspaceHref}>{returnTo ? "Back to my comparison" : "Back to workspace"}</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="button" variant="brand" size="lg" onClick={handleRestore} disabled={isRestoring}>
                      {isRestoring ? <CircleNotch className="size-4 animate-spin" weight="bold" /> : <ArrowClockwise className="size-4" weight="bold" />}
                      Restore access
                    </Button>
                    <Button type="button" variant="outline" size="lg" onClick={handleOpenPortal} disabled={isPortalLoading}>
                      {isPortalLoading ? <CircleNotch className="size-4 animate-spin" weight="bold" /> : <ArrowSquareOut className="size-4" weight="bold" />}
                      Billing portal
                    </Button>
                    <Button type="button" variant="outline" size="lg" onClick={handleLoadReceipts} disabled={isReceiptsLoading}>
                      {isReceiptsLoading ? <CircleNotch className="size-4 animate-spin" weight="bold" /> : <Receipt className="size-4" weight="duotone" />}
                      View receipts
                    </Button>
                    <Button asChild variant="ghost" size="lg">
                      <Link href={workspaceHref}>{returnTo ? "Back to my comparison" : "Back to workspace"}</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {receiptsState === "error" ? (
            <div role="alert" className="rounded-xl border border-destructive bg-error-surface px-5 py-4 text-sm leading-6 text-destructive">
              <p className="font-semibold">Receipts could not load.</p>
              <p className="mt-1">{receiptsMessage}</p>
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={handleLoadReceipts} disabled={isReceiptsLoading}>
                Try again
              </Button>
            </div>
          ) : receiptsState === "loaded" ? (
            <section className="border-t border-line pt-8" aria-labelledby="receipt-list-title">
              <div className="grid gap-6">
                <div>
                  <p className="text-sm font-medium text-foreground">Receipts</p>
                  <h2 id="receipt-list-title" className="mt-3 font-sans text-report-title">Your payment record</h2>
                </div>
                <div className="divide-y divide-line border-y border-line">
                  {receipts.length === 0 ? (
                    <p role="status" className="py-5 text-sm leading-6 text-muted-foreground">{receiptsMessage}</p>
                  ) : receipts.map((item) => (
                    <article key={item.id} className="grid gap-3 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6">
                      <div>
                        <p className="font-medium text-foreground">{item.number || "Stripe receipt"}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()} · {formatAmount(item.amount_paid, item.currency)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.hosted_invoice_url ? (
                          <Button asChild variant="outline" size="sm">
                            <a href={item.hosted_invoice_url} target="_blank" rel="noreferrer">View receipt <ArrowSquareOut className="size-4" /></a>
                          </Button>
                        ) : null}
                        {item.invoice_pdf ? (
                          <Button asChild variant="ghost" size="sm">
                            <a href={item.invoice_pdf} target="_blank" rel="noreferrer">PDF</a>
                          </Button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </section>
      </div>
      <Footer />
    </>
  );
}
