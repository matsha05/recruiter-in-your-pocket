"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "../shared/ThemeToggle";
import { Plus, ArrowLeft, FileText, ChevronDown, Linkedin } from "lucide-react";
import { PocketMark, Wordmark } from "@/components/icons";
import { UserNav } from "../shared/UserNav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/components/providers/AuthProvider";

interface WorkspaceHeaderProps {
    user?: AuthUser | null;
    onNewReport?: () => void;
    onResumeSample?: () => void;
    onLinkedInSample?: () => void;
    onSignIn?: () => void;
    onSignOut?: () => void;
    onHistory?: () => void;
    showBack?: boolean;
    onBack?: () => void;
}

export default function WorkspaceHeader({
    user,
    onNewReport,
    onResumeSample,
    onLinkedInSample,
    onSignIn,
    onSignOut,
    onHistory,
    showBack,
    onBack,
}: WorkspaceHeaderProps) {
    const [isExampleOpen, setIsExampleOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsExampleOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                <span className="font-display text-lg text-foreground/80">The Studio</span>
            </div>

            {/* Actions - Responsive */}
            <div className="flex items-center gap-1 md:gap-2">
                {/* Examples Dropdown */}
                <div className="relative hidden md:block" ref={dropdownRef}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExampleOpen(!isExampleOpen)}
                        className="gap-1"
                    >
                        <FileText className="w-4 h-4" />
                        Examples
                        <ChevronDown className={cn(
                            "w-3.5 h-3.5 transition-transform",
                            isExampleOpen && "rotate-180"
                        )} />
                    </Button>

                    {isExampleOpen && (
                        <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded shadow-sm py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                            <button
                                onClick={() => {
                                    onResumeSample?.();
                                    setIsExampleOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                            >
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span>Resume Example</span>
                            </button>
                            <button
                                onClick={() => {
                                    onLinkedInSample?.();
                                    setIsExampleOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                            >
                                <Linkedin className="w-4 h-4 text-muted-foreground" />
                                <span>LinkedIn Example</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* New Report - Icon only on mobile */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNewReport}
                    aria-label="New Report"
                >
                    <Plus className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">New Review</span>
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
