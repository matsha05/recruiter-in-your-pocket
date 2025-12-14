"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ThemeToggle from "../shared/ThemeToggle";
import { ArrowRight, Settings } from "lucide-react";
import type { AuthUser } from "@/components/providers/AuthProvider";

interface HeaderProps {
    user?: AuthUser | null;
    onSignIn?: () => void;
    onSignOut?: () => void;
}

export default function Header({ user, onSignIn, onSignOut }: HeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const userInitial = user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "?";

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-surface dark:bg-surface backdrop-blur-sm sticky top-0 z-50 border-b border-subtle">
            <Link href="/" className="font-display font-extrabold text-lg text-primary hover:text-brand dark:hover:text-brand-strong transition-colors">
                Recruiter in Your Pocket
            </Link>

            <div className="flex items-center gap-4">
                <Link href="/research" className="text-sm font-medium text-muted hover:text-foreground transition-colors hidden md:block">
                    Research Library
                </Link>

                {!user ? (
                    <button className="btn-ghost font-semibold" onClick={onSignIn}>
                        Sign In
                    </button>
                ) : (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-hover transition-colors"
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span className="w-8 h-8 flex items-center justify-center bg-brand text-white rounded-full font-semibold text-sm">
                                {userInitial}
                            </span>
                            <span className="text-sm text-secondary max-w-[120px] truncate hidden sm:block">
                                {user.firstName || user.email}
                            </span>
                            <span className="text-muted text-xs">▾</span>
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-subtle rounded-xl shadow-modal z-50 py-2">
                                <div className="px-4 py-2 text-xs text-muted truncate">{user.email}</div>
                                <div className="border-t border-subtle my-1" />
                                <Link
                                    href="/workspace"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-secondary hover:bg-brand-soft transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                                    Go to Workspace
                                </Link>
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-secondary hover:bg-brand-soft transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <Settings className="w-4 h-4" strokeWidth={2} />
                                    Settings
                                </Link>
                                <div className="border-t border-subtle my-1" />
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger hover:bg-warning-soft transition-colors"
                                    type="button"
                                    onClick={() => { onSignOut?.(); setIsDropdownOpen(false); }}
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                )}
                <ThemeToggle />
            </div>
        </header>
    );
}
