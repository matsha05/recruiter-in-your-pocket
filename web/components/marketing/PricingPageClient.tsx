"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowsClockwise, Info, LockKey, Receipt, ShieldCheck } from "@phosphor-icons/react";
import { PricingCard, type PricingTier } from "@/components/shared/PricingCard";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Analytics } from "@/lib/analytics";
import { toast } from "sonner";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { FREE_REPORT_ENTITLEMENT, JOB_SEARCH_PASS_DECISION } from "@/lib/billing/pricing";

const billingPoints = [
    {
        icon: ShieldCheck,
        title: "Stripe checkout",
        body: "Stripe handles your card details. We never see or store the card number.",
    },
    {
        icon: ArrowsClockwise,
        title: "No renewal",
        body: "The Job Search Pass is one payment. It ends after 30 days and never auto-renews.",
    },
    {
        icon: Receipt,
        title: "Immediate access",
        body: "Your five-report pass begins after checkout and can be restored from the same email.",
    },
];

function PricingHeroActions({
    billingEnabled,
    checkoutLoading,
    onCheckout,
}: {
    billingEnabled: boolean;
    checkoutLoading: boolean;
    onCheckout: () => void;
}) {
    return (
        <nav aria-label="Pricing actions" className="mt-7 grid max-w-[34rem] gap-3 sm:grid-cols-2 lg:hidden">
            <Link
                href="/workspace"
                data-testid="pricing-hero-free-action"
                onClick={() => Analytics.track("pricing_run_free_review_clicked", { source: "pricing_hero" })}
                className="focus-ring group flex min-h-14 items-center justify-between gap-4 rounded-md bg-foreground px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 [&_svg]:text-citron"
            >
                Get my free report
                <ArrowRight aria-hidden="true" className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" weight="bold" />
            </Link>

            {billingEnabled ? (
                <Button
                    type="button"
                    data-testid="pricing-hero-paid-action"
                    onClick={onCheckout}
                    disabled={checkoutLoading}
                    variant="outline"
                    className="focus-ring group flex min-h-14 items-center justify-between gap-4 rounded-md border border-foreground bg-background/75 px-4 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:text-brand"
                >
                    {checkoutLoading ? "Opening checkout..." : "Get 5 reports · $29"}
                    <ArrowRight aria-hidden="true" className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" weight="bold" />
                </Button>
            ) : (
                <Button
                    type="button"
                    disabled
                    data-testid="pricing-hero-paid-action"
                    variant="outline"
                    className="flex min-h-14 cursor-not-allowed items-center justify-between gap-4 rounded-md border border-border bg-muted/35 px-4 py-3 text-left text-muted-foreground"
                >
                    <span>
                        <span className="block text-sm font-semibold">5 careful reports · $29</span>
                        <span className="mt-0.5 block text-xs leading-4">Checkout opens after beta verification</span>
                    </span>
                    <LockKey aria-hidden="true" className="size-4 shrink-0" weight="bold" />
                </Button>
            )}
        </nav>
    );
}

