import { Suspense } from "react";
import PurchaseConfirmedClient from "@/components/purchase/PurchaseConfirmedClient";

function PurchaseConfirmedFallback() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-background px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-xl border border-border/50 bg-card p-8 md:p-10">
        <h1 className="font-display text-3xl tracking-tight text-foreground">Finalizing your access</h1>
        <p className="mt-4 text-sm text-muted-foreground">Checking payment confirmation...</p>
      </div>
    </main>
  );
}

export default function PurchaseConfirmedPage() {
  return (
    <Suspense fallback={<PurchaseConfirmedFallback />}>
      <PurchaseConfirmedClient />
    </Suspense>
  );
}
