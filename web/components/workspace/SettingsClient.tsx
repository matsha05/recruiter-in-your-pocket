"use client";

import { useState, useEffect } from "react";
import { Check, CreditCard, Clock, FileText, Zap, Loader2, Crown } from "lucide-react";
import { InsightSparkleIcon, PocketMark } from "@/components/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";

export default function SettingsClient() {
    const { user, refreshUser } = useAuth();
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
    const [isLoading, setIsLoading] = useState<string | null>(null); // "single" or "monthly"

    const [showEmailInput, setShowEmailInput] = useState<"single" | "monthly" | null>(null);
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

    const onCheckoutClick = (tier: "single" | "monthly") => {
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

    const handleCheckout = async (tier: "single" | "monthly", email: string) => {
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
                        <span className="font-display font-medium text-xl text-foreground">Pocket</span>
                        <span className="text-muted-foreground/30 text-xl font-light">/</span>
                        <span className="font-display text-lg text-foreground/80">Settings</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold hidden sm:block">
                        Secured by Stripe
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">

                {/* 1. Account Overview */}
                <section className="space-y-8">
                    <div className="flex items-start gap-6">
                        {/* Premium Avatar */}
                        <div className="w-20 h-20 rounded-md bg-brand flex items-center justify-center text-white font-display font-semibold text-2xl select-none shrink-0 shadow-lg shadow-brand/20">
                            {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                        </div>

                        <div className="flex-1 space-y-6 pt-1">
                            {/* Name Field */}
                            <div className="max-w-md">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Display Name</label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="flex-1 bg-background border border-border/20 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
                                    />
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSavingProfile || !displayName.trim() || displayName === user?.firstName}
                                        className="px-5 py-2.5 bg-brand text-white hover:opacity-90 rounded-md font-medium text-sm transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSavingProfile && <Loader2 className="w-3 h-3 animate-spin" />}
                                        Save
                                    </button>
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="max-w-md">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Email</label>
                                <div className="text-sm text-foreground bg-secondary/20 px-4 py-2.5 rounded-md border border-border/10">
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
                            <h2 className="text-2xl font-display font-medium text-foreground">Available Plans</h2>
                            <p className="text-sm text-muted-foreground mt-1">Unlock Principal Recruiter analysis for every application.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 items-stretch">
                        {/* TIER 1: Quick Fix ($9) */}
                        <div className="p-8 rounded-md border border-border/10 bg-secondary/10 hover:bg-secondary/20 transition-colors flex flex-col">
                            <div className="mb-6">
                                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Quick Fix</div>
                                <div className="text-4xl font-display font-bold text-foreground">$9</div>
                                <p className="text-sm text-muted-foreground mt-2">One scan. See what recruiters see.</p>
                            </div>
                            <ul className="space-y-4 mb-8 text-sm text-foreground/80 font-medium flex-1">
                                <FeatureItem text="1 Full Audit + Rewrites" icon={Check} />
                                <FeatureItem text="PDF Export" icon={Check} />
                                <FeatureItem text="Lifetime access to report" icon={Check} />
                            </ul>
                            <button
                                onClick={() => onCheckoutClick("single")}
                                disabled={!!isLoading}
                                className="w-full py-3 px-4 rounded-md border border-border/10 bg-background font-medium text-sm hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading === "single" && <Loader2 className="w-4 h-4 animate-spin" />}
                                Get Quick Fix
                            </button>
                        </div>

                        {/* TIER 2: Job Search Pass ($29) - HIGHLIGHTED */}
                        <div className="relative p-8 rounded-md border-2 border-premium bg-background shadow-[0_0_40px_-10px_rgba(251,191,36,0.15)] flex flex-col">
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-premium to-transparent" />
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-premium text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-sm shadow-lg flex items-center gap-1.5">
                                <Crown className="w-3 h-3 fill-white" /> Best Value
                            </div>

                            <div className="mb-6">
                                <div className="text-xs font-bold uppercase tracking-widest text-premium mb-2">Job Search Pass</div>
                                <div className="text-4xl font-display font-bold text-foreground">$29<span className="text-sm font-sans font-medium text-muted-foreground ml-1">/mo</span></div>
                                <p className="text-sm text-muted-foreground mt-2">Unlimited audits for active job seekers.</p>
                            </div>
                            <ul className="space-y-3 mb-8 text-sm text-foreground font-medium flex-1">
                                <FeatureItem text="Unlimited Full Audits" icon={InsightSparkleIcon} accent="gold" />
                                <FeatureItem text="Before & After Rewrites" />
                                <FeatureItem text="PDF Report Export" />
                                <FeatureItem text="Saved Report History" />
                                <FeatureItem text="Job-Specific Calibration" />
                                <FeatureItem text="Priority Analysis Speed" />
                            </ul>
                            <button
                                onClick={() => onCheckoutClick("monthly")}
                                disabled={!!isLoading}
                                className="w-full py-3 px-4 rounded-md bg-premium text-white font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-premium/20 flex items-center justify-center gap-2"
                            >
                                {isLoading === "monthly" && <Loader2 className="w-4 h-4 animate-spin" />}
                                Start Job Search Pass
                            </button>
                        </div>
                    </div>

                    <div className="mt-12 text-center border-t border-border/50 pt-8">
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                            <strong>100% Satisfaction Guarantee:</strong> If you don't feel more confident after your first report, email us within 24h for a full refund.
                        </p>
                    </div>
                </section>

                {/* 3. Billing History */}
                <section className="space-y-6 pt-12 border-t border-border/50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-foreground">Billing History</h2>
                    </div>

                    <div className="bg-card border border-border/10 rounded-md overflow-hidden">
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
                                                        {pass.tier === "monthly" ? "Job Search Pass" : "Quick Fix"}
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
                                                        ? "bg-success/10 text-success"
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
                            className="text-xs px-4 py-2 border border-border/10 rounded-md text-muted-foreground hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all font-medium"
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
