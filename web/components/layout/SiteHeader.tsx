"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserNav } from "@/components/shared/UserNav";
import { PocketMark, Wordmark } from "@/components/icons";
import { cn } from "@/lib/utils";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";
import { List } from "@phosphor-icons/react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface SiteHeaderProps {
    /** Show "Research" nav link (hide on research hub itself) */
    showResearchLink?: boolean;
    /** Show "Resources" nav link (hide on resources hub itself) */
    showResourcesLink?: boolean;
}

export function SiteHeader({ showResearchLink = true, showResourcesLink = true }: SiteHeaderProps) {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const isInkHeader = true;

    const isMarketingActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);
    const isStudioActive = pathname === "/workspace" || pathname?.startsWith("/workspace/") || pathname === "/reports" || pathname?.startsWith("/reports/");

    return (
        <header className={cn("site-header", isInkHeader && "site-header-ink")}>
            <div className="app-shell-inner">
                <Link href="/" aria-label="Recruiter in Your Pocket home" className="focus-ring group flex min-h-11 shrink-0 items-center justify-start gap-3 rounded-md">
                    <PocketMark className="size-9 text-background sm:hidden" />
                    <span className="font-display text-lg font-semibold leading-[0.92] tracking-[-0.045em] text-background sm:hidden">Recruiter in<br />Your Pocket</span>
                    <Wordmark className="site-wordmark hidden text-background transition-transform group-hover:scale-[1.01] sm:inline-flex" />
                </Link>

                <nav className="flex items-center gap-8">
                    <div className="hidden items-center gap-7 lg:flex">
                        <SiteNavLink href="/#how-it-works">How it works</SiteNavLink>
                        <SiteNavLink href="/pricing" active={isMarketingActive("/pricing")}>Pricing</SiteNavLink>
                        {isLaunchFlagEnabled("extensionSync") && (
                            <SiteNavLink href="/extension" active={isMarketingActive("/extension")}>Extension</SiteNavLink>
                        )}
                        {showResearchLink && <SiteNavLink href="/research" active={isMarketingActive("/research")}>Research</SiteNavLink>}
                        {showResourcesLink && <SiteNavLink href="/resources" active={isMarketingActive("/resources")}>Resources</SiteNavLink>}
                    </div>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <SiteNavLink href="/workspace" active={isStudioActive}>Studio</SiteNavLink>
                            <UserNav user={user} onSignOut={signOut} />
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/auth"
                                className={cn(
                                    "focus-ring hidden min-h-12 items-center whitespace-nowrap rounded-md px-2 text-sm font-medium transition-colors sm:inline-flex",
                                    "text-background/70 hover:text-background"
                                )}
                            >
                                Log in
                            </Link>
                            <Link
                                href="/workspace"
                                className={cn(
                                    "site-header-cta focus-ring inline-flex min-h-12 items-center whitespace-nowrap rounded-md border py-2 font-semibold transition-colors",
                                    "border-citron bg-citron text-foreground hover:border-citron/85 hover:bg-citron/85"
                                )}
                            >
                                <span className="sm:hidden">First read</span>
                                <span className="hidden sm:inline">See my first read</span>
                            </Link>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <button type="button" aria-label="Open navigation" className="focus-ring inline-flex size-11 items-center justify-center rounded-md border border-background/30 text-background transition-colors hover:bg-white/10 lg:hidden">
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
                                        <MobileSiteLink href="/pricing">Pricing</MobileSiteLink>
                                        {isLaunchFlagEnabled("extensionSync") && (
                                            <MobileSiteLink href="/extension">Extension</MobileSiteLink>
                                        )}
                                        {showResearchLink && <MobileSiteLink href="/research">Research</MobileSiteLink>}
                                        {showResourcesLink && <MobileSiteLink href="/resources">Resources</MobileSiteLink>}
                                        <div className="my-5 h-px bg-slate-300" />
                                        <MobileSiteLink href="/auth">Log in</MobileSiteLink>
                                        <Link href="/workspace" className="focus-ring mt-4 inline-flex min-h-12 items-center justify-center rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90">
                                            See my first read
                                        </Link>
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}

function MobileSiteLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="focus-ring rounded-md px-3 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-white hover:text-slate-950">
            {children}
        </Link>
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
