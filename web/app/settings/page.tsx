"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import ThemeToggle from "@/components/shared/ThemeToggle";

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
            <div className="min-h-screen bg-gray-50 dark:bg-[#020617] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to view settings</p>
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

    // Toggle component
    const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
        <button
            onClick={onChange}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-indigo-500" : "bg-gray-200 dark:bg-gray-700"
                }`}
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""
                }`} />
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#020617]">
            {/* Header */}
            <header className="bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="font-display text-lg font-bold text-gray-900 dark:text-white">
                        Recruiter in Your Pocket
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/workspace" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                            ← Back to Workspace
                        </Link>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6">
                {/* Page Header - Above Two Column Layout */}
                <div className="pt-12 pb-8">
                    <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account, passes, and preferences.</p>
                </div>

                {/* Two Column Layout */}
                <div className="flex gap-8 pb-16">
                    {/* Left Sidebar */}
                    <nav className="w-52 flex-shrink-0">
                        {/* User Identity */}
                        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.firstName || user.email?.split("@")[0]}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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
                                                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium"
                                                : item.id === "delete"
                                                    ? "text-gray-500 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                            }`}
                                    >
                                        {activeSection === item.id && (
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r" />
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
                            <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                                <h2 className="font-semibold text-gray-900 dark:text-white">Profile</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">Update your basic account info.</p>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={user.email}
                                            disabled
                                            className="input bg-gray-50 dark:bg-gray-800 cursor-not-allowed text-gray-500"
                                        />
                                        <p className="text-xs text-gray-400 mt-1.5">Used for login and pass access.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
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
                                            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:underline"
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
                                <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="font-semibold text-gray-900 dark:text-white">Your current plan</h2>
                                            {activePass ? (
                                                <>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">
                                                        {getTierLabel(activePass.tier)}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {formatPassExpiry(activePass.expires_at, activePass.tier)}
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">Free plan</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                        You can run two full reports at no cost. Upgrade when you are ready for more.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        {activePass && (
                                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Past Passes Card */}
                                <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Pass history</h2>

                                    {loadingPasses ? (
                                        <p className="text-sm text-gray-500">Loading...</p>
                                    ) : pastPasses.length === 0 ? (
                                        <p className="text-sm text-gray-400">You have not used any passes yet.</p>
                                    ) : (
                                        <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                                    <tr>
                                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pass</th>
                                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</th>
                                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pastPasses.map(pass => (
                                                        <tr key={pass.id} className="border-t border-gray-100 dark:border-gray-800">
                                                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                                                                {getTierLabel(pass.tier)}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                                Used on {formatDate(pass.created_at)}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-400">
                                                                Completed
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    <div className="mt-5">
                                        <Link href="/workspace" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                                            Get a new pass →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preferences Section */}
                        {activeSection === "preferences" && (
                            <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                                <h2 className="font-semibold text-gray-900 dark:text-white">Preferences</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
                                    Customize how Recruiter in Your Pocket feels and behaves.
                                </p>

                                <div className="space-y-0">
                                    {/* Dark Mode Toggle */}
                                    <div className="flex items-start justify-between py-4 border-b border-gray-100 dark:border-gray-800">
                                        <div className="pr-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">Dark mode</div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                Use a darker theme that is easier on the eyes.
                                            </p>
                                        </div>
                                        <Toggle checked={darkMode} onChange={handleToggleDarkMode} />
                                    </div>

                                    {/* Show Sample Report Toggle */}
                                    <div className="flex items-start justify-between py-4 border-b border-gray-100 dark:border-gray-800">
                                        <div className="pr-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">Show sample report link in workspace</div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                Keep a shortcut to the sample report in your workspace.
                                            </p>
                                        </div>
                                        <Toggle checked={showSampleReport} onChange={() => setShowSampleReport(!showSampleReport)} />
                                    </div>

                                    {/* Email Reminders Toggle */}
                                    <div className="flex items-start justify-between py-4">
                                        <div className="pr-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">Email reminders before a pass expires</div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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
                            <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-red-200 dark:border-red-500/30 p-6">
                                <h2 className="font-semibold text-red-600 dark:text-red-400">Delete account</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
                                    Permanently remove your account and all reports from Recruiter in Your Pocket.
                                </p>
                                <p className="text-sm text-red-500 dark:text-red-400 mb-6">
                                    This action cannot be undone.
                                </p>

                                <div className="flex flex-col items-start gap-3">
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={deleting}
                                        className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                                    >
                                        {deleting ? "Deleting..." : deleteConfirm ? "Click again to confirm" : "Delete account"}
                                    </button>
                                    {deleteConfirm && (
                                        <button
                                            onClick={() => setDeleteConfirm(false)}
                                            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:underline"
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
