"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "../shared/ThemeToggle";
import { Plus, Files, ArrowLeft, Settings, FileText, LogOut, CreditCard } from "lucide-react";
import { UserNav } from "../shared/UserNav";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/components/providers/AuthProvider";

interface WorkspaceHeaderProps {
    user?: AuthUser | null;
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
        <header className="flex h-14 items-center justify-between px-6 border-b border-border bg-background sticky top-0 z-30">
            {/* Brand - Mobile Only (Hidden on Desktop to avoid duplication with Sidebar) */}
            <div className="flex items-center gap-4 md:hidden">
                <h1 className="font-serif italic font-semibold text-lg tracking-tight text-foreground">
                    Recruiter in Your Pocket
                </h1>
            </div>

            {/* Desktop Spacer (keeps right actions aligned if brand is hidden) */}
            <div className="hidden md:block" />

            <div className="flex items-center gap-2">
                <button
                    onClick={onSampleReport}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Sample Report</span>
                </button>

                {/* 
                   "New Report" button is often in the sidebar or main CTA area, 
                   but keeping it here as a primary action is fine.
                */}
                <button
                    onClick={onNewReport}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Report</span>
                </button>

                {!user ? (
                    <button
                        className="px-3 py-1.5 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                        onClick={onSignIn}
                    >
                        Sign In
                    </button>
                ) : (
                    <div className="ml-2">
                        <UserNav
                            user={user}
                            onSignOut={onSignOut || (() => { })}
                            onHistoryClick={onHistory}
                        />
                    </div>
                )}

                <div className="ml-2">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}

