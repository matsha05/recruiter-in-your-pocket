"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PocketMark } from "@/components/icons";
import { STUDIO_NAV, type NavItem } from "@/lib/navigation";

interface StudioSidebarProps {
    className?: string;
}

export function StudioSidebar({ className }: StudioSidebarProps) {
    return (
        <aside
            className={cn(
                "hidden md:flex fixed left-0 top-0 z-40 h-screen w-[260px] flex-col border-r border-border bg-background transition-transform duration-300 ease-in-out",
                className
            )}
        >
            {/* Brand - Matches Landing Page Wordmark */}
            <div className="h-14 flex items-center px-6 border-b border-border bg-background relative z-10">
                <Link href="/" className="flex items-center gap-2">
                    <PocketMark className="w-5 h-5 text-brand" />
                    <span className="font-display font-medium tracking-tight text-lg text-foreground">
                        Recruiter in Your Pocket
                    </span>
                </Link>
            </div>
            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {STUDIO_NAV.map((item) => (
                    <StudioNavLink key={item.href} item={item} />
                ))}
            </div>
        </aside>
    );
}

function StudioNavLink({ item }: { item: NavItem }) {
    const pathname = usePathname();
    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                    ? "bg-brand/5 text-brand"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            <Icon className={cn("h-4 w-4", isActive ? "text-brand" : "text-muted-foreground")} />
            {item.label}
        </Link>
    );
}
