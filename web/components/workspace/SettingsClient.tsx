"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Clock,
    Chrome,
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
import { getPassStatus, getPassStatusLabel, getTierLabel, isPassActive, isUnlimitedPassTier } from "@/lib/billing/entitlements";
import { Analytics } from "@/lib/analytics";
import { AppPageIntro } from "@/components/layout/AppPageIntro";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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
    revoked_at?: string | null;
    revocation_reason?: string | null;
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
    const { user, refreshUser, isLoading: authLoading } = useAuth();
    const queryClient = useQueryClient();
    const billingEnabled = isLaunchFlagEnabled("billingUnlock");
    const visibleTabs = billingEnabled ? TABS : TABS.filter((tab) => tab.id !== "billing");

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
        refetch: refetchPasses,
    } = useQuery({
        queryKey: ["settings", "passes"],
        queryFn: fetchPassesRequest,
        enabled: billingEnabled && Boolean(user?.email),
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
        enabled: billingEnabled && activeTab === "billing" && Boolean(user?.email),
        staleTime: 30_000,
    });

    useEffect(() => {
        setActiveTab(!billingEnabled && initialTab === "billing" ? "account" : initialTab);
    }, [billingEnabled, initialTab]);

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

            Analytics.track("account_export_completed", { source: "settings" });
            toast.success("Export downloaded");
        } catch (err: any) {
            toast.error(err?.message || "Export failed");
        } finally {
            setIsExportingData(false);
        }
    }

    async function handleCheckout(tier: PricingTier, emailOverride?: string) {
        if (tier !== "30d") return;
        const email = user?.email || emailOverride || guestCheckoutForm.getValues("guestEmail").trim();
        if (!email) {
            setShowEmailInput(tier);
            return;
        }

        try {
            setIsCheckoutLoading(tier);
            Analytics.checkoutStarted(tier, 29);
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
                ? `${user.paidUsesLeft || 0} paid reports`
                : `${user?.freeUsesLeft || 0} free report${(user?.freeUsesLeft || 0) === 1 ? "" : "s"} left`;
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
    const showRestoreNudge = !loadingPasses && !passesError && passes.length === 0 && hasPaidMembership;
    const tabDescriptions: Record<Tab, string> = {
        account: "Profile, exports, and account controls. Clear, reversible where possible, and easy to audit.",
        matching: "Choose the resume that powers your extension match scores so job triage stays fast and accurate.",
        billing: "See access status, restore purchases, and open billing controls without leaving the product.",
    };

    if (authLoading) {
        return (
            <div data-visual-anchor="settings-loading" className="min-h-full pb-20" role="status" aria-live="polite">
                <div className="mx-auto max-w-4xl px-6 pt-8">
                    <AppPageIntro
                        anchor="settings-loading"
                        eyebrow="Settings"
                        title="Opening your settings"
                        description="Checking your account before showing profile, matching, or billing controls."
                    />
                    <div className="app-card mt-8 flex min-h-40 items-center justify-center gap-3 p-8 text-sm text-muted-foreground">
                        <Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                        Loading account settings…
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div data-visual-anchor="settings-page" className="min-h-full pb-20">
                <div className="max-w-4xl mx-auto px-6 pt-8 gap-y-6">
                    <AppPageIntro
                        anchor="settings-page"
                        eyebrow="Settings"
                        title="Settings"
                        description={billingEnabled
                            ? "Sign in to manage your account, billing, and matching defaults. We keep these controls simple so you can verify and change things yourself."
                            : "Sign in to manage your account and matching defaults. We keep these controls simple so you can verify and change things yourself."}
                    />

                    <section className="app-card app-card-highlight p-8 text-center md:p-10">
                        <ShieldAlert className="mx-auto size-8 text-brand" />
                        <h2 className="mt-4 font-display text-[1.9rem] font-medium tracking-[-0.03em] text-foreground">
                            Sign in to open settings
                        </h2>
                        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
                            Signed-in settings give you data export, account deletion, and the default resume used by matching features.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href="/auth"
                                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/workspace"
                                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-foreground bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-paper-muted"
                            >
                                Back to workspace
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div data-visual-anchor="settings-page" className="min-h-full pb-20">
            <div className="max-w-4xl mx-auto px-6 pt-8">
                <AppPageIntro
                    anchor="settings-page"
                    eyebrow="Settings"
                    title="Settings"
                    description={tabDescriptions[activeTab]}
                    meta={
                        <>
                            <span className="inline-flex items-center border-l-2 border-cyan-bright bg-surface-sky px-3 py-1 text-xs font-medium text-muted-foreground">
                                {accessLabel}
                            </span>
                            {user?.email ? (
                                <span className="inline-flex items-center border-l-2 border-line bg-paper-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                    {user.email}
                                </span>
                            ) : null}
                        </>
                    }
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            {isLaunchFlagEnabled("extensionSync") ? (
                                <Link
                                    href="/extension"
                                    className="inline-flex min-h-11 items-center gap-2 rounded-md border border-foreground bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-paper-muted"
                                >
                                    <Chrome className="size-4" />
                                    Extension
                                </Link>
                            ) : null}
                            <Link
                                href="/security"
                                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-foreground bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-paper-muted"
                            >
                                Review data handling
                            </Link>
                        </div>
                    }
                    className="mb-8"
                />

                <nav
                    aria-label="Settings sections"
                    className="mb-8 flex w-full items-center gap-1 overflow-x-auto border-y border-line bg-paper p-1.5"
                >
                    {visibleTabs.map(({ id, label, href, icon: Icon }) => (
                        <Link
                            key={id}
                            href={href}
                            className={cn(
                                "relative flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-5 py-2.5 text-sm font-medium transition-colors duration-150",
                                activeTab === id
                                    ? "border-citron bg-background text-foreground"
                                    : "border-transparent text-muted-foreground hover:bg-paper-muted hover:text-foreground"
                            )}
                            aria-current={activeTab === id ? "page" : undefined}
                        >
                            <Icon className="size-4" />
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="gap-y-8">
                    {activeTab === "account" && (
                        <div className="gap-y-8 animate-in fade-in duration-200">
                            <section className="app-card p-6">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">Profile</h2>
                                <div className="flex flex-col items-start gap-6 sm:flex-row">
                                    <div className="flex size-14 shrink-0 select-none items-center justify-center border border-cyan-bright/35 bg-surface-sky font-display text-xl font-medium text-brand">
                                        {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                                    </div>
                                    <div className="flex-1 gap-y-5">
                                        <form
                                            className="max-w-sm"
                                            onSubmit={profileForm.handleSubmit(handleSaveProfile)}
                                        >
                                            <label htmlFor="settings-display-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Display Name</label>
                                            <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                                                <input
                                                    id="settings-display-name"
                                                    type="text"
                                                    placeholder="Your name"
                                                    {...profileForm.register("displayName")}
                                                    className="min-h-11 min-w-0 flex-1 border border-border/40 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={
                                                        profileForm.formState.isSubmitting ||
                                                        !displayNameValue.trim() ||
                                                        displayNameValue === (user?.firstName || "")
                                                    }
                                                    className="flex min-h-11 items-center justify-center gap-1.5 border border-line bg-secondary px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/80 disabled:opacity-40"
                                                >
                                                    {profileForm.formState.isSubmitting && <Loader2 className="size-3 animate-spin" />}
                                                    Save
                                                </button>
                                            </div>
                                        </form>
                                        <div className="max-w-sm">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Email</p>
                                            <div className="border-l-2 border-line bg-paper-muted px-3 py-2 text-sm text-muted-foreground">{user?.email}</div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="border-y border-line bg-paper-muted p-4">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h3 className="mb-0.5 text-sm font-medium text-foreground">Export account data</h3>
                                        <p className="text-xs text-muted-foreground">Create a portable copy of your reports, jobs, profile, usage, and billing records.</p>
                                    </div>
                                    <button type="button"
                                        onClick={handleExportData}
                                        disabled={isExportingData}
                                        className="inline-flex min-h-11 shrink-0 items-center border border-foreground bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-paper-muted disabled:opacity-50"
                                    >
                                        {isExportingData ? "Exporting…" : "Export data"}
                                    </button>
                                </div>
                            </section>

                            <section className="border-l-2 border-destructive bg-error-surface p-4">
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    <div>
                                        <h3 className="text-sm font-medium text-destructive mb-0.5">Delete Account</h3>
                                        <p className="text-xs text-destructive">Permanently remove your account, reports, and usage data.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button type="button"
                                            onClick={() => setIsDeleteConfirmOpen(true)}
                                            disabled={isDeletingAccount}
                                            className="inline-flex min-h-11 shrink-0 items-center border border-destructive/30 bg-background px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                                        >
                                            {isDeletingAccount ? "Deleting…" : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === "matching" && (
                        <div className="gap-y-6 animate-in fade-in duration-200">
                            <div className="mb-2">
                                <h2 className="text-lg font-medium text-foreground">Job Matching</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Upload your default resume for instant match scores in the Chrome extension.
                                </p>
                            </div>
                            <div className="border-l-2 border-cyan-bright bg-surface-sky px-4 py-3 text-sm text-muted-foreground">
                                The extension reads supported job pages only when you capture a role. Your default resume here powers match context once you choose to use it.
                            </div>
                            <DefaultResumeSection />
                        </div>
                    )}

                    {activeTab === "billing" && (
                        <div className="gap-y-10 animate-in fade-in duration-200">
                            <section className="app-card gap-y-4 p-5">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="gap-y-2">
                                        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Billing Status</h2>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className={cn(
                                                "border-l-2 px-2 py-1 text-xs font-bold uppercase tracking-wide",
                                                (hasPaidMembership || activePass) ? "border-success bg-success/10 text-success" : "border-line bg-paper-muted text-muted-foreground"
                                            )}>
                                                {(hasPaidMembership || activePass) ? "Active" : "Free"}
                                            </span>
                                            <p className="text-lg font-medium text-foreground">{accessLabel}</p>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Purchases are tied to <span className="font-medium text-foreground">{user?.email}</span>
                                        </div>
                                        {passTierLabel && (
                                            <div className="text-xs text-muted-foreground gap-y-1">
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
                                        <button type="button"
                                            onClick={handleRestoreAccess}
                                            disabled={isRestoreLoading}
                                            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-foreground px-4 py-2 text-sm font-medium transition-colors hover:bg-paper-muted disabled:opacity-50"
                                        >
                                            {isRestoreLoading ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="size-4" />
                                            )}
                                            Restore Access
                                        </button>
                                        {(user?.membership === "monthly" || user?.membership === "lifetime") && (
                                            <button type="button"
                                                onClick={handleOpenBillingPortal}
                                                disabled={isPortalLoading}
                                                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
                                            >
                                                {isPortalLoading ? (
                                                    <Loader2 className="size-4 animate-spin" />
                                                ) : (
                                                    <ExternalLink className="size-4" />
                                                )}
                                                Manage legacy plan
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {showRestoreNudge && (
                                    <div className="border-l-2 border-warning bg-paper-muted px-4 py-3 text-xs text-muted-foreground">
                                        We couldn&apos;t find billing records for this email. If you used a different email at checkout,
                                        sign in with that email and press Restore Access.
                                    </div>
                                )}
                            </section>

                            <section>
                                <h2 className="text-lg font-medium text-foreground mb-1">Job Search Pass</h2>
                                <p className="text-sm text-muted-foreground mb-5">
                                    Five more complete reports for 30 days. One payment, no automatic renewal.
                                </p>
                                <div className="grid gap-4">
                                    <PricingCard tier="30d" onSelect={() => handleCheckout("30d")} loading={isCheckoutLoading === "30d"} />
                                </div>
                            </section>

                            <section className="border-l-2 border-line bg-paper-muted p-4 text-sm text-muted-foreground">
                                Need procurement, invoices, or a billing edge case handled by a person?{" "}
                                <Link href="mailto:support@recruiterinyourpocket.com" className="underline underline-offset-4 hover:text-foreground">
                                    support@recruiterinyourpocket.com
                                </Link>
                            </section>

                            <section>
                                <h2 className="text-base font-medium text-foreground mb-3">Purchase History</h2>
                                <div className="app-card overflow-hidden">
                                    {loadingPasses ? (
                                        <div className="p-6 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                                            <Loader2 className="size-4 animate-spin" /> Loading…
                                        </div>
                                    ) : passesError ? (
                                        <div role="alert" className="border-l-2 border-destructive bg-error-surface p-6 text-sm text-destructive">
                                            <p className="font-medium">Purchase history could not load.</p>
                                            <p className="mt-1 text-destructive/80">Your access has not changed. Try the request again before relying on this list.</p>
                                            <button type="button" onClick={() => void refetchPasses()} className="mt-4 inline-flex min-h-11 items-center border border-destructive/40 bg-background px-4 py-2 font-medium">
                                                Try again
                                            </button>
                                        </div>
                                    ) : passes.length === 0 ? (
                                        <div className="p-6 text-center text-muted-foreground/70 text-sm">
                                            <Clock className="size-5 mx-auto mb-2 opacity-40" />
                                            No purchases yet. If you already paid, use Restore Access.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border/20">
                                            {passes.map((pass) => {
                                                const active = isPassActive(pass);
                                                const passStatus = getPassStatus(pass);
                                                const passStatusLabel = getPassStatusLabel(pass);
                                                const uses = Number(pass.uses_remaining || 0);
                                                const usesLabel = isUnlimitedPassTier(pass.tier)
                                                    ? "Unlimited"
                                                    : `${uses} remaining`;
                                                const expiryDate = formatDate(pass.expires_at);

                                                return (
                                                    <div key={pass.id} className="p-4 flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="flex size-8 shrink-0 items-center justify-center border border-line bg-paper-muted">
                                                                <FileText className="size-3.5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium truncate">{getTierLabel(pass.tier)}</p>
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    {new Date(pass.created_at).toLocaleDateString()} · {usesLabel}
                                                                </p>
                                                                {expiryDate && (
                                                                    <p className="text-xs text-muted-foreground/70">
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
                                                                "border-l-2 px-2 py-0.5 text-xs font-bold uppercase tracking-wider",
                                                                active
                                                                    ? "border-success bg-success/10 text-success"
                                                                    : passStatus === "revoked"
                                                                        ? "border-destructive bg-error text-destructive"
                                                                        : "border-line bg-paper-muted text-muted-foreground"
                                                            )}
                                                        >
                                                            {passStatusLabel}
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
                                    <button type="button"
                                        onClick={() => {
                                            void refetchReceipts();
                                        }}
                                        disabled={loadingReceipts}
                                        className="min-h-11 border border-border/50 px-3 py-1.5 text-xs transition-colors hover:bg-muted/40 disabled:opacity-50"
                                    >
                                        {loadingReceipts ? "Loading…" : "Refresh"}
                                    </button>
                                </div>
                                <div className="app-card overflow-hidden">
                                    {loadingReceipts ? (
                                        <div className="p-6 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                                            <Loader2 className="size-4 animate-spin" /> Loading…
                                        </div>
                                    ) : receiptsError ? (
                                        <div role="alert" className="border-l-2 border-destructive bg-error-surface p-6 text-sm text-destructive">
                                            <p className="font-medium">Receipts could not load.</p>
                                            <p className="mt-1 text-destructive/80">Try again or open the billing portal if you need an invoice now.</p>
                                            <button type="button" onClick={() => void refetchReceipts()} className="mt-4 inline-flex min-h-11 items-center border border-destructive/40 bg-background px-4 py-2 font-medium">
                                                Try again
                                            </button>
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
                                                                "mt-1 inline-flex border-l-2 px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
                                                                receipt.status === "paid" ? "border-success bg-success/10 text-success" : "border-line bg-paper-muted text-muted-foreground"
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
                                                                className="inline-flex min-h-11 items-center border border-border/50 px-3 py-2 text-xs transition-colors hover:bg-muted/40"
                                                            >
                                                                Invoice
                                                            </a>
                                                        )}
                                                        {receipt.invoice_pdf && (
                                                            <a
                                                                href={receipt.invoice_pdf}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex min-h-11 items-center border border-border/50 px-3 py-2 text-xs transition-colors hover:bg-muted/40"
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

                            <section className="border-l-2 border-line bg-paper-muted p-4">
                                <p className="text-xs text-muted-foreground flex items-start gap-2">
                                    <ShieldAlert className="size-4 mt-0.5 shrink-0" />
                                    Job Search Passes do not renew. Receipts stay available here. If you paid with a different email, use Restore Access first.
                                </p>
                            </section>
                        </div>
                    )}
                </div>

                <Dialog open={Boolean(showEmailInput)} onOpenChange={(open) => { if (!open) setShowEmailInput(null); }}>
                    <DialogContent className="max-w-sm gap-y-4 p-6">
                        <DialogHeader className="text-center">
                            <DialogTitle className="font-display text-lg font-semibold">Where should we send your receipt?</DialogTitle>
                            <DialogDescription>We will link access to this email.</DialogDescription>
                        </DialogHeader>
                            <form onSubmit={handleGuestSubmit} className="gap-y-3">
                                <input
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    {...guestCheckoutForm.register("guestEmail", {
                                        required: true,
                                        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    })}
                                    aria-label="Billing email"
                                    className="min-h-11 w-full border border-border/30 bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/20"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!guestEmailValue.trim() || !!isCheckoutLoading}
                                    className="flex min-h-11 w-full items-center justify-center gap-2 bg-foreground py-2.5 font-semibold text-background transition-colors hover:bg-foreground/90"
                                >
                                    {isCheckoutLoading && <Loader2 className="size-4 animate-spin" />}
                                    Continue to Checkout
                                </button>
                            </form>
                            <button type="button" onClick={() => setShowEmailInput(null)} className="min-h-11 w-full text-sm text-muted-foreground hover:text-foreground">
                                Cancel
                            </button>
                    </DialogContent>
                </Dialog>

                <ConfirmModal
                    isOpen={isDeleteConfirmOpen}
                    onClose={() => setIsDeleteConfirmOpen(false)}
                    onConfirm={handleDeleteAccount}
                    title="Delete your account?"
                    description="This permanently removes your account and user-owned product data from RIYP. Any verifiable legacy subscription is cancelled first. Stripe may retain payment records, and RIYP keeps limited deletion and billing-reversal records required to prevent restored access, handle disputes, and meet legal obligations. This cannot be undone."
                    confirmText="Delete Account"
                    cancelText="Keep Account"
                    variant="destructive"
                    loading={isDeletingAccount}
                />
            </div>
        </div>
    );
}
