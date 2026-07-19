import type { ComponentType } from "react";
import {
    Award,
    BarChart2,
    BookOpen,
    Lock,
    Shield,
    Trash2,
    Users,
} from "lucide-react";
import type { ReportData } from "@/components/workspace/report/ReportTypes";

export type LandingIcon = ComponentType<{ className?: string }>;

export type HeroStatContent = {
    value: string;
    label: string;
    sublabel?: string;
    highlight?: boolean;
    valueClassName?: string;
};

export type LandingHeroContent = {
    badge: string;
    badgeIcon: LandingIcon;
    title: string;
    subtitle: string;
    stats: HeroStatContent[];
    bullets: string[];
    primaryCta: { label: string; href: string; analyticsCta: string; analyticsDestination: string };
    secondaryCta: { label: string; href: string };
    footnote: string;
    reportSample: ReportData;
    reportPlaybackSeconds: number;
    reportLabel: string;
    reportSubtitle: string;
    reportIcon: LandingIcon;
};

export type LandingSignalCard = {
    icon: LandingIcon;
    title: string;
    description: string;
    weight: string;
    citation: string;
};

export type LandingEvidenceContent = {
    eyebrow: string;
    title: string;
    copy: string;
    howItWorks: {
        eyebrow: string;
        steps: string[];
        cta: { label: string; href: string };
    };
    signalCards: LandingSignalCard[];
};

export type LandingResearchContent = {
    kicker: string;
    title: string;
    copy: string;
    cta: { label: string; href: string };
    curatedLabel: string;
    featured: {
        eyebrow: string;
        readTime: string;
        title: string;
        copy: string;
        highlightLabel: string;
        highlightCopy: string;
        ctaLabel: string;
        href: string;
    };
    curated: Array<{
        category: string;
        title: string;
        readTime: string;
        copy: string;
        icon: LandingIcon;
        href: string;
    }>;
};

export type LandingTrustContent = {
    eyebrow: string;
    title: string;
    copy: string;
    reasonsLabel: string;
    testimonials: Array<{ quote: string; name: string; role: string; company: string }>;
    reasons: string[];
    policyLabel: string;
    policyCopy: string;
    cta: { label: string; href: string };
};

export type LandingPricingContent = {
    eyebrow: string;
    title: string;
    copy: string;
    included: {
        eyebrow: string;
        items: string[];
        cta: { label: string; href: string };
    };
    trust: {
        kicker: string;
        title: string;
        cta: { label: string; href: string };
        items: Array<{ icon: LandingIcon; title: string; copy: string }>;
    };
};

export type LandingContentConfig = {
    hero: LandingHeroContent;
    evidence: LandingEvidenceContent;
    research: LandingResearchContent;
    trust: LandingTrustContent;
    pricing: LandingPricingContent;
};

const HERO_REPORT_SAMPLE: ReportData = {
    score: 87,
    score_comment_short: "Strong story. Impact is under-quantified.",
    biggest_gap_example: "Impact metrics missing in two recent roles.",
    top_fixes: [
        {
            fix: "Add one measurable business outcome per recent role.",
            evidence: {
                excerpt: "Led migration across 4 services.",
                section: "Work Experience",
            },
            confidence: "high",
        },
    ],
    subscores: {
        story: 92,
        impact: 78,
        clarity: 85,
        readability: 68,
    },
};

