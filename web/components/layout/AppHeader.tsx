"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserNav } from "@/components/shared/UserNav";
import { PocketMark, Wordmark } from "@/components/icons";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";

const APP_NAV = [
    { label: "Studio", href: "/workspace" },
    { label: "Reports", href: "/reports" },
    { label: "Jobs", href: "/jobs" },
    { label: "Extension", href: "/extension" },
    { label: "Research", href: "/research" },
    { label: "Resources", href: "/resources" },
].filter((item) => isLaunchFlagEnabled("extensionSync") || (item.href !== "/extension" && item.href !== "/jobs"));

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
                <Link href="/" aria-label="Recruiter in Your Pocket home" className="focus-ring group flex min-h-11 w-11 shrink-0 items-center justify-center gap-2.5 rounded-md sm:w-auto sm:justify-start">
                    <PocketMark className="size-9 text-background sm:hidden" />
                    <span className="font-display text-lg font-semibold leading-[0.92] tracking-[-0.045em] text-background sm:hidden">Recruiter in<br />Your Pocket</span>
                    <Wordmark className="site-wordmark hidden text-background sm:inline-flex" />
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
