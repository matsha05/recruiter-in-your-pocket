import { Suspense } from "react";
import PurchaseRestoreClient from "@/components/purchase/PurchaseRestoreClient";

function PurchaseRestoreFallback() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-background px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-xl border border-border/50 bg-card p-8">
          <h1 className="font-display text-3xl tracking-tight text-foreground">Restore purchase access</h1>
          <p className="mt-3 text-sm text-muted-foreground">Loading billing tools...</p>
        </section>
      </div>
    </main>
  );
}

export default function PurchaseRestorePage() {
  return (
    <Suspense fallback={<PurchaseRestoreFallback />}>
      <PurchaseRestoreClient />
    </Suspense>
  );
}
