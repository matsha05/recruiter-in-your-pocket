"use client";

import Link from "next/link";
import { LogOut, Files, Settings } from "lucide-react";
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
                        "flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-muted transition-colors border border-transparent hover:border-border group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        className
                    )}
                >
                    <span className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-xs font-bold shadow-sm group-hover:shadow-md transition-shadow">
                        {userInitial}
                    </span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56 border-border/60 shadow-lg" align="end">
                {/* User info header */}
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.firstName || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>

                    {/* Membership Status Badge */}
                    <div className="mt-2 text-[10px] font-medium uppercase tracking-wider flex flex-col gap-1">
                        {user.membership === "pro" && (
                            <span className="text-primary flex items-center gap-1">
                                Pro Member • <span className="text-muted-foreground lowercase normal-case">{user.daysLeft} days left</span>
                            </span>
                        )}
                        {user.membership === "audit" && (
                            <span className="text-success">1 Review Available</span>
                        )}
                        {(user.membership === "free" || !user.membership) && (
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Free Plan</span>
                                {user.freeUsesLeft !== undefined && user.freeUsesLeft > 0 && (
                                    <span className="text-moss lowercase normal-case">• {user.freeUsesLeft} free {user.freeUsesLeft === 1 ? 'review' : 'reviews'} remaining</span>
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
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="w-full">
                                <Settings className="mr-2 h-4 w-4" />
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
