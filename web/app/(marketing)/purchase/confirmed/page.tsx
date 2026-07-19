import { Suspense } from "react";
import PurchaseConfirmedClient from "@/components/purchase/PurchaseConfirmedClient";

function PurchaseConfirmedFallback() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-paper px-5 pb-20 pt-28 md:px-8 md:pt-36">
      <div className="mx-auto max-w-3xl border-y border-line py-8 md:py-10">
        <p className="text-xs font-semibold uppercase riyp-track-010 text-brand">Payment</p>
        <h1 className="mt-4 font-display text-5xl riyp-weight-520 tracking-[-0.04em] text-foreground">Finalizing your access</h1>
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
