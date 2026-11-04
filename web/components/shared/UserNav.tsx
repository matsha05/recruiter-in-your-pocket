"use client";

import Link from "next/link";
import { Files, SignOut } from "@phosphor-icons/react";
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
                <button type="button"
                    aria-label="Open account menu"
                    className={cn(
                        "flex size-11 items-center justify-center rounded-full transition-all hover:ring-2 hover:ring-border/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        className
                    )}
                >
                    <span className="size-8 flex items-center justify-center bg-brand text-white rounded-full text-xs font-semibold ring-1 ring-border/20">
                        {userInitial}
                    </span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56 border-border/60 shadow-sm" align="end">
                {/* User info header */}
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-y-1">
                        <p className="text-sm font-medium">{user.firstName || 'Your account'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>

                    {/* Membership Status Badge */}
                    <div className="mt-2 text-xs font-medium flex flex-col gap-1">
                        {user.membership === "lifetime" && (
                            <span className="text-brand flex items-center gap-1">
                                Lifetime access
                            </span>
                        )}
                        {user.membership === "monthly" && (
                            <span className="text-brand flex items-center gap-1">
                                Monthly plan
                                {typeof user.daysLeft === "number" ? (
                                    <span className="text-muted-foreground lowercase normal-case">• {user.daysLeft} days left</span>
                                ) : null}
                            </span>
                        )}
                        {user.membership === "credit" && (
                            <span className="text-success">
                                {user.paidUsesLeft || 0} {(user.paidUsesLeft || 0) === 1 ? "report" : "reports"} left on your pass
                            </span>
                        )}
                        {(user.membership === "free" || !user.membership) && (
                            user.freeUsesLeft !== undefined && user.freeUsesLeft > 0
                                ? <span className="text-success">{user.freeUsesLeft === 1 ? "Free report available" : `${user.freeUsesLeft} free reports available`}</span>
                                : <span className="text-muted-foreground">Free report used</span>
                        )}
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    {onHistoryClick ? (
                        <DropdownMenuItem onClick={onHistoryClick}>
                            <Files className="mr-2 size-4" />
                            My reports
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem asChild>
                            <Link href="/reports" className="w-full">
                                <Files className="mr-2 size-4" />
                                My reports
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
                            <Link href="/settings/account" className="w-full">
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
                    <SignOut className="mr-2 size-4" />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
