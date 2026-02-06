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
        <div className={cn("flex flex-col items-center mb-12", className)}>
            {/* Tab Navigation */}
            <nav className="flex items-center p-1 bg-card border border-border/60 rounded animate-in fade-in zoom-in-95 duration-500 max-w-[90vw] overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap",
                                isActive
                                    ? "bg-secondary text-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
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
