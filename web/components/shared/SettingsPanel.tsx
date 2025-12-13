"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { X } from "lucide-react";

interface Pass {
    id: string;
    tier: string;
    expires_at: string;
    created_at: string;
}

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
    const { user, refreshUser } = useAuth();
    const [firstName, setFirstName] = useState("");
    const [originalName, setOriginalName] = useState("");
    const [saving, setSaving] = useState(false);
    const [passes, setPasses] = useState<Pass[]>([]);
    const [activeTab, setActiveTab] = useState<"profile" | "passes">("profile");
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        if (user?.firstName) {
            setFirstName(user.firstName);
            setOriginalName(user.firstName);
        }
    }, [user]);

    useEffect(() => {
        if (isOpen && user) {
            fetch("/api/passes")
                .then(r => r.json())
                .then(data => {
                    if (data.ok && data.passes) setPasses(data.passes);
                })
                .catch(() => { });
        }
    }, [isOpen, user]);

    const handleSaveName = async () => {
        if (!firstName.trim() || firstName === originalName) return;
        setSaving(true);
        try {
            const supabase = createSupabaseBrowserClient();
            await supabase.auth.updateUser({ data: { first_name: firstName.trim() } });
            await refreshUser();
            setOriginalName(firstName.trim());
        } catch { }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            return;
        }
        // TODO: Implement delete account
        onClose();
    };

    const formatTimeRemaining = (expiresAt: string) => {
        const diff = new Date(expiresAt).getTime() - Date.now();
        if (diff <= 0) return "Expired";
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        return days > 0 ? `${days}d ${hours % 24}h left` : `${hours}h left`;
    };

    const getTierLabel = (tier: string) => tier === "30d" ? "30-Day" : "24-Hour";

    if (!isOpen) return null;

    const activePass = passes.find(p => new Date(p.expires_at) > new Date());

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-[999]"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-80 bg-surface shadow-2xl z-[1000] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-subtle">
                    <h2 className="font-semibold text-primary">Settings</h2>
                    <button onClick={onClose} className="p-1 text-muted hover:text-secondary">
                        <X className="w-5 h-5" strokeWidth={2} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-subtle">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === "profile"
                            ? "text-brand border-b-2 border-brand"
                            : "text-muted hover:text-secondary"
                            }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab("passes")}
                        className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === "passes"
                            ? "text-brand border-b-2 border-brand"
                            : "text-muted hover:text-secondary"
                            }`}
                    >
                        Passes
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === "profile" ? (
                        <div className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-xs font-medium text-muted mb-1">Email</label>
                                <div className="text-sm text-primary truncate">{user?.email}</div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-medium text-muted mb-1">Name</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Your name"
                                        className="input text-sm flex-1"
                                    />
                                    <button
                                        onClick={handleSaveName}
                                        disabled={saving || firstName === originalName}
                                        className="btn-secondary text-xs px-3"
                                    >
                                        {saving ? "..." : "Save"}
                                    </button>
                                </div>
                            </div>

                            {/* Active Pass */}
                            {activePass && (
                                <div className="p-3 bg-success-soft rounded-lg">
                                    <div className="text-xs text-success font-medium">Active Pass</div>
                                    <div className="text-sm text-primary">
                                        {getTierLabel(activePass.tier)} • {formatTimeRemaining(activePass.expires_at)}
                                    </div>
                                </div>
                            )}

                            {/* Danger Zone */}
                            <div className="pt-4 border-t border-subtle">
                                <button
                                    onClick={handleDelete}
                                    className={`text-xs ${deleteConfirm ? "text-danger font-medium" : "text-muted hover:text-danger"}`}
                                >
                                    {deleteConfirm ? "Click again to confirm" : "Delete account"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {passes.length === 0 ? (
                                <p className="text-sm text-muted">No passes yet</p>
                            ) : (
                                passes.map(pass => {
                                    const isActive = new Date(pass.expires_at) > new Date();
                                    return (
                                        <div
                                            key={pass.id}
                                            className={`p-3 rounded-lg border ${isActive
                                                ? "border-[var(--status-success)]/30 bg-success-soft"
                                                : "border-subtle"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-primary">
                                                    {getTierLabel(pass.tier)} Pass
                                                </span>
                                                {isActive && (
                                                    <span className="text-xs text-success">Active</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted mt-1">
                                                {isActive
                                                    ? formatTimeRemaining(pass.expires_at)
                                                    : `Expired ${new Date(pass.expires_at).toLocaleDateString()}`
                                                }
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
