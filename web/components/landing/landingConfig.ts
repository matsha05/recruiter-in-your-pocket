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
        badge: "Built from real recruiter-behavior research",
        badgeIcon: BookOpen,
        title: "In 7.4 seconds, they are already forming an opinion.",
        subtitle: "See that first impression in plain language, understand what triggered it, and fix the exact lines costing you interviews.",
        stats: [
            {
                value: "7.4s",
                label: "Decision window",
                sublabel: "Ladders 2018",
                highlight: true,
                valueClassName: "text-[46px] leading-none font-semibold tracking-tight",
            },
            {
                value: "250+",
                label: "Applicants per role",
                sublabel: "Common competitive range",
                valueClassName: "text-[42px] leading-none font-semibold tracking-tight",
            },
            {
                value: "3",
                label: "Priority rewrites",
                sublabel: "Delivered in first review",
                valueClassName: "text-[42px] leading-none font-semibold tracking-tight",
            },
        ],
        bullets: [
            "Real first-read verdict, not a generic score",
            "Critical miss with line-level evidence",
            "Paste-ready rewrites in priority order",
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
        footnote: "Start with one complete review for free. No card required.",
        reportSample: HERO_REPORT_SAMPLE,
        reportPlaybackSeconds: 7.4,
        reportLabel: "7.4-Second Read Window",
        reportSubtitle: "Initial recruiter read",
        reportIcon: SixSecondIcon,
    },
    evidence: {
        eyebrow: "How the verdict is built",
        title: "Every recommendation is tied to evidence on your page",
        copy: "No vague feedback. You see what triggered the reaction, why it matters, and how to fix it.",
        howItWorks: {
            eyebrow: "How the review works",
            steps: [
                "1. Simulate the fast recruiter scan.",
                "2. Pinpoint the line that creates doubt.",
                "3. Rewrite it in the order that moves outcomes.",
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
                description: "Does your trajectory make sense at a glance?",
                weight: "35%",
                citation: "NBER, 2019",
            },
            {
                icon: Users,
                title: "Impact Signal",
                description: "Do outcomes show business value, not just activity?",
                weight: "30%",
                citation: "Bock/Google, 2015",
            },
            {
                icon: SixSecondIcon,
                title: "Clarity Signal",
                description: "Can role, level, and scope be understood fast?",
                weight: "20%",
                citation: "Ladders, 2018",
            },
            {
                icon: BookOpen,
                title: "Readability Signal",
                description: "Does your layout hold up under real time pressure?",
                weight: "15%",
                citation: "Eye-tracking, 2018",
            },
        ],
    },
    research: {
        kicker: "Research translated into action",
        title: "Evidence library, not marketing fluff",
        copy: "Every framework in the studio maps to source material and becomes practical edits you can use today.",
        cta: {
            label: "View all research",
            href: "/research",
        },
        curatedLabel: "Start here",
        featured: {
            eyebrow: "Featured: Eye-tracking",
            readTime: "4 min read",
            title: "What recruiters actually read in the first 7.4 seconds",
            copy: "What recruiters fixate on, skip, and misread during the first pass.",
            highlightLabel: "What this changes",
            highlightCopy: "Lead with one concrete, measurable win in the top third so value lands before attention drops.",
            ctaLabel: "Read the full research note",
            href: "/research/how-recruiters-read",
        },
        curated: [
            {
                category: "Resume writing",
                title: "The Laszlo Bock Formula",
                readTime: "5 min",
                copy: "The structure recruiters read as ownership and impact.",
                icon: BarChart2,
                href: "/research/quantifying-impact",
            },
            {
                category: "Job search strategy",
                title: "The Referral Advantage",
                readTime: "4 min",
                copy: "Where referrals help most and how to use them credibly.",
                icon: Users,
                href: "/research/referral-advantage",
            },
        ],
    },
    trust: {
        eyebrow: "From people who review resumes for a living",
        title: "Built with coaches, hiring managers, and candidates in the loop",
        copy: "The goal is simple: make your strengths read clearly under real hiring pressure.",
        reasonsLabel: "What feels different",
        testimonials: [
            {
                quote: "This feels like the best part of a career coach session, but faster and more concrete.",
                name: "Jennifer Martinez",
                role: "Career Coach",
                company: "Executive coaching practice",
            },
            {
                quote: "This flags the same issues we call out in hiring debriefs, with clearer rewrite guidance.",
                name: "Marcus Williams",
                role: "VP Engineering",
                company: "Series C Startup",
            },
        ],
        reasons: [
            "You get the first-read verdict before generic advice.",
            "Each fix links to the exact evidence line that caused it.",
            "The tone is direct and practical, never dehumanizing.",
        ],
        policyLabel: "First review is on us",
        policyCopy: "One complete review is free, no card required. Upgrade only if you want ongoing iterations.",
        cta: {
            label: "Start free review",
            href: "/workspace",
        },
    },
    pricing: {
        eyebrow: "Simple pricing",
        title: "Start free. Upgrade when you want faster iteration loops.",
        copy: "Free gets you a complete recruiter-style review. Paid plans unlock repeated, role-specific passes and saved history.",
        included: {
            eyebrow: "Included in every plan",
            items: [
                "Evidence-linked verdict and rewrite flow",
                "Clear fix order for every review",
                "Transparent billing and self-serve restore",
            ],
            cta: {
                label: "View full pricing details",
                href: "/pricing",
            },
        },
        trust: {
            kicker: "Clarity and control",
            title: "Your data and billing rules are explicit",
            cta: {
                label: "Review security and data handling",
                href: "/security",
            },
            items: [
                { icon: Lock, title: "Encrypted in transit", copy: "Resume files are encrypted during upload and processing." },
                { icon: Trash2, title: "You control retention", copy: "Reports save when you choose and can be deleted in Settings." },
                { icon: Shield, title: "No public model training", copy: "Resume content is never used to train public models." },
                { icon: Award, title: "Stripe handles billing", copy: "Receipts, renewals, and cancellation are self-serve." },
            ],
        },
    },
};
