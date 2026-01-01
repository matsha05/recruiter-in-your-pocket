"use client";

import { useState, useEffect } from "react";
import { Clock, FileText, Zap, Loader2, User, Target, Receipt } from "lucide-react";
import { PocketMark, Wordmark } from "@/components/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import DefaultResumeSection from "@/components/settings/DefaultResumeSection";
import { PricingCard, type PricingTier } from "@/components/shared/PricingCard";

type Tab = "account" | "matching" | "billing";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "account", label: "Account", icon: User },
    { id: "matching", label: "Matching", icon: Target },
    { id: "billing", label: "Billing", icon: Receipt },
];

export default function SettingsClient() {
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("account");
    const [isLoading, setIsLoading] = useState<PricingTier | null>(null);
    const [showEmailInput, setShowEmailInput] = useState<PricingTier | null>(null);
    const [guestEmail, setGuestEmail] = useState("");
    const [passes, setPasses] = useState<any[]>([]);
    const [loadingPasses, setLoadingPasses] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    useEffect(() => {
        if (user) setDisplayName(user.firstName || "");
    }, [user]);

    const handleSaveProfile = async () => {
        if (!displayName.trim()) return;
        setIsSavingProfile(true);
        try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.auth.updateUser({ data: { first_name: displayName } });
            if (error) throw error;
            await refreshUser?.();
            toast.success("Profile updated");
        } catch (err: any) {
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
                .then(data => { if (data.ok) setPasses(data.passes); })
                .catch(console.error)
                .finally(() => setLoadingPasses(false));
        }
    }, [user?.email]);

    const handleCheckout = async (tier: PricingTier) => {
        const email = user?.email || guestEmail;
        if (!email) {
            setShowEmailInput(tier);
            return;
        }
        try {
            setIsLoading(tier);
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, tier })
            });
            const data = await res.json();
            if (data.ok && data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.message || "Checkout failed");
            }
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setIsLoading(null);
            setShowEmailInput(null);
        }
    };

    const handleGuestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (showEmailInput && guestEmail) handleCheckout(showEmailInput);
    };

    return (
        <div className="min-h-screen bg-muted/10 pb-20">
            {/* Header */}
            <header className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5 text-brand" />
                        <Wordmark className="h-5 text-foreground" />
                        <span className="text-muted-foreground/30 text-xl font-light">/</span>
                        <span className="font-display text-lg text-foreground/80">Settings</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-8">
                {/* Tab Navigation */}
                <nav className="flex gap-1 mb-8 relative">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative rounded-t",
                                activeTab === id
                                    ? "text-foreground bg-background border-t border-x border-border/60"
                                    : "text-muted-foreground hover:text-foreground/80"
                            )}
                            style={{ marginBottom: activeTab === id ? "-1px" : "0" }}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-border/60" />
                </nav>

                {/* Tab Content */}
                <div className="space-y-8">
                    {/* ACCOUNT TAB */}
                    {activeTab === "account" && (
                        <div className="space-y-8 animate-in fade-in duration-200">
                            <section className="bg-card border border-border/60 rounded p-6">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">Profile</h2>
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-display font-medium text-xl select-none shrink-0">
                                        {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                                    </div>
                                    <div className="flex-1 space-y-5">
                                        <div className="max-w-sm">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Display Name</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={displayName}
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                    placeholder="Your name"
                                                    className="flex-1 bg-background border border-border/40 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                                                />
                                                <button
                                                    onClick={handleSaveProfile}
                                                    disabled={isSavingProfile || !displayName.trim() || displayName === user?.firstName}
                                                    className="px-3 py-2 bg-secondary hover:bg-secondary/80 rounded font-medium text-sm transition-all disabled:opacity-40 flex items-center gap-1.5"
                                                >
                                                    {isSavingProfile && <Loader2 className="w-3 h-3 animate-spin" />}
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                        <div className="max-w-sm">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Email</label>
                                            <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded">{user?.email}</div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="p-4 rounded border border-destructive/20 bg-destructive/5">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-destructive mb-0.5">Delete Account</h3>
                                        <p className="text-xs text-destructive/70">Permanently delete your account and all data.</p>
                                    </div>
                                    <button
                                        onClick={() => toast.info("Email privacy@recruiterinyourpocket.com")}
                                        className="text-xs px-3 py-1.5 border border-destructive/30 rounded text-destructive hover:bg-destructive/10 font-medium bg-background shrink-0"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* MATCHING TAB */}
                    {activeTab === "matching" && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="mb-2">
                                <h2 className="text-lg font-medium text-foreground">Job Matching</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Upload your resume to get instant match scores from the Chrome extension.
                                </p>
                            </div>
                            <DefaultResumeSection />
                        </div>
                    )}

                    {/* BILLING TAB */}
                    {activeTab === "billing" && (
                        <div className="space-y-10 animate-in fade-in duration-200">
                            {/* Credits */}
                            <section className="bg-card border border-border/60 rounded p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Your Reviews</h2>
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className={cn("w-2 h-2 rounded-full", i < (user?.freeUsesLeft ?? 0) ? "bg-brand" : "bg-border/40")} />
                                                ))}
                                            </div>
                                            <span className="font-semibold text-sm">{user?.freeUsesLeft ?? 0} available</span>
                                        </div>
                                    </div>
                                    <a href="/workspace" className="px-4 py-2 rounded text-sm font-medium bg-brand text-white hover:bg-brand/90 transition-colors">
                                        Run a Review
                                    </a>
                                </div>
                            </section>

                            {/* Pricing Cards */}
                            <section>
                                <h2 className="text-lg font-medium text-foreground mb-1">Get More Reviews</h2>
                                <p className="text-sm text-muted-foreground mb-5">Your first review is free. Unlock more to iterate.</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <PricingCard tier="single" onSelect={() => handleCheckout("single")} loading={isLoading === "single"} />
                                    <PricingCard tier="pack" onSelect={() => handleCheckout("pack")} loading={isLoading === "pack"} />
                                </div>
                            </section>

                            {/* History */}
                            <section>
                                <h2 className="text-base font-medium text-foreground mb-3">History</h2>
                                <div className="bg-card border border-border/60 rounded overflow-hidden">
                                    {loadingPasses ? (
                                        <div className="p-6 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                                        </div>
                                    ) : passes.length === 0 ? (
                                        <div className="p-6 text-center text-muted-foreground/50 text-sm">
                                            <Clock className="w-5 h-5 mx-auto mb-2 opacity-30" /> No purchases yet
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border/10">
                                            {passes.map((pass) => (
                                                <div key={pass.id} className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center">
                                                            {pass.tier === "30d" ? <Zap className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{pass.tier === "monthly" ? "Job Search Pack" : "Quick Check"}</p>
                                                            <p className="text-xs text-muted-foreground">{new Date(pass.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <span className={cn(
                                                        "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full",
                                                        new Date(pass.expires_at) > new Date() ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"
                                                    )}>
                                                        {new Date(pass.expires_at) > new Date() ? "Active" : "Expired"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </main>

            {/* Email Modal */}
            {showEmailInput && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card border border-border/20 rounded w-full max-w-sm p-6 space-y-4">
                        <div className="text-center">
                            <h3 className="text-lg font-display font-semibold">Where should we send your receipt?</h3>
                            <p className="text-muted-foreground text-sm mt-1">We&apos;ll link your credits to this email.</p>
                        </div>
                        <form onSubmit={handleGuestSubmit} className="space-y-3">
                            <input
                                type="email"
                                required
                                placeholder="you@example.com"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                className="w-full px-4 py-2.5 rounded border border-border/30 bg-background focus:outline-none focus:ring-2 focus:ring-brand/20"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!guestEmail || !!isLoading}
                                className="w-full py-2.5 rounded bg-brand text-white font-medium hover:bg-brand/90 transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Continue to Checkout
                            </button>
                        </form>
                        <button onClick={() => setShowEmailInput(null)} className="w-full text-sm text-muted-foreground hover:text-foreground">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
