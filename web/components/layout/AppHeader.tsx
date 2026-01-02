"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserNav } from "@/components/shared/UserNav";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { PocketMark, Wordmark } from "@/components/icons";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";

/**
 * AppHeader — Premium top navigation for authenticated users
 * 
 * Design: "Editorial Authority" Pattern (right-aligned)
 * - Logo left with generous breathing room
 * - Navigation links right-aligned
 * - Underline hover effect (Stripe-inspired)
 * - User actions far right
 */

// Primary navigation for authenticated users
// Order: Core product → Tools → Educational content
const APP_NAV = [
    { label: "Studio", href: "/workspace" },
    { label: "Jobs", href: "/jobs" },
    { label: "Research", href: "/research" },
    { label: "Resources", href: "/guides" },
];

export function AppHeader() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    return (
        <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-border/20 bg-background/95 backdrop-blur-lg sticky top-0 z-50">
            {/* Logo — Left side with breathing room */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
                <PocketMark className="w-6 h-6 text-brand transition-transform group-hover:scale-105" />
                <Wordmark className="h-5 md:h-[22px] text-foreground hidden sm:block" />
            </Link>

            {/* Navigation — Right aligned */}
            <nav className="flex items-center gap-1 md:gap-2">
                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-1">
                    {APP_NAV.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="group relative px-3 py-1.5"
                            >
                                <span className={cn(
                                    "text-sm font-medium transition-colors",
                                    isActive
                                        ? "text-foreground"
                                        : "text-muted-foreground group-hover:text-foreground"
                                )}>
                                    {item.label}
                                </span>
                                {/* Underline — matches footer style */}
                                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-brand transition-all duration-200 group-hover:w-full" />
                            </Link>
                        );
                    })}
                </div>

                {/* Separator */}
                <div className="hidden md:block w-px h-5 bg-border/40 mx-2" />

                {/* User Actions */}
                <div className="flex items-center gap-1.5">
                    <ThemeToggle />
                    {user && (
                        <div className="hidden md:block">
                            <UserNav user={user} onSignOut={signOut} />
                        </div>
                    )}
                    <MobileNav />
                </div>
            </nav>
        </header>
    );
}
