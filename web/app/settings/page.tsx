"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import ThemeToggle from "@/components/shared/ThemeToggle";
import Toggle from "@/components/shared/Toggle";

type Section = "profile" | "passes" | "preferences" | "delete";

interface Pass {
    id: string;
    tier: string;
    expires_at: string;
    created_at: string;
}

export default function SettingsPage() {
    const router = useRouter();
    const { user, signOut, refreshUser } = useAuth();
    const [activeSection, setActiveSection] = useState<Section>("profile");

    // Profile state
    const [firstName, setFirstName] = useState("");
    const [originalName, setOriginalName] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Passes state
    const [passes, setPasses] = useState<Pass[]>([]);
    const [loadingPasses, setLoadingPasses] = useState(true);

    // Preferences state
    const [darkMode, setDarkMode] = useState(false);
    const [showSampleReport, setShowSampleReport] = useState(true);
    const [emailReminders, setEmailReminders] = useState(true);

    // Delete state
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (user?.firstName) {
            setFirstName(user.firstName);
            setOriginalName(user.firstName);
        }
    }, [user]);

    useEffect(() => {
        const isDark = document.documentElement.classList.contains("dark");
        setDarkMode(isDark);
    }, []);

    useEffect(() => {
        const fetchPasses = async () => {
            try {
                const res = await fetch("/api/passes");
                const data = await res.json();
                if (data.ok && data.passes) setPasses(data.passes);
            } catch { }
            setLoadingPasses(false);
        };
        if (user) fetchPasses();
        else setLoadingPasses(false);
    }, [user]);

    const handleSaveName = async () => {
        if (!firstName.trim() || firstName === originalName) return;
        setSaving(true);
        setSaveSuccess(false);
        try {
            const supabase = createSupabaseBrowserClient();
            await supabase.auth.updateUser({ data: { first_name: firstName.trim() } });
            await refreshUser();
            setOriginalName(firstName.trim());
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch { }
        setSaving(false);
    };

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    const handleToggleDarkMode = () => {
        const newValue = !darkMode;
        setDarkMode(newValue);
        if (newValue) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    const handleDeleteAccount = async () => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            return;
        }
        setDeleting(true);
        try {
            await fetch("/api/account", { method: "DELETE" });
            await signOut();
            router.push("/?deleted=true");
        } catch { }
        setDeleting(false);
    };

    const formatPassExpiry = (expiresAt: string, tier: string) => {
        const date = new Date(expiresAt);
        const now = new Date();
        if (date <= now) return "Expired";

        if (tier === "30d") {
            const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            return `Unlimited full reports until ${dateStr}.`;
        } else {
            const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
            const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
            return `Unlimited full reports until ${dayName} at ${time}.`;
        }
    };

    const getTierLabel = (tier: string) => tier === "30d" ? "30-Day Campaign Pass" : "24-Hour Fix Pass";

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const activePass = passes.find(p => new Date(p.expires_at) > new Date());
    const pastPasses = passes.filter(p => new Date(p.expires_at) <= new Date());

    if (!user) {
        return (
            <div className="min-h-screen bg-body flex items-center justify-center">
                <div className="text-center">
                    <p className="text-secondary mb-4">Please sign in to view settings</p>
                    <Link href="/" className="btn-primary">Go Home</Link>
                </div>
            </div>
        );
    }

    const menuItems: { id: Section; label: string }[] = [
        { id: "profile", label: "Profile" },
        { id: "passes", label: "Passes" },
        { id: "preferences", label: "Preferences" },
        { id: "delete", label: "Delete account" }
    ];

    return (
        <div className="min-h-screen bg-body">
            {/* Header */}
            <header className="bg-surface border-b border-subtle">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="font-display text-lg font-bold text-primary">
                        Recruiter in Your Pocket
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/workspace" className="text-sm text-secondary hover:text-primary">
                            ← Back to Workspace
                        </Link>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6">
                {/* Page Header - Above Two Column Layout */}
                <div className="pt-12 pb-8">
                    <h1 className="font-display text-2xl font-bold text-primary">Settings</h1>
                    <p className="text-muted mt-1">Manage your account, passes, and preferences.</p>
                </div>

                {/* Two Column Layout */}
                <div className="flex gap-8 pb-16">
                    {/* Left Sidebar */}
                    <nav className="w-52 flex-shrink-0">
                        {/* User Identity */}
                        <div className="mb-6 pb-6 border-b border-subtle">
                            <div className="text-sm font-medium text-primary">
                                {user.firstName || user.email?.split("@")[0]}
                            </div>
                            <div className="text-xs text-muted mt-0.5">
                                {activePass ? getTierLabel(activePass.tier) : "Free plan"}
                            </div>
                        </div>

                        {/* Nav Items */}
                        <ul className="space-y-1">
                            {menuItems.map(item => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => { setActiveSection(item.id); setDeleteConfirm(false); }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors relative ${activeSection === item.id
                                            ? "bg-brand-soft text-brand font-medium"
                                            : item.id === "delete"
                                                ? "text-muted hover:text-danger hover:bg-hover"
                                                : "text-secondary hover:bg-hover"
                                            }`}
                                    >
                                        {activeSection === item.id && (
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand rounded-r" />
                                        )}
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Right Content Panel */}
                    <div className="flex-1 min-w-0">
                        {/* Profile Section */}
                        {activeSection === "profile" && (
                            <div className="bg-surface rounded-xl border border-subtle p-6">
                                <h2 className="font-semibold text-primary">Profile</h2>
                                <p className="text-sm text-muted mt-1 mb-6">Update your basic account info.</p>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={user.email ?? ""}
                                            disabled
                                            className="input bg-muted cursor-not-allowed text-muted"
                                        />
                                        <p className="text-xs text-muted mt-1.5">Used for login and pass access.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Your name"
                                            className="input"
                                        />
                                    </div>

                                    <div className="pt-4 flex flex-col items-start gap-3">
                                        <button
                                            onClick={handleSaveName}
                                            disabled={saving || firstName === originalName || !firstName.trim()}
                                            className="btn-primary"
                                        >
                                            {saving ? "Saving..." : saveSuccess ? "✓ Saved" : "Save changes"}
                                        </button>
                                        <button
                                            onClick={handleSignOut}
                                            className="text-sm text-muted hover:text-secondary hover:underline"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Passes Section */}
                        {activeSection === "passes" && (
                            <div className="space-y-6">
                                {/* Current Pass Card */}
                                <div className="bg-surface rounded-xl border border-subtle p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="font-semibold text-primary">Your current plan</h2>
                                            {activePass ? (
                                                <>
                                                    <p className="text-sm font-medium text-primary mt-2">
                                                        {getTierLabel(activePass.tier)}
                                                    </p>
                                                    <p className="text-sm text-muted mt-0.5">
                                                        {formatPassExpiry(activePass.expires_at, activePass.tier)}
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm font-medium text-primary mt-2">Free plan</p>
                                                    <p className="text-sm text-muted mt-0.5">
                                                        You can run two full reports at no cost. Upgrade when you are ready for more.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        {activePass && (
                                            <span className="badge-success px-2.5 py-1 text-xs font-medium rounded-full">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Past Passes Card */}
                                <div className="bg-surface rounded-xl border border-subtle p-6">
                                    <h2 className="font-semibold text-primary mb-4">Pass history</h2>

                                    {loadingPasses ? (
                                        <p className="text-sm text-muted">Loading...</p>
                                    ) : pastPasses.length === 0 ? (
                                        <p className="text-sm text-muted">You have not used any passes yet.</p>
                                    ) : (
                                        <div className="border border-subtle rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted">
                                                    <tr>
                                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted uppercase tracking-wide">Pass</th>
                                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted uppercase tracking-wide">Date</th>
                                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted uppercase tracking-wide">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pastPasses.map(pass => (
                                                        <tr key={pass.id} className="border-t border-subtle">
                                                            <td className="px-4 py-3 text-primary">
                                                                {getTierLabel(pass.tier)}
                                                            </td>
                                                            <td className="px-4 py-3 text-muted">
                                                                Used on {formatDate(pass.created_at)}
                                                            </td>
                                                            <td className="px-4 py-3 text-muted">
                                                                Completed
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    <div className="mt-5">
                                        <Link href="/workspace" className="text-sm text-brand hover:underline">
                                            Get a new pass →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preferences Section */}
                        {activeSection === "preferences" && (
                            <div className="bg-surface rounded-xl border border-subtle p-6">
                                <h2 className="font-semibold text-primary">Preferences</h2>
                                <p className="text-sm text-muted mt-1 mb-6">
                                    Customize how Recruiter in Your Pocket feels and behaves.
                                </p>

                                <div className="space-y-0">
                                    {/* Dark Mode Toggle */}
                                    <div className="flex items-start justify-between py-4 border-b border-subtle">
                                        <div className="pr-4">
                                            <div className="text-sm font-medium text-primary">Dark mode</div>
                                            <p className="text-xs text-muted mt-0.5">
                                                Use a darker theme that is easier on the eyes.
                                            </p>
                                        </div>
                                        <Toggle checked={darkMode} onChange={handleToggleDarkMode} />
                                    </div>

                                    {/* Show Sample Report Toggle */}
                                    <div className="flex items-start justify-between py-4 border-b border-subtle">
                                        <div className="pr-4">
                                            <div className="text-sm font-medium text-primary">Show sample report link in workspace</div>
                                            <p className="text-xs text-muted mt-0.5">
                                                Keep a shortcut to the sample report in your workspace.
                                            </p>
                                        </div>
                                        <Toggle checked={showSampleReport} onChange={() => setShowSampleReport(!showSampleReport)} />
                                    </div>

                                    {/* Email Reminders Toggle */}
                                    <div className="flex items-start justify-between py-4">
                                        <div className="pr-4">
                                            <div className="text-sm font-medium text-primary">Email reminders before a pass expires</div>
                                            <p className="text-xs text-muted mt-0.5">
                                                Get a quick reminder before your current pass ends.
                                            </p>
                                        </div>
                                        <Toggle checked={emailReminders} onChange={() => setEmailReminders(!emailReminders)} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delete Account Section */}
                        {activeSection === "delete" && (
                            <div className="bg-surface rounded-xl border border-danger/30 p-6">
                                <h2 className="font-semibold text-danger">Delete account</h2>
                                <p className="text-sm text-muted mt-1 mb-4">
                                    Permanently remove your account and all reports from Recruiter in Your Pocket.
                                </p>
                                <p className="text-sm text-danger mb-6">
                                    This action cannot be undone.
                                </p>

                                <div className="flex flex-col items-start gap-3">
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={deleting}
                                        className="btn-destructive"
                                    >
                                        {deleting ? "Deleting..." : deleteConfirm ? "Click again to confirm" : "Delete account"}
                                    </button>
                                    {deleteConfirm && (
                                        <button
                                            onClick={() => setDeleteConfirm(false)}
                                            className="text-sm text-muted hover:text-secondary hover:underline"
                                        >
                                            Go back to settings
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
