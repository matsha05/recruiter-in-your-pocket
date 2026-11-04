"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowsClockwise, ArrowUUpLeft, Info, LockKey, ShieldCheck, Stack } from "@phosphor-icons/react";
import { PricingCard, type PricingTier } from "@/components/shared/PricingCard";
import Footer from "@/components/landing/Footer";
import { PassExamples } from "@/components/marketing/PassExamples";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { Analytics } from "@/lib/analytics";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { FREE_REPORT_ENTITLEMENT, JOB_SEARCH_PASS_DECISION } from "@/lib/billing/pricing";
import { getCheckoutRestoreHref, normalizeCheckoutReturnTo } from "@/lib/billing/checkoutReturn";

// The terms a buyer needs before paying: who holds the card, when it ends, what stays after, and refunds.
const billingPoints: { icon: typeof ShieldCheck; title: string; body: React.ReactNode }[] = [
    {
        icon: ShieldCheck,
        title: "Stripe checkout",
        body: "Stripe handles your card. We never see or store the number.",
    },
    {
        icon: ArrowsClockwise,
        title: "No renewal",
        body: "One payment. The pass ends after 90 days and never auto-renews.",
    },
    {
        icon: Stack,
        title: "Used all five",
        body: "Your saved reports and their PDFs stay open. Another report needs a new pass.",
    },
    {
        icon: ArrowUUpLeft,
        title: "Refunds",
        body: <>Haven&rsquo;t used a paid report yet? Full refund within 14 days: write to support from your checkout email. <Link href="/terms" className="riyp-link">Terms</Link></>,
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
        /* One dominant action (Impeccable 5): the free report is filled; the pass is a quiet route to its card below. */
        <nav aria-label="Pricing actions" className="mt-7 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center lg:hidden">
            <Button asChild className="w-full sm:w-auto">
                <Link
                    href="/workspace"
                    data-testid="pricing-hero-free-action"
                    onClick={() => Analytics.track("pricing_run_free_review_clicked", { source: "pricing_hero" })}
                >
                    Get your free report
                    <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
                </Link>
            </Button>

            {billingEnabled ? (
                <Button type="button" variant="quiet" data-testid="pricing-hero-paid-action" onClick={onCheckout} disabled={checkoutLoading}>
                    {checkoutLoading ? "Opening checkout…" : JOB_SEARCH_PASS_DECISION.cta}
                </Button>
            ) : (
                <Button type="button" variant="quiet" disabled data-testid="pricing-hero-paid-action">
                    <LockKey aria-hidden="true" className="size-4 shrink-0" weight="bold" />
                    5 reports · $29. Passes are paused for now.
                </Button>
            )}
        </nav>
    );
}

