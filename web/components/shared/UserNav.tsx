"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Files, Settings, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/components/providers/AuthProvider";

interface UserNavProps {

    user: AuthUser;
    onSignOut: () => void;
    onHistoryClick?: () => void;
    onSettingsClick?: () => void;
    className?: string;
}

export function UserNav({
    user,
    onSignOut,
    onHistoryClick,
    onSettingsClick,
    className
}: UserNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const userInitial = user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "?";

    return (
        <div className={cn("relative", className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-muted transition-colors border border-transparent hover:border-border group"
            >
                <span className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-xs font-bold shadow-sm group-hover:shadow-md transition-shadow">
                    {userInitial}
                </span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-3 py-2 border-b border-border bg-muted/30">
                            <p className="text-xs font-medium text-foreground truncate">{user.firstName || 'User'}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>

                            {/* Membership Status Badge */}
                            <div className="mt-2 text-[10px] font-medium uppercase tracking-wider flex flex-col gap-1">
                                {user.membership === "pro" && (
                                    <span className="text-primary flex items-center gap-1">
                                        Pro Member • <span className="text-muted-foreground lowercase normal-case">{user.daysLeft} days left</span>
                                    </span>
                                )}
                                {user.membership === "audit" && (
                                    <span className="text-emerald-600">1 Audit Available</span>
                                )}
                                {(user.membership === "free" || !user.membership) && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-muted-foreground">Free Plan</span>
                                        {user.freeUsesLeft !== undefined && user.freeUsesLeft > 0 && (
                                            <span className="text-emerald-600 lowercase normal-case">• {user.freeUsesLeft} free audit remaining</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-1">
                            {onHistoryClick ? (
                                <button
                                    onClick={() => { onHistoryClick(); setIsOpen(false); }}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors text-left"
                                >
                                    <Files className="w-3.5 h-3.5" />
                                    My Reports
                                </button>
                            ) : (
                                <Link
                                    href="/workspace"
                                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors text-left"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Files className="w-3.5 h-3.5" />
                                    My Reports
                                </Link>
                            )}

                            {onSettingsClick ? (
                                <button
                                    onClick={() => { onSettingsClick(); setIsOpen(false); }}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors text-left"
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    Settings
                                </button>
                            ) : (
                                <Link
                                    href="/settings"
                                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors text-left"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    Settings
                                </Link>
                            )}
                        </div>

                        <div className="border-t border-border mt-1 p-1">
                            <button
                                onClick={() => { onSignOut(); setIsOpen(false); }}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors text-left"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
