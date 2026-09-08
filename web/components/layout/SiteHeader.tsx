"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserNav } from "@/components/shared/UserNav";
import { Wordmark } from "@/components/icons";
import { cn } from "@/lib/utils";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { ArrowRight, List } from "@phosphor-icons/react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import alpine from "./AlpineHeader.module.css";

interface SiteHeaderProps {
    /** Show "Research" nav link (hide on research hub itself) */
    showResearchLink?: boolean;
    /** Show "Resources" nav link (hide on resources hub itself) */
    showResourcesLink?: boolean;
}

export function SiteHeader({ showResearchLink = true, showResourcesLink = true }: SiteHeaderProps) {
    const pathname = usePathname();
    const { user, signOut, isLoading: authLoading } = useAuth();

    const isMarketingActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);
    const isStudioActive = pathname === "/workspace" || pathname?.startsWith("/workspace/") || pathname === "/reports" || pathname?.startsWith("/reports/");

    if (pathname === "/") {
        return (
            <header className={`site-header ${alpine.header}`}>
                <div className={`app-shell-inner ${alpine.inner}`}>
                    <Link href="/" aria-label="Recruiter in Your Pocket home" className={alpine.wordmark}>
                        Recruiter<br />in your<br />pocket
                    </Link>
                    <nav className={alpine.navigation} aria-label="Main navigation">
                        <div className={alpine.links}>
                            <Link href="/#how-it-works">How it works</Link>
                            <Link href="/sample-report">Sample report</Link>
                            <Link href="/#about">About</Link>
                            <Link href="/research">Research</Link>
                        </div>
                        <Link href="/workspace" className={alpine.cta}>
                            {user ? "Open my workspace" : "Get your free report"}<ArrowRight aria-hidden="true" />
                        </Link>
                        <SiteMobileMenu pathname={pathname} user={user} onSignOut={signOut} authLoading={authLoading} showResearchLink={showResearchLink} showResourcesLink={showResourcesLink} />
                    </nav>
                </div>
            </header>
        );
    }

    return (
        <header className="site-header">
            <div className="app-shell-inner">
                <Link href="/" aria-label="Recruiter in Your Pocket home" className="focus-ring group flex min-h-11 shrink-0 items-center justify-start gap-3 rounded-md">
                    <Wordmark className="site-wordmark text-foreground" />
                </Link>

                <nav className="flex shrink-0 items-center gap-2 md:gap-4 xl:gap-6" aria-label="Main navigation">
                    <div className="hidden items-center gap-3 xl:flex">
                        <SiteNavLink href="/#how-it-works">How it works</SiteNavLink>
                        <SiteNavLink href="/pricing" active={isMarketingActive("/pricing")}>Pricing</SiteNavLink>
                        {isLaunchFlagEnabled("extensionSync") && (
                            <SiteNavLink href="/extension" active={isMarketingActive("/extension")}>Extension</SiteNavLink>
                        )}
                        {showResearchLink && <SiteNavLink href="/research" active={isMarketingActive("/research")}>Research</SiteNavLink>}
                        {showResourcesLink && <SiteNavLink href="/resources" active={isMarketingActive("/resources")}>Resources</SiteNavLink>}
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
                            <Link
                                href="/workspace"
                                aria-current={isStudioActive ? "page" : undefined}
                                className="site-header-cta focus-ring hidden min-h-12 min-w-28 items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 md:inline-flex xl:hidden"
                            >
                                Studio
                            </Link>
                            <div className="hidden items-center gap-4 xl:flex">
                                <SiteNavLink href="/workspace" active={isStudioActive}>Studio</SiteNavLink>
                                <UserNav user={user} onSignOut={signOut} />
                            </div>
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
                                Log in
                            </Link>
                            <Link
                                href="/workspace"
                                className={cn(
                                    "site-header-cta focus-ring hidden min-h-12 min-w-28 items-center justify-center whitespace-nowrap rounded-full px-6 py-2 font-medium transition-colors md:inline-flex",
                                    "bg-primary text-primary-foreground hover:bg-primary/90"
                                )}
                            >
                                Get my free report
                            </Link>
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
    return (
        <Sheet>
            <SheetTrigger asChild>
                <button type="button" aria-label="Open navigation" className="focus-ring inline-flex size-11 items-center justify-center rounded-[10px] border border-border text-foreground transition-colors hover:bg-muted xl:hidden">
                    <List className="size-5" weight="bold" />
                </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(88vw,22rem)] bg-background">
                <SheetHeader className="border-b border-border pb-5 text-left">
                    <SheetTitle><Wordmark className="text-foreground" /></SheetTitle>
                    <SheetDescription className="sr-only">Navigate to the main areas of Recruiter in Your Pocket.</SheetDescription>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile navigation">
                    <MobileSiteLink href="/#how-it-works">How it works</MobileSiteLink>
                    {pathname === "/" && <>
                        <MobileSiteLink href="/sample-report">Sample report</MobileSiteLink>
                        <MobileSiteLink href="/#about">About</MobileSiteLink>
                    </>}
                    <MobileSiteLink href="/pricing" active={isPathActive(pathname, "/pricing")}>Pricing</MobileSiteLink>
                    {isLaunchFlagEnabled("extensionSync") && <MobileSiteLink href="/extension" active={isPathActive(pathname, "/extension")}>Extension</MobileSiteLink>}
                    {showResearchLink && <MobileSiteLink href="/research" active={isPathActive(pathname, "/research")}>Research</MobileSiteLink>}
                    {showResourcesLink && <MobileSiteLink href="/resources" active={isPathActive(pathname, "/resources")}>Resources</MobileSiteLink>}
                    <div className="my-5 h-px bg-border" />
                    {authLoading ? (
                        <p className="min-h-12 px-3 py-3 text-base text-muted-foreground" role="status" aria-live="polite">
                            Checking account…
                        </p>
                    ) : user ? (
                        <>
                            <MobileSiteLink href="/workspace" active={isPathActive(pathname, "/workspace")}>Studio</MobileSiteLink>
                            <MobileSiteLink href="/reports" active={isPathActive(pathname, "/reports")}>Reports</MobileSiteLink>
                            <MobileSiteLink href="/settings/account" active={isPathActive(pathname, "/settings")}>Settings</MobileSiteLink>
                            <SheetClose asChild>
                                <button
                                    type="button"
                                    onClick={() => onSignOut()}
                                    className="focus-ring min-h-12 rounded-[10px] px-3 py-3 text-left text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    Sign out
                                </button>
                            </SheetClose>
                        </>
                    ) : (
                        <>
                            <MobileSiteLink href="/auth" active={isPathActive(pathname, "/auth")}>Log in</MobileSiteLink>
                            <SheetClose asChild>
                                <Link href="/workspace" className="focus-ring mt-4 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                                    Get my free report
                                </Link>
                            </SheetClose>
                        </>
                    )}
                </nav>
            </SheetContent>
        </Sheet>
    );
}

function isPathActive(pathname: string | null, href: string) {
    return pathname === href || pathname?.startsWith(`${href}/`) || false;
}

function MobileSiteLink({ href, children, active = false }: { href: string; children: React.ReactNode; active?: boolean }) {
    return (
        <SheetClose asChild>
            <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                    "focus-ring min-h-12 rounded-[10px] px-3 py-3 text-base font-medium transition-colors hover:bg-muted hover:text-foreground",
                    active ? "bg-secondary text-foreground" : "text-muted-foreground"
                )}
            >
                {children}
            </Link>
        </SheetClose>
    );
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
