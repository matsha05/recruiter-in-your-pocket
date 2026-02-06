"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, RefreshCw, Receipt, ExternalLink } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { Analytics } from "@/lib/analytics";

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
  const { user, refreshUser } = useAuth();
  const [isRestoring, setIsRestoring] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isReceiptsLoading, setIsReceiptsLoading] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);

  const billingUpdated = searchParams.get("billing") === "updated";
  const signedIn = !!user?.email;

  const header = useMemo(() => {
    if (!signedIn) return "Sign in to restore billing access";
    return "Restore purchase access";
  }, [signedIn]);

  async function handleRestore() {
    setIsRestoring(true);
    setRestoreMessage(null);
    try {
      Analytics.track("billing_restore_requested", { source: "purchase_restore_page" });
      const res = await fetch("/api/billing/restore", { method: "POST" });
      const data = await res.json();
      if (!data?.ok) {
        throw new Error(data?.message || "Restore failed");
      }
      await refreshUser();
      setRestoreMessage(data.message || "Restore completed.");
      Analytics.track("billing_restore_succeeded", { restored: data.restored || 0 });
      toast.success("Restore complete");
    } catch (err: any) {
      toast.error(err?.message || "Restore failed");
      setRestoreMessage(err?.message || "Restore failed.");
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
        body: JSON.stringify({ returnTo: "restore" })
      });
      const data = await res.json();
      if (!data?.ok || !data?.url) {
        throw new Error(data?.message || "Unable to open billing portal");
      }
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err?.message || "Unable to open billing portal");
    } finally {
      setIsPortalLoading(false);
    }
  }

  async function handleLoadReceipts() {
    setIsReceiptsLoading(true);
    try {
      const res = await fetch("/api/billing/receipts");
      const data = await res.json();
      if (!data?.ok) {
        throw new Error(data?.message || "Failed to load receipts");
      }
      setReceipts(Array.isArray(data.receipts) ? data.receipts : []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load receipts");
    } finally {
      setIsReceiptsLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-background px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-xl border border-border/50 bg-card p-8">
          <h1 className="font-display text-3xl tracking-tight text-foreground">{header}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Use this page if payment succeeded but access looks locked, or if you need invoices and billing controls.
          </p>
          {signedIn && (
            <p className="mt-2 text-xs text-muted-foreground">
              Signed in as <span className="text-foreground font-medium">{user?.email}</span>
            </p>
          )}
          {billingUpdated && (
            <p className="mt-3 rounded border border-success/20 bg-success/10 px-3 py-2 text-xs text-success">
              Billing updated successfully.
            </p>
          )}
          {restoreMessage && (
            <p className="mt-3 rounded border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              {restoreMessage}
            </p>
          )}

          {!signedIn ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/auth?from=paywall" className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90">
                Sign In
              </Link>
              <Link href="/workspace" className="rounded border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50">
                Back to Workspace
              </Link>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleRestore}
                disabled={isRestoring}
                className="inline-flex items-center gap-2 rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-70"
              >
                {isRestoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Restore Access
              </button>
              <button
                onClick={handleOpenPortal}
                disabled={isPortalLoading}
                className="inline-flex items-center gap-2 rounded border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 disabled:opacity-70"
              >
                {isPortalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                Open Billing Portal
              </button>
              <button
                onClick={handleLoadReceipts}
                disabled={isReceiptsLoading}
                className="inline-flex items-center gap-2 rounded border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 disabled:opacity-70"
              >
                {isReceiptsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
                Load Receipts
              </button>
              <Link
                href="/workspace"
                className="inline-flex items-center gap-2 rounded border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
              >
                Back to Workspace
              </Link>
            </div>
          )}
        </section>

        {receipts.length > 0 && (
          <section className="rounded-xl border border-border/50 bg-card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Receipts</h2>
            <div className="mt-4 divide-y divide-border/30">
              {receipts.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.number || item.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()} · {formatAmount(item.amount_paid, item.currency)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {item.hosted_invoice_url && (
                      <a
                        href={item.hosted_invoice_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50"
                      >
                        View Invoice
                      </a>
                    )}
                    {item.invoice_pdf && (
                      <a
                        href={item.invoice_pdf}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50"
                      >
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