export const landingContent: LandingContentConfig = {
    hero: {
        badge: "Based on how recruiters actually decide",
        badgeIcon: BookOpen,
        title: "Your resume is making a case. See the case it actually makes.",
        subtitle: "Get your free report first. Add a job description only if you want to see how it lines up with a specific role.",
        stats: [
            {
                value: "1",
                label: "Complete report",
                sublabel: "Free, no card",
                highlight: true,
                valueClassName: "text-[46px] leading-none font-semibold tracking-tight",
            },
            {
                value: "3",
                label: "Changes to start with",
                sublabel: "Ordered by impact",
                valueClassName: "text-[42px] leading-none font-semibold tracking-tight",
            },
            {
                value: "0",
                label: "Invented achievements",
                sublabel: "Your facts only",
                valueClassName: "text-[42px] leading-none font-semibold tracking-tight",
            },
        ],
        bullets: [
            "What stands out first, and what gets missed",
            "Where the reader hesitates, and why",
            "The highest-impact changes to make next",
        ],
        primaryCta: {
            label: "Run free report",
            href: "/workspace",
            analyticsCta: "hero_run_free_report",
            analyticsDestination: "/workspace",
        },
        secondaryCta: {
            label: "View methodology",
            href: "/research/how-we-score",
        },
        footnote: "First report free. No login required. Save only when you decide to.",
        reportSample: HERO_REPORT_SAMPLE,
        reportPlaybackSeconds: 5,
        reportLabel: "Opening read",
        reportSubtitle: "What the page communicates",
        reportIcon: BookOpen,
    },
    evidence: {
        eyebrow: "How it works",
        title: "See the resume a recruiter sees—not the one you meant to write.",
        copy: "Your report separates what is already working from what is easy to miss, hard to believe, or still making the reader guess.",
        howItWorks: {
            eyebrow: "How the report works",
            steps: [
                "1. Read the resume as a recruiter-style opening review.",
                "2. Show what landed, what created doubt, and what is missing.",
                "3. Prioritize the few changes that will improve the whole read.",
            ],
            cta: {
                label: "See full methodology",
                href: "/research/how-we-score",
            },
        },
        signalCards: [
            {
                icon: BarChart2,
                title: "Story Signal",
                description: "Can someone follow your career story without filling in the gaps?",
                weight: "35%",
                citation: "NBER, 2019",
            },
            {
                icon: Users,
                title: "Impact Signal",
                description: "Are you showing what you accomplished, or just listing what you did?",
                weight: "30%",
                citation: "Bock/Google, 2015",
            },
            {
                icon: BookOpen,
                title: "Clarity Signal",
                description: "Can someone tell what you do quickly?",
                weight: "20%",
                citation: "Recruiter review research",
            },
            {
                icon: BookOpen,
                title: "Readability Signal",
                description: "Is your resume easy to scan when someone's in a rush?",
                weight: "15%",
                citation: "Eye-tracking, 2018",
            },
        ],
    },
    research: {
        kicker: "The research behind it",
        title: "Peer-reviewed research. Not a blog post from 2019.",
        copy: "Every recommendation traces back to real research, then turns into a more useful edit on your resume.",
        cta: {
            label: "View all research",
            href: "/research",
        },
        curatedLabel: "Start here",
        featured: {
            eyebrow: "Featured: Eye-tracking",
            readTime: "4 min read",
            title: "How recruiters actually read a resume",
            copy: "What the best available studies observed, what they did not prove, and what that changes.",
            highlightLabel: "What this changes",
            highlightCopy: "Put your strongest proof near the top, before they move on.",
            ctaLabel: "Read the full research note",
            href: "/research/how-recruiters-read",
        },
        curated: [
            {
                category: "Resume writing",
                title: "The Laszlo Bock Formula",
                readTime: "5 min",
                copy: "How to write bullets that sound like you owned the work.",
                icon: BarChart2,
                href: "/research/quantifying-impact",
            },
            {
                category: "Job search strategy",
                title: "The Referral Advantage",
                readTime: "4 min",
                copy: "When referrals help, and how to ask without being weird.",
                icon: Users,
                href: "/research/referral-advantage",
            },
        ],
    },
    trust: {
        eyebrow: "The recruiter behind the report",
        title: "Built from the hiring side, for the person waiting on the other side.",
        copy: "Matt Shaw has spent 14 years recruiting and leading hiring teams across OpenAI, Meta, Google, X-Team, and Robert Half. RIYP makes the questions recruiters ask privately useful before you apply.",
        reasonsLabel: "What the product protects",
        testimonials: [
            {
                quote: "Most people aren't short on good experience. The resume is just missing the details that make it obvious.",
                name: "Matt Shaw",
                role: "Founder",
                company: "Recruiter in Your Pocket",
            },
        ],
        reasons: [
            "You see what a recruiter is likely to notice first, not generic resume tips.",
            "Every recommendation shows the evidence behind it.",
            "Honest, useful feedback. Not robotic.",
            "Clear controls for saving, deleting, billing, and extension capture.",
        ],
        policyLabel: "First report is on us",
        policyCopy: "Your first report is completely free. No card, no silent save, and no account required until you want durable history.",
        cta: {
            label: "Run free report",
            href: "/workspace",
        },
    },
    pricing: {
        eyebrow: "Simple pricing",
        title: "One complete report free. Five more for $29.",
        copy: "The Job Search Pass is a one-time purchase for an active search: five additional reports over 30 days, with no subscription.",
        included: {
            eyebrow: "Included in every plan",
            items: [
                "Your report, the evidence behind it, and rewrites every time",
                "Fixes in the order that matters most",
                "Straightforward billing, restore, and cancellation paths.",
            ],
            cta: {
                label: "View full pricing details",
                href: "/pricing",
            },
        },
        trust: {
            kicker: "Your data, your rules",
            title: "Want to know exactly how we handle your data and extension access?",
            cta: {
                label: "Review security and install details",
                href: "/extension",
            },
            items: [
                { icon: Lock, title: "Encrypted in transit", copy: "Your resume is protected while it moves through the upload flow." },
                { icon: Trash2, title: "You control your data", copy: "Your reports are only saved if you want them, and you can delete them anytime." },
                { icon: Shield, title: "No AI training", copy: "We never use your resume to train AI models." },
                { icon: Award, title: "Explicit extension capture", copy: "The extension works on supported job pages and only captures roles when you ask it to." },
            ],
        },
    },
};
