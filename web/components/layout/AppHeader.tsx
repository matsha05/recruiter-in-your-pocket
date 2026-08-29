"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
    const { user, signOut, isLoading: authLoading } = useAuth();
    const [workspaceReportVisible, setWorkspaceReportVisible] = useState(false);

    useEffect(() => {
        const handleReportVisibility = (event: Event) => {
            setWorkspaceReportVisible(Boolean((event as CustomEvent<{ visible?: boolean }>).detail?.visible));
        };
        window.addEventListener("riyp-report-visibility", handleReportVisibility);
        return () => window.removeEventListener("riyp-report-visibility", handleReportVisibility);
    }, []);

    useEffect(() => {
        if (pathname !== "/workspace") setWorkspaceReportVisible(false);
    }, [pathname]);

    const isActive = (href: string) => {
        if (href === "/workspace") {
            return (pathname === "/workspace" || pathname?.startsWith("/workspace/")) && !workspaceReportVisible;
        }
        if (href === "/reports") {
            return workspaceReportVisible || pathname === href || pathname?.startsWith(`${href}/`);
        }
        return pathname === href || pathname?.startsWith(`${href}/`);
    };

    return (
        <header className="app-shell-header">
            <div className="app-shell-inner">
                <Link href="/" aria-label="Recruiter in Your Pocket home" className="focus-ring group flex min-h-11 shrink-0 items-center justify-start gap-2.5 rounded-md">
                    <PocketMark className="size-9 text-background sm:hidden" />
                    <span className="font-display text-lg font-semibold leading-[0.92] tracking-[-0.045em] text-background sm:hidden">Recruiter in<br />Your Pocket</span>
                    <Wordmark className="site-wordmark hidden text-background sm:inline-flex" />
                </Link>

                <nav className="flex items-center gap-1 md:gap-2">
                    <div className="hidden items-center gap-1 md:flex">
                        {APP_NAV.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={active ? "page" : undefined}
                                    className={cn("app-nav-link hidden md:inline-flex", active && "app-nav-link-active")}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="hidden md:block app-shell-divider" />

                    <div className="flex items-center gap-1.5">
                        {authLoading ? (
                            <span
                                className="hidden size-11 items-center justify-center border border-background/15 bg-background/5 md:flex"
                                role="status"
                                aria-label="Checking account status"
                            >
                                <span className="size-1.5 animate-pulse rounded-full bg-citron motion-reduce:animate-none" aria-hidden="true" />
                            </span>
                        ) : user ? (
                            <div className="hidden md:block">
                                <UserNav user={user} onSignOut={signOut} />
                            </div>
                        ) : (
                            <Link href="/auth" className="app-nav-link hidden md:inline-flex">Log in</Link>
                        )}
                        <MobileNav workspaceReportVisible={workspaceReportVisible} />
                    </div>
                </nav>
            </div>
        </header>
    );
}
