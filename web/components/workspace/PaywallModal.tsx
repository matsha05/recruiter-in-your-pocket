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
import { PricingCard, type PricingTier } from "@/components/shared/PricingCard";
import { UnlockValueList } from "@/components/shared/UnlockValueList";
import { RefreshCw } from "lucide-react";
import { Analytics } from "@/lib/analytics";
import { getUnlockContext, type UnlockContext, type UnlockSection } from "@/lib/unlock/unlockContext";

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    creditsRemaining?: number;
    hasCurrentReport?: boolean;
}

const DEFAULT_UNLOCK_COPY = {
    label: "Paid Access",
    title: "Run the next role-specific report",
    subtitle: "Your completed free report stays visible. Paid access is for repeated recruiter reports across the jobs, versions, and LinkedIn updates you actually plan to send.",
    bullets: [
        "Fresh reports for serious applications",
        "Role-fit runs for specific jobs",
        "Resume and LinkedIn iterations",
        "Version history and exports for reports you keep"
    ]
};

const CONTEXT_UNLOCK_COPY: Record<UnlockSection, typeof DEFAULT_UNLOCK_COPY> = {
    evidence_ledger: {
        label: "Evidence Ledger",
        title: "Keep going with evidence",
        subtitle: "Your free report stays visible. Paid access lets you keep using evidence-led reports across roles and versions.",
        bullets: [
            "Every run grounded in the line behind it",
            "Confidence and impact on each call",
            "Rewrites tied to your actual resume",
            "Keep a history of reports you use"
        ]
    },
    bullet_upgrades: {
        label: "Red Pen",
        title: "Keep using Red Pen",
        subtitle: "Run more recruiter-grade rewrites without losing your completed free report.",
        bullets: [
            "More bullet rewrites across versions",
            "Phrasing a recruiter would notice",
            "Why each change lands harder",
            "Fresh reports for different roles"
        ]
    },
    missing_wins: {
        label: "Missing Wins",
        title: "Find the missing wins",
        subtitle: "Use paid access when you want repeated passes on the wins that are still buried.",
        bullets: [
            "All missing-win prompts",
            "Why each one matters",
            "Track them as you add them back in",
            "Keep report versions together"
        ]
    },
    job_alignment: {
        label: "Role Fit",
        title: "Run role-fit briefs",
        subtitle: "Compare the resume against specific jobs whenever you want a closer read.",
        bullets: [
            "Your best-fit roles and stretch paths",
            "Job match score and missing signals",
            "A positioning statement you can reuse",
            "Save this report for later"
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
            "Fresh reports when you need them"
        ]
    }
};

export default function PaywallModal({
    isOpen,
    onClose
}: PaywallModalProps) {
    const { user } = useAuth();
    const [selectedTier, setSelectedTier] = useState<PricingTier>("monthly");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [restoreLoading, setRestoreLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [unlockContext, setUnlockContext] = useState<UnlockContext | null>(null);

    const isLoggedIn = !!user;

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
            setError("Please enter your email");
            setLoading(false);
            return;
        }

        try {
            const unlockSection = unlockContext?.section || null;
            Analytics.checkoutStarted(selectedTier, selectedTier === "monthly" ? 9 : 79);
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tier: selectedTier,
                    email: checkoutEmail,
                    source: "paywall",
                    idempotencyKey: crypto.randomUUID(),
                    unlockSection
                })
            });

            const result = await res.json();

            if (result.ok && result.url) {
                window.location.href = result.url;
            } else {
                Analytics.track("checkout_start_failed", { source: "paywall", tier: selectedTier });
                setError(result.message || "Failed to start checkout");
            }
        } catch (err: any) {
            Analytics.track("checkout_start_failed", { source: "paywall", tier: selectedTier });
            setError(err.message || "Something went wrong");
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

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[400px] p-6">
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

                <div className="rounded border border-border/60 bg-secondary/10 p-4 gap-y-3 mb-5">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                        <span>Unlocks now</span>
                        <span className="text-foreground/80">{unlockCopy.label}</span>
                    </div>
                    <UnlockValueList items={unlockCopy.bullets} dense />
                    {unlockContext?.section && (
                        <p className="text-xs text-muted-foreground">
                            We saved your place in <span className="text-foreground font-medium">{unlockCopy.label}</span>.
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Your completed free report stays visible. Upgrade only when you want another pass for a real application, a revised resume, or a LinkedIn/profile update.
                    </p>
                </div>

                {/* Tier Selection - Compact Cards */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <PricingCard
                        tier="monthly"
                        variant="compact"
                        selected={selectedTier === "monthly"}
                        onSelect={() => setSelectedTier("monthly")}
                    />
                    <PricingCard
                        tier="lifetime"
                        variant="compact"
                        selected={selectedTier === "lifetime"}
                        onSelect={() => setSelectedTier("lifetime")}
                    />
                </div>

                {/* Checkout Section */}
                <div className="bg-secondary/10 rounded p-4 border border-border/40 mb-3">
                    {isLoggedIn ? (
                        <>
                            <p className="text-sm text-muted-foreground mb-3 text-center">
                                Upgrading <strong className="text-foreground">{user.email}</strong>
                            </p>
                            <Button
                                className="w-full"
                                onClick={handleCheckout}
                                isLoading={loading}
                            >
                                {loading ? "Processing..." : `Start Paid Access - ${selectedTier === "monthly" ? "$9/mo" : "$79"}`}
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="mb-3"
                            />
                            <Button
                                className="w-full"
                                onClick={handleCheckout}
                                disabled={!email.trim()}
                                isLoading={loading}
                            >
                                {loading ? "Processing..." : `Continue to Secure Checkout`}
                            </Button>
                        </>
                    )}
                </div>

                <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={handleRestore}
                    isLoading={restoreLoading}
                >
                    {!restoreLoading && <RefreshCw className="size-4 mr-2" />}
                    Restore Access / Manage Billing
                </Button>

                {error && (
                    <div className="text-destructive text-sm text-center mb-3 bg-destructive/10 p-2 rounded">
                        {error}
                    </div>
                )}

                <p className="text-center text-xs text-muted-foreground/50 uppercase tracking-wide">
                    Secure checkout by Stripe · Cancel anytime · All receipts in billing
                </p>
            </DialogContent>
        </Dialog>
    );
}
