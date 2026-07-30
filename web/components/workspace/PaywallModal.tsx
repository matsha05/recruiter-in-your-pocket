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

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    creditsRemaining?: number;
    hasCurrentReport?: boolean;
    workspaceState?: {
        report: unknown;
        resumeText: string;
        jobDescription: string;
    } | null;
}

const DEFAULT_UNLOCK_COPY = {
    label: "Job Search Pass",
    title: "Run another report",
    subtitle: "Your free report stays available. The Job Search Pass adds five careful recruiter-style reports for the revisions and applications that matter most.",
    bullets: [
        "5 additional full reports",
        "Reviews tailored to a job posting",
        "Side-by-side revision comparisons",
        "Saved history and PDF exports"
    ]
};

const CONTEXT_UNLOCK_COPY: Record<UnlockSection, typeof DEFAULT_UNLOCK_COPY> = {
    evidence_ledger: {
        label: "Evidence Ledger",
        title: "See the rest of the evidence",
        subtitle: "Your free report stays available. The Job Search Pass adds five more reports for other roles or revisions.",
        bullets: [
            "The resume line behind each recommendation",
            "Confidence and effort labels",
            "Suggested rewrites tied to the resume",
            "Saved report history"
        ]
    },
    bullet_upgrades: {
        label: "Suggested rewrites",
        title: "See all suggested rewrites",
        subtitle: "Your free report stays available. The Job Search Pass adds more reports for the revisions you want to compare.",
        bullets: [
            "More rewrites across resume versions",
            "The original beside every suggestion",
            "Why each change may help",
            "Reports for different roles"
        ]
    },
    missing_wins: {
        label: "Details to add",
        title: "See all questions to answer",
        subtitle: "The Job Search Pass gives you five more reports to answer the open questions, revise, and compare the new read.",
        bullets: [
            "All questions raised by the resume",
            "Why each detail matters",
            "A clear place to start",
            "Saved report versions"
        ]
    },
    job_alignment: {
        label: "Fit for the role",
        title: "See the full role comparison",
        subtitle: "Compare the resume with specific job postings and keep each report with the application it supports.",
        bullets: [
            "Relevant experience and open gaps",
            "Job match score and missing details",
            "A role-specific positioning suggestion",
            "Saved report history"
        ]
    },
    export_pdf: {
        label: "Export",
        title: "Export your report",
        subtitle: "Download and keep reports after the free in-browser read.",
        bullets: [
            "PDF export for saved reports",
            "Export without re-running",
            "Restore access if anything looks locked",
            "More reports when you need them"
        ]
    }
};

export default function PaywallModal({
    isOpen,
    onClose,
    workspaceState = null,
}: PaywallModalProps) {
    const { user } = useAuth();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [restoreLoading, setRestoreLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [unlockContext, setUnlockContext] = useState<UnlockContext | null>(null);

    const isLoggedIn = !!user;
    const billingEnabled = isLaunchFlagEnabled("billingUnlock");

    useEffect(() => {
        if (!isOpen) return;
        const context = getUnlockContext();
        setUnlockContext(context);
        if (context?.section) {
            Analytics.paywallViewed(`section_${context.section}`);
        }
    }, [isOpen]);

    const unlockCopy = useMemo(() => {
        if (unlockContext?.section) {
            return CONTEXT_UNLOCK_COPY[unlockContext.section] || DEFAULT_UNLOCK_COPY;
        }
        return DEFAULT_UNLOCK_COPY;
    }, [unlockContext]);

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
        } catch (err: any) {
            Analytics.track("checkout_start_failed", { source: "paywall", tier: "30d" });
            setError(err.message || "Checkout could not start. Try again or restore an existing purchase.");
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
        window.location.href = "/purchase/restore";
    };

    if (!billingEnabled) {
        return (
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-md p-7">
                    <DialogHeader className="text-center">
                        <p className="mx-auto mb-2 text-xs font-bold uppercase riyp-track-010 text-brand">Private preview</p>
                        <DialogTitle className="font-display text-2xl font-medium">
                            You&apos;ve reached the preview limit
                        </DialogTitle>
                        <DialogDescription className="mx-auto max-w-sm text-sm leading-6">
                            Paid access is not open yet. Your existing report stays available, and we will make the next step clear before checkout ever enters the picture.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-5 border-y border-border/70 py-4 text-sm leading-6 text-muted-foreground">
                        We&apos;re deliberately keeping this preview small while the report experience is still being tuned.
                    </div>
                    <Button className="mt-5 w-full" onClick={onClose}>Back to my report</Button>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[440px] p-6 sm:p-7">
                <DialogHeader className="text-center mb-4">
                    <DialogTitle className="font-display text-xl font-medium">
                        {unlockCopy.title}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        {unlockCopy.subtitle}
                    </DialogDescription>
                    <p className="text-xs text-muted-foreground">
                        You&apos;ve used your free report.
                    </p>
                </DialogHeader>

                <div className="mb-5 gap-y-3 border-y border-line bg-surface-sky/45 px-4 py-4">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                        <span>Included with the pass</span>
                        <span className="text-foreground/80">{unlockCopy.label}</span>
                    </div>
                    <UnlockValueList items={unlockCopy.bullets} dense />
                    {unlockContext?.section && (
                        <p className="text-xs text-muted-foreground">
                            We saved your place in <span className="text-foreground font-medium">{unlockCopy.label}</span>.
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Your free report stays available. Buy the pass only when you want to revise, compare, or review more roles.
                    </p>
                </div>

                <div className="mb-5 grid grid-cols-[0.8fr_1.2fr] border-y border-line py-4">
                    <div>
                        <p className="font-display text-4xl riyp-weight-520 tracking-[-0.03em] text-foreground">$29</p>
                        <p className="mt-1 text-xs font-semibold uppercase riyp-track-010 text-brand">One payment</p>
                    </div>
                    <div className="border-l border-line pl-4 text-sm leading-6 text-muted-foreground">
                        Five careful reports over 30 days. No automatic renewal.
                    </div>
                </div>

                <form
                    className="mb-3 border border-line bg-background p-4"
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
                                isLoading={loading}
                            >
                                {loading ? "Opening checkout…" : "Continue to Stripe · $29 once"}
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
                                disabled={!email.trim()}
                                isLoading={loading}
                            >
                                {loading ? "Opening checkout…" : "Continue to Stripe checkout"}
                            </Button>
                        </>
                    )}
                </form>

                <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={handleRestore}
                    isLoading={restoreLoading}
                >
                    {!restoreLoading && <ArrowClockwise className="mr-2 size-4" weight="bold" />}
                    Restore purchase or manage billing
                </Button>

                {error && (
                    <div id="checkout-error" role="alert" aria-live="polite" className="mb-3 border-l-2 border-destructive bg-destructive/10 p-2 text-center text-sm text-destructive">
                        {error}
                    </div>
                )}

                <p id="checkout-terms" className="text-center text-xs leading-5 text-muted-foreground">
                    Stripe handles payment. No automatic renewal. Unused passes are refundable within 14 days; full details are in the <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">Terms</Link>. By continuing, you also agree to the <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy Policy</Link>. Billing help is available through <Link href="/support" className="underline underline-offset-4 hover:text-foreground">Support</Link>.
                </p>
            </DialogContent>
        </Dialog>
    );
}
