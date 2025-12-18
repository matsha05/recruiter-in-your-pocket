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
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                ) : (
                    <Link href="/" className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5 text-brand" />
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

            {/* Actions - Responsive */}
            <div className="flex items-center gap-1 md:gap-2">
                {/* Sample Report - Hidden on mobile (accessible via header menu or report CTA) */}
                <button
                    onClick={onSampleReport}
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                    <FileText className="w-4 h-4" />
                    <span>Sample Report</span>
                </button>

                {/* New Report - Icon only on mobile */}
                <button
                    onClick={onNewReport}
                    className="flex items-center gap-2 px-2 md:px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                    aria-label="New Report"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden md:inline">New Report</span>
                </button>

                {!user ? (
                    <button
                        className="px-2 md:px-3 py-1.5 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                        onClick={onSignIn}
                    >
                        <span className="hidden sm:inline">Sign In</span>
                        <span className="sm:hidden">Sign In</span>
                    </button>
                ) : (
                    <div className="ml-1 md:ml-2">
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
