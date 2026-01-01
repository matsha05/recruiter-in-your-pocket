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
    /** Context for copy customization. 'report' = gating free report, uses value-first copy */
    context?: "default" | "report";
}

export default function AuthModal({ isOpen, onClose, onSuccess, context = "default" }: AuthModalProps) {
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
            <DialogContent className="sm:max-w-md bg-background border border-border/60 shadow-sm p-8 rounded-lg">
                <DialogHeader className="space-y-4">
                    <DialogTitle className="font-display text-3xl font-medium tracking-tight text-center">
                        {step === "email" && (context === "report" ? "See What They See" : "Welcome to the Studio")}
                        {step === "code" && "Check your inbox"}
                        {step === "name" && "One last thing"}
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground text-base">
                        {step === "email" && (context === "report"
                            ? "Enter your email to run your free review."
                            : "Sign in to access your reports and history."
                        )}
                        {step === "code" && (
                            <span>
                                We sent an 8-digit code to <span className="text-foreground font-medium">{email}</span>
                            </span>
                        )}
                        {step === "name" && "What should we call you?"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {error && (
                        <div className="p-3 text-sm text-center text-destructive bg-destructive/10 rounded border border-destructive/20">
                            {error}
                        </div>
                    )}

                    {step === "email" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="sr-only">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                                    autoFocus
                                    className="h-12 text-base bg-secondary/10 border-border/60 focus:ring-brand/20 focus:border-brand/40 placeholder:text-muted-foreground/40"
                                />
                            </div>
                            <Button onClick={handleSendCode} disabled={loading} className="w-full h-12 text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors rounded">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Login Code
                            </Button>
                        </div>
                    )}

                    {step === "code" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code" className="sr-only">Login Code</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    placeholder="00000000"
                                    className="h-14 font-mono tracking-[0.5em] text-center text-2xl bg-secondary/10 border-border/60 focus:ring-brand/20 focus:border-brand/40 placeholder:text-muted-foreground/20"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                                    onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                                    autoFocus
                                />
                            </div>
                            <Button onClick={verifyCode} disabled={loading || code.length !== 8} className="w-full h-12 text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors rounded">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify Code
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-muted-foreground hover:text-foreground hover:bg-transparent"
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
                                <Label htmlFor="fname" className="sr-only">First Name</Label>
                                <Input
                                    id="fname"
                                    type="text"
                                    placeholder="Jane"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                                    autoFocus
                                    className="h-12 text-base bg-secondary/10 border-border/60 focus:ring-brand/20 focus:border-brand/40"
                                />
                            </div>
                            <Button onClick={handleSaveName} disabled={loading || !firstName.trim()} className="w-full h-12 text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors rounded">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Continue to Studio
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-muted-foreground hover:text-foreground"
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
                <div className="text-[10px] text-center text-muted-foreground/50 uppercase tracking-wider font-medium">
                    Secure Login • No Password Required
                </div>
            </DialogContent>
        </Dialog>
    );
}
