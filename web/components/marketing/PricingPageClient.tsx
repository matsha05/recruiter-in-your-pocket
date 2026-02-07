"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Receipt, RotateCcw, ShieldCheck } from "lucide-react";
import { PricingCard, type PricingTier } from "@/components/shared/PricingCard";
import Footer from "@/components/landing/Footer";
import { Analytics } from "@/lib/analytics";
import { toast } from "sonner";

const unlockPoints = [
    "Evidence Ledger and Red Pen rewrites on paid runs",
    "Role matching, Missing Wins, and run history",
    "Export and restore controls without support tickets",
];

const billingPoints = [
    {
        icon: ShieldCheck,
        title: "Trust at checkout",
        body: "Card details are handled by Stripe. We never store raw card numbers.",
    },
    {
        icon: RotateCcw,
        title: "Restore and billing control",
        body: "Restore access, manage renewals, and cancel from Billing.",
    },
    {
        icon: Receipt,
        title: "Immediate unlock scope",
        body: "Deep sections, repeated runs, export, and history unlock immediately.",
    },
];

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
                    idempotencyKey: crypto.randomUUID(),
                }),
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
            <main className="landing-page">
                <section className="landing-section-pad landing-section-divider landing-section-hero">
                    <div className="landing-rail">
                        <div className="landing-flow-md mx-auto max-w-3xl text-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                Pricing with clear value boundaries
                            </div>
                            <h1 className="landing-title-xl mx-auto max-w-[20ch]">
                                Start free, upgrade when iteration speed matters
                            </h1>
                            <p className="mx-auto max-w-2xl landing-copy">
                                First review is free. Paid plans unlock repeated role-specific runs, deeper rewrites, and saved history.
                            </p>
                            <div className="landing-flow-sm mx-auto max-w-2xl landing-card landing-card-pad text-left">
                                <div className="landing-eyebrow">What paid unlocks</div>
                                <ul className="space-y-2.5 landing-copy-muted">
                                    {unlockPoints.map((point) => (
                                        <li key={point} className="flex items-start gap-2">
                                            <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-brand" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="landing-section-pad landing-section landing-section-tight landing-section-divider">
                    <div className="landing-rail">
                        <div className="mx-auto grid max-w-[1120px] gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            <PricingCard
                                tier="free"
                                allowFreeSelect
                                onSelect={() => {
                                    Analytics.track("pricing_run_free_review_clicked", { source: "pricing_page" });
                                    window.location.href = "/workspace";
                                }}
                            />
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
                    </div>
                </section>

                <section className="landing-section-pad landing-deep-ink">
                    <div className="landing-rail landing-grid-gap grid items-start lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="landing-flow-md">
                            <div className="text-label-mono text-slate-400">Billing trust</div>
                            <h2 className="landing-title-lg text-slate-50">
                                Payment and access stay transparent
                            </h2>
                            <p className="landing-copy-inverted max-w-[42rem]">
                                If unlock lags after payment, restore flow and billing controls are available immediately.
                            </p>
                        </div>
                        <div className="landing-deep-ink-panel landing-flow-md">
                            <div className="space-y-3.5">
                                {billingPoints.map((item) => (
                                    <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <item.icon className="h-4 w-4 text-brand" />
                                            <h3 className="text-sm font-semibold text-slate-100">{item.title}</h3>
                                        </div>
                                        <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{item.body}</p>
                                    </div>
                                ))}
                            </div>
                            <Link
                                href="/purchase/restore"
                                className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-3 text-white transition-colors hover:bg-brand/90"
                            >
                                Open restore access
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="landing-section-pad landing-section landing-section-tight">
                    <div className="landing-rail">
                        <div className="mx-auto max-w-3xl text-center">
                            <p className="landing-copy-muted">
                                Need invoices, receipts, or procurement help?{" "}
                                <Link
                                    href="mailto:support@recruiterinyourpocket.com"
                                    className="text-foreground underline underline-offset-4 hover:text-brand"
                                >
                                    support@recruiterinyourpocket.com
                                </Link>
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
