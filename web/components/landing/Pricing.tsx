"use client";

import { useState } from "react";
import { Check, Shield, Loader2 } from "lucide-react";
import { InsightSparkleIcon } from "@/components/icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
            <section className="py-16 px-6 bg-background relative overflow-hidden" id="pricing">
                <div className="max-w-3xl mx-auto relative z-10">

                    <div className="text-center mb-12 max-w-2xl mx-auto">
                        <h2 className="font-display text-4xl md:text-5xl text-primary mb-4 leading-tight tracking-tight animate-in slide-in-from-bottom-4 fade-in duration-700">
                            Fix it before they see it.
                        </h2>
                        <p className="text-memo text-lg text-muted-foreground animate-in slide-in-from-bottom-5 fade-in duration-700 delay-100">
                            Resume or LinkedIn — get recruiter-grade feedback in 60 seconds.
                        </p>
                    </div>

                    {/* Primary Free CTA */}
                    <div className="text-center">
                        <Button variant="brand" size="lg" className="shadow-lg shadow-brand/20" asChild>
                            <Link href="/workspace">
                                Run Your Free Review →
                            </Link>
                        </Button>
                        <p className="mt-4 text-sm text-muted-foreground">No credit card required</p>
                    </div>

                    {/* Social Proof Section */}
                    <div className="mt-16 p-6 rounded-lg border border-border/30 bg-muted/20">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">Built using real recruiter screening heuristics</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Focuses on the first 10 seconds</span>
                            <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Turns vague bullets into measurable outcomes</span>
                            <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Copy-paste upgrades, not generic advice</span>
                        </div>
                    </div>

                    {/* Intent-Framed Divider */}
                    <div className="mt-12 flex items-center gap-4">
                        <div className="flex-1 h-px bg-border/30" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">How serious is your job search?</span>
                        <div className="flex-1 h-px bg-border/30" />
                    </div>

                    {/* Paid Tiers - Intent-Based */}
                    <div className="mt-8 grid md:grid-cols-2 gap-4 items-stretch">

                        {/* TIER 1: QUICK CHECK - $9 for 1 review */}
                        <div className="p-6 rounded border border-border/20 bg-card hover:bg-card/80 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md flex flex-col">
                            <div className="mb-6">
                                <div className="text-label text-muted-foreground mb-2">Quick Check</div>
                                <div className="text-4xl font-display font-bold text-foreground">$9</div>
                                <p className="text-sm text-muted-foreground mt-2">Best for first-time feedback</p>
                            </div>
                            <ul className="space-y-3 mb-8 text-sm text-muted-foreground font-medium flex-1">
                                <li className="flex items-start gap-3">
                                    <Check className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span><strong>1 full review included</strong></span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>See exactly what recruiters notice in 10 seconds</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>Copy-paste rewrites for your weakest bullets</span>
                                </li>
                            </ul>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handlePurchase("single")}
                            >
                                Unlock 1 Full Review
                            </Button>
                        </div>

                        {/* TIER 2: ACTIVE JOB SEARCH - $29 for 5 reviews - HIGHLIGHTED */}
                        <div className="relative p-6 rounded border-2 border-premium bg-card transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg flex flex-col">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-premium text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-sm">
                                Recommended
                            </div>

                            <div className="mb-6">
                                <div className="text-label text-premium mb-2">Active Job Search</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-display font-bold text-foreground">$29</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">For an active job search</p>
                            </div>
                            <ul className="space-y-3 mb-8 text-sm text-foreground font-medium flex-1">
                                <li className="flex items-start gap-3">
                                    <Check className="w-4 h-4 text-premium mt-0.5 shrink-0" />
                                    <span><strong>5 full reviews included</strong></span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                    <span>Tailor versions for different roles and job postings</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                    <span>Unlock full rewrites and missing wins</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                    <span>Compare progress across versions</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                    <span>Export a clean PDF when you&apos;re ready to apply</span>
                                </li>
                            </ul>
                            <Button
                                variant="premium"
                                className="w-full"
                                onClick={() => handlePurchase("pack")}
                            >
                                Start Job Search Mode
                            </Button>
                        </div>

                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-xs text-muted-foreground">
                            <strong>100% Satisfaction Guarantee:</strong> Not happy? Email us within 24h for a full refund.
                        </p>
                    </div>

                </div>
            </section >

            {/* Checkout Email Dialog */}
            < Dialog open={checkoutTier !== null
            } onOpenChange={(open) => !open && setCheckoutTier(null)}>
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
                            <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded-lg">
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
                            Secure payment by Stripe · 100% money-back guarantee
                        </p>
                    </div>
                </DialogContent>
            </Dialog >
        </>
    );
}
