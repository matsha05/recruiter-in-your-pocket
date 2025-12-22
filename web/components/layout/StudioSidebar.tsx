"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Library,
    FileText,
    CreditCard,
} from "lucide-react";
import { PocketMark } from "@/components/icons";

interface StudioSidebarProps {
    className?: string;
}

export function StudioSidebar({ className }: StudioSidebarProps) {
    return (
        <aside
            className={cn(
                "hidden md:flex fixed left-0 top-0 z-40 h-screen w-[260px] flex-col border-r bg-sidebar-glass backdrop-blur-xl transition-transform duration-300 ease-in-out",
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
                <StudioNavLink href="/workspace" icon={FileText}>
                    The Studio
                </StudioNavLink>
                <StudioNavLink href="/research" icon={Library}>
                    Research Library
                </StudioNavLink>
                <StudioNavLink href="/settings" icon={CreditCard}>
                    Settings
                </StudioNavLink>
            </div>
        </aside>
    );
}

function StudioNavLink({
    href,
    icon: Icon,
    children
}: {
    href: string;
    icon: React.ElementType;
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname?.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                    ? "bg-brand/5 text-brand"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            <Icon className={cn("h-4 w-4", isActive ? "text-brand" : "text-muted-foreground")} />
            {children}
        </Link>
    );
}
