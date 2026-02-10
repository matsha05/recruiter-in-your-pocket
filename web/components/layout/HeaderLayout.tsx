"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { SiteHeader } from "./SiteHeader";
import { AppHeader } from "./AppHeader";

interface HeaderLayoutProps {
    children: React.ReactNode;
}

/**
 * HeaderLayout — Unified header wrapper for marketing/editorial pages.
 *
 * Renders the appropriate navigation based on authentication state:
 * - Guests see SiteHeader (Editor's Desk style)
 * - Logged-in users see AppHeader (app nav)
 */
export function HeaderLayout({ children }: HeaderLayoutProps) {
    const { user, isLoading } = useAuth();

    // Loading skeleton prevents flash of wrong header
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <div className="site-header">
                    <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-5 md:px-8">
                        <div className="h-5 w-40 animate-pulse rounded bg-slate-200/50" />
                        <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200/50" />
                    </div>
                </div>
                <main className="flex-1 pt-[68px]">{children}</main>
            </div>
        );
    }

    // Logged-in users get the full app navigation
    if (user) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <AppHeader />
                <main className="flex-1">{children}</main>
            </div>
        );
    }

    // Guests get the marketing navigation (fixed position, content needs top padding)
    return (
        <div className="min-h-screen flex flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
        </div>
    );
}
