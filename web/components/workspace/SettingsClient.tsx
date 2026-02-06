"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Clock,
    FileText,
    Loader2,
    User,
    Target,
    Receipt,
    RefreshCw,
    ExternalLink,
    ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { useAuth } from "@/components/providers/AuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import DefaultResumeSection from "@/components/settings/DefaultResumeSection";
import { PricingCard, type PricingTier } from "@/components/shared/PricingCard";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { cn } from "@/lib/utils";
import { getTierLabel, isPassActive, isUnlimitedPassTier } from "@/lib/billing/entitlements";
import { Analytics } from "@/lib/analytics";

type Tab = "account" | "matching" | "billing";

const TABS: { id: Tab; label: string; href: string; icon: typeof User }[] = [
    { id: "account", label: "Account", href: "/settings/account", icon: User },
    { id: "matching", label: "Matching", href: "/settings/matching", icon: Target },
    { id: "billing", label: "Billing", href: "/settings/billing", icon: Receipt }
];

type PassRecord = {
    id: string;
    tier: string;
    uses_remaining?: number | null;
    expires_at: string;
    created_at: string;
};

type ReceiptRecord = {
    id: string;
    number: string | null;
    status: string | null;
    amount_paid: number;
    currency: string | null;
    created_at: string;
    hosted_invoice_url: string | null;
    invoice_pdf: string | null;
};

type ProfileFormValues = {
    displayName: string;
};

type GuestCheckoutFormValues = {
    guestEmail: string;
};

type ExportJobRecord = {
    id: string;
    status: "pending" | "running" | "completed" | "failed" | "expired";
    format: string;
    requested_at: string;
    started_at: string | null;
    completed_at: string | null;
    expires_at: string | null;
    error_message: string | null;
};

interface SettingsClientProps {
    initialTab?: Tab;
}

function formatDate(input?: string | null) {
    if (!input) return null;
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString();
}

function formatAmount(cents: number, currency: string | null) {
    const amount = (Number(cents || 0) / 100).toFixed(2);
    return `${(currency || "USD").toUpperCase()} ${amount}`;
}

async function fetchPassesRequest(): Promise<PassRecord[]> {
    const res = await fetch("/api/passes");
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "Failed to load purchases");
    }
    return Array.isArray(data.passes) ? data.passes : [];
}

async function fetchReceiptsRequest(): Promise<ReceiptRecord[]> {
    const res = await fetch("/api/billing/receipts");
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "Failed to load receipts");
    }
    return Array.isArray(data.receipts) ? data.receipts : [];
}

