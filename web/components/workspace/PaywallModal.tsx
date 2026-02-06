"use client";

import { useState } from "react";
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
import { RefreshCw } from "lucide-react";
import { Analytics } from "@/lib/analytics";

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    creditsRemaining?: number;
    hasCurrentReport?: boolean;
}

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

    const isLoggedIn = !!user;

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
            Analytics.checkoutStarted(selectedTier, selectedTier === "monthly" ? 9 : 79);
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tier: selectedTier,
                    email: checkoutEmail,
                    source: "paywall",
                    idempotencyKey: crypto.randomUUID()
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
                        Your free review is used.
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Unlock unlimited iterations, recruiter-grade rewrites, and job-targeted feedback.
                    </DialogDescription>
                </DialogHeader>

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
                                {loading ? "Processing..." : `Unlock Full Review — ${selectedTier === "monthly" ? "$9/mo" : "$79"}`}
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
                    {!restoreLoading && <RefreshCw className="w-4 h-4 mr-2" />}
                    Restore Access / Manage Billing
                </Button>

                {error && (
                    <div className="text-destructive text-sm text-center mb-3 bg-destructive/10 p-2 rounded">
                        {error}
                    </div>
                )}

                <p className="text-center text-[10px] text-muted-foreground/50 uppercase tracking-widest">
                    Secure checkout by Stripe · Cancel monthly anytime · Receipts in billing portal
                </p>
            </DialogContent>
        </Dialog>
    );
}
