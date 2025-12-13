"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { X } from "lucide-react";

type Tier = "24h" | "30d";

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
            <div className="bg-surface rounded-2xl shadow-modal w-full max-w-[520px] p-8 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={handleClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 text-muted hover:text-primary transition-colors p-2"
                >
                    <X className="w-5 h-5" strokeWidth={2} />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="font-display text-xl font-bold text-primary mb-2">
                        {getHeaderText()}
                    </h2>
                    <p className="text-muted">
                        Pick a pass that fits your timeline. No subscriptions.
                    </p>
                </div>

                {/* Tier Selection */}
                <div className="flex gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => setSelectedTier("24h")}
                        className={`flex-1 p-5 rounded-xl text-center transition-all
                            ${selectedTier === "24h"
                                ? "border-2 border-brand bg-brand-soft"
                                : "border-2 border-subtle hover:border-brand"
                            }`}
                    >
                        <div className="inline-block px-3 py-1 text-[11px] font-semibold uppercase tracking-wide rounded bg-brand text-white mb-3">
                            Most popular
                        </div>
                        <div className="text-3xl font-extrabold text-brand mb-1">$9</div>
                        <div className="font-semibold text-primary mb-2">24-Hour Fix Pass</div>
                        <p className="text-xs text-muted leading-relaxed">
                            Unlimited reports for 24 hours.
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedTier("30d")}
                        className={`flex-1 p-5 rounded-xl text-center transition-all
                            ${selectedTier === "30d"
                                ? "border-2 border-success bg-success-soft"
                                : "border-2 border-subtle hover:border-success"
                            }`}
                    >
                        <div className="inline-block px-3 py-1 text-[11px] font-semibold uppercase tracking-wide rounded bg-[var(--status-success)] text-white mb-3">
                            Best value
                        </div>
                        <div className="text-3xl font-extrabold text-success mb-1">$39</div>
                        <div className="font-semibold text-primary mb-2">30-Day Campaign Pass</div>
                        <p className="text-xs text-muted leading-relaxed">
                            Unlimited reports for 30 days.
                        </p>
                    </button>
                </div>

                {/* Checkout Section */}
                <div className="bg-muted rounded-xl p-5 mb-4">
                    {isLoggedIn ? (
                        <>
                            <p className="text-sm text-secondary mb-4">
                                You&apos;re getting this pass for <strong className="text-primary">{user.email}</strong>
                            </p>
                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={loading}
                                className="btn-primary w-full"
                            >
                                {loading ? "Processing..." : `Get ${selectedTier === "24h" ? "24-Hour" : "30-Day"} Pass →`}
                            </button>
                        </>
                    ) : (
                        <>
                            <label className="block text-sm font-medium text-secondary mb-2">
                                Your email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="input mb-4"
                            />
                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={loading || !email.trim()}
                                className="btn-primary w-full"
                            >
                                {loading ? "Processing..." : `Continue to checkout →`}
                            </button>
                            <p className="text-xs text-muted text-center mt-3">
                                Your email links your pass to any device.
                            </p>
                        </>
                    )}
                </div>

                {error && (
                    <div className="text-danger text-sm text-center mb-4">
                        {error}
                    </div>
                )}

                {hasCurrentReport && (
                    <p className="text-center text-xs text-muted mb-2">
                        Your current report stays here while you upgrade.
                    </p>
                )}

                <p className="text-center text-xs text-muted">
                    🔒 No recurring charges • Instant access
                </p>
            </div>
        </div>
    );
}
