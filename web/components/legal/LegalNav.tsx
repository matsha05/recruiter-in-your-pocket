"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface LegalNavProps {
    className?: string;
}

/**
 * LegalNav — Editor's Desk style tab bar
 *
 * Clean, horizontal pill-shaped tabs on warm background.
 */
export function LegalNav({ className }: LegalNavProps) {
    const pathname = usePathname();

    const tabs = [
        { name: "Trust & Security", href: "/trust" },
        { name: "Data Handling", href: "/security" },
        { name: "Status", href: "/status" },
        { name: "Methodology", href: "/methodology" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "FAQ", href: "/faq" },
    ];

    return (
        <div className={cn("flex flex-col items-center", className)}>
            <nav
                className="flex w-full max-w-[68rem] flex-wrap items-center gap-1 rounded-xl bg-white p-1.5"
                style={{
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)",
                }}
            >
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "whitespace-nowrap rounded-lg px-3 py-2 text-[12px] font-semibold tracking-[0.01em] transition-all duration-150",
                                isActive
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
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
