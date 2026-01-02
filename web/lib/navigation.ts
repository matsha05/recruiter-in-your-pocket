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
    CreditCard,
    Home,
    BookOpen,
    Wrench,
} from "lucide-react";

// ============================================================================
// STUDIO NAVIGATION (Sidebar + Mobile Nav for authenticated app)
// ============================================================================

export interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
}

export const STUDIO_NAV: NavItem[] = [
    {
        label: "The Studio",
        href: "/workspace",
        icon: FileText,
        description: "Review your resume",
    },
    {
        label: "Jobs",
        href: "/jobs",
        icon: Briefcase,
        description: "Saved jobs and matching",
    },
    {
        label: "Research",
        href: "/research",
        icon: Library,
        description: "Hiring research hub",
    },
    {
        label: "Resources",
        href: "/guides",
        icon: BookOpen,
        description: "Negotiation guides & tools",
    },
    {
        label: "Settings",
        href: "/settings",
        icon: CreditCard,
        description: "Account & billing",
    },
];

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

export const MARKETING_NAV = {
    research: [
        { label: "How Recruiters Read", href: "/research/how-recruiters-read" },
        { label: "The 7-Second Scan", href: "/research/how-people-scan" },
        { label: "Research Hub", href: "/research" },
    ],
    resources: [
        { label: "Negotiation Guide", href: "/guides/tech-offer-negotiation" },
        { label: "Offer Calculator", href: "/guides/tools/comp-calculator" },
        { label: "All Resources", href: "/guides" },
    ],
    company: [
        { label: "FAQ", href: "/faq" },
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
    ],
} as const;

// ============================================================================
// FOOTER NAVIGATION
// ============================================================================

export const FOOTER_NAV = {
    pillLinks: [
        { label: "Research", href: "/research" },
        { label: "Resources", href: "/guides" },
    ],
    legalLinks: [
        { label: "FAQ", href: "/faq" },
        { label: "Terms", href: "/terms" },
        { label: "Privacy", href: "/privacy" },
    ],
} as const;
