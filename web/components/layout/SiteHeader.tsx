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
 * SiteHeader v2
 * 
 * Single source of truth for site-wide navigation.
 * Improved visual separation between nav groups.
 */
export function SiteHeader({ showResearchLink = true, showResourcesLink = true }: SiteHeaderProps) {
    const { user, isLoading: isAuthLoading, signOut } = useAuth();

    return (
        <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-border/10 bg-background/80 backdrop-blur-md sticky top-0 z-50 overflow-x-hidden safe-area-inset-x">
            {/* Logo — always links home */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
                <PocketMark className="w-6 h-6 text-brand transition-transform group-hover:scale-105" />
                <Wordmark className="h-5 md:h-6 text-foreground hidden sm:block" />
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1 md:gap-2">
                {/* Content Nav Group */}
                {(showResearchLink || showResourcesLink) && (
                    <div className="hidden md:flex items-center gap-1 bg-muted/30 rounded-full px-1 py-0.5">
                        {showResearchLink && (
                            <Link
                                href="/research"
                                className="text-sm text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors font-medium px-3 py-1.5 rounded-full"
                            >
                                Research
                            </Link>
                        )}
                        {showResourcesLink && (
                            <Link
                                href="/guides"
                                className="text-sm text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors font-medium px-3 py-1.5 rounded-full"
                            >
                                Resources
                            </Link>
                        )}
                    </div>
                )}

                {/* Separator */}
                <div className="hidden md:block w-px h-5 bg-border/30 mx-2" />

                {isAuthLoading ? (
                    <div className="w-20 h-9" />
                ) : user ? (
                    <div className="flex items-center gap-2">
                        <Link
                            href="/workspace"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium hidden md:block px-3 py-1.5"
                        >
                            The Studio
                        </Link>
                        <div className="hidden md:block w-px h-4 bg-border/30" />
                        <UserNav user={user} onSignOut={signOut} />
                        {/* Tablet: full button */}
                        <Link href="/workspace" className="hidden sm:block md:hidden">
                            <Button variant="brand" size="sm">Open Studio</Button>
                        </Link>
                        {/* Mobile: compact */}
                        <Link href="/workspace" className="sm:hidden">
                            <Button variant="brand" size="sm" className="px-3">Studio</Button>
                        </Link>
                        <ThemeToggle />
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
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
