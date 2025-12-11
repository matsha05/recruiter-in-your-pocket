"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

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
            <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-modal w-full max-w-[520px] p-8 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={handleClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {getHeaderText()}
                    </h2>
                    <p className="text-gray-500">
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
                                ? "border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                                : "border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                            }`}
                    >
                        <div className="inline-block px-3 py-1 text-[11px] font-semibold uppercase tracking-wide rounded bg-indigo-500 text-white mb-3">
                            Most popular
                        </div>
                        <div className="text-3xl font-extrabold text-indigo-500 mb-1">$9</div>
                        <div className="font-semibold text-gray-900 dark:text-white mb-2">24-Hour Fix Pass</div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Unlimited reports for 24 hours.
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedTier("30d")}
                        className={`flex-1 p-5 rounded-xl text-center transition-all
                            ${selectedTier === "30d"
                                ? "border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"
                                : "border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-400"
                            }`}
                    >
                        <div className="inline-block px-3 py-1 text-[11px] font-semibold uppercase tracking-wide rounded bg-emerald-600 text-white mb-3">
                            Best value
                        </div>
                        <div className="text-3xl font-extrabold text-emerald-600 mb-1">$39</div>
                        <div className="font-semibold text-gray-900 dark:text-white mb-2">30-Day Campaign Pass</div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Unlimited reports for 30 days.
                        </p>
                    </button>
                </div>

                {/* Checkout Section */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 mb-4">
                    {isLoggedIn ? (
                        <>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                You&apos;re getting this pass for <strong className="text-gray-900 dark:text-white">{user.email}</strong>
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                            <p className="text-xs text-gray-500 text-center mt-3">
                                Your email links your pass to any device.
                            </p>
                        </>
                    )}
                </div>

                {error && (
                    <div className="text-red-600 text-sm text-center mb-4">
                        {error}
                    </div>
                )}

                {hasCurrentReport && (
                    <p className="text-center text-xs text-gray-400 mb-2">
                        Your current report stays here while you upgrade.
                    </p>
                )}

                <p className="text-center text-xs text-gray-500">
                    🔒 No recurring charges • Instant access
                </p>
            </div>
        </div>
    );
}
