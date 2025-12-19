"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "../shared/ThemeToggle";
import { Plus, Files, ArrowLeft, Settings, FileText, LogOut, CreditCard } from "lucide-react";
import { PocketMark, Wordmark } from "@/components/icons";
import { UserNav } from "../shared/UserNav";
import { Button } from "@/components/ui/button";
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
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-2"
                        onClick={onBack}
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
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
                <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex"
                    onClick={onSampleReport}
                >
                    <FileText className="w-4 h-4 mr-2" />
                    Sample Report
                </Button>

                {/* New Report - Icon only on mobile */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNewReport}
                    aria-label="New Report"
                >
                    <Plus className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">New Report</span>
                </Button>

                {!user ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSignIn}
                    >
                        Sign In
                    </Button>
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
