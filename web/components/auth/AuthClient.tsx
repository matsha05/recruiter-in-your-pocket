"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, ArrowRight, Check } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";

// Contextual messaging based on where user came from
function getContextualCopy(from: string | null): { headline: string; subtext: string } {
    switch (from) {
        case "report":
            return {
                headline: "Sign in to save your report",
                subtext: "Keep this report and track improvements over time."
            };
        case "settings":
            return {
                headline: "Sign in to manage your reviews",
                subtext: "Access your credits and billing history."
            };
        case "paywall":
            return {
                headline: "Sign in to use your credits",
                subtext: "Your purchased reviews are linked to your account."
            };
        default:
            return {
                headline: "Welcome Back",
                subtext: "Sign in to access your reports and history."
            };
    }
}

export default function AuthClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get("from");
    const contextCopy = getContextualCopy(from);

    const [step, setStep] = useState<"email" | "otp">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createSupabaseBrowserClient();

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
            });

            if (error) throw error;
            setStep("otp");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to send code.");
        } finally {
            setLoading(false);
        }
    };

    const verifyToken = async (token: string) => {
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: "email"
            });

            if (error) throw error;

            // Wait for session to be established and refresh router
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.refresh(); // Ensure server components re-run
                // Redirect back to origin or workspace
                router.push(from === "settings" ? "/settings" : "/workspace");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Invalid code. Please try again.");
            setLoading(false);
        }
    };

    const handleVerifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        verifyToken(otp);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 bg-background">

            <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-display font-medium text-foreground tracking-tight">{contextCopy.headline}</h1>
                    <p className="text-lg text-muted-foreground/80">{contextCopy.subtext}</p>
                </div>

                <div className="bg-card border border-border/60 rounded p-8">
                    {step === "email" ? (
                        <form onSubmit={handleSendCode} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-label text-foreground/70">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-brand" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-background border border-border/60 rounded text-base focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand/40 transition-all placeholder:text-muted-foreground/30"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            {error && <p className="text-xs text-destructive font-medium flex items-center gap-1 bg-destructive/5 p-2 rounded"><span className="w-1 h-1 bg-destructive rounded-full" />{error}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-brand text-white rounded text-sm font-medium hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Login Code <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifySubmit} className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-label text-foreground/70">Login Code</label>
                                    <button
                                        type="button"
                                        onClick={() => setStep("email")}
                                        className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Change email
                                    </button>
                                </div>
                                <div className="p-3 bg-secondary/30 rounded text-center border border-border/5 mb-2">
                                    <p className="text-xs text-muted-foreground">
                                        Checking <span className="font-medium text-foreground">{email}</span>
                                    </p>
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="1 2 3 4 5 6 7 8"
                                    value={otp}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setOtp(val);
                                        if (val.length === 8) {
                                            verifyToken(val);
                                        }
                                    }}
                                className="w-full px-4 py-4 bg-background border border-border/10 rounded text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand/40 transition-colors"
                                    autoFocus
                                    maxLength={8}
                                />
                            </div>
                            {error && <p className="text-xs text-destructive font-medium flex items-center gap-1 bg-destructive/5 p-2 rounded"><span className="w-1 h-1 bg-destructive rounded-full" />{error}</p>}
                            <button
                                type="submit"
                                disabled={loading || otp.length < 8}
                                className="w-full py-3 bg-brand text-white rounded text-sm font-medium hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify & Sign In <Check className="w-4 h-4" /></>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
