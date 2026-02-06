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
            <nav className="flex max-w-[92vw] items-center overflow-x-auto rounded-xl border border-border/60 bg-white p-1 no-scrollbar dark:bg-slate-900">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-150",
                                isActive
                                    ? "bg-brand/10 text-foreground"
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
