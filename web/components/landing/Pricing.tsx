"use client";

import { useState } from "react";
import { Loader2, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
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

/**
 * Pricing v2 - Premium card layout matching Research Hub
 */
export function Pricing({ onSelectTier }: PricingProps) {
    const [checkoutTier, setCheckoutTier] = useState<"single" | "pack" | null>(null);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePurchase = (tier: "single" | "pack") => {
        if (onSelectTier) {
            onSelectTier(tier);
        } else {
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
            <section className="py-20 px-6 bg-muted/20 border-t border-border/30" id="pricing">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10 max-w-xl mx-auto">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                            Pricing
                        </div>
                        <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3 tracking-tight">
                            Fix it before they see it.
                        </h2>
                        <p className="text-muted-foreground">
                            Resume or LinkedIn — recruiter-grade feedback in minutes.
                        </p>
                    </div>

                    {/* Free CTA */}
                    <div className="text-center mb-10">
                        <Button variant="brand" size="lg" asChild>
                            <Link href="/workspace">
                                Run Your Free Review →
                            </Link>
                        </Button>
                        <p className="mt-3 text-sm text-muted-foreground">No credit card required</p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 gap-4 items-stretch">
                        {/* Quick Check */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            viewport={{ once: true }}
                            className="p-6 rounded-xl border border-border/40 bg-white dark:bg-card flex flex-col transition-all duration-300 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5"
                        >
                            <div className="mb-6">
                                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                                    Quick Check
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-display font-semibold text-foreground">$9</span>
                                    <span className="text-muted-foreground text-sm">/review</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Best for first-time feedback.
                                </p>
                            </div>
                            <ul className="space-y-3 mb-6 text-sm text-foreground flex-1">
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                                    <span>One full review</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                                    <span>Verdict, critical miss, next steps</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                                    <span>Copy-ready rewrite suggestions</span>
                                </li>
                            </ul>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handlePurchase("single")}
                            >
                                Unlock 1 Full Review
                            </Button>
                        </motion.div>

                        {/* Active Job Search - Best Value */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            viewport={{ once: true }}
                            className="p-6 rounded-xl border-2 border-brand/40 bg-white dark:bg-card flex flex-col relative transition-all duration-300 hover:shadow-lg hover:shadow-brand/10"
                        >
                            {/* Best Value Badge - Premium Gold */}
                            <div className="absolute -top-3 left-6 flex items-center gap-1.5 bg-premium text-white px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide shadow-sm">
                                <Sparkles className="w-3 h-3" />
                                Best Value
                            </div>

                            <div className="mb-6 mt-2">
                                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                                    Active Job Search
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-display font-semibold text-foreground">$29</span>
                                    <span className="text-muted-foreground text-sm">/5 reviews</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    For multiple versions and roles.
                                </p>
                            </div>
                            <ul className="space-y-3 mb-6 text-sm text-foreground flex-1">
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                                    <span>Five full reviews</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                                    <span>Versioning and role targeting</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                                    <span>Full rewrites, missing wins, export</span>
                                </li>
                            </ul>
                            <Button
                                variant="brand"
                                className="w-full"
                                onClick={() => handlePurchase("pack")}
                            >
                                Unlock 5 Full Reviews
                            </Button>
                        </motion.div>
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
