"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserNav } from "@/components/shared/UserNav";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { PocketMark, Wordmark } from "@/components/icons";
import { cn } from "@/lib/utils";
import { STUDIO_NAV } from "@/lib/navigation";
import { MobileNav } from "./MobileNav";

/**
 * AppHeader - Top navigation for the authenticated app experience
 * 
 * Replaces the sidebar with a streamlined top nav.
 * Design rationale: "Quiet Power" + "Raycast Density" from design-philosophy.md
 * - Every pixel earns its place
 * - Calm by default
 * - Content gets full width
 */
export function AppHeader() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    return (
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-border/40 bg-background/95 backdrop-blur-md sticky top-0 z-50">
            {/* Logo */}
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 shrink-0 group">
                    <PocketMark className="w-5 h-5 text-brand transition-transform group-hover:scale-105" />
                    <Wordmark className="h-4 md:h-5 text-foreground hidden sm:block" />
                </Link>

                {/* Desktop Nav - Pill Groups */}
                <nav className="hidden md:flex items-center gap-0.5 bg-muted/40 rounded-lg px-1 py-0.5">
                    {STUDIO_NAV.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                )}
                            >
                                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-brand" : "")} />
                                <span className="hidden lg:inline">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Right Side: User + Mobile */}
            <div className="flex items-center gap-2">
                {user && (
                    <div className="hidden md:flex items-center gap-2">
                        <UserNav user={user} onSignOut={signOut} />
                    </div>
                )}
                <ThemeToggle />
                <MobileNav />
            </div>
        </header>
    );
}
