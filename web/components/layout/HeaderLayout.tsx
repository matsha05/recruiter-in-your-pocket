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
    const { user } = useAuth();

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
