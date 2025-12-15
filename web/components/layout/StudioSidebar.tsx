"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Library,
    FileText,
    CreditCard,
    LogOut,
    Sparkles
} from "lucide-react";

interface StudioSidebarProps {
    className?: string;
}

export function StudioSidebar({ className }: StudioSidebarProps) {
    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen w-[260px] flex flex-col border-r bg-sidebar-glass backdrop-blur-xl transition-transform duration-300 ease-in-out",
                className
            )}
        >
            {/* Brand - Matches Landing Page Wordmark */}
            <div className="h-14 flex items-center px-6 border-b border-border bg-background relative z-10">
                <Link href="/" className="hover:opacity-80 transition-opacity">
                    <span className="font-serif italic font-semibold tracking-tight text-sidebar-foreground text-xl">
                        Pocket
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
                    Passes & Billing
                </StudioNavLink>
            </div>

            {/* Footer / CTA */}
            <div className="p-4 border-t border-border/50 bg-background/50">
                <div className="rounded-lg border bg-gradient-to-br from-background to-secondary/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pro Tip</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        Recruiters spend 6 seconds on your resume. Make them count.
                    </p>
                    <Link href="/settings" className="w-full block">
                        <Button size="sm" variant="outline" className="w-full text-xs h-7 border-dashed">
                            Get a Pass
                        </Button>
                    </Link>
                </div>
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
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
            {children}
        </Link>
    );
}
