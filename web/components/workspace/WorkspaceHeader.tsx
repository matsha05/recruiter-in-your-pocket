"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "../shared/ThemeToggle";
import { Plus, Files, ArrowLeft, Settings } from "lucide-react";

interface User {
    email?: string;
    firstName?: string;
}

interface WorkspaceHeaderProps {
    user?: User | null;
    onNewReport?: () => void;
    onSampleReport?: () => void;
    onSignIn?: () => void;
    onSignOut?: () => void;
    onHistory?: () => void;
}

export default function WorkspaceHeader({
    user,
    onNewReport,
    onSampleReport,
    onSignIn,
    onSignOut,
    onHistory
}: WorkspaceHeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const userInitial = user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "?";

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-surface border-b border-subtle">
            <Link href="/" className="font-display font-bold text-lg text-primary hover:text-brand dark:hover:text-brand-strong transition-colors">
                Recruiter in Your Pocket
            </Link>

            <div className="flex items-center gap-3">
                <button className="btn-ghost" onClick={onSampleReport}>
                    📄 Sample Report
                </button>

                <button
                    onClick={onNewReport}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-success text-white 
                        font-semibold rounded-lg shadow-button hover:opacity-90 
                        transition-all duration-200"
                >
                    <Plus className="w-4 h-4" strokeWidth={2} />
                    New Report
                </button>

                {!user ? (
                    <button className="btn-ghost font-semibold" onClick={onSignIn}>
                        Sign In
                    </button>
                ) : (
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-hover transition-colors"
                        >
                            <span className="w-8 h-8 flex items-center justify-center bg-brand text-white rounded-full font-semibold text-sm">
                                {userInitial}
                            </span>
                            <span className="text-sm text-primary max-w-[120px] truncate">
                                {user.firstName || user.email}
                            </span>
                            <span className="text-muted text-xs">▾</span>
                        </button>

                        {isDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsDropdownOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-1 w-56 bg-surface border border-subtle rounded-xl shadow-modal z-50 py-2">

                                    <div className="px-4 py-2 text-xs text-muted truncate">
                                        {user.email}
                                    </div>
                                    <div className="border-t border-subtle my-1" />

                                    <button
                                        onClick={() => { onHistory?.(); setIsDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-secondary hover:bg-brand-soft transition-colors"
                                    >
                                        <Files className="w-4 h-4" strokeWidth={2} />
                                        My Reports
                                    </button>

                                    <button
                                        onClick={() => { onNewReport?.(); setIsDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-secondary hover:bg-brand-soft transition-colors"
                                    >
                                        <Plus className="w-4 h-4" strokeWidth={2} />
                                        New Report
                                    </button>

                                    <div className="border-t border-subtle my-1" />

                                    <Link
                                        href="/"
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-secondary hover:bg-brand-soft transition-colors"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                                        Home
                                    </Link>

                                    <Link
                                        href="/settings"
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-secondary hover:bg-brand-soft transition-colors"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <Settings className="w-4 h-4" strokeWidth={2} />
                                        Settings
                                    </Link>

                                    <button
                                        onClick={() => { onSignOut?.(); setIsDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger hover:bg-warning-soft transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <ThemeToggle />
            </div>
        </header>
    );
}
