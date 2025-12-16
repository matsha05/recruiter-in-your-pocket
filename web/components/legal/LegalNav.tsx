"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LegalNavProps {
    className?: string;
}

export function LegalNav({ className }: LegalNavProps) {
    const pathname = usePathname();

    const tabs = [
        { name: "Trust & Security", href: "/trust" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
    ];

    return (
        <div className={cn("flex flex-col items-center mb-16", className)}>
            {/* Back Link */}
            <Link href="/" className="mb-8">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Button>
            </Link>

            {/* Pill Navigation */}
            <nav className="flex items-center space-x-1 p-1.5 bg-secondary/40 border border-border/10 rounded-md animate-in fade-in zoom-in-95 duration-500 max-w-[90vw] overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-sm transition-all duration-normal",
                                isActive
                                    ? "bg-background text-foreground shadow-sm ring-1 ring-black/5"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
