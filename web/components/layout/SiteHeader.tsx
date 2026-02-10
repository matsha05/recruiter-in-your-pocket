"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserNav } from "@/components/shared/UserNav";
import { Button } from "@/components/ui/button";
import { PocketMark } from "@/components/icons";
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
    const { user, isLoading: isAuthLoading, signOut } = useAuth();

    return (
        <header className="site-header">
            <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-5 md:px-8">
                <Link href="/" className="group flex shrink-0 items-center gap-2.5">
                    <PocketMark className="h-5 w-5 text-slate-800 transition-transform group-hover:scale-105" />
                    <span className="text-[15px] font-medium tracking-[-0.01em] text-slate-700">
                        Recruiter in Your Pocket
                    </span>
                </Link>

                <nav className="flex items-center gap-8">
                    <div className="hidden items-center gap-6 md:flex">
                        <SiteNavLink href="/pricing">Pricing</SiteNavLink>
                        {showResearchLink && <SiteNavLink href="/research">Research</SiteNavLink>}
                        {showResourcesLink && <SiteNavLink href="/guides">Resources</SiteNavLink>}
                    </div>

                    {isAuthLoading ? (
                        <div className="h-9 w-20" />
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            <SiteNavLink href="/workspace">Studio</SiteNavLink>
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
                                Get Started
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
}: {
    href: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Link
            href={href}
            className={cn(
                "text-[13px] font-medium text-slate-400 transition-colors hover:text-slate-700",
                className
            )}
        >
            {children}
        </Link>
    );
}
