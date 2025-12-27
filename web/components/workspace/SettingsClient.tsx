"use client";

import { useState, useEffect } from "react";
import { Check, CreditCard, Clock, FileText, Zap, Loader2 } from "lucide-react";
import { InsightSparkleIcon, PocketMark, Wordmark } from "@/components/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";

export default function SettingsClient() {
    const { user, refreshUser } = useAuth();
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
    const [isLoading, setIsLoading] = useState<string | null>(null); // "single" or "pack"

    const [showEmailInput, setShowEmailInput] = useState<"single" | "pack" | null>(null);
    const [guestEmail, setGuestEmail] = useState("");
    const [passes, setPasses] = useState<any[]>([]);
    const [loadingPasses, setLoadingPasses] = useState(false);

    // Profile State
    const [displayName, setDisplayName] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    useEffect(() => {
        if (user) {
            setDisplayName(user.firstName || "");
        }
    }, [user]);

    const handleSaveProfile = async () => {
        if (!displayName.trim()) return;
        setIsSavingProfile(true);
        try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.auth.updateUser({
                data: { first_name: displayName }
            });

            if (error) throw error;

            await refreshUser?.();
            toast.success("Profile updated successfully");
        } catch (err: any) {
            console.error("Profile update error:", err);
            toast.error(err.message || "Failed to update profile");
        } finally {
            setIsSavingProfile(false);
        }
    };

    useEffect(() => {
        if (user?.email) {
            setLoadingPasses(true);
            fetch("/api/passes")
                .then(res => res.json())
                .then(data => {
                    if (data.ok) setPasses(data.passes);
                })
                .catch(console.error)
                .finally(() => setLoadingPasses(false));
        }
    }, [user?.email]);

    const onCheckoutClick = (tier: "single" | "pack") => {
        if (user?.email) {
            handleCheckout(tier, user.email);
        } else {
            setShowEmailInput(tier);
        }
    };

    const handleGuestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (showEmailInput && guestEmail) {
            handleCheckout(showEmailInput, guestEmail);
        }
    };

    const handleCheckout = async (tier: "single" | "pack", email: string) => {
        try {
            setIsLoading(tier);
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    tier: tier
                })
            });

            const data = await res.json();
            if (data.ok && data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.message || "Checkout failed");
            }
        } catch (err: any) {
            console.error("Checkout error:", err);
            toast.error(err.message || "Something went wrong. Please try again.");
            setIsLoading(null);
            setShowEmailInput(null);
        }
    };

    return (
        <div className="min-h-screen bg-muted/10 pb-20">
            {/* Header */}
            <header className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5 text-brand" />
                        <Wordmark className="h-5 text-foreground" />
                        <span className="text-muted-foreground/30 text-xl font-light">/</span>
                        <span className="font-display text-lg text-foreground/80">Settings</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold hidden sm:block">
                        Secured by Stripe
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">

                {/* 0. Credits Summary Card - Quick Status */}
                <section className="bg-card border border-border/60 rounded-lg p-6 md:p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="space-y-3">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Reviews</h2>
                            {user ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        {/* Visual dots - show filled for available, empty for used */}
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-3 h-3 rounded-full ${i < (user.freeUsesLeft ?? 0) ? 'bg-brand' : 'bg-border/30'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-lg font-semibold text-foreground">
                                            {user.freeUsesLeft ?? 0} available
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {(user.freeUsesLeft ?? 0) > 0
                                            ? "Your first review is free"
                                            : "Unlock more reviews to keep improving"}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-lg font-semibold text-foreground">
                                        1 free review included
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Sign in to run your first review
                                    </p>
                                </>
                            )}
                        </div>
                        {user && (user.freeUsesLeft ?? 0) === 0 ? (
                            <a
                                href="#pricing"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded text-sm font-medium bg-premium-accent text-white hover:bg-premium-accent/90 transition-colors whitespace-nowrap"
                            >
                                Get More Reviews →
                            </a>
                        ) : (
                            <a
                                href="/workspace"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded text-sm font-medium bg-brand text-white hover:bg-brand/90 transition-colors whitespace-nowrap"
                            >
                                {user ? "Run a Review →" : "Get Started →"}
                            </a>
                        )}
                    </div>
                </section>

                {/* 1. Account Overview */}
                <section className="space-y-8">
                    <div className="flex items-start gap-6 bg-card p-6 rounded-lg border border-border/60 shadow-sm">
                        {/* Premium Avatar */}
                        <div className="w-16 h-16 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-display font-medium text-2xl select-none shrink-0">
                            {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                        </div>

                        <div className="flex-1 space-y-5 pt-1">
                            {/* Name Field */}
                            <div className="max-w-md">
                                <label className="text-label mb-2 block">Display Name</label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="flex-1 bg-background border border-border/20 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand/40 transition-all placeholder:text-muted-foreground/40"
                                    />
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSavingProfile || !displayName.trim() || displayName === user?.firstName}
                                        className="px-4 py-2 bg-secondary text-foreground hover:bg-secondary/80 rounded-md font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 border border-border/10"
                                    >
                                        {isSavingProfile && <Loader2 className="w-3 h-3 animate-spin" />}
                                        Save
                                    </button>
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="max-w-md">
                                <label className="text-label mb-2 block">Email</label>
                                <div className="text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-md border border-border/5">
                                    {user?.email}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Get More Reviews */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-display font-medium text-foreground">How serious is your job search?</h2>
                            <p className="text-sm text-muted-foreground mt-1">Your first review is free. Unlock more to iterate and tailor.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 items-stretch">
                        {/* TIER 1: Quick Check ($9/1) */}
                        <div className="p-8 rounded-lg border border-border/60 bg-card hover:border-border/80 transition-all shadow-sm flex flex-col group">
                            <div className="mb-6">
                                <div className="text-label text-muted-foreground mb-2">Quick Check</div>
                                <div className="text-4xl font-display font-medium text-foreground tracking-tight">$9</div>
                                <p className="text-sm text-muted-foreground mt-2 group-hover:text-foreground transition-colors">Best for first-time feedback</p>
                            </div>
                            <ul className="space-y-4 mb-8 text-sm text-muted-foreground font-medium flex-1">
                                <FeatureItem text="1 full review included" bold />
                                <FeatureItem text="See exactly what recruiters notice in 10 seconds" />
                                <FeatureItem text="Copy-paste rewrites for your weakest bullets" />
                            </ul>
                            <button
                                onClick={() => onCheckoutClick("single")}
                                disabled={!!isLoading}
                                className="w-full py-3 px-4 rounded-md border border-border/60 bg-secondary/50 font-medium text-sm hover:bg-secondary hover:text-foreground transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading === "single" && <Loader2 className="w-4 h-4 animate-spin" />}
                                Unlock 1 Full Review
                            </button>
                        </div>

                        {/* TIER 2: Active Job Search ($29/5) - HIGHLIGHTED */}
                        <div className="relative p-8 rounded-lg border border-brand/20 bg-brand/5 flex flex-col shadow-sm">
                            <div className="absolute -top-3 left-8 bg-brand text-white text-[10px] font-bold uppercase tracking-widest py-0.5 px-2 rounded-sm shadow-sm ring-2 ring-background">
                                Most Popular
                            </div>

                            <div className="mb-6">
                                <div className="text-label text-brand mb-2">Active Job Search</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-display font-medium text-foreground tracking-tight">$29</span>
                                </div>
                                <p className="text-sm text-foreground/80 mt-2">For an active job search</p>
                            </div>
                            <ul className="space-y-4 mb-8 text-sm text-foreground font-medium flex-1">
                                <FeatureItem text="5 full reviews included" bold accent="gold" />
                                <FeatureItem text="Tailor versions for different roles" />
                                <FeatureItem text="Unlock full rewrites and missing wins" />
                                <FeatureItem text="Compare progress across versions" />
                                <FeatureItem text="Export a clean PDF when you're ready" />
                            </ul>
                            <button
                                onClick={() => onCheckoutClick("pack")}
                                disabled={!!isLoading}
                                className="w-full py-3 px-4 rounded-md bg-brand text-white font-medium text-sm hover:opacity-90 transition-all shadow-md shadow-brand/10 flex items-center justify-center gap-2"
                            >
                                {isLoading === "pack" && <Loader2 className="w-4 h-4 animate-spin" />}
                                Start Job Search Mode
                            </button>
                        </div>
                    </div>

                    <div className="mt-12 text-center border-t border-border/10 pt-8">
                        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                            <strong>100% Satisfaction Guarantee:</strong> If you don&apos;t feel more confident after your first review, email us within 24h for a full refund.
                        </p>
                    </div>
                </section>

                {/* 3. Billing History */}
                <section className="space-y-6 pt-12">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-foreground">Billing History</h2>
                    </div>

                    <div className="bg-card border border-border/60 rounded-lg overflow-hidden shadow-sm">
                        {loadingPasses ? (
                            <div className="p-12 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading history...
                            </div>
                        ) : passes.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground/50 text-sm">
                                <Clock className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                <p>No invoices found.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/10">
                                {passes.map((pass) => {
                                    const isActive = new Date(pass.expires_at) > new Date();
                                    return (
                                        <div key={pass.id} className="p-5 flex items-center justify-between hover:bg-secondary/20 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center text-foreground/70 group-hover:bg-background transition-colors border border-transparent group-hover:border-border/10">
                                                    {pass.tier === "30d" ? <Zap className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">
                                                        {pass.tier === "monthly" ? "Job Search Pass" : "Quick Fix"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-variant-numeric tabular-nums font-medium opacity-60">
                                                        {new Date(pass.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={cn(
                                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border",
                                                    isActive
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                        : "bg-secondary text-muted-foreground border-border/10"
                                                )}>
                                                    {isActive ? "Active" : "Expired"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* 4. Danger Zone */}
                <section className="pt-12 pb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded border border-red-100 bg-red-50/30">
                        <div>
                            <h3 className="text-sm font-medium text-red-900 mb-1">Danger Zone</h3>
                            <p className="text-xs text-red-700/80">
                                Permanently delete your account and all associated data.
                            </p>
                        </div>
                        <button
                            onClick={() => toast.info("Please email privacy@recruiterinyourpocket.com to process deletion requests safely.")}
                            className="text-xs px-4 py-2 border border-red-200 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-all font-medium bg-white"
                        >
                            Delete Account
                        </button>
                    </div>
                </section>
                {/* Email Prompt Modal */}
                {showEmailInput && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-card border border-border/10 shadow-lg rounded-md w-full max-w-md p-6 space-y-6 animate-in zoom-in-95 duration-200">
                            <div className="space-y-2 text-center">
                                <h3 className="text-xl font-display font-semibold">Where should we send your receipt?</h3>
                                <p className="text-muted-foreground text-sm">
                                    We&apos;ll link your credits to this email. You can create a password later.
                                </p>
                            </div>

                            <form onSubmit={handleGuestSubmit} className="space-y-4">
                                <input
                                    type="email"
                                    required
                                    placeholder="recruiter@example.com"
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-md border border-border/10 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!guestEmail || !!isLoading}
                                    className="w-full py-3 rounded-md bg-brand text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue to Checkout"}
                                </button>
                            </form>

                            <button
                                onClick={() => setShowEmailInput(null)}
                                className="w-full text-sm text-muted-foreground hover:text-foreground"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function FeatureItem({ text, icon: Icon = Check, highlight = false, accent, bold = false }: { text: string; icon?: any; highlight?: boolean; accent?: "moss" | "gold"; bold?: boolean }) {
    const getIconColor = () => {
        if (accent === "moss") return "text-moss";
        if (accent === "gold" || highlight) return "text-premium-accent";
        return "text-muted-foreground/50";
    };

    return (
        <div className={cn("flex items-center gap-3 text-sm", (highlight || accent) ? "text-foreground" : "text-muted-foreground")}>
            <Icon className={cn("w-4 h-4 shrink-0", getIconColor())} />
            <span className={bold ? "font-semibold text-foreground" : ""}>{text}</span>
        </div>
    );
}
