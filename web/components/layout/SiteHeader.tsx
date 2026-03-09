"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserNav } from "@/components/shared/UserNav";
import { Wordmark } from "@/components/icons";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
    /** Show "Research" nav link (hide on research hub itself) */
    showResearchLink?: boolean;
    /** Show "Resources" nav link (hide on resources hub itself) */
    showResourcesLink?: boolean;
}

/**
 * SiteHeader — Editor's Desk design language
 *
 * Warm paper background, minimal text links, pill CTA.
 * Matches the canonical landing page nav style.
 */
export function SiteHeader({ showResearchLink = true, showResourcesLink = true }: SiteHeaderProps) {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const isMarketingActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);
    const isStudioActive = pathname === "/workspace" || pathname?.startsWith("/workspace/") || pathname === "/reports" || pathname?.startsWith("/reports/");

    return (
        <header className="site-header">
            <div className="app-shell-inner">
                <Link href="/" className="group flex shrink-0 items-center gap-2.5">
                    <Wordmark className="h-5 text-foreground transition-transform group-hover:scale-[1.01] md:h-[22px]" />
                </Link>

                <nav className="flex items-center gap-8">
                    <div className="hidden items-center gap-6 md:flex">
                        <SiteNavLink href="/pricing" active={isMarketingActive("/pricing")}>Pricing</SiteNavLink>
                        <SiteNavLink href="/extension" active={isMarketingActive("/extension")}>Extension</SiteNavLink>
                        {showResearchLink && <SiteNavLink href="/research" active={isMarketingActive("/research")}>Research</SiteNavLink>}
                        {showResourcesLink && <SiteNavLink href="/guides" active={isMarketingActive("/guides")}>Resources</SiteNavLink>}
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
                                className="hidden text-[13px] font-medium text-slate-400 transition-colors hover:text-slate-700 sm:block"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/workspace"
                                className="rounded-full bg-slate-900 px-5 py-2 text-[13px] font-medium text-white transition-all hover:bg-slate-800 active:scale-[0.97]"
                            >
                                Start free review
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}

/**
 * SiteNavLink — Clean text link, Editor's Desk style
 */
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
