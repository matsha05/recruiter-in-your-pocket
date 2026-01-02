"use client";

import Link from "next/link";
import { LogOut, Files } from "lucide-react";
import { SettingsIcon } from "@/components/ui/settings";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    const userInitial = user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "?";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "flex items-center justify-center rounded-full hover:ring-2 hover:ring-border/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        className
                    )}
                >
                    <span className="w-8 h-8 flex items-center justify-center bg-brand text-white rounded-full text-xs font-semibold ring-1 ring-border/20">
                        {userInitial}
                    </span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56 border-border/60 shadow-sm" align="end">
                {/* User info header */}
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.firstName || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>

                    {/* Membership Status Badge */}
                    <div className="mt-2 text-[10px] font-medium uppercase tracking-wider flex flex-col gap-1">
                        {user.membership === "pro" && (
                            <span className="text-brand flex items-center gap-1">
                                Pro Member • <span className="text-muted-foreground lowercase normal-case">{user.daysLeft} days left</span>
                            </span>
                        )}
                        {user.membership === "audit" && (
                            <span className="text-success">1 Review Available</span>
                        )}
                        {(user.membership === "free" || !user.membership) && (
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Free Plan</span>
                                {user.freeUsesLeft !== undefined && user.freeUsesLeft > 0 ? (
                                    <span className="text-success lowercase normal-case">• {user.freeUsesLeft} {user.freeUsesLeft === 1 ? 'review' : 'reviews'} remaining</span>
                                ) : (
                                    <span className="text-muted-foreground/60 lowercase normal-case">• 0 reviews remaining</span>
                                )}
                            </div>
                        )}
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    {onHistoryClick ? (
                        <DropdownMenuItem onClick={onHistoryClick}>
                            <Files className="mr-2 h-4 w-4" />
                            My Reports
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem asChild>
                            <Link href="/workspace" className="w-full">
                                <Files className="mr-2 h-4 w-4" />
                                My Reports
                            </Link>
                        </DropdownMenuItem>
                    )}

                    {onSettingsClick ? (
                        <DropdownMenuItem onClick={onSettingsClick}>
                            <SettingsIcon size={16} className="mr-2" />
                            Settings
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="w-full">
                                <SettingsIcon size={16} className="mr-2" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={onSignOut}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
