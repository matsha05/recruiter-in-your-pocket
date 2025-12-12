"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [firstName, setFirstName] = useState("");
    const [step, setStep] = useState<"email" | "code" | "name">("email");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isNewUser, setIsNewUser] = useState(false);

    // Prevent double-submit on auto-verify
    const isVerifyingRef = useRef(false);

    // Define verifyCode as useCallback so it can be used in useEffect
    const verifyCode = useCallback(async () => {
        if (!code.trim() || loading) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), code: code.trim() })
            });
            const data = await res.json();

            if (data.ok) {
                // Check if user already has a first name set
                if (data.user?.firstName) {
                    // Existing user with name - done!
                    onSuccess?.();
                    onClose();
                } else {
                    // New user or no name yet - ask for name
                    setIsNewUser(true);
                    setStep("name");
                }
            } else {
                setError(data.message || "Invalid code");
                // Reset the ref so user can try again
                isVerifyingRef.current = false;
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            isVerifyingRef.current = false;
        } finally {
            setLoading(false);
        }
    }, [code, email, loading, onClose, onSuccess]);

    // Auto-submit when code is complete (8 digits)
    useEffect(() => {
        if (step === "code" && code.length === 8 && !loading && !isVerifyingRef.current) {
            isVerifyingRef.current = true;
            verifyCode();
        }
    }, [code, step, loading, verifyCode]);

    if (!isOpen) return null;

    const handleSendCode = async () => {
        if (!email.trim()) {
            setError("Please enter your email");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() })
            });
            const data = await res.json();

            if (data.ok) {
                setStep("code");
            } else {
                setError(data.message || "Failed to send code");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    const handleSaveName = async () => {
        if (!firstName.trim()) {
            setError("Please enter your first name");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const supabase = createSupabaseBrowserClient();
            const { error: updateError } = await supabase.auth.updateUser({
                data: { first_name: firstName.trim() }
            });

            if (updateError) {
                setError(updateError.message);
                return;
            }

            onSuccess?.();
            onClose();
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail("");
        setCode("");
        setFirstName("");
        setStep("email");
        setError(null);
        setIsNewUser(false);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="bg-surface rounded-2xl shadow-modal w-full max-w-[400px] p-8 relative">
                <button
                    onClick={handleClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 text-muted hover:text-primary transition-colors p-2"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>

                <div className="text-center mb-6">
                    <h2 className="font-display text-xl font-bold text-primary mb-2">
                        {step === "email" && "Sign in or create account"}
                        {step === "code" && "Check your email"}
                        {step === "name" && "One last thing"}
                    </h2>
                    <p className="text-muted text-sm">
                        {step === "email" && "We'll send you a login code. No password needed."}
                        {step === "code" && `We sent an 8-digit code to ${email}`}
                        {step === "name" && "What should we call you?"}
                    </p>
                </div>

                {step === "email" && (
                    <div className="space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="input"
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                        />

                        {error && (
                            <div className="text-danger text-sm text-center">{error}</div>
                        )}

                        <button
                            onClick={handleSendCode}
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? "Sending..." : "Send Code"}
                        </button>
                    </div>
                )}

                {step === "code" && (
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                            placeholder="00000000"
                            className="input text-center text-2xl tracking-widest font-mono"
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                        />

                        {error && (
                            <div className="text-danger text-sm text-center">{error}</div>
                        )}

                        <button
                            onClick={verifyCode}
                            disabled={loading || code.length !== 8}
                            className="btn-primary w-full"
                        >
                            {loading ? "Verifying..." : "Verify Code"}
                        </button>

                        <button
                            onClick={() => { setStep("email"); setCode(""); setError(null); isVerifyingRef.current = false; }}
                            className="btn-ghost w-full text-sm"
                        >
                            Use a different email
                        </button>
                    </div>
                )}

                {step === "name" && (
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Your first name"
                            className="input"
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                        />

                        {error && (
                            <div className="text-danger text-sm text-center">{error}</div>
                        )}

                        <button
                            onClick={handleSaveName}
                            disabled={loading || !firstName.trim()}
                            className="btn-primary w-full"
                        >
                            {loading ? "Saving..." : "Continue"}
                        </button>

                        <button
                            onClick={() => {
                                // Skip name - just close
                                onSuccess?.();
                                onClose();
                            }}
                            className="btn-ghost w-full text-sm"
                        >
                            Skip for now
                        </button>
                    </div>
                )}

                <p className="text-center text-xs text-muted mt-4">
                    By continuing, you agree to our Terms and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
