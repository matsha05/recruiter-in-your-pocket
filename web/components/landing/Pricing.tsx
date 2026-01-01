"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface PricingProps {
    onSelectTier?: (tier: "single" | "pack") => void;
}

export function Pricing({ onSelectTier }: PricingProps) {
    const [checkoutTier, setCheckoutTier] = useState<"single" | "pack" | null>(null);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePurchase = (tier: "single" | "pack") => {
        if (onSelectTier) {
            onSelectTier(tier);
        } else {
            // Open email collection dialog
            setCheckoutTier(tier);
            setError(null);
        }
    };

    const handleCheckout = async () => {
        if (!email.trim()) {
            setError("Please enter your email");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tier: checkoutTier,
                    email: email.trim()
                })
            });

            const result = await res.json();

            if (result.ok && result.url) {
                window.location.href = result.url;
            } else {
                setError(result.message || "Failed to start checkout");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className="py-16 px-6 bg-background border-t border-border/30" id="pricing">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12 max-w-2xl mx-auto">
                        <h2 className="font-display text-4xl md:text-5xl text-primary mb-4 leading-tight tracking-tight">
                            Fix it before they see it.
                        </h2>
                        <p className="text-memo text-lg text-muted-foreground">
                            Resume or LinkedIn — recruiter-grade feedback in minutes.
                        </p>
                    </div>

                    <div className="text-center">
                        <Button variant="brand" size="lg" asChild>
                            <Link href="/workspace">
                                Run Your Free Review →
                            </Link>
                        </Button>
                        <p className="mt-4 text-sm text-muted-foreground">No credit card required</p>
                    </div>

                    <div className="mt-12 grid md:grid-cols-2 gap-6 items-stretch">
                        <div className="p-6 rounded border border-border/40 bg-card flex flex-col">
                            <div className="mb-6">
                                <div className="text-label text-muted-foreground mb-2">Quick Check</div>
                                <div className="text-4xl font-display font-semibold text-foreground">$9</div>
                                <p className="text-sm text-muted-foreground mt-2">Best for first-time feedback.</p>
                            </div>
                            <ul className="space-y-3 mb-8 text-sm text-muted-foreground flex-1">
                                <li>One full review.</li>
                                <li>Verdict, critical miss, and next steps.</li>
                                <li>Copy-ready rewrite suggestions.</li>
                            </ul>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handlePurchase("single")}
                            >
                                Unlock 1 Full Review
                            </Button>
                        </div>

                        <div className="p-6 rounded border border-border/40 bg-card flex flex-col">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-premium mb-2">
                                Best value
                            </div>
                            <div className="mb-6">
                                <div className="text-label text-muted-foreground mb-2">Active Job Search</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-display font-semibold text-foreground">$29</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">For multiple versions and roles.</p>
                            </div>
                            <ul className="space-y-3 mb-8 text-sm text-muted-foreground flex-1">
                                <li>Five full reviews.</li>
                                <li>Versioning and role targeting.</li>
                                <li>Full rewrites, missing wins, and export.</li>
                            </ul>
                            <Button
                                variant="premium"
                                className="w-full"
                                onClick={() => handlePurchase("pack")}
                            >
                                Unlock 5 Full Reviews
                            </Button>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-muted-foreground">
                            Credits never expire. No subscription.
                        </p>
                    </div>
                </div>
            </section>

            {/* Checkout Email Dialog */}
            <Dialog open={checkoutTier !== null} onOpenChange={(open) => !open && setCheckoutTier(null)}>
                <DialogContent className="max-w-[380px] p-6">
                    <DialogHeader className="text-center mb-4">
                        <DialogTitle className="font-display text-xl font-medium">
                            {checkoutTier === "pack" ? "Start Job Search Mode" : "Unlock 1 Full Review"}
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                            Enter your email to continue to secure checkout.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="bg-background border-border/60 focus:border-brand/40"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && email.trim()) {
                                    handleCheckout();
                                }
                            }}
                            autoFocus
                        />

                        {error && (
                            <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <Button
                            className="w-full"
                            onClick={handleCheckout}
                            disabled={!email.trim() || loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Continue to Checkout →`
                            )}
                        </Button>

                        <p className="text-center text-[10px] text-muted-foreground/50">
                            Secure payment by Stripe
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
