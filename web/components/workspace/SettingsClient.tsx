"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Clock,
    GoogleChromeLogo as Chrome,
    CircleNotch as Loader2,
    User,
    Target,
    Receipt,
    ArrowsClockwise as RefreshCw,
    ArrowSquareOut as ExternalLink,
    ShieldWarning as ShieldAlert
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";

import { useAuth } from "@/components/providers/AuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import DefaultResumeSection from "@/components/settings/DefaultResumeSection";
import type { PricingTier } from "@/components/shared/PricingCard";
import { JOB_SEARCH_PASS_DECISION } from "@/lib/billing/pricing";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { cn } from "@/lib/utils";
import { ClientActionError, getClientActionError } from "@/lib/client-action-error";
import { getPassStatus, getPassStatusLabel, getTierLabel, isPassActive, isUnlimitedPassTier } from "@/lib/billing/entitlements";
import { Analytics } from "@/lib/analytics";
import { AppPageIntro } from "@/components/layout/AppPageIntro";
import { Pile } from "@/components/materials/Pile";
import settings from "./Settings.module.css";
import { ActionFeedback } from "@/components/ui/action-feedback";
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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatAmount(cents: number, currency: string | null) {
    const code = (currency || "USD").toUpperCase();
    try {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(Number(cents || 0) / 100);
    } catch {
        return `${code} ${(Number(cents || 0) / 100).toFixed(2)}`;
    }
}

async function fetchPassesRequest(): Promise<PassRecord[]> {
    const res = await fetch("/api/passes");
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok || !data?.ok) {
        throw new ClientActionError(data?.message, "We couldn't load your purchases. Try again.");
    }
    return Array.isArray(data.passes) ? data.passes : [];
}

async function fetchReceiptsRequest(): Promise<ReceiptRecord[]> {
    const res = await fetch("/api/billing/receipts");
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok || !data?.ok) {
        throw new ClientActionError(data?.message, "We couldn't load your receipts. Try again.");
    }
    return Array.isArray(data.receipts) ? data.receipts : [];
}

