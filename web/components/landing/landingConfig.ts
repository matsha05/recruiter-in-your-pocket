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
import { SixSecondIcon } from "@/components/icons";
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
        title: "In 7.4 seconds, they've already made up their mind about you.",
        subtitle: "Upload your resume for a free recruiter-grade review, then add a job description only if you want fit context for a specific role.",
        stats: [
            {
                value: "7.4s",
                label: "That's all you get",
                sublabel: "Ladders 2018",
                highlight: true,
                valueClassName: "text-[46px] leading-none font-semibold tracking-tight",
            },
            {
                value: "250+",
                label: "...are competing with you",
                sublabel: "Per open role",
                valueClassName: "text-[42px] leading-none font-semibold tracking-tight",
            },
            {
                value: "3",
                label: "Fixes you can make tonight",
                sublabel: "In your first free review",
                valueClassName: "text-[42px] leading-none font-semibold tracking-tight",
            },
        ],
        bullets: [
            "What a recruiter actually thinks — not a score with no explanation",
            "The one thing that's hurting you most, with proof",
            "Rewrites you can paste into your resume tonight",
        ],
        primaryCta: {
            label: "Start free review",
            href: "/workspace",
            analyticsCta: "hero_run_free_review",
            analyticsDestination: "/workspace",
        },
        secondaryCta: {
            label: "View methodology",
            href: "/research/how-we-score",
        },
        footnote: "First review free. No login required. Save only when you decide to.",
        reportSample: HERO_REPORT_SAMPLE,
        reportPlaybackSeconds: 7.4,
        reportLabel: "The first 7.4 seconds",
        reportSubtitle: "What they see first",
        reportIcon: SixSecondIcon,
    },
    evidence: {
        eyebrow: "How it works",
        title: "Most tools say 'add more impact.' We highlight the exact sentence and rewrite it for you.",
        copy: "You get the specific line from your resume, why it's weak, and a better version you can use.",
        howItWorks: {
            eyebrow: "How the review works",
            steps: [
                "1. Read your resume the way a recruiter would — fast.",
                "2. Find the line that makes them hesitate.",
                "3. Rewrite it for you, starting with what matters most.",
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
                description: "Can someone tell your career story in 10 seconds?",
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
                icon: SixSecondIcon,
                title: "Clarity Signal",
                description: "Can someone tell what you do — quickly?",
                weight: "20%",
                citation: "Ladders, 2018",
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
        copy: "Every recommendation traces back to a real study — and becomes a specific edit on your resume.",
        cta: {
            label: "View all research",
            href: "/research",
        },
        curatedLabel: "Start here",
        featured: {
            eyebrow: "Featured: Eye-tracking",
            readTime: "4 min read",
            title: "What recruiters read in the first 7.4 seconds",
            copy: "What they look at, what they skip, and what they get wrong.",
            highlightLabel: "What this changes",
            highlightCopy: "Put your biggest win near the top — before they stop reading.",
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
                copy: "When referrals help — and how to ask without being weird.",
                icon: Users,
                href: "/research/referral-advantage",
            },
        ],
    },
    trust: {
        eyebrow: "From people who hire",
        title: "Built by people who've read 10,000 resumes.",
        copy: "You're better than your resume makes you look. We make that obvious, without hiding the methodology or the data handling.",
        reasonsLabel: "What feels different",
        testimonials: [
            {
                quote: "This feels like the best part of a career coach session, but faster and more concrete.",
                name: "Jennifer Martinez",
                role: "Career Coach",
                company: "Executive coaching practice",
            },
            {
                quote: "This catches the same stuff we flag in hiring debriefs — but with actual rewrites.",
                name: "Marcus Williams",
                role: "VP Engineering",
                company: "Series C Startup",
            },
        ],
        reasons: [
            "You see what a recruiter would actually think — not tips from a blog.",
            "Every suggestion links to the exact line on your resume.",
            "Honest, useful feedback. Not robotic.",
            "Clear controls for saving, deleting, billing, and extension capture.",
        ],
        policyLabel: "First review is on us",
        policyCopy: "Your first review is completely free. No card, no silent save, and no account required until you want durable history.",
        cta: {
            label: "Start free review",
            href: "/workspace",
        },
    },
    pricing: {
        eyebrow: "Simple pricing",
        title: "Start free. Pay when you want more.",
        copy: "Your first review is free — the full thing, not a teaser. Paid plans are for repeated reviews, report history, exports, and a steadier role-by-role workflow.",
        included: {
            eyebrow: "Included in every plan",
            items: [
                "Your review, the evidence behind it, and rewrites — every time",
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
                { icon: Lock, title: "Encrypted on upload", copy: "Your resume is encrypted the moment you upload it." },
                { icon: Trash2, title: "You control your data", copy: "Your reports are only saved if you want them — and you can delete them anytime." },
                { icon: Shield, title: "No AI training", copy: "We never use your resume to train AI models." },
                { icon: Award, title: "Explicit extension capture", copy: "The extension works on supported job pages and only captures roles when you ask it to." },
            ],
        },
    },
};
