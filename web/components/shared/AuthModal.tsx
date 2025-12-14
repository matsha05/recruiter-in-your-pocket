"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { Loader2 } from "lucide-react";

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
    const [, setIsNewUser] = useState(false);

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
                body: JSON.stringify({ email: email.trim(), code: code.trim() }),
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
                body: JSON.stringify({ email: email.trim() }),
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
                data: { first_name: firstName.trim() },
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

    const handleClose = useCallback(() => {
        setEmail("");
        setCode("");
        setFirstName("");
        setStep("email");
        setError(null);
        setIsNewUser(false);
        onClose();
    }, [onClose]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">
                        {step === "email" && "Sign in or create account"}
                        {step === "code" && "Check your email"}
                        {step === "name" && "One last thing"}
                    </DialogTitle>
                    <DialogDescription>
                        {step === "email" && "We'll send you a login code. No password needed."}
                        {step === "code" && `We sent an 8-digit code to ${email}`}
                        {step === "name" && "What should we call you?"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                            {error}
                        </div>
                    )}

                    {step === "email" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                                    autoFocus
                                />
                            </div>
                            <Button onClick={handleSendCode} disabled={loading} className="w-full" variant="studio">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Login Code
                            </Button>
                        </div>
                    )}

                    {step === "code" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Login Code</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    placeholder="00000000"
                                    className="font-mono tracking-widest text-center text-lg"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                                    onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                                    autoFocus
                                />
                            </div>
                            <Button onClick={verifyCode} disabled={loading || code.length !== 8} className="w-full" variant="studio">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify Code
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => {
                                    setStep("email");
                                    setCode("");
                                    setError(null);
                                    isVerifyingRef.current = false;
                                }}
                            >
                                Use a different email
                            </Button>
                        </div>
                    )}

                    {step === "name" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fname">First Name</Label>
                                <Input
                                    id="fname"
                                    type="text"
                                    placeholder="Jane"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                                    autoFocus
                                />
                            </div>
                            <Button onClick={handleSaveName} disabled={loading || !firstName.trim()} className="w-full" variant="studio">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Continue to Studio
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => {
                                    onSuccess?.();
                                    handleClose();
                                }}
                            >
                                Skip for now
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer Note */}
                <div className="text-[11px] text-center text-muted-foreground">
                    By continuing, you agree to our Terms and Privacy Policy.
                </div>
            </DialogContent>
        </Dialog>
    );
}