export default function SettingsClient({ initialTab = "account" }: SettingsClientProps) {
    const { user, refreshUser } = useAuth();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState<PricingTier | null>(null);
    const [showEmailInput, setShowEmailInput] = useState<PricingTier | null>(null);
    const [isPortalLoading, setIsPortalLoading] = useState(false);
    const [isRestoreLoading, setIsRestoreLoading] = useState(false);

    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isExportingData, setIsExportingData] = useState(false);

    const profileForm = useForm<ProfileFormValues>({
        defaultValues: { displayName: "" }
    });
    const guestCheckoutForm = useForm<GuestCheckoutFormValues>({
        defaultValues: { guestEmail: "" }
    });

    const {
        data: passes = [],
        isLoading: loadingPasses,
        error: passesError,
    } = useQuery({
        queryKey: ["settings", "passes"],
        queryFn: fetchPassesRequest,
        enabled: Boolean(user?.email),
        staleTime: 30_000,
    });

    const {
        data: receipts = [],
        isLoading: loadingReceipts,
        error: receiptsError,
        refetch: refetchReceipts,
    } = useQuery({
        queryKey: ["settings", "receipts"],
        queryFn: fetchReceiptsRequest,
        enabled: activeTab === "billing" && Boolean(user?.email),
        staleTime: 30_000,
    });

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        profileForm.reset({ displayName: user?.firstName || "" });
        if (user?.email) {
            guestCheckoutForm.reset({ guestEmail: user.email });
        }
    }, [user?.firstName, user?.email, profileForm, guestCheckoutForm]);

    useEffect(() => {
        if (passesError instanceof Error) {
            toast.error(passesError.message || "Failed to load purchase history");
        }
    }, [passesError]);

    useEffect(() => {
        if (receiptsError instanceof Error) {
            toast.error(receiptsError.message || "Failed to load receipts");
        }
    }, [receiptsError]);

    async function handleSaveProfile(values: ProfileFormValues) {
        const trimmed = values.displayName.trim();
        if (!trimmed) return;
        try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.auth.updateUser({ data: { first_name: trimmed } });
            if (error) throw error;
            await refreshUser?.();
            profileForm.reset({ displayName: trimmed });
            toast.success("Profile updated");
        } catch (err: any) {
            toast.error(err.message || "Failed to update profile");
        }
    }

    async function handleDeleteAccount() {
        setIsDeleteConfirmOpen(false);
        setIsDeletingAccount(true);
        try {
            const res = await fetch("/api/account/delete", { method: "DELETE" });
            const data = await res.json();
            if (!data.ok) {
                throw new Error(data.message || "Failed to delete account");
            }

            toast.success("Account deleted");
            window.location.href = "/";
        } catch (err: any) {
            toast.error(err.message || "Failed to delete account");
        } finally {
            setIsDeletingAccount(false);
        }
    }

    async function handleExportData() {
        setIsExportingData(true);
        try {
            Analytics.track("account_export_requested", { source: "settings" });

            const createRes = await fetch("/api/account/export", { method: "POST" });
            const createData = await createRes.json().catch(() => ({} as any));
            if (!createRes.ok || !createData?.ok || !createData?.job?.id) {
                throw new Error(createData?.message || "Could not start export");
            }

            const jobId = String(createData.job.id);
            let job: ExportJobRecord | null = createData.job as ExportJobRecord;
            const maxAttempts = 24;

            if (job?.status !== "completed") {
                toast.message("Preparing export", {
                    description: "We are gathering your account data now.",
                });
            }

            for (let attempt = 0; attempt < maxAttempts && job?.status !== "completed"; attempt += 1) {
                const waitMs = Math.min(1200 + attempt * 250, 4000);
                await new Promise((resolve) => setTimeout(resolve, waitMs));

                const statusRes = await fetch(`/api/account/export?jobId=${encodeURIComponent(jobId)}`, {
                    cache: "no-store"
                });
                const statusData = await statusRes.json().catch(() => ({} as any));
                if (!statusRes.ok || !statusData?.ok || !statusData?.job) {
                    throw new Error(statusData?.message || "Failed to check export status");
                }

                job = statusData.job as ExportJobRecord;
                if (job.status === "failed" || job.status === "expired") {
                    throw new Error(job.error_message || "Export could not be completed");
                }
            }

            if (!job || job.status !== "completed") {
                throw new Error("Export is still processing. Please try again in a moment.");
            }

            const downloadRes = await fetch(`/api/account/export?jobId=${encodeURIComponent(jobId)}&download=1`);
            if (!downloadRes.ok) {
                const data = await downloadRes.json().catch(() => ({} as any));
                throw new Error(data?.message || "Export download failed");
            }

            const blob = await downloadRes.blob();
            const disposition = downloadRes.headers.get("content-disposition") || "";
            const nameMatch = disposition.match(/filename=\"([^\"]+)\"/);
            const filename = nameMatch?.[1] || "riyp-account-export.json";

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            Analytics.track("account_export_completed", { source: "settings", job_id: jobId });
            toast.success("Export downloaded");
        } catch (err: any) {
            toast.error(err?.message || "Export failed");
        } finally {
            setIsExportingData(false);
        }
    }

    async function handleCheckout(tier: PricingTier, emailOverride?: string) {
        const email = user?.email || emailOverride || guestCheckoutForm.getValues("guestEmail").trim();
        if (!email) {
            setShowEmailInput(tier);
            return;
        }

        try {
            setIsCheckoutLoading(tier);
            Analytics.checkoutStarted(tier, tier === "monthly" ? 9 : 79);
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    tier,
                    source: "settings",
                    idempotencyKey: crypto.randomUUID()
                })
            });
            const data = await res.json();
            if (!data.ok || !data.url) {
                throw new Error(data.message || "Checkout failed");
            }
            window.location.href = data.url;
        } catch (err: any) {
            Analytics.track("checkout_start_failed", { source: "settings", tier });
            toast.error(err.message || "Something went wrong");
        } finally {
            setIsCheckoutLoading(null);
            setShowEmailInput(null);
        }
    }

    async function handleOpenBillingPortal() {
        setIsPortalLoading(true);
        try {
            Analytics.track("billing_portal_open_requested", { source: "settings" });
            const res = await fetch("/api/billing/portal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ returnTo: "settings" })
            });
            const data = await res.json();
            if (!data.ok || !data.url) {
                throw new Error(data.message || "Billing portal unavailable");
            }

            window.location.href = data.url;
        } catch (err: any) {
            toast.error(err.message || "Unable to open billing portal");
        } finally {
            setIsPortalLoading(false);
        }
    }

    async function handleRestoreAccess() {
        setIsRestoreLoading(true);
        try {
            Analytics.track("billing_restore_requested", { source: "settings" });
            const res = await fetch("/api/billing/restore", { method: "POST" });
            const data = await res.json();
            if (!data.ok) {
                throw new Error(data.message || "Could not restore access");
            }

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["settings", "passes"] }),
                queryClient.invalidateQueries({ queryKey: ["settings", "receipts"] }),
                refreshUser?.()
            ]);
            toast.success("Access check complete", {
                description: data.message || "Billing state refreshed."
            });
            Analytics.track("billing_restore_succeeded", { restored: data.restored || 0 });
        } catch (err: any) {
            toast.error(err?.message || "Could not refresh access");
        } finally {
            setIsRestoreLoading(false);
        }
    }

    const handleGuestSubmit = guestCheckoutForm.handleSubmit(async (values) => {
        if (showEmailInput) {
            await handleCheckout(showEmailInput, values.guestEmail.trim());
        }
    });

    const hasPaidMembership = Boolean(user?.membership && user.membership !== "free");
    const accessLabel = user?.membership === "lifetime"
        ? "Lifetime Access"
        : user?.membership === "monthly"
            ? "Full Access Monthly"
            : user?.membership === "credit"
                ? `${user.paidUsesLeft || 0} paid reviews`
                : `${user?.freeUsesLeft || 0} free review${(user?.freeUsesLeft || 0) === 1 ? "" : "s"} left`;
    const displayNameValue = profileForm.watch("displayName") || "";
    const guestEmailValue = guestCheckoutForm.watch("guestEmail") || "";
    const activePass = loadingPasses ? null : passes.find((pass) => isPassActive(pass));
    const latestPass = loadingPasses ? null : passes[0];
    const passForStatus = activePass || latestPass || null;
    const passTierLabel = passForStatus ? getTierLabel(passForStatus.tier) : null;
    const passUsesLabel = passForStatus
        ? isUnlimitedPassTier(passForStatus.tier)
            ? "Unlimited"
            : `${Math.max(0, Number(passForStatus.uses_remaining || 0))} remaining`
        : null;
    const passExpiryDate = passForStatus?.expires_at ? formatDate(passForStatus.expires_at) : null;
    const passPurchasedDate = passForStatus?.created_at ? formatDate(passForStatus.created_at) : null;
    const passExpiryLabel = passForStatus
        ? passForStatus.tier === "lifetime"
            ? "No renewal"
            : isUnlimitedPassTier(passForStatus.tier)
                ? passExpiryDate
                    ? `Renews on ${passExpiryDate}`
                    : null
                : passExpiryDate
                    ? `Expires on ${passExpiryDate}`
                    : null
        : null;
    const showRestoreNudge = !loadingPasses && passes.length === 0 && hasPaidMembership;

    return (
        <div className="min-h-full pb-20">
            <div className="max-w-4xl mx-auto px-6 pt-8">
                <h1 className="font-display text-2xl font-medium text-foreground mb-8">Settings</h1>

                <nav
                    aria-label="Settings sections"
                    className="inline-flex items-center gap-0.5 p-1 rounded-lg bg-muted/60 border border-border/80 mb-8"
                >
                    {TABS.map(({ id, label, href, icon: Icon }) => (
                        <Link
                            key={id}
                            href={href}
                            className={cn(
                                "relative flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                                activeTab === id
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                            aria-current={activeTab === id ? "page" : undefined}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="space-y-8">
                    {activeTab === "account" && (
                        <div className="space-y-8 animate-in fade-in duration-200">
                            <section className="bg-white dark:bg-card border border-border/40 rounded-xl p-6 transition-all hover:shadow-sm">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">Profile</h2>
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-display font-medium text-xl select-none shrink-0">
                                        {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                                    </div>
                                    <div className="flex-1 space-y-5">
                                        <form
                                            className="max-w-sm"
                                            onSubmit={profileForm.handleSubmit(handleSaveProfile)}
                                        >
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Display Name</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Your name"
                                                    {...profileForm.register("displayName")}
                                                    className="flex-1 bg-background border border-border/40 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={
                                                        profileForm.formState.isSubmitting ||
                                                        !displayNameValue.trim() ||
                                                        displayNameValue === (user?.firstName || "")
                                                    }
                                                    className="px-3 py-2 bg-secondary hover:bg-secondary/80 rounded font-medium text-sm transition-all disabled:opacity-40 flex items-center gap-1.5"
                                                >
                                                    {profileForm.formState.isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                                                    Save
                                                </button>
                                            </div>
                                        </form>
                                        <div className="max-w-sm">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Email</label>
                                            <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded">{user?.email}</div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    <div>
                                        <h3 className="text-sm font-medium text-destructive mb-0.5">Delete Account</h3>
                                        <p className="text-xs text-destructive">Permanently remove your account, reports, and usage data.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleExportData}
                                            disabled={isExportingData}
                                            className="text-xs px-3 py-1.5 border border-border/50 rounded text-foreground hover:bg-muted/40 font-medium bg-background shrink-0 disabled:opacity-50"
                                        >
                                            {isExportingData ? "Exporting..." : "Export Data"}
                                        </button>
                                        <button
                                            onClick={() => setIsDeleteConfirmOpen(true)}
                                            disabled={isDeletingAccount}
                                            className="text-xs px-3 py-1.5 border border-destructive/30 rounded text-destructive hover:bg-destructive/10 font-medium bg-background shrink-0 disabled:opacity-50"
                                        >
                                            {isDeletingAccount ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === "matching" && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="mb-2">
                                <h2 className="text-lg font-medium text-foreground">Job Matching</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Upload your default resume for instant match scores in the Chrome extension.
                                </p>
                            </div>
                            <DefaultResumeSection />
                        </div>
                    )}

                    {activeTab === "billing" && (
                        <div className="space-y-10 animate-in fade-in duration-200">
                            <section className="bg-white dark:bg-card border border-border/40 rounded-xl p-5 transition-all hover:shadow-sm space-y-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="space-y-2">
                                        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Billing Status</h2>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className={cn(
                                                "text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full",
                                                (hasPaidMembership || activePass) ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"
                                            )}>
                                                {(hasPaidMembership || activePass) ? "Active" : "Free"}
                                            </span>
                                            <p className="text-lg font-medium text-foreground">{accessLabel}</p>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Purchases are tied to <span className="font-medium text-foreground">{user?.email}</span>
                                        </div>
                                        {passTierLabel && (
                                            <div className="text-xs text-muted-foreground space-y-1">
                                                <div>
                                                    <span className="text-foreground/70 font-medium">Pass:</span> {passTierLabel}
                                                    {passUsesLabel && <span className="text-foreground/70"> · {passUsesLabel}</span>}
                                                </div>
                                                {passExpiryLabel && <div>{passExpiryLabel}</div>}
                                                {passPurchasedDate && <div>Purchased on {passPurchasedDate}</div>}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={handleRestoreAccess}
                                            disabled={isRestoreLoading}
                                            className="px-4 py-2 rounded text-sm font-medium border border-border/50 hover:bg-muted/40 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                                        >
                                            {isRestoreLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="w-4 h-4" />
                                            )}
                                            Restore Access
                                        </button>
                                        <button
                                            onClick={handleOpenBillingPortal}
                                            disabled={isPortalLoading}
                                            className="px-4 py-2 rounded text-sm font-medium bg-brand text-white hover:bg-brand/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                                        >
                                            {isPortalLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <ExternalLink className="w-4 h-4" />
                                            )}
                                            Manage Billing
                                        </button>
                                    </div>
                                </div>

                                {showRestoreNudge && (
                                    <div className="rounded border border-border/50 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                                        We couldn&apos;t find billing records for this email. If you used a different email at checkout,
                                        sign in with that email and press Restore Access.
                                    </div>
                                )}
                            </section>

                            <section>
                                <h2 className="text-lg font-medium text-foreground mb-1">Upgrade</h2>
                                <p className="text-sm text-muted-foreground mb-5">
                                    Keep iterating by role with full evidence ledgers, Red Pen rewrites, and export access.
                                </p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <PricingCard tier="monthly" onSelect={() => handleCheckout("monthly")} loading={isCheckoutLoading === "monthly"} />
                                    <PricingCard tier="lifetime" onSelect={() => handleCheckout("lifetime")} loading={isCheckoutLoading === "lifetime"} />
                                </div>
                            </section>

                            <section>
                                <h2 className="text-base font-medium text-foreground mb-3">Purchase History</h2>
                                <div className="bg-white dark:bg-card border border-border/40 rounded-xl overflow-hidden">
                                    {loadingPasses ? (
                                        <div className="p-6 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                                        </div>
                                    ) : passes.length === 0 ? (
                                        <div className="p-6 text-center text-muted-foreground/70 text-sm">
                                            <Clock className="w-5 h-5 mx-auto mb-2 opacity-40" />
                                            No purchases yet. If you already paid, use Restore Access.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border/20">
                                            {passes.map((pass) => {
                                                const active = isPassActive(pass);
                                                const uses = Number(pass.uses_remaining || 0);
                                                const usesLabel = isUnlimitedPassTier(pass.tier)
                                                    ? "Unlimited"
                                                    : `${uses} remaining`;
                                                const expiryDate = formatDate(pass.expires_at);

                                                return (
                                                    <div key={pass.id} className="p-4 flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center shrink-0">
                                                                <FileText className="w-3.5 h-3.5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium truncate">{getTierLabel(pass.tier)}</p>
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    {new Date(pass.created_at).toLocaleDateString()} · {usesLabel}
                                                                </p>
                                                                {expiryDate && (
                                                                    <p className="text-[11px] text-muted-foreground/70">
                                                                        {pass.tier === "lifetime"
                                                                            ? "No renewal"
                                                                            : isUnlimitedPassTier(pass.tier)
                                                                                ? `Renews on ${expiryDate}`
                                                                                : `Expires on ${expiryDate}`}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span
                                                            className={cn(
                                                                "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full",
                                                                active ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"
                                                            )}
                                                        >
                                                            {active ? "Active" : "Expired"}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <h2 className="text-base font-medium text-foreground">Receipts & Invoices</h2>
                                    <button
                                        onClick={() => {
                                            void refetchReceipts();
                                        }}
                                        disabled={loadingReceipts}
                                        className="text-xs px-3 py-1.5 border border-border/50 rounded hover:bg-muted/40 transition-colors disabled:opacity-50"
                                    >
                                        {loadingReceipts ? "Loading..." : "Refresh"}
                                    </button>
                                </div>
                                <div className="bg-white dark:bg-card border border-border/40 rounded-xl overflow-hidden">
                                    {loadingReceipts ? (
                                        <div className="p-6 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                                        </div>
                                    ) : receipts.length === 0 ? (
                                        <div className="p-6 text-center text-muted-foreground/70 text-sm">
                                            No receipts yet. Try Refresh or open the billing portal.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border/20">
                                            {receipts.map((receipt) => (
                                                <div key={receipt.id} className="p-4 flex items-center justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {receipt.number || receipt.id}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {new Date(receipt.created_at).toLocaleDateString()} · {formatAmount(receipt.amount_paid, receipt.currency)}
                                                        </p>
                                                        {receipt.status && (
                                                            <span className={cn(
                                                                "mt-1 inline-flex text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full",
                                                                receipt.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"
                                                            )}>
                                                                {receipt.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {receipt.hosted_invoice_url && (
                                                            <a
                                                                href={receipt.hosted_invoice_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-xs px-2.5 py-1 rounded border border-border/50 hover:bg-muted/40 transition-colors"
                                                            >
                                                                Invoice
                                                            </a>
                                                        )}
                                                        {receipt.invoice_pdf && (
                                                            <a
                                                                href={receipt.invoice_pdf}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-xs px-2.5 py-1 rounded border border-border/50 hover:bg-muted/40 transition-colors"
                                                            >
                                                                PDF
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-xl border border-border/50 bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground flex items-start gap-2">
                                    <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                                    Billing portal includes card updates, invoices/receipts, and subscription cancellation.
                                    If you paid with a different email, use Restore Access first.
                                </p>
                            </section>
                        </div>
                    )}
                </div>

                {showEmailInput && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <div className="bg-card border border-border/20 rounded w-full max-w-sm p-6 space-y-4">
                            <div className="text-center">
                                <h3 className="text-lg font-display font-semibold">Where should we send your receipt?</h3>
                                <p className="text-muted-foreground text-sm mt-1">We will link access to this email.</p>
                            </div>
                            <form onSubmit={handleGuestSubmit} className="space-y-3">
                                <input
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    {...guestCheckoutForm.register("guestEmail", {
                                        required: true,
                                        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    })}
                                    className="w-full px-4 py-2.5 rounded border border-border/30 bg-background focus:outline-none focus:ring-2 focus:ring-brand/20"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!guestEmailValue.trim() || !!isCheckoutLoading}
                                    className="w-full py-2.5 rounded bg-brand text-white font-medium hover:bg-brand/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    {isCheckoutLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Continue to Checkout
                                </button>
                            </form>
                            <button onClick={() => setShowEmailInput(null)} className="w-full text-sm text-muted-foreground hover:text-foreground">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <ConfirmModal
                    isOpen={isDeleteConfirmOpen}
                    onClose={() => setIsDeleteConfirmOpen(false)}
                    onConfirm={handleDeleteAccount}
                    title="Delete your account?"
                    description="This permanently removes your account, reports, and usage history from our app database."
                    confirmText="Delete Account"
                    cancelText="Keep Account"
                    variant="destructive"
                    loading={isDeletingAccount}
                />
            </div>
        </div>
    );
}
