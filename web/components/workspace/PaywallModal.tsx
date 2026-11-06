"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnlockValueList } from "@/components/shared/UnlockValueList";
import { ArrowClockwise } from "@phosphor-icons/react";
import { Analytics } from "@/lib/analytics";
import { getUnlockContext, type UnlockContext, type UnlockSection } from "@/lib/unlock/unlockContext";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { saveCheckoutWorkspaceState } from "@/lib/unlock/unlockContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JOB_SEARCH_PASS_DECISION } from "@/lib/billing/pricing";

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    creditsRemaining?: number;
    hasCurrentReport?: boolean;
    /** Opens sign-in for a visitor whose browser or network has used the anonymous free report. */
    onSignInForFreeReport?: () => void;
    workspaceState?: {
        report: unknown;
        resumeText: string;
        jobDescription: string;
    } | null;
}

const COMPLETE_REPORT_SUBTITLE = `${JOB_SEARCH_PASS_DECISION.freeBoundary} ${JOB_SEARCH_PASS_DECISION.whenToBuy}`;
// The price row under the list carries the term and the renewal fact.
const PASS_BULLETS = [
    "5 more complete reports",
    "Re-check a revision and see which lines came off the list",
    "Read your resume against each job posting",
];

// The title names what the visitor was doing when the pass came up; the list and price are the same every time.
const DEFAULT_UNLOCK_TITLE = "Want another read?";
const CONTEXT_UNLOCK_TITLE: Record<UnlockSection, string> = {
    evidence_ledger: "Check your revised resume",
    bullet_upgrades: "See what your edits changed",
    missing_wins: "Check the details you add",
    job_alignment: "Read it against another role",
    export_pdf: "PDFs come with a signed-in report",
};

