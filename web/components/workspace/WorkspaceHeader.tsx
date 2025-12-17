"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "../shared/ThemeToggle";
import { Plus, Files, ArrowLeft, Settings, FileText, LogOut, CreditCard } from "lucide-react";
import { PocketMark, Wordmark } from "@/components/icons";
import { UserNav } from "../shared/UserNav";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/layout/MobileNav";
import type { AuthUser } from "@/components/providers/AuthProvider";

interface WorkspaceHeaderProps {
    user?: AuthUser | null;
    onNewReport?: () => void;
    onSampleReport?: () => void;
    onSignIn?: () => void;
    onSignOut?: () => void;
    onHistory?: () => void;
    showBack?: boolean;
    onBack?: () => void;
}

export default function WorkspaceHeader({
    user,
    onNewReport,
    onSampleReport,
    onSignIn,
    onSignOut,
    onHistory,
    showBack,
    onBack
}: WorkspaceHeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const userInitial = user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "?";

    return (
        <header className="flex h-14 items-center justify-between px-6 border-b border-border bg-background sticky top-0 z-30">
            {/* Brand - Mobile Only */}
            <div className="flex items-center gap-2 md:hidden">
                {showBack && onBack ? (
                    <button onClick={onBack} className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                ) : (
                    <Link href="/" className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5 text-brand" />
                        <Wordmark className="h-4 text-foreground" />
                    </Link>
                )}
            </div>

            {/* Brand - Desktop */}
            <div className="hidden md:flex items-center gap-2">
                <Link href="/" className="group flex items-center gap-2">
                    <PocketMark className="w-5 h-5 text-brand group-hover:text-brand/80 transition-colors" />
                    <Wordmark className="h-5 text-foreground group-hover:opacity-80 transition-opacity" />
                </Link>
                <span className="text-muted-foreground/30 text-xl font-light">/</span>
                <span className="font-display text-lg text-foreground/80">Workspace</span>
            </div>

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

