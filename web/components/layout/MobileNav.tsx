"use client";

import { PASS_SPENT_LABEL, isPassSpent } from "@/lib/billing/accountPassStatus";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/components/providers/AuthProvider";
import { STUDIO_NAV, navLinkHref } from "@/lib/navigation";
import { NavDrawer, NavDrawerDivider, NavDrawerLink } from "./NavDrawer";

export function MobileNav({ workspaceReportVisible = false }: { workspaceReportVisible?: boolean }) {
    const pathname = usePathname();
    const { user, signOut, isLoading: authLoading } = useAuth();

    return (
        <NavDrawer
            triggerClassName="md:hidden"
            description="Open your reports, settings and account."
            footer={authLoading ? (
                <p className="min-h-11 text-sm text-muted-foreground" role="status" aria-live="polite">
                    Checking account…
                </p>
            ) : user ? (
                <div className="grid gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded bg-brand-tint font-semibold text-brand">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate font-medium">{user.email}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                {user.membership === "lifetime" && (
                                    <span className="inline-flex items-center gap-1">
                                        <span className="inline-flex items-center rounded-sm bg-brand-tint px-1.5 py-0.5 text-xs font-bold text-brand">Lifetime access</span>
                                    </span>
                                )}
                                {user.membership === "monthly" && (
                                    <span className="inline-flex items-center gap-1">
                                        <span className="inline-flex items-center rounded-sm bg-brand-tint px-1.5 py-0.5 text-xs font-bold text-brand">Monthly plan</span>
                                        {typeof user.daysLeft === "number" ? (
                                            <span className="text-xs font-medium text-muted-foreground">• {user.daysLeft} days left</span>
                                        ) : null}
                                    </span>
                                )}
                                {user.membership === "credit" && (
                                    <span className="inline-flex items-center rounded-sm bg-success/10 px-1.5 py-0.5 text-xs font-bold text-success">
                                        {user.paidUsesLeft || 0} {(user.paidUsesLeft || 0) === 1 ? "report" : "reports"} left on your pass
                                    </span>
                                )}
                                {(user.membership === "free" || !user.membership) && (
                                    user.freeUsesLeft !== undefined && user.freeUsesLeft > 0
                                        ? <span className="text-xs font-medium text-success">{user.freeUsesLeft === 1 ? "Free report available" : `${user.freeUsesLeft} free reports available`}</span>
                                        : <span className="text-xs font-medium text-muted-foreground">{isPassSpent(user) ? PASS_SPENT_LABEL : "Free report used"}</span>
                                )}
                            </p>
                        </div>
                    </div>
                    <SheetClose asChild>
                        <Button size="sm" variant="secondary" className="w-full justify-start" onClick={() => signOut()}>
                            <SignOut className="size-4" aria-hidden="true" />
                            Sign out
                        </Button>
                    </SheetClose>
                </div>
            ) : (
                <SheetClose asChild>
                    <Button size="sm" asChild className="w-full" variant="primary">
                        <Link href="/auth">Sign in</Link>
                    </Button>
                </SheetClose>
            )}
        >
            <NavDrawerLink href="/" active={pathname === "/"}>Home</NavDrawerLink>
            {STUDIO_NAV.map((item) => (
                <NavDrawerLink
                    key={item.href}
                    href={navLinkHref(item.href)}
                    active={
                        item.href === "/workspace"
                            ? (pathname === "/workspace" || pathname?.startsWith("/workspace/")) && !workspaceReportVisible
                            : item.href === "/reports" && workspaceReportVisible
                                ? true
                            : pathname === item.href || pathname?.startsWith(`${item.href}/`) || false
                    }
                >
                    {item.label}
                </NavDrawerLink>
            ))}
            <NavDrawerDivider />
            <NavDrawerLink href="/settings/account" active={pathname === "/settings" || pathname?.startsWith("/settings/") || false}>
                Settings
            </NavDrawerLink>
        </NavDrawer>
    );
}
