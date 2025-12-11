"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ThemeToggle from "../shared/ThemeToggle";

interface User {
    email?: string;
    firstName?: string;
}

interface HeaderProps {
    user?: User | null;
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
            <Link href="/" className="font-display font-extrabold text-lg text-primary hover:text-brand dark:hover:text-brand-strong transition-colors" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                Recruiter in Your Pocket
            </Link>

            <div className="flex items-center gap-3">
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
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <path d="M13 6L19 12M19 12L13 18M19 12H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Go to Workspace
                                </Link>
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-secondary hover:bg-brand-soft transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
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
