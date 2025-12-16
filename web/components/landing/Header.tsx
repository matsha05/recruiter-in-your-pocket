"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ThemeToggle from "../shared/ThemeToggle";
import { Settings, LogOut, ArrowRight, User } from "lucide-react";
import { PocketMark } from "@/components/icons";
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
        <header className="flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border/10">
            <Link href="/" className="flex items-center gap-2 group">
                <PocketMark className="w-6 h-6 text-brand group-hover:text-brand/80 transition-colors" />
                <span className="font-display font-medium tracking-tight text-xl text-foreground group-hover:opacity-80 transition-opacity">
                    Recruiter in Your Pocket
                </span>
            </Link>

            <div className="flex items-center gap-4">
                <Link href="/research" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:block">
                    Research Library
                </Link>

                {!user ? (
                    <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={onSignIn}>
                        Sign In
                    </button>
                ) : (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary/50 transition-colors"
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span className="w-8 h-8 flex items-center justify-center bg-brand text-white rounded-full font-semibold text-sm">
                                {userInitial}
                            </span>
                            <span className="text-sm text-muted-foreground max-w-[120px] truncate hidden sm:block">
                                {user.firstName || user.email}
                            </span>
                            <span className="text-muted-foreground text-xs">▾</span>
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border/10 rounded-md shadow-lg z-50 py-2">
                                <div className="px-4 py-2 text-xs text-muted-foreground truncate">{user.email}</div>
                                <div className="border-t border-border/10 my-1" />
                                <Link
                                    href="/workspace"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:bg-secondary/50 transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                                    Go to Workspace
                                </Link>
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:bg-secondary/50 transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <Settings className="w-4 h-4" strokeWidth={2} />
                                    Settings
                                </Link>
                                <div className="border-t border-border/10 my-1" />
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
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
