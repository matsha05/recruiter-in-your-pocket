"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Receipt, RotateCcw, ShieldCheck } from "lucide-react";
import { PricingCard, type PricingTier } from "@/components/shared/PricingCard";
import Footer from "@/components/landing/Footer";
import { Analytics } from "@/lib/analytics";
import { toast } from "sonner";

const unlockPoints = [
    "A fresh recruiter report for each serious application",
    "Version history tied to your account",
    "Exports for reports you want to keep",
    "Specific job-fit reports from pasted roles",
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
        body: "Restore access, manage renewals, or cancel from the billing page.",
    },
    {
        icon: Receipt,
        title: "Access starts immediately",
        body: "As soon as you pay, paid access turns on for repeated runs, role-fit reports, and your report workspace.",
    },
];

const planGuidance = [
    {
        label: "Use free when",
        body: "You want one honest first pass before trusting the product with your job search.",
    },
    {
        label: "Use monthly when",
        body: "You are actively applying and want reports across several roles without rebuilding context every time.",
    },
    {
        label: "Use lifetime when",
        body: "You expect to keep tuning your resume for future searches, promotions, and role pivots.",
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
                <section className="px-6 pb-8 md:px-8 md:pb-10">
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
                            Your first report is a complete in-browser read, not a teaser.
                            Pay only if you want repeated role-specific reports, version history, exports, and a steadier application workflow.
                        </p>
                    </div>
                </section>

                {/* Pricing cards */}
                <section className="px-6 pb-10 md:px-8 md:pb-14">
                    <div className="mx-auto max-w-[1060px]">
                        <div className="mb-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                            <div>
                                <p className="editorial-kicker mb-3 text-slate-300">
                                    Choose by workflow
                                </p>
                                <h2 className="max-w-[520px] font-display text-[clamp(1.7rem,3vw,2.5rem)] font-normal leading-[1.02] tracking-[-0.03em] text-slate-900">
                                    One honest free read, then a paid workbench if it earns the seat.
                                </h2>
                            </div>
                            <p className="max-w-[420px] text-sm leading-6 text-slate-500 lg:justify-self-end">
                                The free report is intentionally useful on its own. Paid access is for momentum:
                                saving evidence, exporting reports you keep, and comparing the same resume against multiple roles.
                            </p>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr] lg:items-stretch">
                            <PricingCard
                                tier="free"
                                context="marketing"
                                allowFreeSelect
                                className="lg:min-h-[100%]"
                                onSelect={() => {
                                    Analytics.track("pricing_run_free_review_clicked", { source: "pricing_page" });
                                    window.location.href = "/workspace";
                                }}
                            />
                            <div className="rounded-[1.75rem] bg-slate-950 p-2 shadow-[0_18px_60px_rgba(15,23,42,0.14)] sm:p-3">
                                <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
                                    <PricingCard
                                        tier="monthly"
                                        context="marketing"
                                        className="bg-white/95"
                                        onSelect={() => handleCheckout("monthly")}
                                        loading={loadingTier === "monthly"}
                                    />
                                    <PricingCard
                                        tier="lifetime"
                                        context="marketing"
                                        className="bg-white"
                                        onSelect={() => handleCheckout("lifetime")}
                                        loading={loadingTier === "lifetime"}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            {planGuidance.map((item) => (
                                <div key={item.label} className="rounded-2xl border border-slate-200/70 bg-white/55 p-4">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                        {item.label}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {item.body}
                                    </p>
                                </div>
                            ))}
                        </div>
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
                                What paid access adds
                            </p>
                            <ul className="gap-y-3">
                                {unlockPoints.map((point) => (
                                    <li key={point} className="flex items-start gap-2.5 text-sm leading-6 text-slate-600">
                                        <span className="mt-2 inline-block size-1.5 shrink-0 rounded-full bg-brand" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Billing clarity  -  warm sand section */}
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
                            Paid access starts right away. If checkout and access ever get out of sync, Restore Access checks Stripe and reconnects your purchase.
                        </p>

                        <div className="mt-8 gap-y-3">
                            {billingPoints.map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-lg bg-white p-4"
                                    style={{
                                        boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)",
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <item.icon className="size-4 text-brand" />
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
                            <ArrowRight className="size-4" />
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
