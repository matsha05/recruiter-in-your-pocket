"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, RotateCcw, Receipt } from "lucide-react";
import { PricingCard, type PricingTier } from "@/components/shared/PricingCard";
import Footer from "@/components/landing/Footer";
import { Analytics } from "@/lib/analytics";
import { toast } from "sonner";

export default function PricingPageClient() {
  const [loadingTier, setLoadingTier] = useState<PricingTier | null>(null);

  async function handleCheckout(tier: "monthly" | "lifetime") {
    try {
      setLoadingTier(tier);
      Analytics.checkoutStarted(tier, tier === "monthly" ? 9 : 79);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          source: "pricing",
          idempotencyKey: crypto.randomUUID()
        })
      });
      const data = await res.json();
      if (!data.ok || !data.url) {
        throw new Error(data.message || "Unable to start checkout");
      }
      window.location.href = data.url;
    } catch (err: any) {
      Analytics.track("checkout_start_failed", { source: "pricing", tier });
      toast.error(err.message || "Checkout failed. Please try again.");
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <>
      <section aria-label="Pricing content" className="min-h-screen bg-background">
        <section className="px-6 py-20 border-b border-border/40">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Pricing</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-tight">
              Start free, pay when iteration matters
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Recruiters do not review one resume version. They compare iterations. Monthly and lifetime plans are
              built for repeated, role-specific improvements.
            </p>
          </div>
        </section>

        <section className="px-6 py-14">
          <div className="max-w-5xl mx-auto grid gap-5 md:grid-cols-3">
            <PricingCard tier="free" allowFreeSelect onSelect={() => (window.location.href = "/workspace")} />
            <PricingCard
              tier="monthly"
              onSelect={() => handleCheckout("monthly")}
              loading={loadingTier === "monthly"}
            />
            <PricingCard
              tier="lifetime"
              onSelect={() => handleCheckout("lifetime")}
              loading={loadingTier === "lifetime"}
            />
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="max-w-4xl mx-auto rounded-xl border border-border/50 bg-muted/20 p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-brand mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Trust at checkout</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Card details are handled by Stripe. We do not store raw card numbers.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-brand mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Restore and billing control</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Restore access, view receipts, update payment method, or cancel monthly from Settings.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Receipt className="w-5 h-5 text-brand mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold text-foreground">What unlocks immediately</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Full report sections, additional runs, and export/history access.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Refund handling is case-by-case with priority on billing errors and failed unlock scenarios.
              {" "}
              Use <Link href="/purchase/restore" className="text-foreground underline underline-offset-4">Restore Access</Link> first for the fastest fix.
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              Need procurement or team access? Contact{" "}
              <Link href="mailto:support@recruiterinyourpocket.com" className="text-foreground underline underline-offset-4">
                support@recruiterinyourpocket.com
              </Link>
              .
            </p>
          </div>
        </section>
      </section>
      <Footer />
    </>
  );
}
