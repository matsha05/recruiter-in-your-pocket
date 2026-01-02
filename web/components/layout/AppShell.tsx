import * as React from "react";
import { cn } from "@/lib/utils";
import { AppHeader } from "./AppHeader";

interface AppShellProps {
    children: React.ReactNode;
    className?: string;
    /** Max width constraint - defaults to 5xl for content pages */
    maxWidth?: "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
    /** Disable padding for full-bleed layouts */
    noPadding?: boolean;
    /** Full height mode for pages with internal scroll (like workspace) */
    fullHeight?: boolean;
}

/**
 * AppShell - Full-width layout with top navigation
 * 
 * Replaces StudioShell's sidebar layout with a cleaner top-nav approach.
 * Aligns with "Quiet Power" principle - content gets full attention.
 */
export function AppShell({
    children,
    className,
    maxWidth = "5xl",
    noPadding = false,
    fullHeight = false,
}: AppShellProps) {
    const maxWidthClass = maxWidth === "full" ? "" : `max-w-${maxWidth}`;

    if (fullHeight) {
        // Full-height mode for pages with internal scrolling
        return (
            <div className="h-screen flex flex-col bg-background overflow-hidden">
                <AppHeader />
                <main className={cn("flex-1 overflow-hidden", className)}>
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <AppHeader />

            <main className={cn(
                "flex-1",
                !noPadding && "p-6 md:p-8 lg:p-12",
                className
            )}>
                <div className={cn(
                    "mx-auto w-full",
                    maxWidthClass
                )}>
                    {children}
                </div>
            </main>
        </div>
    );
}
