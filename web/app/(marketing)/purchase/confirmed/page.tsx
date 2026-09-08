import { Suspense } from "react";
import type { Metadata } from "next";
import PurchaseConfirmedClient from "@/components/purchase/PurchaseConfirmedClient";

export const metadata: Metadata = {
  title: "Purchase Confirmation",
  description: "Confirm and restore Recruiter in Your Pocket purchase access.",
};

function PurchaseConfirmedFallback() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background px-5 pb-20 pt-28 md:px-8 md:pt-36">
      <div className="mx-auto max-w-form rounded-2xl border border-line bg-card p-6 md:rounded-3xl md:p-10">
        <p className="text-xs font-semibold uppercase riyp-track-010 text-brand">Payment</p>
        <h1 className="mt-4 font-display text-3xl font-normal tracking-tight text-foreground sm:text-workspace-title">Checking your purchase</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">Checking the payment with Stripe…</p>
      </div>
    </div>
  );
}

export default function PurchaseConfirmedPage() {
  return (
    <Suspense fallback={<PurchaseConfirmedFallback />}>
      <PurchaseConfirmedClient />
    </Suspense>
  );
}
