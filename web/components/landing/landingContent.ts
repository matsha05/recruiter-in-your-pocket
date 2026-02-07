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
        badge: "Methodology grounded in recruiting science",
        badgeIcon: BookOpen,
        title: "See what recruiters see before they move on.",
        subtitle: "Get the initial recruiter read, the evidence behind it, and what to rewrite first.",
        stats: [
            {
                value: "7.4s",
                label: "Avg first scan",
                sublabel: "Ladders 2018",
                highlight: true,
                valueClassName: "text-[46px] leading-none font-semibold tracking-tight",
            },
            {
                value: "250+",
                label: "Applicants per role",
                sublabel: "Large-market benchmark",
                valueClassName: "text-[42px] leading-none font-semibold tracking-tight",
            },
            {
                value: "3",
                label: "Priority fixes",
                sublabel: "First review",
                valueClassName: "text-[42px] leading-none font-semibold tracking-tight",
            },
        ],
        bullets: [
            "Initial read and critical miss",
            "Evidence-linked rewrite",
            "Priority order for next iteration",
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
        footnote: "First review free. No card required. Reports save only if you choose.",
        reportSample: HERO_REPORT_SAMPLE,
        reportPlaybackSeconds: 7.4,
        reportLabel: "7.4-Second Read Window",
        reportSubtitle: "Initial recruiter read",
        reportIcon: SixSecondIcon,
    },
    evidence: {
        eyebrow: "The 7.4-second review model",
        title: "Evidence before advice",
        copy: "Four weighted signals tied to exact lines in your resume.",
        howItWorks: {
            eyebrow: "How the review works",
            steps: [
                "1. Spot what triggers the decision.",
                "2. Show the line that caused it.",
                "3. Recommend the rewrite in order.",
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
                description: "Would a recruiter keep reading?",
                weight: "35%",
                citation: "NBER, 2019",
            },
            {
                icon: Users,
                title: "Impact Signal",
                description: "Are outcomes tied to business value?",
                weight: "30%",
                citation: "Bock/Google, 2015",
            },
            {
                icon: SixSecondIcon,
                title: "Clarity Signal",
                description: "Can role and level be understood quickly?",
                weight: "20%",
                citation: "Ladders, 2018",
            },
            {
                icon: BookOpen,
                title: "Readability Signal",
                description: "Can someone scan this under time pressure?",
                weight: "15%",
                citation: "Eye-tracking, 2018",
            },
        ],
    },
    research: {
        kicker: "Research-backed by design",
        title: "Built on how recruiters decide",
        copy: "Research translated into practical edits you can apply on your next draft.",
        cta: {
            label: "View all research",
            href: "/research",
        },
        curatedLabel: "Curated next reads",
        featured: {
            eyebrow: "Featured: Eye-tracking research",
            readTime: "4 min read",
            title: "What recruiters actually read in the first 7.4 seconds",
            copy: "Eye-tracking evidence on the cues that drive pass versus reject decisions.",
            highlightLabel: "What this changes",
            highlightCopy: "Move your strongest quantified outcome into the top third of page one.",
            ctaLabel: "Read full breakdown",
            href: "/research/how-recruiters-read",
        },
        curated: [
            {
                category: "Resume writing",
                title: "The Laszlo Bock Formula",
                readTime: "5 min",
                copy: "Quantified outcomes and perceived impact",
                icon: BarChart2,
                href: "/research/quantifying-impact",
            },
            {
                category: "Job search strategy",
                title: "The Referral Advantage",
                readTime: "4 min",
                copy: "Referral patterns that shift interview odds",
                icon: Users,
                href: "/research/referral-advantage",
            },
        ],
    },
    trust: {
        eyebrow: "Recruiter perspective",
        title: "Trusted by people making hiring decisions",
        copy: "Built around how coaches and hiring managers review resumes under time pressure.",
        reasonsLabel: "Why teams choose RIYP",
        testimonials: [
            {
                quote: "Executive coaches charge $500+ for less operational detail than this.",
                name: "Jennifer Martinez",
                role: "Career Coach",
                company: "$450/hr clients",
            },
            {
                quote: "I have reviewed thousands of resumes. This catches the same misses we flag in interview loops.",
                name: "Marcus Williams",
                role: "VP Engineering",
                company: "Series C Startup",
            },
        ],
        reasons: [
            "It surfaces the initial read, not just a score.",
            "It links every recommendation to line-level evidence.",
            "It gives paste-ready rewrites in priority order.",
        ],
        policyLabel: "First review policy",
        policyCopy: "First full review is free. No card required.",
        cta: {
            label: "Start free review",
            href: "/workspace",
        },
    },
    pricing: {
        eyebrow: "Pricing with clear value boundaries",
        title: "Start free, upgrade when iteration speed matters",
        copy: "One full review is free. Paid plans add repeated role-specific reviews, deeper rewrites, and saved history.",
        included: {
            eyebrow: "Included in every plan",
            items: [
                "Evidence-first report structure",
                "Clear fix order for each review",
                "Transparent billing and self-serve restore",
            ],
            cta: {
                label: "View full pricing details",
                href: "/pricing",
            },
        },
        trust: {
            kicker: "Trust, in plain English",
            title: "Clear rules for data, billing, and control",
            cta: {
                label: "Review security and data handling",
                href: "/security",
            },
            items: [
                { icon: Lock, title: "Encrypted in transit", copy: "Files are encrypted during upload and processing." },
                { icon: Trash2, title: "You control retention", copy: "Reports save when you choose and can be removed in Settings." },
                { icon: Shield, title: "No public model training", copy: "Resume data is not used to train public models." },
                { icon: Award, title: "Stripe handles billing", copy: "Receipts, renewals, and cancellation are self-serve." },
            ],
        },
    },
};
