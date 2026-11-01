"use client";

import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface LegalNavProps {
    className?: string;
}

function centerLinkInNav(nav: HTMLElement, link: HTMLAnchorElement) {
    const linkBounds = link.getBoundingClientRect();
    const navBounds = nav.getBoundingClientRect();
    nav.scrollTo({
        left: nav.scrollLeft + linkBounds.left - navBounds.left - (nav.clientWidth - linkBounds.width) / 2,
        behavior: "auto",
    });
}

/** Compact, horizontally scrollable trust navigation. */
export function LegalNav({ className }: LegalNavProps) {
    const pathname = usePathname();
    const navRef = useRef<HTMLElement>(null);
    const activeRef = useRef<HTMLAnchorElement>(null);
    const [hasMore, setHasMore] = useState(false);

    // Four tabs (plan 4.9). Trust folds into Security and Support into Help; Status and the
    // methodology stay reachable from the footer and the research library, not from here.
    const tabs = [
        { name: "Privacy", href: "/privacy", match: ["/privacy"] },
        { name: "Terms", href: "/terms", match: ["/terms"] },
        { name: "Security", href: "/security", match: ["/security", "/trust"] },
        { name: "Help", href: "/faq", match: ["/faq", "/support"] },
    ];

    useEffect(() => {
        const nav = navRef.current;
        if (!nav) return;

        if (activeRef.current) centerLinkInNav(nav, activeRef.current);
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
                    centerLinkInNav(event.currentTarget, link);
                }}
            >
                {tabs.map((tab) => {
                    const isActive = tab.match.includes(pathname);
                    return (
                        <Link
                            ref={isActive ? activeRef : undefined}
                            key={tab.href}
                            href={tab.href}
                            aria-current={pathname === tab.href ? "page" : isActive ? "true" : undefined}
                            className={cn(
                                "focus-ring inline-flex min-h-11 snap-start items-center whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium",
                                isActive
                                    ? "border-brand/20 bg-brand-tint text-brand"
                                    : "border-transparent text-muted-foreground riyp-surface-link hover:text-foreground"
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
