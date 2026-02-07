"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface LegalNavProps {
    className?: string;
}

export function LegalNav({ className }: LegalNavProps) {
    const pathname = usePathname();

    const tabs = [
        { name: "Trust & Security", href: "/trust" },
        { name: "Data Handling", href: "/security" },
        { name: "Methodology", href: "/methodology" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "FAQ", href: "/faq" },
    ];

    return (
        <div className={cn("flex flex-col items-center", className)}>
            <nav className="flex w-full max-w-[68rem] flex-wrap items-center gap-1 rounded-xl border border-border/60 bg-white/95 p-1.5 dark:bg-slate-900/90">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold tracking-[0.01em] transition-all duration-150",
                                isActive
                                    ? "bg-brand/12 text-foreground shadow-[inset_0_0_0_1px_hsl(var(--brand)/0.22)]"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            {tab.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
