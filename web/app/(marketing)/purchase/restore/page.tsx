import { Suspense } from "react";
import type { Metadata } from "next";
import PurchaseRestoreClient from "@/components/purchase/PurchaseRestoreClient";

export const metadata: Metadata = {
  title: "Restore your purchase",
  description: "Restore access to a Recruiter in Your Pocket purchase.",
};

function PurchaseRestoreFallback() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background px-5 pb-20 pt-28 md:px-8 md:pt-36">
      <div className="mx-auto max-w-form rounded-2xl border border-line bg-card p-6 md:rounded-3xl md:p-10">
        <h1 className="font-display text-title text-foreground">Restore your purchase</h1>
        <p className="mt-4 text-base text-muted-foreground">Loading your purchase details…</p>
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
