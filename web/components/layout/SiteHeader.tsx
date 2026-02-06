"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserNav } from "@/components/shared/UserNav";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { PocketMark, Wordmark } from "@/components/icons";

interface SiteHeaderProps {
    /** Show "Research" nav link (hide on research hub itself) */
    showResearchLink?: boolean;
    /** Show "Resources" nav link (hide on resources hub itself) */
    showResourcesLink?: boolean;
}

/**
 * SiteHeader — Premium navigation for guests/marketing pages
 * 
 * Design: "Editorial Authority" Pattern (right-aligned)
 * - Logo left with generous breathing room
 * - Navigation links right-aligned
 * - Underline hover effect (Stripe-inspired)
 * - CTA + user actions far right
 * 
 * Consistent with AppHeader — no jarring transition when user logs in.
 */
export function SiteHeader({ showResearchLink = true, showResourcesLink = true }: SiteHeaderProps) {
    const { user, isLoading: isAuthLoading, signOut } = useAuth();

    return (
        <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-border/20 bg-background/95 backdrop-blur-lg sticky top-0 z-50">
            {/* Logo — Left side with breathing room */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
                <PocketMark className="w-6 h-6 text-brand transition-transform group-hover:scale-105" />
                <Wordmark className="h-5 md:h-[22px] text-foreground hidden sm:block" />
            </Link>

            {/* Navigation — Right aligned */}
            <nav className="flex items-center gap-1 md:gap-2">
                {/* Content Nav Links */}
                {(showResearchLink || showResourcesLink) && (
                    <div className="hidden md:flex items-center gap-1">
                        <NavLink href="/pricing">Pricing</NavLink>
                        {showResearchLink && (
                            <NavLink href="/research">Research</NavLink>
                        )}
                        {showResourcesLink && (
                            <NavLink href="/guides">Resources</NavLink>
                        )}
                    </div>
                )}

                {/* Separator */}
                <div className="hidden md:block w-px h-5 bg-border/40 mx-2" />

                {/* Auth Section */}
                {isAuthLoading ? (
                    <div className="w-20 h-9" />
                ) : user ? (
                    <div className="flex items-center gap-1.5">
                        {/* Desktop: Show Studio link */}
                        <NavLink href="/workspace">Studio</NavLink>
                        <ThemeToggle />
                        <UserNav user={user} onSignOut={signOut} />
                        {/* Mobile: Studio button */}
                        <Link href="/workspace" className="md:hidden">
                            <Button variant="brand" size="sm" className="px-3">Studio</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5">
                        <Link href="/auth" className="hidden sm:block">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                Log In
                            </Button>
                        </Link>
                        <Link href="/workspace">
                            <Button variant="brand" size="sm" className="px-3 md:px-4">
                                Get Started
                            </Button>
                        </Link>
                        <ThemeToggle />
                    </div>
                )}
            </nav>
        </header>
    );
}

/**
 * NavLink — Text link with underline hover effect
 */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="group relative px-3 py-1.5 hidden md:block">
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {children}
            </span>
            {/* Underline — matches footer style */}
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-brand transition-all duration-200 group-hover:w-full" />
        </Link>
    );
}
