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
    workspaceState?: {
        report: unknown;
        resumeText: string;
        jobDescription: string;
    } | null;
}

const COMPLETE_REPORT_SUBTITLE = `${JOB_SEARCH_PASS_DECISION.freeBoundary} ${JOB_SEARCH_PASS_DECISION.whenToBuy}`;
const PASS_BULLETS = [
    "5 more complete reports",
    "See whether your Critical Miss is fixed after you revise",
    "Check your resume against each job posting",
    "PDF exports for 30 days",
];

const DEFAULT_UNLOCK_COPY = {
    label: "Job Search Pass",
    title: "Want another read?",
    subtitle: COMPLETE_REPORT_SUBTITLE,
    bullets: PASS_BULLETS,
};

const CONTEXT_UNLOCK_COPY: Record<UnlockSection, typeof DEFAULT_UNLOCK_COPY> = {
    evidence_ledger: { ...DEFAULT_UNLOCK_COPY, label: "Your revision", title: "Check your revised resume" },
    bullet_upgrades: { ...DEFAULT_UNLOCK_COPY, label: "Your edits", title: "See what your edits changed" },
    missing_wins: { ...DEFAULT_UNLOCK_COPY, label: "Details to add", title: "Check the details you add" },
    job_alignment: { ...DEFAULT_UNLOCK_COPY, label: "Role fit", title: "Read it against another role" },
    export_pdf: { ...DEFAULT_UNLOCK_COPY, label: "PDF export", title: "Take your report with you" },
};

export default function PaywallModal({
    isOpen,
    onClose,
    hasCurrentReport = false,
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
        return (
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-md p-7">
                    <DialogHeader className="text-center">
                        <DialogTitle className="font-display text-2xl font-bold">
                            Passes are paused for now
                        </DialogTitle>
                        <DialogDescription className="mx-auto max-w-sm text-sm leading-6">
                            {hasCurrentReport
                                ? "Your existing report stays available. You can return to it below."
                                : "You can't buy a pass right now. Your resume is still here when you're ready."}
                        </DialogDescription>
                    </DialogHeader>
                    <Button className="mt-5 w-full" onClick={onClose}>
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
                        {unlockCopy.title}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        {hasCurrentReport ? unlockCopy.subtitle : JOB_SEARCH_PASS_DECISION.whenToBuy}
                    </DialogDescription>
                </DialogHeader>

                <div className="mb-5 gap-y-3 border-y border-line bg-surface-sky/45 px-4 py-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">What you get</span>
                        <span data-testid="paywall-context-label" className="text-foreground/80">{unlockCopy.label}</span>
                    </div>
                    <UnlockValueList items={unlockCopy.bullets} dense />
                </div>

                <div className="mb-5 grid grid-cols-[0.8fr_1.2fr] border-y border-line py-4">
                    <div>
                        <p className="font-display text-4xl riyp-weight-520 tracking-[-0.03em] text-foreground">$29</p>
                        <p className="mt-1 text-sm text-muted-foreground">once</p>
                    </div>
                    <div className="border-l border-line pl-4 text-sm leading-6 text-muted-foreground">
                        {JOB_SEARCH_PASS_DECISION.terms}
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
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={handleRestore}
                    isLoading={restoreLoading}
                    loadingLabel="Checking access…"
                >
                    <ArrowClockwise className="mr-2 size-4" weight="bold" />
                    Already paid? Restore access
                </Button>

                {error && (
                    <div id="checkout-error" role="alert" aria-live="polite" className="mb-3 border-l-2 border-destructive bg-destructive/10 p-2 text-center text-sm text-destructive">
                        {error}
                    </div>
                )}

                <p id="checkout-terms" className="text-center text-xs leading-5 text-muted-foreground">
                    Payment by Stripe. Unused passes are refundable within 14 days (see the <Link href="/terms" className="riyp-link-quiet">Terms</Link>). By continuing, you agree to the <Link href="/privacy" className="riyp-link-quiet">Privacy Policy</Link>. Questions? <Link href="/support" className="riyp-link-quiet">Ask us</Link>.
                </p>
            </DialogContent>
        </Dialog>
    );
}
