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
        { name: "Trust", href: "/trust" },
        { name: "Security & Data", href: "/security" },
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
                className="flex w-full snap-x items-center gap-1 overflow-x-auto py-1 pr-9 [scrollbar-width:none] md:pr-0 [&::-webkit-scrollbar]:hidden"
                aria-label="Trust and legal pages"
                onFocusCapture={(event) => {
                    const link = event.target;
                    if (!(link instanceof HTMLAnchorElement) || !link.matches(":focus-visible")) return;
                    const nav = event.currentTarget;
                    const linkBounds = link.getBoundingClientRect();
                    const navBounds = nav.getBoundingClientRect();
                    nav.scrollTo({
                        left: nav.scrollLeft + linkBounds.left - navBounds.left - (nav.clientWidth - linkBounds.width) / 2,
                        behavior: "auto",
                    });
                }}
            >
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            ref={isActive ? activeRef : undefined}
                            key={tab.href}
                            href={tab.href}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "focus-ring inline-flex min-h-11 snap-start items-center whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
                                isActive
                                    ? "border-brand/20 bg-brand-tint text-brand"
                                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {tab.name}
                        </Link>
                    );
                })}
            </nav>
            {hasMore ? (
                <div className="pointer-events-none absolute inset-y-px right-0 flex w-8 items-center justify-end bg-background" aria-hidden="true">
                    <CaretRight className="size-4 text-brand" weight="bold" />
                </div>
            ) : null}
        </div>
    );
}
