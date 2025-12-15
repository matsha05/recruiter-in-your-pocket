"use client";

import { useState, useEffect } from "react";
import { Check, Sparkles, CreditCard, Clock, FileText, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
                        <span className="font-serif italic font-semibold text-xl text-foreground">Pocket</span>
                        <span className="text-muted-foreground">/</span>
                        <h1 className="font-medium text-sm text-foreground">Settings</h1>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold hidden sm:block">
                        Secured by Stripe
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">

                {/* 1. Account Overview */}
                <section className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center text-foreground font-serif italic text-2xl select-none shrink-0 border border-border/50">
                            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="space-y-4 flex-1 max-w-sm">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Display Name</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="flex-1 bg-secondary/30 border-0 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                    />
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSavingProfile || !displayName.trim() || displayName === user?.firstName}
                                        className="text-xs px-4 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSavingProfile && <Loader2 className="w-3 h-3 animate-spin" />}
                                        Save
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Email</label>
                                <div className="text-sm font-medium text-muted-foreground bg-secondary/30 px-3 py-2 rounded-lg border-0">
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
                            <h2 className="text-2xl font-serif font-medium text-foreground">Available Plans</h2>
                            <p className="text-sm text-muted-foreground mt-1">Unlock Principal Recruiter analysis for every application.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Free / Pay As You Go */}
                        <div className="bg-gradient-to-br from-moss/5 to-transparent border border-moss/30 rounded-2xl p-8 flex flex-col relative overflow-hidden ring-1 ring-moss/10 shadow-[0_8px_32px_rgba(16,185,129,0.04)] group">
                            <div className="mb-6">
                                <h3 className="font-bold text-moss uppercase tracking-widest text-[10px] mb-2">Basic</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-serif font-medium text-foreground">$19</span>
                                    <span className="text-muted-foreground font-medium">/ report</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                    Perfect for a sanity check before a big application.
                                </p>
                            </div>

                            <div className="space-y-4 flex-1">
                                <FeatureItem text="Single Resume Audit" icon={Check} accent="moss" />
                                <FeatureItem text="6-Second Recruiter Scan" icon={Check} accent="moss" />
                                <FeatureItem text="Fix-It Instructions" icon={Check} accent="moss" />
                            </div>

                            <button
                                onClick={() => onCheckoutClick("24h")}
                                disabled={!!isLoading}
                                className="mt-8 w-full py-3 rounded-xl bg-moss text-white hover:opacity-90 font-bold text-sm shadow-sm transition-opacity flex items-center justify-center gap-2"
                            >
                                {isLoading === "24h" && <Loader2 className="w-4 h-4 animate-spin" />}
                                Buy Single Pass
                            </button>
                        </div>

                        {/* Pro Subscription */}
                        <div className="bg-gradient-to-br from-premium-accent/5 to-transparent border border-premium-accent/30 rounded-2xl p-8 flex flex-col relative overflow-hidden ring-1 ring-premium-accent/10 shadow-[0_8px_32px_rgba(255,215,0,0.04)]">
                            <div className="absolute top-0 right-0 p-6">
                                <Sparkles className="w-5 h-5 text-premium-accent fill-premium-accent/20" />
                            </div>

                            <div className="mb-6">
                                <h3 className="font-bold text-premium-accent uppercase tracking-widest text-[10px] mb-2">Pro Membership</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-serif font-medium text-foreground">$29</span>
                                    <span className="text-muted-foreground font-medium">/ month</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                    Continuous improvement for active job seekers.
                                </p>
                            </div>

                            <div className="space-y-4 flex-1">
                                <FeatureItem text="Unlimited Reports" icon={Zap} highlight />
                                <FeatureItem text="Priority Processing" highlight />
                                <FeatureItem text="Compare Versions" highlight />
                                <FeatureItem text="PDF Export" highlight />
                            </div>

                            <button
                                onClick={() => onCheckoutClick("30d")}
                                disabled={!!isLoading}
                                className="mt-8 w-full py-3 rounded-xl bg-premium-accent text-primary-foreground hover:opacity-90 font-bold text-sm shadow-sm transition-opacity flex items-center justify-center gap-2"
                            >
                                {isLoading === "30d" && <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />}
                                Upgrade to Pro
                            </button>
                        </div>
                    </div>
                </section>

                {/* 3. Billing History */}
                <section className="space-y-6 pt-12 border-t border-border/50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-foreground">Billing History</h2>
                    </div>

                    <div className="bg-card border border-border/30 rounded-2xl overflow-hidden">
                        {loadingPasses ? (
                            <div className="p-12 text-center text-muted-foreground text-sm">Loading history...</div>
                        ) : passes.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground text-sm">
                                <Clock className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                <p>No invoices found.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/30">
                                {passes.map((pass) => {
                                    const isActive = new Date(pass.expires_at) > new Date();
                                    return (
                                        <div key={pass.id} className="p-6 flex items-center justify-between hover:bg-secondary/30 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground/70 group-hover:bg-background transition-colors">
                                                    {pass.tier === "30d" ? <Zap className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">
                                                        {pass.tier === "30d" ? "Pro Membership" : "Single Audit Pass"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-variant-numeric tabular-nums font-medium opacity-60">
                                                        {new Date(pass.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={cn(
                                                    "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold",
                                                    isActive
                                                        ? "bg-status-success/10 text-status-success"
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
                <section className="pt-16 border-t border-border/50">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity duration-300">
                        <div>
                            <h3 className="text-sm font-medium text-destructive mb-1">Danger Zone</h3>
                            <p className="text-xs text-muted-foreground">
                                Permanently delete your account and all data.
                            </p>
                        </div>
                        <button
                            onClick={() => toast.info("Please email privacy@recruiterinyourpocket.com to process deletion requests safely.")}
                            className="text-xs px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all font-medium"
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

function FeatureItem({ text, icon: Icon = Check, highlight = false, accent }: { text: string; icon?: any; highlight?: boolean; accent?: "moss" | "gold" }) {
    const getIconColor = () => {
        if (accent === "moss") return "text-moss";
        if (accent === "gold" || highlight) return "text-premium-accent";
        return "text-muted-foreground/50";
    };

    return (
        <div className={cn("flex items-center gap-3 text-sm", (highlight || accent) ? "text-foreground" : "text-muted-foreground")}>
            <Icon className={cn("w-4 h-4 shrink-0", getIconColor())} />
            <span>{text}</span>
        </div>
    );
}
