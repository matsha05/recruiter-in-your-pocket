"use client";

import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { isLaunchFlagEnabled } from "@/lib/launch/flags";

interface LegalNavProps {
    className?: string;
}

/** Compact, horizontally scrollable trust navigation. */
export function LegalNav({ className }: LegalNavProps) {
    const pathname = usePathname();
    const navRef = useRef<HTMLElement>(null);
    const activeRef = useRef<HTMLAnchorElement>(null);
    const [hasMore, setHasMore] = useState(false);

    const tabs = [
        { name: "Trust & Security", href: "/trust" },
        { name: "Data Handling", href: "/security" },
        ...(isLaunchFlagEnabled("extensionSync") ? [{ name: "Extension", href: "/extension" }] : []),
        { name: "Support", href: "/support" },
        { name: "Status", href: "/status" },
        { name: "Methodology", href: "/methodology" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "FAQ", href: "/faq" },
    ];

    useEffect(() => {
        const nav = navRef.current;
        if (!nav) return;

        activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
        const update = () => setHasMore(nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 4);
        update();
        nav.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            nav.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, [pathname]);

    return (
        <div className={cn("relative min-w-0", className)}>
            <nav
                ref={navRef}
                className="flex w-full snap-x items-center gap-6 overflow-x-auto border-y border-line py-1 pr-9 [scrollbar-width:none] md:pr-0 [&::-webkit-scrollbar]:hidden"
                aria-label="Trust and legal pages"
            >
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            ref={isActive ? activeRef : undefined}
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "focus-ring min-h-11 snap-start whitespace-nowrap border-b-2 px-0 py-3 text-[13px] font-semibold transition-colors duration-200",
                                isActive
                                    ? "border-brand text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab.name}
                        </Link>
                    );
                })}
            </nav>
            {hasMore ? (
                <div className="pointer-events-none absolute inset-y-px right-0 flex w-8 items-center justify-end bg-paper" aria-hidden="true">
                    <CaretRight className="size-4 text-brand" weight="bold" />
                </div>
            ) : null}
        </div>
    );
}
