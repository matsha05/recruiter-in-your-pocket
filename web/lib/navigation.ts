/**
 * Centralized Navigation Configuration
 * 
 * Single source of truth for navigation links across the app.
 * Edit here to update sidebar, mobile nav, footer, and headers.
 */

import {
    FileText,
    Briefcase,
    Library,
    Chrome,
    BookOpen,
    FileClock,
} from "lucide-react";
import { launchFlags } from "@/lib/launch/flags";

// ============================================================================
// STUDIO NAVIGATION (Sidebar + Mobile Nav for authenticated app)
// ============================================================================

export interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
}

const STUDIO_NAV_ITEMS: NavItem[] = [
    {
        label: "The Studio",
        href: "/workspace",
        icon: FileText,
        description: "Review your resume",
    },
    {
        label: "Reports",
        href: "/reports",
        icon: FileClock,
        description: "Saved reports and versions",
    },
    {
        label: "Jobs",
        href: "/jobs",
        icon: Briefcase,
        description: "Saved jobs and matching",
    },
    {
        label: "Extension",
        href: "/extension",
        icon: Chrome,
        description: "Install and use the Chrome extension",
    },
    {
        label: "Research",
        href: "/research",
        icon: Library,
        description: "Hiring research hub",
    },
    {
        label: "Resources",
        href: "/resources",
        icon: BookOpen,
        description: "Negotiation guides & tools",
    },
    // Settings is now accessed via UserNav dropdown (premium pattern)
];

export const STUDIO_NAV: NavItem[] = STUDIO_NAV_ITEMS.filter(
    (item) => launchFlags.extensionSync || (item.href !== "/extension" && item.href !== "/jobs")
);

// ============================================================================
// MARKETING NAVIGATION (SiteHeader, Footer)
// ============================================================================

export interface MarketingNavGroup {
    label: string;
    items: MarketingNavItem[];
}

export interface MarketingNavItem {
    label: string;
    href: string;
    description?: string;
}

const MARKETING_NAV = {
    product: [
        { label: "Pricing", href: "/pricing" },
        { label: "Workspace", href: "/workspace" },
        ...(launchFlags.extensionSync ? [{ label: "Extension", href: "/extension" }] : []),
    ],
    research: [
        { label: "How Recruiters Read", href: "/research/how-recruiters-read" },
        { label: "How We Score", href: "/research/how-we-score" },
        { label: "Research Hub", href: "/research" },
    ],
    resources: [
        { label: "Negotiation Guide", href: "/resources/tech-offer-negotiation" },
        { label: "Offer Calculator", href: "/resources/tools/comp-calculator" },
        { label: "All Resources", href: "/resources" },
    ],
    company: [
        { label: "FAQ", href: "/faq" },
        { label: "Security", href: "/security" },
        { label: "Methodology", href: "/methodology" },
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
    ],
} as const;

// ============================================================================
// FOOTER NAVIGATION
// ============================================================================

export const FOOTER_NAV = {
    pillLinks: [
        { label: "Pricing", href: "/pricing" },
        ...(launchFlags.extensionSync ? [{ label: "Extension", href: "/extension" }] : []),
        { label: "Research", href: "/research" },
        { label: "Resources", href: "/resources" },
    ],
    legalLinks: [
        { label: "FAQ", href: "/faq" },
        { label: "Security", href: "/security" },
        { label: "Methodology", href: "/methodology" },
        { label: "Terms", href: "/terms" },
        { label: "Privacy", href: "/privacy" },
    ],
} as const;