export default function PaywallModal({
    isOpen,
    onClose,
    hasCurrentReport = false,
    onSignInForFreeReport,
    workspaceState = null,
}: PaywallModalProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [restoreLoading, setRestoreLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [unlockContext, setUnlockContext] = useState<UnlockContext | null>(null);

    const isLoggedIn = !!user;
    const billingEnabled = isLaunchFlagEnabled("billingUnlock");
    // The anonymous allowance is shared by a browser and its network, so a visitor
    // can arrive with it already used. Every account has its own free report, so a
    // signed-out visitor who hasn't seen a report yet is offered that first.
    const offerFreeSignIn = !isLoggedIn && !hasCurrentReport && Boolean(onSignInForFreeReport);

    const handleFreeSignIn = () => {
        Analytics.track("paywall_free_sign_in_clicked", { billing_enabled: billingEnabled });
        onSignInForFreeReport?.();
    };

    const freeSignInOffer = offerFreeSignIn ? (
        <div className="mb-5" data-testid="paywall-free-sign-in">
            <Button className="w-full" onClick={handleFreeSignIn}>
                Sign in for your free report
            </Button>
        </div>
    ) : null;

    useEffect(() => {
        if (!isOpen) return;
        const context = getUnlockContext();
        setUnlockContext(context);
        if (context?.section) {
            Analytics.paywallViewed(`section_${context.section}`);
        }
    }, [isOpen]);

    const unlockTitle = useMemo(
        () => (unlockContext?.section && CONTEXT_UNLOCK_TITLE[unlockContext.section]) || DEFAULT_UNLOCK_TITLE,
        [unlockContext],
    );

    const handleCheckout = async () => {
        setLoading(true);
        setError(null);

        const checkoutEmail = isLoggedIn ? user.email : email.trim();

        if (!checkoutEmail) {
            setError("Enter the email address you want to use for billing.");
            setLoading(false);
            return;
        }

        try {
            const unlockSection = unlockContext?.section || null;
            Analytics.checkoutStarted("30d", 29);
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tier: "30d",
                    email: checkoutEmail,
                    source: "paywall",
                    idempotencyKey: crypto.randomUUID(),
                    unlockSection
                })
            });

            const result = await res.json();

            if (result.ok && result.url) {
                if (workspaceState?.report) {
                    saveCheckoutWorkspaceState(workspaceState);
                }
                window.location.href = result.url;
            } else {
                Analytics.track("checkout_start_failed", { source: "paywall", tier: "30d" });
                setError(result.message || "Checkout could not start. Try again or restore an existing purchase.");
            }
        } catch {
            Analytics.track("checkout_start_failed", { source: "paywall", tier: "30d" });
            setError("Checkout could not start. Try again or restore an existing purchase.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setEmail("");
            setError(null);
            onClose();
        }
    };

    const handleRestore = async () => {
        Analytics.track("billing_restore_requested", { source: "paywall" });
        setRestoreLoading(true);
        router.push("/purchase/restore");
    };

    if (!billingEnabled) {
        const description = offerFreeSignIn
            ? "The free report on this device or network has been used. Each account gets its own, so sign in to get yours."
            : hasCurrentReport
                ? "Your existing report stays available."
                : null;
        return (
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-md p-7">
                    <DialogHeader className="text-center">
                        <DialogTitle className="font-display text-heading">
                            {offerFreeSignIn ? "Your free report needs an account" : "Passes are paused for now"}
                        </DialogTitle>
                        {description ? (
                            <DialogDescription className="mx-auto max-w-sm text-sm">{description}</DialogDescription>
                        ) : null}
                    </DialogHeader>
                    {offerFreeSignIn ? <div className="mt-5">{freeSignInOffer}</div> : null}
                    <Button className={offerFreeSignIn ? "w-full" : "mt-5 w-full"} variant={offerFreeSignIn ? "secondary" : "primary"} onClick={onClose}>
                        {hasCurrentReport ? "Back to my report" : "Back to my resume"}
                    </Button>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[440px] p-6 sm:p-7">
                <DialogHeader className="text-center mb-4">
                    <DialogTitle className="font-display text-xl font-bold">
                        {offerFreeSignIn ? "Your free report needs an account" : unlockTitle}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        {offerFreeSignIn
                            ? "The free report on this device or network has been used. Each account gets its own, so sign in to get yours."
                            : hasCurrentReport ? COMPLETE_REPORT_SUBTITLE : JOB_SEARCH_PASS_DECISION.whenToBuy}
                    </DialogDescription>
                </DialogHeader>

                {freeSignInOffer}

                <div className="mb-5 border-y border-line bg-surface-sky/45 px-4 py-4">
                    <UnlockValueList items={PASS_BULLETS} dense />
                </div>

                <div className="mb-5 grid grid-cols-[0.8fr_1.2fr] border-y border-line py-4">
                    <div>
                        <p className="font-display text-title text-foreground">$29</p>
                        <p className="mt-1 text-sm text-muted-foreground">one-time</p>
                    </div>
                    <div className="border-l border-line pl-4 text-sm text-muted-foreground">
                        Good for 90 days. No automatic renewal.
                    </div>
                </div>

                <form
                    className="mb-1"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void handleCheckout();
                    }}
                >
                    {isLoggedIn ? (
                        <>
                            <p className="text-sm text-muted-foreground mb-3 text-center">
                                Continue with <strong className="text-foreground">{user.email}</strong>
                            </p>
                            <Button
                                type="submit"
                                className="w-full"
                                variant={offerFreeSignIn ? "secondary" : "primary"}
                                isLoading={loading}
                                loadingLabel="Opening checkout…"
                            >
                                Continue to checkout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Label htmlFor="checkout-email" className="text-muted-foreground text-xs mb-2 block">
                                Your email
                            </Label>
                            <Input
                                id="checkout-email"
                                type="email"
                                autoComplete="email"
                                inputMode="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                aria-invalid={Boolean(error)}
                                aria-describedby={error ? "checkout-error checkout-terms" : "checkout-terms"}
                                placeholder="you@example.com"
                                className="mb-3"
                            />
                            <Button
                                type="submit"
                                className="w-full"
                                variant={offerFreeSignIn ? "secondary" : "primary"}
                                disabled={!email.trim()}
                                isLoading={loading}
                                loadingLabel="Opening checkout…"
                            >
                                Continue to checkout
                            </Button>
                        </>
                    )}
                </form>

                <Button
                    variant="quiet"
                    className="w-full text-muted-foreground"
                    onClick={handleRestore}
                    isLoading={restoreLoading}
                    loadingLabel="Checking access…"
                >
                    <ArrowClockwise className="mr-2 size-4" weight="bold" />
                    Restore access
                </Button>

                {error && (
                    <div id="checkout-error" role="alert" aria-live="polite" className="mb-3 border-l-2 border-destructive bg-destructive/10 p-2 text-center text-sm text-destructive">
                        {error}
                    </div>
                )}

                <p id="checkout-terms" className="text-center text-xs text-muted-foreground">
                    Payment by Stripe. Unused passes are refundable within 14 days (see the <Link href="/terms" className="riyp-link-quiet">Terms</Link>). By continuing, you agree to the <Link href="/privacy" className="riyp-link-quiet">Privacy Policy</Link>.
                </p>
            </DialogContent>
        </Dialog>
    );
}
