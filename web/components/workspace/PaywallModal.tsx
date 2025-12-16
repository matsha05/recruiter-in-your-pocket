"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { X } from "lucide-react";

type Tier = "24h" | "30d" | "90d";

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    freeUsesRemaining?: number;
    hasCurrentReport?: boolean;
    onSuccess?: () => void;
}

export default function PaywallModal({
    isOpen,
    onClose,
    freeUsesRemaining = 0,
    hasCurrentReport = false,
    onSuccess
}: PaywallModalProps) {
    const { user } = useAuth();
    const [selectedTier, setSelectedTier] = useState<Tier>("24h");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isLoggedIn = !!user;

    if (!isOpen) return null;

    const getHeaderText = () => {
        if (freeUsesRemaining === 2) {
            return "You have 2 free reviews left";
        } else if (freeUsesRemaining === 1) {
            return "You have 1 free review left";
        } else {
            return "You've used your free reviews. Pick a pass to keep going.";
        }
    };

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
            <div className="bg-background border border-white/10 rounded-xl shadow-2xl w-full max-w-[500px] p-8 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={handleClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-2"
                >
                    <X className="w-5 h-5" strokeWidth={2} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
                        Ready for the full recruiter perspective?
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        See your strengths, your gaps, your exact next steps.
                    </p>

                    {/* Value Summary */}
                    <div className="mt-6 bg-secondary/20 border border-white/5 rounded-lg p-5 text-left space-y-3">
                        <p className="text-sm font-medium text-foreground">Pro Studio Access includes:</p>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li className="flex items-center gap-3">
                                <span className="text-gold">✓</span>
                                Unlimited recruiter-grade resume reviews
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-gold">✓</span>
                                Deep-dive feedback per line
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-gold">✓</span>
                                "Before & After" bullet rewrites
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-gold">✓</span>
                                PDF export of your reports
                            </li>
                        </ul>
                    </div>

                    {/* Testimonial */}
                    <div className="mt-6 pt-4 border-t border-white/5">
                        <p className="text-sm text-muted-foreground italic font-serif">
                            &ldquo;Finally, feedback that sounds like a real recruiter, not a robot.&rdquo;
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-2 uppercase tracking-widest font-medium">— Senior PM, Google</p>
                    </div>
                </div>

                {/* Tier Selection - Grid 3 */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {/* Single */}
                    <button
                        type="button"
                        onClick={() => setSelectedTier("24h")}
                        className={cn("p-3 rounded-lg text-center transition-all border relative flex flex-col items-center justify-center",
                            selectedTier === "24h" ? "bg-secondary/40 border-foreground/30" : "bg-transparent border-white/5 hover:bg-secondary/10"
                        )}
                    >
                        <span className="text-xl font-serif font-medium text-foreground">$19</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Single</span>
                    </button>

                    {/* Pro - Highlighted */}
                    <button
                        type="button"
                        onClick={() => setSelectedTier("30d")}
                        className={cn("p-3 rounded-lg text-center transition-all border relative flex flex-col items-center justify-center overflow-hidden",
                            selectedTier === "30d" ? "bg-gold/10 border-gold shadow-[0_0_15px_-5px_rgba(251,191,36,0.3)]" : "bg-transparent border-white/5 hover:bg-secondary/10"
                        )}
                    >
                        <div className="absolute top-0 right-0 left-0 h-0.5 bg-gold/50" />
                        <span className="text-xl font-serif font-medium text-gold">$39</span>
                        <span className="text-[10px] uppercase tracking-wider text-gold mt-1 font-bold">Monthly</span>
                    </button>

                    {/* Exec */}
                    <button
                        type="button"
                        onClick={() => setSelectedTier("90d")}
                        className={cn("p-3 rounded-lg text-center transition-all border relative flex flex-col items-center justify-center",
                            selectedTier === "90d" ? "bg-purple-500/10 border-purple-500/30" : "bg-transparent border-white/5 hover:bg-secondary/10"
                        )}
                    >
                        <span className="text-xl font-serif font-medium text-purple-300">$79</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Quarterly</span>
                    </button>
                </div>

                {/* Checkout Section */}
                <div className="bg-secondary/10 rounded-xl p-6 border border-white/5 mb-4">
                    {isLoggedIn ? (
                        <>
                            <p className="text-sm text-muted-foreground mb-4 text-center">
                                Adding pass to <strong className="text-foreground">{user.email}</strong>
                            </p>
                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full bg-foreground text-background hover:bg-foreground/90 h-10 rounded-md font-medium text-sm transition-colors"
                            >
                                {loading ? "Processing..." : `Get ${selectedTier === "24h" ? "Single" : selectedTier === "90d" ? "Executive" : "Pro"} Pass →`}
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
                                className="w-full h-10 rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-gold/50 mb-4"
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
                                We'll email you a magic link to log in.
                            </p>
                        </>
                    )}
                </div>

                {error && (
                    <div className="text-rose-500 text-sm text-center mb-4 bg-rose-500/10 p-2 rounded">
                        {error}
                    </div>
                )}

                {hasCurrentReport && (
                    <p className="text-center text-xs text-muted-foreground/50 mb-2">
                        Your current report is saved and waiting for you.
                    </p>
                )}

                <p className="text-center text-[10px] text-muted-foreground/40 uppercase tracking-widest">
                    Secure Payment by Stripe • 100% Satisfaction Guarantee
                </p>
            </div>
        </div>
    );
}
