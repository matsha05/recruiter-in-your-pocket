"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserNav } from "@/components/shared/UserNav";
import { PocketMark, Wordmark } from "@/components/icons";
import { cn } from "@/lib/utils";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { List } from "@phosphor-icons/react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface SiteHeaderProps {
    /** Show "Research" nav link (hide on research hub itself) */
    showResearchLink?: boolean;
    /** Show "Resources" nav link (hide on resources hub itself) */
    showResourcesLink?: boolean;
}

export function SiteHeader({ showResearchLink = true, showResourcesLink = true }: SiteHeaderProps) {
    const pathname = usePathname();
    const { user, signOut, isLoading: authLoading } = useAuth();
    const isInkHeader = true;

    const isMarketingActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);
    const isStudioActive = pathname === "/workspace" || pathname?.startsWith("/workspace/") || pathname === "/reports" || pathname?.startsWith("/reports/");

    return (
        <header className={cn("site-header", isInkHeader && "site-header-ink")}>
            <div className="app-shell-inner">
                <Link href="/" aria-label="Recruiter in Your Pocket home" className="focus-ring group flex min-h-11 shrink-0 items-center justify-start gap-3 rounded-md">
                    <PocketMark className="size-9 text-background md:hidden" />
                    <span className="font-display text-lg font-semibold leading-[0.92] tracking-[-0.045em] text-background md:hidden">Recruiter in<br />Your Pocket</span>
                    <Wordmark className="site-wordmark hidden text-background transition-transform group-hover:scale-[1.01] md:inline-flex" />
                </Link>

                <nav className="flex shrink-0 items-center gap-2 md:gap-4 xl:gap-8">
                    <div className="hidden items-center gap-7 xl:flex">
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
                            className="hidden h-12 w-36 shrink-0 items-center justify-center gap-2 border border-background/15 bg-background/5 text-xs font-medium text-background/55 md:flex"
                            role="status"
                            aria-label="Checking account status"
                        >
                            <span className="size-1.5 animate-pulse rounded-full bg-citron motion-reduce:animate-none" aria-hidden="true" />
                            Account
                        </div>
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/workspace"
                                aria-current={isStudioActive ? "page" : undefined}
                                className="site-header-cta focus-ring hidden min-h-12 min-w-28 items-center justify-center rounded-md border border-citron bg-citron px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-citron/85 hover:bg-citron/85 md:inline-flex xl:hidden"
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
                                    "text-background/70 hover:text-background"
                                )}
                            >
                                Log in
                            </Link>
                            <Link
                                href="/workspace"
                                className={cn(
                                    "site-header-cta focus-ring hidden min-h-12 min-w-28 items-center justify-center whitespace-nowrap rounded-md border py-2 font-semibold transition-colors md:inline-flex",
                                    "border-citron bg-citron text-foreground hover:border-citron/85 hover:bg-citron/85"
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
                <button type="button" aria-label="Open navigation" className="focus-ring inline-flex size-11 items-center justify-center rounded-md border border-background/30 text-background transition-colors hover:bg-white/10 xl:hidden">
                    <List className="size-5" weight="bold" />
                </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(88vw,22rem)] bg-background">
                <SheetHeader className="border-b border-border pb-5 text-left">
                    <SheetTitle className="font-display text-2xl riyp-weight-620 tracking-[-0.04em] text-slate-950 riyp-stretch-91">Recruiter in Your Pocket</SheetTitle>
                    <SheetDescription className="sr-only">Navigate to the main areas of Recruiter in Your Pocket.</SheetDescription>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile navigation">
                    <MobileSiteLink href="/#how-it-works">How it works</MobileSiteLink>
                    <MobileSiteLink href="/pricing" active={isPathActive(pathname, "/pricing")}>Pricing</MobileSiteLink>
                    {isLaunchFlagEnabled("extensionSync") && <MobileSiteLink href="/extension" active={isPathActive(pathname, "/extension")}>Extension</MobileSiteLink>}
                    {showResearchLink && <MobileSiteLink href="/research" active={isPathActive(pathname, "/research")}>Research</MobileSiteLink>}
                    {showResourcesLink && <MobileSiteLink href="/resources" active={isPathActive(pathname, "/resources")}>Resources</MobileSiteLink>}
                    <div className="my-5 h-px bg-slate-300" />
                    {authLoading ? (
                        <p className="min-h-12 px-3 py-3 text-base text-slate-600" role="status" aria-live="polite">
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
                                    className="focus-ring min-h-12 rounded-md px-3 py-3 text-left text-base font-medium text-slate-700 transition-colors hover:bg-white hover:text-slate-950"
                                >
                                    Sign out
                                </button>
                            </SheetClose>
                        </>
                    ) : (
                        <>
                            <MobileSiteLink href="/auth" active={isPathActive(pathname, "/auth")}>Log in</MobileSiteLink>
                            <SheetClose asChild>
                                <Link href="/workspace" className="focus-ring mt-4 inline-flex min-h-12 items-center justify-center rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90">
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
                className="focus-ring min-h-12 rounded-md px-3 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-white hover:text-slate-950"
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