export default function PricingPageClient() {
    const [loadingTier, setLoadingTier] = useState<PricingTier | null>(null);
    const [paymentCancelled, setPaymentCancelled] = useState(false);
    const billingEnabled = isLaunchFlagEnabled("billingUnlock");

    useEffect(() => {
        setPaymentCancelled(new URLSearchParams(window.location.search).get("payment") === "cancelled");
    }, []);

    async function handleCheckout() {
        const tier: PricingTier = "30d";
        try {
            setLoadingTier(tier);
            Analytics.checkoutStarted(tier, 29);
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

    if (!billingEnabled) {
        return (
            <>
                <div data-visual-anchor="pricing-page" className="pricing-beta-page !pt-28 bg-mineral text-foreground selection:bg-brand/15 lg:!pt-[9.5rem]">
                    <section className="px-6 pb-14 md:px-8">
                        <div className="pricing-rail mx-auto">
                            <div className="pricing-hero-grid grid gap-10 border-b-2 border-cyan-bright pb-10 lg:items-end">
                                <div>
                                    <p className="mb-5 text-xs font-bold uppercase riyp-track-010 text-brand">Beta access</p>
                                    <h1 className="max-w-3xl text-balance font-display text-[clamp(2.55rem,5.8vw,5.1rem)] font-semibold leading-[1.08] tracking-[-0.05em]">
                                        One complete report is <span className="riyp-marker riyp-marker-block">included.</span><br className="sm:hidden" /> Five more are $29.
                                    </h1>
                                    <PricingHeroActions
                                        billingEnabled={false}
                                        checkoutLoading={false}
                                        onCheckout={handleCheckout}
                                    />
                                </div>
                                <p className="max-w-lg text-pretty text-lg leading-8 text-muted-foreground lg:mb-2">
                                    Checkout is closed while we finish the beta safety checks. When it opens, the Job Search Pass will give you five careful recruiter-style reports for the revisions and applications that matter most. One payment, 30 days, no renewal.
                                </p>
                            </div>

                            <div className="mt-10 grid overflow-hidden border-y border-border bg-background/60 md:grid-cols-2">
                                <div className="border-b border-border p-7 md:border-b-0 md:border-r md:px-8 md:py-8">
                                    <p className="text-xs font-bold uppercase riyp-track-010 text-brand">First report</p>
                                    <p className="pricing-price mt-5 font-display riyp-weight-540 tracking-tight">$0</p>
                                    <p className="mt-2 text-base text-muted-foreground">One complete in-browser report</p>
                                    <p className="mt-3 max-w-2xl text-lg leading-7 text-muted-foreground">
                                        The recruiter takeaway, evidence, questions to answer, and rewrites are all included. {FREE_REPORT_ENTITLEMENT.promise} {FREE_REPORT_ENTITLEMENT.boundary}
                                    </p>
                                    <Link href="/workspace" className="pricing-primary-cta mt-10 inline-flex items-center justify-center gap-2 rounded-md bg-foreground py-3 font-semibold text-background transition-colors duration-150 hover:bg-foreground/90 active:scale-[0.98] [&_svg]:text-citron">
                                        Run your free report
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                                <div className="p-7 md:px-8 md:py-8">
                                    <p className="text-xs font-bold uppercase riyp-track-010 text-brand">Job Search Pass</p>
                                    <p className="pricing-price mt-5 font-display riyp-weight-540 tracking-tight">$29</p>
                                    <p className="mt-2 text-base text-muted-foreground">Five careful reports for 30 days</p>
                                    <p className="mt-3 max-w-2xl text-lg leading-7 text-muted-foreground">
                                        For the resume revisions and applications that matter most. No subscription and no automatic renewal.
                                    </p>
                                    <p role="status" className="pricing-disabled-cta mt-10 inline-flex items-center border border-border bg-muted/35 py-3 font-semibold text-muted-foreground">
                                        Checkout opens after beta verification
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <div data-visual-anchor="pricing-page" className="bg-paper pt-28 text-foreground selection:bg-brand/15 md:pt-36">
                <section className="px-6 pb-16 md:px-8 md:pb-24">
                    <div className="mx-auto max-w-[1120px]">
                        <div className="grid gap-10 border-b-2 border-cyan-bright pb-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.7fr)] lg:items-end">
                            <div>
                                <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-brand">Pricing</p>
                                <h1
                                    id="pricing-page-title"
                                    className="max-w-[760px] text-balance font-display text-[clamp(2.55rem,5.8vw,5.1rem)] font-semibold leading-[0.96] tracking-[-0.05em]"
                                >
                                    One complete report is <span className="riyp-marker riyp-marker-block">included.</span><br className="sm:hidden" /> Five more are $29.
                                </h1>
                                <PricingHeroActions
                                    billingEnabled
                                    checkoutLoading={loadingTier === "30d"}
                                    onCheckout={handleCheckout}
                                />
                            </div>
                            <p className="max-w-[34rem] text-pretty text-lg leading-8 text-muted-foreground">
                                No teaser score and no subscription waiting in the weeds. The Job Search Pass gives you five careful recruiter-style reports for important revisions and applications.
                            </p>
                        </div>

                        {paymentCancelled ? (
                            <div role="status" className="mt-8 flex items-start gap-3 border-y border-line bg-surface-sky/45 px-4 py-3 text-base text-foreground">
                                <Info className="mt-0.5 size-5 shrink-0 text-brand" weight="bold" />
                                <p><span className="font-semibold">Checkout canceled.</span> Nothing was charged.</p>
                            </div>
                        ) : null}

                        <div className="mt-10 grid gap-0 md:grid-cols-2">
                            <PricingCard
                                tier="free"
                                context="marketing"
                                allowFreeSelect
                                onSelect={() => {
                                    Analytics.track("pricing_run_free_review_clicked", { source: "pricing_page" });
                                    window.location.href = "/workspace";
                                }}
                                className="border-b-0 md:border-b md:border-r-0"
                            />
                            <PricingCard
                                tier="30d"
                                context="marketing"
                                onSelect={handleCheckout}
                                loading={loadingTier === "30d"}
                            />
                        </div>

                        <p className="mt-5 text-base leading-6 text-muted-foreground">
                            {JOB_SEARCH_PASS_DECISION.whenToBuy} {JOB_SEARCH_PASS_DECISION.terms} Taxes may apply at checkout.
                        </p>
                    </div>
                </section>

                <section className="border-y border-line bg-surface-sky/45 px-6 py-14 md:px-8 md:py-20">
                    <div className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[0.65fr_1.35fr]">
                        <div>
                            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-brand">Billing clarity</p>
                            <h2 className="max-w-sm font-display text-[clamp(2.2rem,4vw,3.5rem)] riyp-weight-560 leading-[1.02] tracking-[-0.035em] riyp-stretch-94">
                                The terms, in plain language.
                            </h2>
                            <p className="mt-4 max-w-sm text-lg leading-7 text-muted-foreground">
                                The price, expiration date, and included reports stay visible before checkout.
                            </p>
                        </div>

                        <div className="divide-y divide-line border-y border-line">
                            {billingPoints.map((item) => (
                                <div key={item.title} className="grid gap-3 py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                                    <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                                        <item.icon className="size-4 text-brand" weight="bold" />
                                        {item.title}
                                    </div>
                                    <p className="text-lg leading-7 text-muted-foreground">{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="px-6 py-12 md:px-8 md:py-16">
                    <div className="mx-auto flex max-w-[1120px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-display text-3xl riyp-weight-560 tracking-[-0.025em] riyp-stretch-96">Already paid?</h2>
                            <p className="mt-2 text-lg text-muted-foreground">Restore an existing purchase or open billing settings.</p>
                        </div>
                        <Link
                            href="/purchase/restore"
                            className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-md border border-line px-5 py-3 text-base font-semibold text-foreground transition-[background-color,border-color,transform] duration-200 hover:border-brand/45 hover:bg-brand/5 active:scale-[0.99]"
                        >
                            Restore access
                            <ArrowRight className="size-4" weight="bold" />
                        </Link>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