export default function SettingsClient({ initialTab = "account" }: SettingsClientProps) {
    const pathname = usePathname();
    const { user, refreshUser, isLoading: authLoading } = useAuth();
    const queryClient = useQueryClient();
    const billingEnabled = isLaunchFlagEnabled("billingUnlock");
    const matchingEnabled = isLaunchFlagEnabled("extensionSync");
    const visibleTabs = TABS.filter((tab) => {
        if (tab.id === "billing") return billingEnabled;
        if (tab.id === "matching") return matchingEnabled;
        return true;
    });
    const requestedTabIsHidden =
        (!billingEnabled && initialTab === "billing") ||
        (!matchingEnabled && initialTab === "matching");

    const [activeTab, setActiveTab] = useState<Tab>(requestedTabIsHidden ? "account" : initialTab);
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
    const displayNameValue = useWatch({ control: profileForm.control, name: "displayName" }) || "";
    const guestEmailValue = useWatch({ control: guestCheckoutForm.control, name: "guestEmail" }) || "";

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
        setActiveTab(requestedTabIsHidden ? "account" : initialTab);
    }, [initialTab, requestedTabIsHidden]);

    useEffect(() => {
        profileForm.reset({ displayName: user?.firstName || "" });
        if (user?.email) {
            guestCheckoutForm.reset({ guestEmail: user.email });
        }
    }, [user?.firstName, user?.email, profileForm, guestCheckoutForm]);

    useEffect(() => {
        if (passesError instanceof Error) {
            toast.error(getClientActionError(passesError, "We couldn't load your purchases. Try again."));
        }
    }, [passesError]);

    useEffect(() => {
        if (receiptsError instanceof Error) {
            toast.error(getClientActionError(receiptsError, "We couldn't load your receipts. Try again."));
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
            toast.error("We couldn't save your name. Try again.");
        }
    }

    async function handleDeleteAccount() {
        setIsDeleteConfirmOpen(false);
        setIsDeletingAccount(true);
        try {
            const res = await fetch("/api/account/delete", { method: "DELETE" });
            const data = await res.json();
            if (!data.ok) {
                throw new ClientActionError(data.message, "We couldn't delete your account. Try again or contact support.");
            }

            // The server clears the SSR cookie and returns Clear-Site-Data.
            // Remove the browser client's in-memory session too before leaving
            // the private app shell.
            const supabase = createSupabaseBrowserClient();
            const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
            if (signOutError) {
                console.warn("Browser session cleanup reported an error after account deletion");
            }
            queryClient.clear();
            toast.success("Account deleted");
            window.location.replace("/");
        } catch (err: any) {
            toast.error(getClientActionError(err, "We couldn't delete your account. Try again or contact support."));
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
                throw new ClientActionError(createData?.message, "We couldn't start your download. Try Export data again.");
            }

            const jobId = String(createData.job.id);
            let job: ExportJobRecord | null = createData.job as ExportJobRecord;
            const maxAttempts = 24;

            if (job?.status !== "completed") {
                toast.message("Preparing export", {
                    description: "We're gathering your account data for download.",
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
                    throw new ClientActionError(statusData?.message, "We couldn't check whether your download is ready. Try Export data again.");
                }

                job = statusData.job as ExportJobRecord;
                if (job.status === "failed" || job.status === "expired") {
                    throw new ClientActionError(job.error_message, "We couldn't prepare your download. Try Export data again.");
                }
            }

            if (!job || job.status !== "completed") {
                throw new ClientActionError(null, "Your export is still processing. Try again in a moment.");
            }

            const downloadRes = await fetch(`/api/account/export?jobId=${encodeURIComponent(jobId)}&download=1`);
            if (!downloadRes.ok) {
                const data = await downloadRes.json().catch(() => ({} as any));
                throw new ClientActionError(data?.message, "We couldn't download your account data. Try Export data again.");
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
            toast.error(getClientActionError(err, "We couldn't download your account data. Try Export data again."));
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
                throw new ClientActionError(data.message, "We couldn't open checkout. Try again.");
            }
            window.location.href = data.url;
        } catch (err: any) {
            Analytics.track("checkout_start_failed", { source: "settings", tier });
            toast.error(getClientActionError(err, "We couldn't open checkout. Try again."));
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
                throw new ClientActionError(data.message, "We couldn't open the billing portal. Try again.");
            }

            window.location.href = data.url;
        } catch (err: any) {
            toast.error(getClientActionError(err, "We couldn't open the billing portal. Try again."));
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
                throw new ClientActionError(data.message, "We couldn't restore your purchase. Try again.");
            }

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["settings", "passes"] }),
                queryClient.invalidateQueries({ queryKey: ["settings", "receipts"] }),
                refreshUser?.()
            ]);
            toast.success("Access check complete", {
                description: data.message || "Your purchases and available reports are up to date."
            });
            Analytics.track("billing_restore_succeeded", { restored: data.restored || 0 });
        } catch (err: any) {
            toast.error(getClientActionError(err, "We couldn't restore your purchase. Try again."));
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
        ? "Lifetime access"
        : user?.membership === "monthly"
            ? "Monthly plan"
            : user?.membership === "credit"
                ? `${user.paidUsesLeft || 0} ${(user.paidUsesLeft || 0) === 1 ? "report" : "reports"} left on your pass`
                : `${user?.freeUsesLeft || 0} free report${(user?.freeUsesLeft || 0) === 1 ? "" : "s"} left`;
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

    if (authLoading) {
        return (
            <div data-visual-anchor="settings-loading" className="min-h-full bg-background pb-20" role="status" aria-live="polite">
                <div className="mx-auto box-content w-auto max-w-account px-4 pt-8 sm:px-6 sm:pt-12">
                    <AppPageIntro
                        anchor="settings-loading"
                        title="Opening your settings"
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
            <div data-visual-anchor="settings-page" className="min-h-full bg-background pb-20">
                <div className="mx-auto box-content w-auto max-w-account px-4 pt-8 sm:px-6 sm:pt-12 space-y-6">
                    <AppPageIntro
                        anchor="settings-page"
                        title="Settings"
                    />

                    <section className="app-card p-6 text-left sm:p-8">
                        <ShieldAlert className="size-8 text-brand" />
                        <h2 className="mt-5 font-sans text-heading text-foreground">
                            Sign in to open settings
                        </h2>
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <Button asChild>
                                <Link href={`/auth?from=settings&next=${encodeURIComponent(pathname || `/settings/${activeTab}`)}`}>
                                    Sign in
                                </Link>
                            </Button>
                            <Button asChild variant="secondary">
                                <Link
                                    href="/workspace"
                                >
                                    Back to workspace
                                </Link>
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div data-visual-anchor="settings-page" className="min-h-full bg-background pb-20">
            <div className="mx-auto box-content w-auto max-w-account px-4 pt-8 sm:px-6 sm:pt-12">
                <AppPageIntro
                    anchor="settings-page"
                    title="Settings"
                    meta={
                        <>
                            <span className="inline-flex items-center rounded-md bg-brand/5 px-3 py-1 text-sm font-medium text-brand">
                                {accessLabel}
                            </span>
                        </>
                    }
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            {isLaunchFlagEnabled("extensionSync") ? (
                                <Button asChild variant="secondary">
                                    <Link
                                        href="/extension"
                                    >
                                        <Chrome className="size-4" />
                                        Extension
                                    </Link>
                                </Button>
                            ) : null}
                            <Button asChild variant="secondary">
                                <Link
                                    href="/privacy"
                                >
                                    How we handle your data
                                </Link>
                            </Button>
                        </div>
                    }
                    className="mb-8"
                />

                <nav aria-label="Settings sections" className={settings.tabs}>
                    {visibleTabs.map(({ id, label, href }) => (
                        <Link
                            key={id}
                            href={href}
                            className={cn("focus-ring", settings.tab, activeTab === id && settings.tabActive)}
                            aria-current={activeTab === id ? "page" : undefined}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="space-y-8">
                    {activeTab === "account" && (
                        <div className="space-y-8 ui-state-enter">
                            {/* One column of rows on hairlines (Nov 4, 2026): name, email, your data, and delete last. */}
                            <div className={settings.rows}>
                                <form className={settings.row} onSubmit={profileForm.handleSubmit(handleSaveProfile)}>
                                    <label htmlFor="settings-display-name" className={settings.rowHead}>Name</label>
                                    <div className={settings.rowBody}>
                                        <input
                                            id="settings-display-name"
                                            type="text"
                                            {...profileForm.register("displayName")}
                                            className={settings.field}
                                        />
                                    </div>
                                    <div className={settings.rowAction}>
                                        <Button
                                            type="submit"
                                            variant="secondary"
                                            size="sm"
                                            aria-busy={profileForm.formState.isSubmitting}
                                            disabled={
                                                profileForm.formState.isSubmitting ||
                                                !displayNameValue.trim() ||
                                                displayNameValue === (user?.firstName || "")
                                            }
                                        >
                                            <ActionFeedback state={profileForm.formState.isSubmitting ? "pending" : "idle"} states={{ idle: { label: "Save" }, pending: { label: "Saving…", icon: <Loader2 className="size-3 animate-spin motion-reduce:animate-none" aria-hidden="true" /> } }} />
                                        </Button>
                                    </div>
                                </form>
                                <div className={settings.row}>
                                    <h2 className={settings.rowHead}>Email</h2>
                                    <div className={settings.rowBody}><p>{user?.email}</p></div>
                                    <span />
                                </div>
                                <div className={settings.row}>
                                    <h2 className={settings.rowHead}>Your data</h2>
                                    <div className={settings.rowBody}><p>Everything we hold about you, as a file.</p></div>
                                    <div className={settings.rowAction}>
                                        <Button type="button"
                                            onClick={handleExportData}
                                            disabled={isExportingData}
                                            aria-busy={isExportingData}
                                            variant="secondary" size="sm"
                                        >
                                            <ActionFeedback state={isExportingData ? "pending" : "idle"} states={{ idle: { label: "Export" }, pending: { label: "Preparing export…" } }} />
                                        </Button>
                                    </div>
                                </div>
                                <div className={settings.row}>
                                    <h2 className={settings.rowHead}>Delete account</h2>
                                    <div className={settings.rowBody}><p>Your reports and your account go with it. Nothing comes back.</p></div>
                                    <div className={settings.rowAction}>
                                        <Button type="button"
                                            onClick={() => setIsDeleteConfirmOpen(true)}
                                            disabled={isDeletingAccount}
                                            aria-busy={isDeletingAccount}
                                            variant="destructive" size="sm"
                                        >
                                            <ActionFeedback state={isDeletingAccount ? "pending" : "idle"} states={{ idle: { label: "Delete" }, pending: { label: "Deleting…" } }} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "matching" && (
                        <div className="space-y-6 ui-state-enter">
                            <h2 className="text-lg font-medium text-foreground">Job matching</h2>
                            <DefaultResumeSection />
                        </div>
                    )}

                    {activeTab === "billing" && (
                        <div className="space-y-10 ui-state-enter">
                            <div className={settings.rows}>
                            <div className={settings.row}>
                                <h2 className={settings.rowHead}>Your pass</h2>
                                <div className={settings.rowBody}>
                                    {activePass && !isUnlimitedPassTier(activePass.tier) && Number(activePass.uses_remaining || 0) > 0 && (
                                        <Pile count={Math.min(5, Number(activePass.uses_remaining || 0))} size="lg" label={`${Number(activePass.uses_remaining || 0)} reports left on your pass, one sheet each`} />
                                    )}
                                    <p className={settings.strong}>{accessLabel}</p>
                                    <p className={settings.quiet}>Purchases are tied to {user?.email}.{passExpiryLabel ? ` ${passExpiryLabel}.` : ""}</p>
                                </div>
                                <div className={settings.rowAction}>
                                        <Button type="button"
                                            onClick={handleRestoreAccess}
                                            disabled={isRestoreLoading}
                                            aria-busy={isRestoreLoading}
                                            variant="secondary"
                                        >
                                            <ActionFeedback state={isRestoreLoading ? "pending" : "idle"} states={{ idle: { label: "Restore access", icon: <RefreshCw className="size-4" /> }, pending: { label: "Checking access…", icon: <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> } }} />
                                        </Button>
                                        {(user?.membership === "monthly" || user?.membership === "lifetime") && (
                                            <Button type="button"
                                                onClick={handleOpenBillingPortal}
                                                disabled={isPortalLoading}
                                                aria-busy={isPortalLoading}
                                            >
                                                <ActionFeedback state={isPortalLoading ? "pending" : "idle"} states={{ idle: { label: "Manage legacy plan", icon: <ExternalLink className="size-4" /> }, pending: { label: "Opening billing…", icon: <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> } }} />
                                            </Button>
                                        )}
                                </div>
                                {showRestoreNudge && (
                                    <p className={settings.quiet} style={{ gridColumn: "1 / -1" }}>
                                        We couldn&apos;t find billing records for this email. If you used a different email at checkout,
                                        sign in with that email and choose Restore access.
                                    </p>
                                )}
                            </div>

                            {activePass || hasPaidMembership ? (
                                <div className={settings.row}>
                                    <h2 className={settings.rowHead}>More reports</h2>
                                    <div className={settings.rowBody}><p>Five more over 90 days, one payment, no renewal.</p></div>
                                    <div className={settings.rowAction}>
                                    <Button type="button"
                                        onClick={() => handleCheckout("30d")}
                                        disabled={isCheckoutLoading === "30d"}
                                        aria-busy={isCheckoutLoading === "30d"}
                                        variant="secondary" size="sm" className="shrink-0"
                                    >
                                        <ActionFeedback state={isCheckoutLoading === "30d" ? "pending" : "idle"} states={{ idle: { label: "Get 5 more reports · $29" }, pending: { label: "Opening checkout…" } }} />
                                    </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className={settings.row}>
                                    <h2 className={settings.rowHead}>Job Search Pass</h2>
                                    <div className={settings.rowBody}>
                                        <Pile count={5} size="lg" label="Five sheets of paper: the Job Search Pass" />
                                        <p>{JOB_SEARCH_PASS_DECISION.terms} {JOB_SEARCH_PASS_DECISION.whenToBuy}</p>
                                    </div>
                                    <div className={settings.rowAction}>
                                        <Button type="button" variant="secondary" size="sm" onClick={() => handleCheckout("30d")} disabled={isCheckoutLoading === "30d"} aria-busy={isCheckoutLoading === "30d"}>
                                            <ActionFeedback state={isCheckoutLoading === "30d" ? "pending" : "idle"} states={{ idle: { label: JOB_SEARCH_PASS_DECISION.cta }, pending: { label: "Opening checkout…" } }} />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className={settings.row}>
                                <h2 className={settings.rowHead}>Purchases</h2>
                                <div className={settings.rowBody}>
                                    {loadingPasses ? (
                                        <div className="p-6 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                                            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> Loading…
                                        </div>
                                    ) : passesError ? (
                                        <div role="alert" className="rounded-xl bg-error-surface p-6 text-sm text-destructive">
                                            <p className="font-medium">Purchase history could not load.</p>
                                            <p className="mt-1 text-destructive/80">We couldn&apos;t retrieve your purchases. Try again to see the list.</p>
                                            <Button variant="destructive" size="sm" className="mt-4" type="button" onClick={() => void refetchPasses()}>
                                                Try again
                                            </Button>
                                        </div>
                                    ) : passes.length === 0 ? (
                                        <div className="p-6 text-center text-muted-foreground/70 text-sm">
                                            <Clock className="size-5 mx-auto mb-2 opacity-40" />
                                            No purchases yet. If you already paid, choose Restore access above.
                                        </div>
                                    ) : (
                                        <ul className={settings.list}>
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
                                                    <li key={pass.id} className={settings.item}>
                                                        <span>
                                                            <span className={settings.strong}>{getTierLabel(pass.tier)}</span> · {formatDate(pass.created_at)} · {usesLabel}
                                                            {expiryDate && (
                                                                <> · {pass.tier === "lifetime" ? "No renewal" : isUnlimitedPassTier(pass.tier) ? `Renews on ${expiryDate}` : `Expires on ${expiryDate}`}</>
                                                            )}
                                                        </span>
                                                        <span className={active ? settings.status : passStatus === "revoked" ? settings.statusBad : settings.statusQuiet}>{passStatusLabel}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                                <span />
                            </div>

                            <div className={settings.row}>
                                <h2 className={settings.rowHead}>Receipts</h2>
                                <div className={settings.rowBody}>
                                    {loadingReceipts ? (
                                        <div className="p-6 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                                            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> Loading…
                                        </div>
                                    ) : receiptsError ? (
                                        <div role="alert" className="rounded-xl bg-error-surface p-6 text-sm text-destructive">
                                            <p className="font-medium">Receipts could not load.</p>
                                            <p className="mt-1 [overflow-wrap:anywhere] text-destructive/80">Try again. If you need an invoice now, email support@recruiterinyourpocket.com.</p>
                                            <Button variant="destructive" size="sm" className="mt-4" type="button" onClick={() => void refetchReceipts()}>
                                                Try again
                                            </Button>
                                        </div>
                                    ) : receipts.length === 0 ? (
                                        <div className="p-6 text-center text-muted-foreground/70 text-sm">
                                            No receipts found for this account. If you recently paid, try Refresh.
                                        </div>
                                    ) : (
                                        <ul className={settings.list}>
                                            {receipts.map((receipt) => (
                                                <li key={receipt.id} className={settings.item}>
                                                    <span>
                                                        <span className={settings.strong}>{formatAmount(receipt.amount_paid, receipt.currency)}</span> · {formatDate(receipt.created_at)} · {receipt.number || receipt.id}
                                                        {receipt.status && <> · {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}</>}
                                                    </span>
                                                    <span className={settings.rowAction}>
                                                        {receipt.hosted_invoice_url && <a href={receipt.hosted_invoice_url} target="_blank" rel="noreferrer" className="focus-ring riyp-link-quiet">Receipt<span className="sr-only"> (opens in a new tab)</span></a>}
                                                        {receipt.invoice_pdf && <a href={receipt.invoice_pdf} target="_blank" rel="noreferrer" className="focus-ring riyp-link-quiet">PDF<span className="sr-only"> (opens in a new tab)</span></a>}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className={settings.rowAction}>
                                    <Button type="button" variant="quiet" size="sm" onClick={() => { void refetchReceipts(); }} disabled={loadingReceipts} aria-busy={loadingReceipts}>
                                        <ActionFeedback state={loadingReceipts ? "pending" : "idle"} states={{ idle: { label: "Refresh" }, pending: { label: "Loading…" } }} />
                                    </Button>
                                </div>
                            </div>
                            </div>
                        </div>
                    )}
                </div>

                <Dialog open={Boolean(showEmailInput)} onOpenChange={(open) => { if (!open) setShowEmailInput(null); }}>
                    <DialogContent className="max-w-auth gap-y-4 p-6 sm:p-8">
                        <DialogHeader className="text-center">
                            <DialogTitle className="font-sans text-heading">Where should we send your receipt?</DialogTitle>
                            <DialogDescription>We will link access to this email.</DialogDescription>
                        </DialogHeader>
                            <form onSubmit={handleGuestSubmit} className="space-y-3">
                                <input
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    {...guestCheckoutForm.register("guestEmail", {
                                        required: true,
                                        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    })}
                                    aria-label="Billing email"
                                    className="min-h-12 w-full rounded-md border border-input bg-card px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-ring/25"
                                    autoFocus
                                />
                                <Button
                                    type="submit"
                                    disabled={!guestEmailValue.trim() || !!isCheckoutLoading}
                                    aria-busy={!!isCheckoutLoading}
                                    className="w-full flex"
                                >
                                    <ActionFeedback state={isCheckoutLoading ? "pending" : "idle"} states={{ idle: { label: "Continue to checkout" }, pending: { label: "Opening checkout…", icon: <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> } }} />
                                </Button>
                            </form>
                            <button type="button" onClick={() => setShowEmailInput(null)} className="focus-ring min-h-11 w-full rounded-full text-sm text-muted-foreground hover:text-foreground">
                                Cancel
                            </button>
                    </DialogContent>
                </Dialog>

                <ConfirmModal
                    isOpen={isDeleteConfirmOpen}
                    onClose={() => setIsDeleteConfirmOpen(false)}
                    onConfirm={handleDeleteAccount}
                    title="Delete your account?"
                    description="This permanently removes your account and user-owned product data from Recruiter in Your Pocket. Any verifiable legacy subscription is cancelled first. Stripe may retain payment records, and RIYP keeps limited deletion and billing-reversal records required to prevent restored access, handle disputes, and meet legal obligations. This cannot be undone."
                    confirmText="Delete account"
                    cancelText="Keep account"
                    variant="destructive"
                    loading={isDeletingAccount}
                />
            </div>
        </div>
    );
}
