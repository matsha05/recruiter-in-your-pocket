"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { X, Crown } from "lucide-react";
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

    if (!isOpen) return null;

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

    const handleClose = () => {
        setEmail("");
        setError(null);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="bg-background border border-border/10 rounded-md shadow-2xl w-full max-w-[420px] p-8 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={handleClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-2"
                >
                    <X className="w-5 h-5" strokeWidth={2} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="font-display text-2xl font-medium text-foreground mb-3">
                        You've used your free audit.
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Get more credits to keep improving your resume.
                    </p>
                </div>

                {/* Tier Selection - Credit Packs */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {/* Quick Fix - 1 Audit */}
                    <button
                        type="button"
                        onClick={() => setSelectedTier("single")}
                        className={cn("p-4 rounded-md text-center transition-all border flex flex-col items-center justify-center",
                            selectedTier === "single" ? "bg-secondary/40 border-foreground/30" : "bg-transparent border-border/10 hover:bg-secondary/10"
                        )}
                    >
                        <span className="text-2xl font-display font-medium text-foreground">$9</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">1 Audit</span>
                    </button>

                    {/* Job Search Pack - 5 Audits - Highlighted */}
                    <button
                        type="button"
                        onClick={() => setSelectedTier("pack")}
                        className={cn("p-4 rounded-md text-center transition-all border relative flex flex-col items-center justify-center overflow-hidden",
                            selectedTier === "pack" ? "bg-premium/10 border-premium shadow-[0_0_15px_-5px_rgba(251,191,36,0.3)]" : "bg-transparent border-border/10 hover:bg-secondary/10"
                        )}
                    >
                        <div className="absolute -top-0.5 right-0 left-0 flex justify-center">
                            <span className="text-[8px] uppercase tracking-wider bg-premium text-white px-2 py-0.5 rounded-b-sm font-bold flex items-center gap-1">
                                <Crown className="w-2 h-2" /> Best Value
                            </span>
                        </div>
                        <span className="text-2xl font-display font-medium text-premium mt-2">$29</span>
                        <span className="text-[10px] uppercase tracking-wider text-premium mt-1 font-bold">5 Audits</span>
                        <span className="text-[9px] text-muted-foreground">$5.80 each</span>
                    </button>
                </div>

                {/* Checkout Section */}
                <div className="bg-secondary/10 rounded-md p-5 border border-border/10 mb-4">
                    {isLoggedIn ? (
                        <>
                            <p className="text-sm text-muted-foreground mb-4 text-center">
                                Adding credits to <strong className="text-foreground">{user.email}</strong>
                            </p>
                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full bg-foreground text-background hover:bg-foreground/90 h-10 rounded-md font-medium text-sm transition-colors"
                            >
                                {loading ? "Processing..." : `Buy ${selectedTier === "single" ? "1 Audit" : "5 Audits"} →`}
                            </button>
                        </>
                    ) : (
                        <>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                Your email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full h-10 rounded-md border border-border/10 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring mb-4"
                            />
                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={loading || !email.trim()}
                                className="w-full bg-foreground text-background hover:bg-foreground/90 h-10 rounded-md font-medium text-sm transition-colors"
                            >
                                {loading ? "Processing..." : `Continue to checkout →`}
                            </button>
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
            </div>
        </div>
    );
}
