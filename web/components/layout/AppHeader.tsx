"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserNav } from "@/components/shared/UserNav";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { PocketMark, Wordmark } from "@/components/icons";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";

const APP_NAV = [
    { label: "Studio", href: "/workspace" },
    { label: "Reports", href: "/reports" },
    { label: "Jobs", href: "/jobs" },
    { label: "Extension", href: "/extension" },
    { label: "Research", href: "/research" },
    { label: "Resources", href: "/guides" },
];

export function AppHeader() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const isActive = (href: string) => {
        if (href === "/workspace") {
            return pathname === "/workspace" || pathname?.startsWith("/workspace/");
        }
        return pathname === href || pathname?.startsWith(`${href}/`);
    };

    return (
        <header className="app-shell-header">
            <div className="app-shell-inner">
                <Link href="/" className="group flex shrink-0 items-center gap-2.5">
                    <PocketMark className="h-6 w-6 text-brand transition-transform group-hover:scale-105" />
                    <Wordmark className="hidden h-5 text-foreground sm:block md:h-[22px]" />
                </Link>

                <nav className="flex items-center gap-1 md:gap-2">
                    <div className="hidden items-center gap-1 md:flex">
                        {APP_NAV.map((item) => {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn("app-nav-link hidden md:inline-flex", isActive(item.href) && "app-nav-link-active")}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="hidden md:block app-shell-divider" />

                    <div className="flex items-center gap-1.5">
                        <ThemeToggle />
                        {user ? (
                            <div className="hidden md:block">
                                <UserNav user={user} onSignOut={signOut} />
                            </div>
                        ) : null}
                        <MobileNav />
                    </div>
                </nav>
            </div>
        </header>
    );
}
