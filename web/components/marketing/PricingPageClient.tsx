"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Receipt, RotateCcw, ShieldCheck } from "lucide-react";
import { PricingCard, type PricingTier } from "@/components/shared/PricingCard";
import Footer from "@/components/landing/Footer";
import { Analytics } from "@/lib/analytics";
import { toast } from "sonner";

const unlockPoints = [
    "Full rewrites and evidence breakdowns in every report",
    "Match your resume to specific job descriptions",
    "Export reports, save history, and manage it yourself",
    "Bring saved job context back from the extension when you want a role-by-role workflow",
];

const billingPoints = [
    {
        icon: ShieldCheck,
        title: "Secure checkout",
        body: "Stripe handles your payment. We never see or store your card number.",
    },
    {
        icon: RotateCcw,
        title: "Easy to manage",
        body: "Restore access, manage renewals, or cancel — all from your billing page.",
    },
    {
        icon: Receipt,
        title: "Access starts immediately",
        body: "As soon as you pay, everything unlocks: reports, exports, history, all of it.",
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
            <main data-visual-anchor="pricing-page" className="bg-paper pt-28 text-slate-900 selection:bg-brand/15 md:pt-36">
                {/* Hero */}
                <section className="px-6 pb-10 md:px-8 md:pb-14">
                    <div className="mx-auto max-w-[600px] text-center">
                        <p className="editorial-kicker mb-4 text-slate-300">
                            Pricing
                        </p>
                        <h1
                            id="pricing-page-title"
                            className="font-display text-slate-900"
                            style={{
                                fontSize: "clamp(2.4rem, 6vw, 4rem)",
                                lineHeight: 1.0,
                                letterSpacing: "-0.035em",
                                fontWeight: 400,
                            }}
                        >
                            Start free. Pay when it&apos;s working.
                        </h1>
                        <p className="editorial-copy-lg mx-auto mt-5 max-w-[440px] text-slate-500">
                            Your first report is on us. The full thing, not a teaser.
                            Pay only when you want more reports, saved history, exports, and a steadier role-by-role workflow.
                        </p>
                    </div>
                </section>

                {/* What you unlock */}
                <section className="px-6 pb-8 md:px-8 md:pb-12">
                    <div className="mx-auto max-w-[560px]">
                        <div
                            className="rounded-2xl bg-white p-6 md:p-8"
                            style={{
                                boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
                            }}
                        >
                            <p className="editorial-kicker mb-4 text-slate-300">
                                What you unlock with a paid plan
                            </p>
                            <ul className="space-y-3">
                                {unlockPoints.map((point) => (
                                    <li key={point} className="flex items-start gap-2.5 text-sm leading-6 text-slate-600">
                                        <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Pricing cards */}
                <section className="px-6 pb-10 md:px-8 md:pb-14">
                    <div className="mx-auto grid max-w-[1000px] gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <PricingCard
                            tier="free"
                            context="marketing"
                            allowFreeSelect
                            onSelect={() => {
                                Analytics.track("pricing_run_free_review_clicked", { source: "pricing_page" });
                                window.location.href = "/workspace";
                            }}
                        />
                        <PricingCard
                            tier="monthly"
                            context="marketing"
                            onSelect={() => handleCheckout("monthly")}
                            loading={loadingTier === "monthly"}
                        />
                        <PricingCard
                            tier="lifetime"
                            context="marketing"
                            onSelect={() => handleCheckout("lifetime")}
                            loading={loadingTier === "lifetime"}
                        />
                    </div>
                </section>

                {/* Billing clarity — warm sand section */}
                <section
                    className="px-6 py-12 md:px-8 md:py-16"
                    style={{ backgroundColor: "hsl(var(--paper-muted))" }}
                >
                    <div className="mx-auto max-w-[640px]">
                        <p className="editorial-kicker mb-5 text-slate-400">
                            Billing clarity
                        </p>
                        <h2
                            className="font-display text-slate-900"
                            style={{
                                fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                                lineHeight: 1.1,
                                letterSpacing: "-0.02em",
                                fontWeight: 400,
                            }}
                        >
                            Billing is simple
                        </h2>
                        <p className="mt-3 max-w-[420px] text-base leading-7 text-slate-500">
                            Paid access starts right away. If anything goes wrong, you can fix it yourself.
                        </p>

                        <div className="mt-8 space-y-3">
                            {billingPoints.map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-lg bg-white p-4"
                                    style={{
                                        boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)",
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <item.icon className="h-4 w-4 text-brand" />
                                        <h3 className="text-sm font-semibold text-slate-700">{item.title}</h3>
                                    </div>
                                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{item.body}</p>
                                </div>
                            ))}
                        </div>

                        <Link
                            href="/purchase/restore"
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-slate-800 active:scale-[0.97]"
                        >
                            Open restore page
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/extension"
                            className="mt-6 ml-3 inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-white"
                        >
                            See extension flow
                        </Link>
                    </div>
                </section>

                {/* Support note */}
                <section className="px-6 py-10 md:px-8 md:py-12">
                    <div className="mx-auto max-w-[600px] text-center">
                        <p className="text-sm text-slate-400">
                            Need invoices, receipts, or procurement help?{" "}
                            <Link
                                href="mailto:support@recruiterinyourpocket.com"
                                className="text-slate-600 underline underline-offset-4 hover:text-slate-900"
                            >
                                support@recruiterinyourpocket.com
                            </Link>
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
