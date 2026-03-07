"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, RefreshCw, Receipt, ExternalLink } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { Analytics } from "@/lib/analytics";
import Footer from "@/components/landing/Footer";

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

/** Paper shadow matching all Editor's Desk cards */
const paperShadow =
  "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)";

/** Dark pill CTA */
const pillPrimary =
  "rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-70";

/** Bordered pill secondary */
const pillSecondary =
  "rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-70";

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
    <>
      <main className="bg-paper px-6 pb-16 pt-28 text-slate-900 selection:bg-brand/15 md:pt-36">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* ── Main restore card ── */}
          <section
            className="rounded-2xl bg-white p-8"
            style={{ boxShadow: paperShadow }}
          >
            <h1
              className="font-display text-slate-900"
              style={{
                fontSize: "clamp(1.6rem, 4vw, 2rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                fontWeight: 400,
              }}
            >
              {header}
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Use this page if payment succeeded but access looks locked, or if you need invoices and billing controls.
            </p>
            {signedIn && (
              <p className="mt-2 text-xs text-slate-400">
                Signed in as <span className="text-slate-700 font-medium">{user?.email}</span>
              </p>
            )}
            {billingUpdated && (
              <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                Billing updated successfully.
              </p>
            )}
            {restoreMessage && (
              <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                {restoreMessage}
              </p>
            )}

            {!signedIn ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/auth?from=paywall" className={pillPrimary}>
                  Sign In
                </Link>
                <Link href="/workspace" className={pillSecondary}>
                  Back to Workspace
                </Link>
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleRestore}
                  disabled={isRestoring}
                  className={`inline-flex items-center gap-2 ${pillPrimary}`}
                >
                  {isRestoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Restore Access
                </button>
                <button
                  onClick={handleOpenPortal}
                  disabled={isPortalLoading}
                  className={`inline-flex items-center gap-2 ${pillSecondary}`}
                >
                  {isPortalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                  Open Billing Portal
                </button>
                <button
                  onClick={handleLoadReceipts}
                  disabled={isReceiptsLoading}
                  className={`inline-flex items-center gap-2 ${pillSecondary}`}
                >
                  {isReceiptsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
                  Load Receipts
                </button>
                <Link
                  href="/workspace"
                  className={`inline-flex items-center gap-2 ${pillSecondary}`}
                >
                  Back to Workspace
                </Link>
              </div>
            )}
          </section>

          {/* ── Receipts card ── */}
          {receipts.length > 0 && (
            <section
              className="rounded-2xl bg-white p-6"
              style={{ boxShadow: paperShadow }}
            >
              <h2 className="editorial-kicker text-slate-400">Receipts</h2>
              <div className="mt-4 divide-y divide-slate-100">
                {receipts.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {item.number || item.id}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()} · {formatAmount(item.amount_paid, item.currency)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {item.hosted_invoice_url && (
                        <a
                          href={item.hosted_invoice_url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          View Invoice
                        </a>
                      )}
                      {item.invoice_pdf && (
                        <a
                          href={item.invoice_pdf}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
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
      <Footer />
    </>
  );
}
