"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Info, LockKey } from "@phosphor-icons/react";
import Footer from "@/components/landing/Footer";
import { Pile } from "@/components/materials/Pile";
import rhythm from "@/components/materials/Rhythm.module.css";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { Analytics } from "@/lib/analytics";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { FREE_REPORT_ENTITLEMENT, JOB_SEARCH_PASS_DECISION } from "@/lib/billing/pricing";
import { getCheckoutRestoreHref, normalizeCheckoutReturnTo } from "@/lib/billing/checkoutReturn";
import { cn } from "@/lib/utils";
import styles from "./PricingPage.module.css";

type PricingTier = "30d";

/**
 * Pricing (Nov 4, 2026): the reports as sheets. A report is a document, so each one is a sheet of paper: one
 * for the free report, five for the Job Search Pass. One headline, the two offers with their one button each,
 * then the terms a buyer needs before paying, one line each (the pricing pages measured that day put the
 * billing cadence under the price and buried refunds; this page puts every term beside the price). Billing
 * copy stays plain: no pen, no marker. Research and the directions tried: docs/design/2026-11-homepage-research.md.
 */
export default function PricingPageClient({ returnTo: requestedReturnTo = null, paymentCancelled = false }: {
    returnTo?: string | null;
    paymentCancelled?: boolean;
}) {
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

    return (
        <div data-visual-anchor="pricing-page" className={rhythm.page}>
            <section className={rhythm.opening} aria-labelledby="pricing-page-title">
                <h1 id="pricing-page-title" className={styles.title}>Your first report is free. Five more are $29.</h1>

                {paymentCancelled ? (
                    <div role="status" className={styles.notice}>
                        <Info weight="bold" aria-hidden="true" />
                        <p><strong>Checkout canceled.</strong> Nothing was charged.</p>
                    </div>
                ) : null}

                {passReportsLeft > 0 && !paymentCancelled ? (
                    <div role="status" data-testid="pricing-active-pass" className={styles.notice}>
                        <Info weight="bold" aria-hidden="true" />
                        <p>
                            <strong>Your pass has {passReportsLeft} {passReportsLeft === 1 ? "report" : "reports"} left{passDaysLeft > 0 ? `, good for ${passDaysLeft} more ${passDaysLeft === 1 ? "day" : "days"}` : ""}.</strong>{" "}
                            <Link href="/workspace?new=1" className="riyp-link">New report</Link>
                        </p>
                    </div>
                ) : null}

                {returnTo ? (
                    <Link href={returnTo} className={cn("riyp-link", styles.back)}>Back to my comparison</Link>
                ) : null}

                <div className={styles.offers}>
                    <Pile count={1} size="xl" outlined={0} label="One sheet of paper: your first report" className={styles.sheetFree} />
                    <Pile count={5} size="xl" label="Five sheets of paper: the Job Search Pass" className={styles.sheetPass} />

                    <div className={cn(styles.words, styles.wordsFree)}>
                        <h2>First report</h2>
                        <span className={styles.price}>$0</span>
                        <p>Your Verdict, where your resume stands, and up to three Critical Misses. {FREE_REPORT_ENTITLEMENT.promise}</p>
                    </div>
                    <div className={cn(styles.words, styles.wordsPass)}>
                        <h2>Job Search Pass</h2>
                        <span className={styles.price}>$29</span>
                        <p>{JOB_SEARCH_PASS_DECISION.terms} {JOB_SEARCH_PASS_DECISION.whenToBuy}</p>
                    </div>

                    <p className={styles.boundary}>{FREE_REPORT_ENTITLEMENT.boundary}</p>

                    {/* One action per offer. The nav is `display: contents`, so the buttons sit in their columns on
                        desktop and stack under both offers on phones without a second copy. */}
                    <nav aria-label="Pricing actions" className={styles.actions}>
                        <div className={styles.buttonFree}>
                            <Button asChild size="lg">
                                <Link
                                    href="/workspace"
                                    data-testid="pricing-hero-free-action"
                                    onClick={() => Analytics.track("pricing_run_free_review_clicked", { source: "pricing_page" })}
                                >
                                    Get your free report <ArrowRight weight="bold" aria-hidden="true" />
                                </Link>
                            </Button>
                        </div>
                        <div className={styles.buttonPass}>
                            {billingEnabled ? (
                                <Button type="button" variant="secondary" size="lg" data-testid="pricing-hero-paid-action" onClick={handleCheckout} disabled={loadingTier === "30d"}>
                                    {loadingTier === "30d" ? "Opening checkout…" : JOB_SEARCH_PASS_DECISION.cta}
                                </Button>
                            ) : (
                                <Button type="button" variant="secondary" size="lg" disabled data-testid="pricing-hero-paid-action">
                                    <LockKey aria-hidden="true" weight="bold" />
                                    Passes are paused for now
                                </Button>
                            )}
                        </div>
                    </nav>
                </div>

                {/* The terms a buyer needs before paying: when it ends, who holds the card, refunds, what stays after. */}
                <ul className={styles.terms}>
                    <li><strong>One payment.</strong> The pass ends after 90 days and never renews.</li>
                    <li><strong>Stripe handles your card.</strong> We never see or store the number.</li>
                    <li><strong>Haven&rsquo;t used a paid report yet?</strong> Full refund within 14 days: write to support from your checkout email. <Link href="/terms" className="riyp-link">Terms</Link></li>
                    <li><strong>Used all five?</strong> Your saved reports and their PDFs stay open. Another report needs a new pass.</li>
                </ul>
                {billingEnabled ? <p className={styles.taxes}>Taxes may apply at checkout.</p> : null}
            </section>

            <section className={cn(rhythm.section, rhythm.close)} aria-label="Other tools and restoring a purchase">
                <div className={styles.asides}>
                    <div>
                        <h2>Weighing other tools?</h2>
                        <p>
                            A writer, a keyword scanner, a builder, and a recruiter&rsquo;s read are different purchases.{" "}
                            <Link href="/compare" className="riyp-link">See how we compare with TopResume, Jobscan, Resume Worded, and Teal</Link>, with each one&rsquo;s own prices.
                        </p>
                    </div>
                    <div className={styles.restore}>
                        <h2>Already paid?</h2>
                        <Button asChild variant="secondary">
                            <Link href={getCheckoutRestoreHref(returnTo)}>Restore access <ArrowRight weight="bold" aria-hidden="true" /></Link>
                        </Button>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}