export default function PricingPageClient({ returnTo: requestedReturnTo = null, paymentCancelled = false }: {
    returnTo?: string | null;
    paymentCancelled?: boolean;
}) {
    const router = useRouter();
    const { user } = useAuth();
    const passReportsLeft = user?.paidUsesLeft ?? 0;
    const passDaysLeft = user?.daysLeft ?? 0;
    const [loadingTier, setLoadingTier] = useState<PricingTier | null>(null);
    const billingEnabled = isLaunchFlagEnabled("billingUnlock");
    const returnTo = normalizeCheckoutReturnTo(requestedReturnTo);

    async function handleCheckout() {
        const tier: PricingTier = "30d";
        let checkoutError = "Could not open checkout. Try again. If this continues, contact support.";
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
                    ...(returnTo ? { returnTo } : {}),
                }),
            });
            const data = await res.json();
            if (!data.ok || !data.url) {
                checkoutError = typeof data.message === "string" && data.message.trim() ? data.message : checkoutError;
                throw new Error(checkoutError);
            }
            window.location.href = data.url;
        } catch {
            Analytics.track("checkout_start_failed", { source: "pricing", tier });
            // Loaded on failure only, so sonner stays out of the pricing page's first load.
            void import("sonner").then(({ toast }) => toast.error(checkoutError));
        } finally {
            setLoadingTier(null);
        }
    }

    const heading = (
        <h1 id="pricing-page-title" className="max-w-form text-balance font-display text-headline">
            Your first report is free.<br className="sm:hidden" /> Five more are $29.
        </h1>
    );

    if (!billingEnabled) {
        return (
            <>
                <div data-visual-anchor="pricing-page" className="bg-background pt-28 text-foreground selection:bg-brand/15 md:pt-36">
                    <section className="px-6 pb-14 md:px-8">
                        <div className="mx-auto max-w-marketing">
                            <div className="border-b border-line pb-10">
                                {heading}
                                <PricingHeroActions
                                    billingEnabled={false}
                                    checkoutLoading={false}
                                    onCheckout={handleCheckout}
                                />
                            </div>

                            {returnTo ? (
                                <Link href={returnTo} className="mt-6 inline-flex text-sm font-semibold riyp-link">Back to my comparison</Link>
                            ) : null}

                            <div className="mt-10 grid gap-5 md:grid-cols-2">
                                <div className="rounded-2xl border border-border bg-card p-6 md:rounded-3xl md:p-8">
                                    <p className="text-base font-semibold text-foreground">First report</p>
                                    <p className="mt-5 font-display text-headline">$0</p>
                                    <p className="mt-3 max-w-2xl text-lg text-muted-foreground">Your Verdict, where your resume stands, and up to three Critical Misses. {FREE_REPORT_ENTITLEMENT.promise}</p>
                                    <p className="mt-3 text-sm text-muted-foreground">{FREE_REPORT_ENTITLEMENT.boundary}</p>
                                    <Button asChild className="mt-10 w-full">
                                        <Link href="/workspace">
                                            Get your free report
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                </div>
                                <div className="rounded-2xl border border-border bg-card p-6 md:rounded-3xl md:p-8">
                                    <p className="text-base font-semibold text-foreground">Job Search Pass</p>
                                    <p className="mt-5 font-display text-headline">$29</p>
                                    <p className="mt-2 text-base text-muted-foreground">5 more reports, good for 90 days</p>
                                    <p role="status" className="mt-10 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-border bg-muted/35 px-5 py-3 text-center text-sm font-medium text-muted-foreground">
                                        Passes are paused for now
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
            <div data-visual-anchor="pricing-page" className="bg-background pt-28 text-foreground selection:bg-brand/15 md:pt-36">
                <section className="px-6 pb-16 md:px-8 md:pb-24">
                    <div className="mx-auto max-w-marketing">
                        <div className="border-b border-line pb-10">
                            {heading}
                            <PricingHeroActions
                                billingEnabled
                                checkoutLoading={loadingTier === "30d"}
                                onCheckout={handleCheckout}
                            />
                        </div>

                        {paymentCancelled ? (
                            <div role="status" className="mt-8 flex items-start gap-3 rounded-xl border border-line bg-surface-sky px-4 py-3 text-base text-foreground">
                                <Info className="mt-0.5 size-5 shrink-0 text-brand" weight="bold" />
                                <p><span className="font-semibold">Checkout canceled.</span> Nothing was charged.</p>
                            </div>
                        ) : null}

                        {passReportsLeft > 0 && !paymentCancelled ? (
                            <div role="status" data-testid="pricing-active-pass" className="mt-8 flex items-start gap-3 rounded-xl border border-line bg-surface-sky px-4 py-3 text-base text-foreground">
                                <Info className="mt-0.5 size-5 shrink-0 text-brand" weight="bold" />
                                <p>
                                    <span className="font-semibold">Your pass has {passReportsLeft} {passReportsLeft === 1 ? "report" : "reports"} left{passDaysLeft > 0 ? `, good for ${passDaysLeft} more ${passDaysLeft === 1 ? "day" : "days"}` : ""}.</span>{" "}
                                    <Link href="/workspace?new=1" className="font-semibold riyp-link">New report</Link>
                                </p>
                            </div>
                        ) : null}

                        {returnTo ? (
                            <Link href={returnTo} className="mt-6 inline-flex text-sm font-semibold riyp-link">Back to my comparison</Link>
                        ) : null}

                        <div className="mt-10 grid gap-5 md:grid-cols-2">
                            <PricingCard
                                tier="free"
                                context="marketing"
                                allowFreeSelect
                                onSelect={() => {
                                    Analytics.track("pricing_run_free_review_clicked", { source: "pricing_page" });
                                    router.push("/workspace");
                                }}
                            />
                            <PricingCard
                                tier="30d"
                                context="marketing"
                                onSelect={handleCheckout}
                                loading={loadingTier === "30d"}
                            />
                        </div>

                        <p className="mt-5 text-base text-muted-foreground">
                            Taxes may apply at checkout.
                        </p>
                    </div>
                </section>

                <PassExamples />

                <section className="border-y border-line bg-muted/45 px-6 py-14 md:px-8 md:py-20">
                    <div className="mx-auto grid max-w-marketing gap-10 lg:grid-cols-[0.65fr_1.35fr]">
                        <h2 className="max-w-sm font-display text-headline">
                            What happens after checkout.
                        </h2>

                        <div className="divide-y divide-line border-y border-line">
                            {billingPoints.map((item) => (
                                <div key={item.title} className="grid gap-3 py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                                    <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                                        <item.icon className="size-4 text-brand" weight="bold" />
                                        {item.title}
                                    </div>
                                    <p className="text-lg text-muted-foreground">{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="px-6 pt-12 md:px-8 md:pt-16" aria-labelledby="pricing-compare-title">
                    <div className="mx-auto max-w-marketing border-b border-line pb-10 md:pb-14">
                        <h2 id="pricing-compare-title" className="font-display text-heading">Weighing other tools?</h2>
                        <p className="mt-2 max-w-reading text-lg text-muted-foreground">
                            A writer, a keyword scanner, a builder, and a recruiter&rsquo;s read are different purchases.{" "}
                            <Link href="/compare" className="font-semibold riyp-link">See how we compare with TopResume, Jobscan, Resume Worded, and Teal</Link>, with each one&rsquo;s own prices.
                        </p>
                    </div>
                </section>

                <section className="px-6 py-12 md:px-8 md:py-16">
                    <div className="mx-auto flex max-w-marketing flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="font-display text-heading">Already paid?</h2>
                        <Button asChild variant="secondary" className="self-start">
                            <Link href={getCheckoutRestoreHref(returnTo)}>
                                Restore access
                                <ArrowRight className="size-4" weight="bold" />
                            </Link>
                        </Button>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
