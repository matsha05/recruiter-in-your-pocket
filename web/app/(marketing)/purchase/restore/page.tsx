import { Suspense } from "react";
import PurchaseRestoreClient from "@/components/purchase/PurchaseRestoreClient";

function PurchaseRestoreFallback() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-paper px-5 pb-20 pt-28 md:px-8 md:pt-36">
      <div className="mx-auto max-w-3xl border-y border-line py-8 md:py-10">
        <p className="text-xs font-semibold uppercase riyp-track-010 text-brand">Billing help</p>
        <h1 className="mt-4 font-display text-5xl riyp-weight-520 tracking-[-0.04em] text-foreground">Restore purchase access</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">Loading billing tools…</p>
      </div>
    </div>
  );
}

export default function PurchaseRestorePage() {
  return (
    <Suspense fallback={<PurchaseRestoreFallback />}>
      <PurchaseRestoreClient />
    </Suspense>
  );
}
