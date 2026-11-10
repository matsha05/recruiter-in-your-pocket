/**
 * Centralized Navigation Configuration
 * 
 * Single source of truth for navigation links across the app.
 * Edit here to update sidebar, mobile nav, footer, and headers.
 */

import { launchFlags } from "@/lib/launch/flags";

// ============================================================================
// STUDIO NAVIGATION (Sidebar + Mobile Nav for authenticated app)
// ============================================================================

export interface NavItem {
    label: string;
    href: string;
}

const STUDIO_NAV_ITEMS: NavItem[] = [
    { label: "New report", href: "/workspace" },
    { label: "My reports", href: "/reports" },
    { label: "Jobs", href: "/jobs" },
    { label: "Extension", href: "/extension" },
    { label: "Research", href: "/research" },
    { label: "After the offer", href: "/resources" },
    // Settings is now accessed via UserNav dropdown (premium pattern)
];

// "New report" always opens a fresh input, even when the workspace would otherwise
// reopen the visitor's last anonymous report. Active-state checks still use "/workspace".
export const NEW_REPORT_HREF = "/workspace?new=1";
export const navLinkHref = (href: string) => (href === "/workspace" ? NEW_REPORT_HREF : href);

export const STUDIO_NAV: NavItem[] = STUDIO_NAV_ITEMS.filter(
    (item) => launchFlags.extensionSync || (item.href !== "/extension" && item.href !== "/jobs")
);

// ============================================================================
// FOOTER NAVIGATION
// ============================================================================

export interface MarketingNavItem {
    label: string;
    href: string;
    description?: string;
}

// One short row (Matt, Nov 10, 2026: "its SO MUCH TEXT"). The header already carries the report, pricing, research
// and After the offer, so the footer holds only what the header doesn't: the comparison, the method, and the three
// trust pages. Names follow the one-name word list in docs/copy-system.md.
export const FOOTER_LINKS: MarketingNavItem[] = [
    { label: "Compared with other tools", href: "/compare" },
    { label: "How the report works", href: "/methodology" },
    ...(launchFlags.extensionSync ? [{ label: "Extension", href: "/extension" }] : []),
    { label: "Help", href: "/help" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
];
