"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserNav } from "@/components/shared/UserNav";
import { Wordmark } from "@/components/icons";
import { cn } from "@/lib/utils";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import { NavDrawer, NavDrawerDivider, NavDrawerLink } from "./NavDrawer";

interface SiteHeaderProps {
    /** Show "Research" nav link (hide on research hub itself) */
    showResearchLink?: boolean;
    /** Show the "After the offer" nav link (hidden on its own hub) */
    showResourcesLink?: boolean;
}

export function SiteHeader({ showResearchLink = true, showResourcesLink = true }: SiteHeaderProps) {
    const pathname = usePathname();
    const { user, signOut, isLoading: authLoading } = useAuth();

    const isMarketingActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);
    const isWorkspaceActive = pathname === "/workspace" || pathname?.startsWith("/workspace/");
    const isReportsActive = pathname === "/reports" || pathname?.startsWith("/reports/");

    return (
        <header className="site-header">
            <div className="app-shell-inner">
                <Link href="/" aria-label="Recruiter in Your Pocket home" className="focus-ring group flex min-h-11 shrink-0 items-center justify-start gap-3 rounded-md">
                    <Wordmark stackOnPhones className="site-wordmark text-foreground" />
                </Link>

                <nav className="flex shrink-0 items-center gap-2 md:gap-4 xl:gap-6" aria-label="Main navigation">
                    <div className="hidden items-center gap-3 xl:flex">
                        <SiteNavLink href="/#how-it-works">How it works</SiteNavLink>
                        <SiteNavLink href="/sample-report" active={isMarketingActive("/sample-report")}>Sample report</SiteNavLink>
                        <SiteNavLink href="/pricing" active={isMarketingActive("/pricing")}>Pricing</SiteNavLink>
                        {isLaunchFlagEnabled("extensionSync") && (
                            <SiteNavLink href="/extension" active={isMarketingActive("/extension")}>Extension</SiteNavLink>
                        )}
                        {showResearchLink && <SiteNavLink href="/research" active={isMarketingActive("/research")}>Research</SiteNavLink>}
                        {showResourcesLink && <SiteNavLink href="/resources" active={isMarketingActive("/resources")}>After the offer</SiteNavLink>}
                    </div>

                    {authLoading ? (
                        <div
                            className="hidden h-12 w-36 shrink-0 items-center justify-center gap-2 rounded-[10px] border border-border bg-card text-xs font-medium text-muted-foreground md:flex"
                            role="status"
                            aria-label="Checking account status"
                        >
                            <span className="size-1.5 animate-pulse rounded-full bg-brand motion-reduce:animate-none" aria-hidden="true" />
                            Account
                        </div>
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden items-center gap-4 xl:flex">
                                <SiteNavLink href="/reports" active={isReportsActive}>My reports</SiteNavLink>
                                <UserNav user={user} onSignOut={signOut} />
                            </div>
                            <Button asChild className="hidden md:inline-flex">
                                <Link
                                    href="/workspace"
                                    aria-current={isWorkspaceActive ? "page" : undefined}
                                    data-analytics-cta="header_new_report"
                                >
                                    New report
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/auth"
                                aria-current={isMarketingActive("/auth") ? "page" : undefined}
                                className={cn(
                                    "focus-ring hidden min-h-12 items-center whitespace-nowrap rounded-md px-2 text-sm font-medium transition-colors md:inline-flex",
                                    "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Sign in
                            </Link>
                            <Button asChild className="hidden md:inline-flex">
                                <Link href="/workspace" data-analytics-cta="header_report">
                                    Get your free report
                                </Link>
                            </Button>
                        </div>
                    )}
                    <SiteMobileMenu
                        pathname={pathname}
                        user={user}
                        onSignOut={signOut}
                        authLoading={authLoading}
                        showResearchLink={showResearchLink}
                        showResourcesLink={showResourcesLink}
                    />
                </nav>
            </div>
        </header>
    );
}

function SiteMobileMenu({
    pathname,
    user,
    onSignOut,
    authLoading,
    showResearchLink,
    showResourcesLink,
}: {
    pathname: string | null;
    user: { email?: string | null } | null;
    onSignOut: () => Promise<void> | void;
    authLoading: boolean;
    showResearchLink: boolean;
    showResourcesLink: boolean;
}) {
    const navigationTarget = useRef<URL | null>(null);
    const menuClosed = useRef(false);
    const focusFrame = useRef<number | null>(null);

    const focusDestination = useCallback(() => {
        const target = navigationTarget.current;
        // Cross-page navigation may finish after the sheet's closing animation.
        if (!menuClosed.current || !target || pathname !== target.pathname) return;
        const destination = target.hash
            ? document.getElementById(decodeURIComponent(target.hash.slice(1)))
            : document.getElementById("main-content");
        if (!destination) return;
        navigationTarget.current = null;
        if (!destination.hasAttribute("tabindex")) destination.setAttribute("tabindex", "-1");
        destination.focus({ preventScroll: true });
        destination.scrollIntoView({ block: "start" });
    }, [pathname]);

    useEffect(() => {
        if (menuClosed.current && navigationTarget.current) {
            focusFrame.current = requestAnimationFrame(focusDestination);
        }
        return () => {
            if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current);
        };
    }, [focusDestination]);

    return (
        <NavDrawer
            triggerClassName="xl:hidden"
            description="Navigate to the main areas of Recruiter in Your Pocket."
            onOpenChange={open => {
                if (open) {
                    navigationTarget.current = null;
                    menuClosed.current = false;
                }
            }}
            onCloseAutoFocus={event => {
                if (!navigationTarget.current) return;
                // Escape and dismissal restore the trigger normally; navigation
                // should keep focus at its destination instead of jumping back.
                event.preventDefault();
                menuClosed.current = true;
                focusFrame.current = requestAnimationFrame(focusDestination);
            }}
            onNavClickCapture={event => {
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
                if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
                const target = new URL(link.href, window.location.href);
                if (target.origin === window.location.origin) navigationTarget.current = target;
            }}
        >
            <NavDrawerLink href="/#how-it-works">How it works</NavDrawerLink>
            {pathname === "/" && <>
                <NavDrawerLink href="/sample-report">Sample report</NavDrawerLink>
                <NavDrawerLink href="/#about">About</NavDrawerLink>
            </>}
            <NavDrawerLink href="/pricing" active={isPathActive(pathname, "/pricing")}>Pricing</NavDrawerLink>
            {isLaunchFlagEnabled("extensionSync") && <NavDrawerLink href="/extension" active={isPathActive(pathname, "/extension")}>Extension</NavDrawerLink>}
            {showResearchLink && <NavDrawerLink href="/research" active={isPathActive(pathname, "/research")}>Research</NavDrawerLink>}
            {showResourcesLink && <NavDrawerLink href="/resources" active={isPathActive(pathname, "/resources")}>After the offer</NavDrawerLink>}
            <NavDrawerDivider />
            {authLoading ? (
                <p className="min-h-12 px-3 py-3 text-base text-muted-foreground" role="status" aria-live="polite">
                    Checking account…
                </p>
            ) : user ? (
                <>
                    <NavDrawerLink href="/workspace" active={isPathActive(pathname, "/workspace")}>New report</NavDrawerLink>
                    <NavDrawerLink href="/reports" active={isPathActive(pathname, "/reports")}>My reports</NavDrawerLink>
                    <NavDrawerLink href="/settings/account" active={isPathActive(pathname, "/settings")}>Settings</NavDrawerLink>
                    <SheetClose asChild>
                        <button
                            type="button"
                            onClick={() => onSignOut()}
                            className="focus-ring min-h-12 rounded-[10px] px-3 py-3 text-left text-base font-medium text-muted-foreground riyp-surface-link hover:text-foreground"
                        >
                            Sign out
                        </button>
                    </SheetClose>
                </>
            ) : (
                <>
                    <NavDrawerLink href="/auth" active={isPathActive(pathname, "/auth")}>Sign in</NavDrawerLink>
                    <SheetClose asChild>
                        <Button asChild className="mt-4">
                            <Link href="/workspace" data-analytics-cta="mobile_menu_report">
                                Get your free report
                            </Link>
                        </Button>
                    </SheetClose>
                </>
            )}
        </NavDrawer>
    );
}

function isPathActive(pathname: string | null, href: string) {
    return pathname === href || pathname?.startsWith(`${href}/`) || false;
}

function SiteNavLink({
    href,
    children,
    className,
    active = false,
}: {
    href: string;
    children: React.ReactNode;
    className?: string;
    active?: boolean;
}) {
    return (
        <Link
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
                "site-nav-link",
                active && "site-nav-link-active",
                className
            )}
        >
            {children}
        </Link>
    );
}
