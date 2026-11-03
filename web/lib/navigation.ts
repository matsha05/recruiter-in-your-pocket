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
    description?: string;
}

const STUDIO_NAV_ITEMS: NavItem[] = [
    {
        label: "New report",
        href: "/workspace",
        description: "Review your resume",
    },
    {
        label: "My reports",
        href: "/reports",
        description: "Saved reports and versions",
    },
    {
        label: "Jobs",
        href: "/jobs",
        description: "Saved jobs and matching",
    },
    {
        label: "Extension",
        href: "/extension",
        description: "Install and use the Chrome extension",
    },
    {
        label: "Research",
        href: "/research",
        description: "Hiring research hub",
    },
    {
        label: "After the offer",
        href: "/resources",
        description: "Negotiation guides & tools",
    },
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

export interface FooterNavGroup {
    id: string;
    label: string;
    links: MarketingNavItem[];
}

// Grouped, labeled columns (plan 4.10). Names follow the one-name word list in docs/copy-system.md.
export const FOOTER_NAV: FooterNavGroup[] = [
    {
        id: "product",
        label: "Product",
        links: [
            { label: "How it works", href: "/#how-it-works" },
            { label: "Sample report", href: "/sample-report" },
            { label: "Pricing", href: "/pricing" },
            ...(launchFlags.extensionSync ? [{ label: "Extension", href: "/extension" }] : []),
            { label: "How the report works", href: "/methodology" },
        ],
    },
    {
        id: "research",
        label: "Research",
        links: [
            { label: "All research", href: "/research" },
            { label: "How recruiters read", href: "/research/how-recruiters-read" },
            { label: "Bullets that show results", href: "/research/quantifying-impact" },
        ],
    },
    {
        id: "after-the-offer",
        label: "After the offer",
        links: [
            { label: "Negotiate an offer", href: "/resources/offer-negotiation" },
            { label: "Read a tech offer", href: "/resources/tech-offer-negotiation" },
            { label: "Offer calculator", href: "/resources/tools/comp-calculator" },
        ],
    },
    // Three trust destinations (Matt, Nov 2, 2026): Privacy (which now carries security and data handling),
    // Terms, and Help (FAQ and support together). /security, /trust and /support redirect to them.
    {
        id: "help",
        label: "Help",
        links: [
            { label: "Help", href: "/faq" },
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
        ],
    },
];
