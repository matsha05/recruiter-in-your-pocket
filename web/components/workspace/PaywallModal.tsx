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
import { cn } from "@/lib/utils";

type Tier = "single" | "pack";

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    creditsRemaining?: number;
    hasCurrentReport?: boolean;
    onSuccess?: () => void;
}

export default function PaywallModal({
    isOpen,
    onClose,
    creditsRemaining = 0,
    hasCurrentReport = false,
    onSuccess
}: PaywallModalProps) {
    const { user } = useAuth();
    const [selectedTier, setSelectedTier] = useState<Tier>("pack");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
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
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tier: selectedTier,
                    email: checkoutEmail
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

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setEmail("");
            setError(null);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[420px] p-8">
                <DialogHeader className="text-center mb-6">
                    <DialogTitle className="font-display text-2xl font-medium">
                        Unlock your complete report
                    </DialogTitle>
                    <DialogDescription>
                        You've seen the diagnosis. Now get the prescription.
                    </DialogDescription>
                </DialogHeader>

                {/* What you get - Value clarity */}
                <div className="text-center text-xs text-muted-foreground mb-6 px-4">
                    <span className="font-medium text-foreground">Unlock:</span> full rewrites, missing wins, role positioning, PDF export, and version tracking.
                </div>

                {/* Tier Selection - Intent-Based */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {/* Quick Check - 1 Review */}
                    <button
                        type="button"
                        onClick={() => setSelectedTier("single")}
                        className={cn(
                            "p-4 rounded text-center transition-all duration-200 ease-out border flex flex-col items-center justify-center",
                            "hover:-translate-y-0.5 hover:shadow-sm",
                            selectedTier === "single"
                                ? "bg-secondary/40 border-foreground/30"
                                : "bg-transparent border-border/10 hover:bg-secondary/10"
                        )}
                    >
                        <span className="text-2xl font-display font-medium text-foreground">$9</span>
                        <span className="text-label text-muted-foreground mt-1">Quick Check</span>
                        <span className="text-[9px] text-muted-foreground">1 review</span>
                    </button>

                    {/* Active Job Search - 5 Reviews - Highlighted */}
                    <button
                        type="button"
                        onClick={() => setSelectedTier("pack")}
                        className={cn(
                            "p-4 rounded text-center transition-all duration-200 ease-out border relative flex flex-col items-center justify-center overflow-hidden",
                            "hover:-translate-y-0.5 hover:shadow-md",
                            selectedTier === "pack"
                                ? "bg-premium/10 border-premium"
                                : "bg-transparent border-border/10 hover:bg-secondary/10"
                        )}
                    >
                        <div className="absolute -top-0.5 right-0 left-0 flex justify-center">
                            <span className="text-[8px] uppercase tracking-wider bg-premium text-white px-2 py-0.5 rounded-b-sm font-bold">
                                Recommended
                            </span>
                        </div>
                        <span className="text-2xl font-display font-medium text-premium mt-2">$29</span>
                        <span className="text-label text-premium mt-1">Job Search</span>
                        <span className="text-[9px] text-muted-foreground">5 reviews</span>
                    </button>
                </div>

                {/* Checkout Section */}
                <div className="bg-secondary/10 rounded-md p-5 border border-border/10 mb-4">
                    {isLoggedIn ? (
                        <>
                            <p className="text-sm text-muted-foreground mb-4 text-center">
                                Adding credits to <strong className="text-foreground">{user.email}</strong>
                            </p>
                            <Button
                                className="w-full"
                                onClick={handleCheckout}
                                isLoading={loading}
                            >
                                {loading ? "Processing..." : `Get ${selectedTier === "single" ? "1 Review" : "5 Reviews"} →`}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Label htmlFor="checkout-email" className="text-muted-foreground mb-2">
                                Your email
                            </Label>
                            <Input
                                id="checkout-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="mb-4"
                            />
                            <Button
                                className="w-full"
                                onClick={handleCheckout}
                                disabled={!email.trim()}
                                isLoading={loading}
                            >
                                {loading ? "Processing..." : `Continue to checkout →`}
                            </Button>
                            <p className="text-xs text-muted-foreground/50 text-center mt-3">
                                We'll email you a magic link to access your credits.
                            </p>
                        </>
                    )}
                </div>

                {error && (
                    <div className="text-destructive text-sm text-center mb-4 bg-destructive/10 p-2 rounded">
                        {error}
                    </div>
                )}

                <p className="text-center text-[10px] text-muted-foreground/40 uppercase tracking-widest">
                    Secure Payment by Stripe • 100% Money-Back Guarantee
                </p>
            </DialogContent>
        </Dialog>
    );
}
