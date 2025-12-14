"use client";

import { useState, useEffect } from "react";
import { Check, Sparkles, CreditCard, Clock, FileText, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";

export default function SettingsClient() {
    const { user, refreshUser } = useAuth();
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
    const [isLoading, setIsLoading] = useState<string | null>(null); // "24h" or "30d"

    const [showEmailInput, setShowEmailInput] = useState<"24h" | "30d" | null>(null);
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
            alert("Profile updated successfully");
        } catch (err: any) {
            console.error("Profile update error:", err);
            alert(err.message || "Failed to update profile");
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

    const onCheckoutClick = (tier: "24h" | "30d") => {
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

    const handleCheckout = async (tier: "24h" | "30d", email: string) => {
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
            alert(err.message || "Something went wrong. Please try again.");
            setIsLoading(null);
            setShowEmailInput(null);
        }
    };

    return (
        <div className="min-h-screen bg-muted/10 pb-20">
            {/* Header */}
            <header className="bg-background border-b border-border sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="font-serif font-semibold text-xl text-foreground">Settings</h1>
                    <div className="text-xs text-muted-foreground font-medium hidden sm:block">
                        Secured by Stripe
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">

                {/* 1. Account Overview */}
                <section className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl select-none shrink-0">
                            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="space-y-4 flex-1 max-w-sm">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Display Name</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSavingProfile || !displayName.trim() || displayName === user?.firstName}
                                        className="text-xs px-3 py-2 bg-muted hover:bg-muted/80 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSavingProfile && <Loader2 className="w-3 h-3 animate-spin" />}
                                        Save
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Email</label>
                                <div className="text-sm font-medium text-foreground bg-muted/30 px-3 py-2 rounded-md border border-transparent">
                                    {user?.email}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Plans & Upgrades */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-serif font-semibold text-foreground">Available Plans</h2>
                            <p className="text-sm text-muted-foreground mt-1">Unlock Principal Recruiter analysis for every application.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Free / Pay As You Go */}
                        <div className="bg-background border border-border rounded-xl p-8 flex flex-col relative overflow-hidden">
                            <div className="mb-6">
                                <h3 className="font-medium text-muted-foreground uppercase tracking-wider text-xs mb-2">Basic</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-serif font-bold text-foreground">$19</span>
                                    <span className="text-muted-foreground">/ report</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-3">
                                    Perfect for a sanity check before a big application.
                                </p>
                            </div>

                            <div className="space-y-3 flex-1">
                                <FeatureItem text="Single Resume Audit" />
                                <FeatureItem text="6-Second Recruiter Scan" />
                                <FeatureItem text="Fix-It Instructions" />
                            </div>

                            <button
                                onClick={() => onCheckoutClick("24h")}
                                disabled={!!isLoading}
                                className="mt-8 w-full py-2.5 rounded-lg border border-border bg-background hover:bg-muted font-medium text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading === "24h" && <Loader2 className="w-4 h-4 animate-spin" />}
                                Buy Single Pass
                            </button>
                        </div>

                        {/* Pro Subscription */}
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 flex flex-col relative overflow-hidden ring-1 ring-primary/10">
                            <div className="absolute top-0 right-0 p-4">
                                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                            </div>

                            <div className="mb-6">
                                <h3 className="font-medium text-primary uppercase tracking-wider text-xs mb-2">Pro Membership</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-serif font-bold text-foreground">$29</span>
                                    <span className="text-muted-foreground">/ month</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-3">
                                    Continuous improvement for active job seekers.
                                </p>
                            </div>

                            <div className="space-y-3 flex-1">
                                <FeatureItem text="Unlimited Reports" icon={Zap} />
                                <FeatureItem text="Priority Processing" />
                                <FeatureItem text="Compare Versions" />
                                <FeatureItem text="PDF Export" />
                            </div>

                            <button
                                onClick={() => onCheckoutClick("30d")}
                                disabled={!!isLoading}
                                className="mt-8 w-full py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 font-medium text-sm shadow-sm transition-opacity flex items-center justify-center gap-2"
                            >
                                {isLoading === "30d" && <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />}
                                Upgrade to Pro
                            </button>
                        </div>
                    </div>
                </section>

                {/* 3. Billing History */}
                <section className="space-y-6 pt-8 border-t border-border/50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-foreground">Billing History</h2>
                    </div>

                    <div className="bg-background border border-border rounded-lg overflow-hidden">
                        {loadingPasses ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">Loading history...</div>
                        ) : passes.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                <Clock className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                <p>No invoices found.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {passes.map((pass) => {
                                    const isActive = new Date(pass.expires_at) > new Date();
                                    return (
                                        <div key={pass.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                                                    {pass.tier === "30d" ? <Zap className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">
                                                        {pass.tier === "30d" ? "Pro Membership" : "Single Audit Pass"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(pass.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={cn(
                                                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                                    isActive
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                        : "bg-muted text-muted-foreground"
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
                <section className="pt-12 border-t border-border/50">
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
                        <h3 className="text-destructive font-medium mb-2">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Permanently delete your account and all report history. This action cannot be undone.
                        </p>
                        <button
                            onClick={() => alert("Please email support@recruiterinyourpocket.com to process deletion requests safely.")}
                            className="text-sm px-4 py-2 bg-background border border-destructive/30 text-destructive rounded-md hover:bg-destructive/10 transition-colors font-medium"
                        >
                            Delete Account
                        </button>
                    </div>
                </section>
                {/* Email Prompt Modal */}
                {showEmailInput && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-card border border-border shadow-lg rounded-xl w-full max-w-md p-6 space-y-6 animate-in zoom-in-95 duration-200">
                            <div className="space-y-2 text-center">
                                <h3 className="text-xl font-serif font-semibold">Where should we send your receipt?</h3>
                                <p className="text-muted-foreground text-sm">
                                    We'll link your pass to this email. You can create a password later.
                                </p>
                            </div>

                            <form onSubmit={handleGuestSubmit} className="space-y-4">
                                <input
                                    type="email"
                                    required
                                    placeholder="recruiter@example.com"
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!guestEmail || !!isLoading}
                                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
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

function FeatureItem({ text, icon: Icon = Check }: { text: string; icon?: any }) {
    return (
        <div className="flex items-center gap-3 text-sm text-foreground/80">
            <Icon className="w-4 h-4 text-primary shrink-0" />
            <span>{text}</span>
        </div>
    );
}
