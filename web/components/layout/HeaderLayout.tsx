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
 * - Guests see SiteHeader (marketing-style: Research, Resources, Get Started)
 * - Logged-in users see AppHeader (app nav: The Studio, Jobs, Research, Resources, Settings)
 * 
 * This component is used by route group layouts to provide consistent 
 * navigation without per-page header imports.
 * 
 * Design rationale: 
 * - "Invisible Perfection" — consistent muscle memory across the site
 * - "Quiet Power" — calm, unified navigation experience
 */
export function HeaderLayout({ children }: HeaderLayoutProps) {
    const { user, isLoading } = useAuth();

    // Loading skeleton prevents flash of wrong header
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <header className="h-14 md:h-16 border-b border-border/10 bg-background/80 backdrop-blur-md sticky top-0 z-50" />
                <main className="flex-1">{children}</main>
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

    // Guests get the marketing navigation
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <SiteHeader />
            <main className="flex-1">{children}</main>
        </div>
    );
}
