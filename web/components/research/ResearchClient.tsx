"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import Footer from "@/components/landing/Footer";

/**
 * Research Hub
 * Document-first layout per docs/research-ui-contract.md.
 */

const featuredArticles = [
    {
        id: "how-recruiters-read",
        title: "How Recruiters Actually Read Resumes",
        thesis: "Eye-tracking studies on attention patterns and decision flow.",
        readTime: "4 min",
        href: "/research/how-recruiters-read",
        label: "Start here"
    },
    {
        id: "quantifying-impact",
        title: "The Laszlo Bock Formula",
        thesis: "How measurable outcomes shape perceived impact.",
        readTime: "5 min",
        href: "/research/quantifying-impact",
        label: "Most actionable"
    },
    {
        id: "referral-advantage",
        title: "The Referral Advantage",
        thesis: "How referrals shift movement through hiring funnels.",
        readTime: "4 min",
        href: "/research/referral-advantage",
        label: "Highest impact"
    }
];

const categories = [
    {
        id: "recruiter-psychology",
        title: "Inside the Recruiter's Mind",
        subtitle: "How hiring decisions actually get made",
        articles: [
            {
                id: "how-people-scan",
                title: "How People Scan Text and Bullets",
                thesis: "F-patterns, first-word scanning, and structure for faster comprehension.",
                readTime: "4 min",
                href: "/research/how-people-scan"
            },
            {
                id: "ats-myths",
                title: "ATS: What Actually Happens",
                thesis: "Where humans step in and where automation stops.",
                readTime: "4 min",
                href: "/research/ats-myths"
            },
            {
                id: "automation-filter-points",
                title: "Where Automation Filters You Out",
                thesis: "Exposure, eligibility, and ranking touchpoints.",
                readTime: "4 min",
                href: "/research/automation-filter-points"
            },
            {
                id: "automation-and-bias",
                title: "Hiring Algorithms and Bias",
                thesis: "How automated systems compound bias across stages.",
                readTime: "4 min",
                href: "/research/automation-and-bias"
            },
            {
                id: "human-vs-algorithm",
                title: "Humans vs. Algorithms",
                thesis: "How recruiters interpret machine scores versus human signals.",
                readTime: "4 min",
                href: "/research/human-vs-algorithm"
            },
            {
                id: "spelling-errors-impact",
                title: "Spelling Errors Carry Weight",
                thesis: "How small errors affect perceived rigor and clarity.",
                readTime: "3 min",
                href: "/research/spelling-errors-impact"
            },
            {
                id: "resume-error-tax",
                title: "The Resume Error Tax",
                thesis: "Why typos are treated as risk signals.",
                readTime: "4 min",
                href: "/research/resume-error-tax"
            },
            {
                id: "hiring-discrimination-meta-analysis",
                title: "Discrimination in Hiring",
                thesis: "What resumes can and cannot control.",
                readTime: "5 min",
                href: "/research/hiring-discrimination-meta-analysis"
            },
            {
                id: "bias-limits-optimization",
                title: "Limits of Resume Optimization",
                thesis: "A bounded-control view of bias and signal.",
                readTime: "4 min",
                href: "/research/bias-limits-optimization"
            }
        ]
    },
    {
        id: "resume-craft",
        title: "Resume Craft",
        subtitle: "Writing and structure fundamentals",
        articles: [
            {
                id: "how-we-score",
                title: "The 7.4-Second Signal Model",
                thesis: "How we score story, impact, clarity, and readability.",
                readTime: "5 min",
                href: "/research/how-we-score"
            },
            {
                id: "star-method",
                title: "The STAR Method",
                thesis: "Structure for behavioral narratives and resume bullets.",
                readTime: "4 min",
                href: "/research/star-method"
            },
            {
                id: "structured-interviews-why-star",
                title: "Structured Interviews Beat Vibes",
                thesis: "Why STAR exists and why structure wins.",
                readTime: "4 min",
                href: "/research/structured-interviews-why-star"
            },
            {
                id: "quantifying-impact",
                title: "The Laszlo Bock Formula",
                thesis: "How measurable outcomes shape perceived impact.",
                readTime: "5 min",
                href: "/research/quantifying-impact"
            },
            {
                id: "writing-quality-hire-probability",
                title: "Writing Quality Changes Hiring",
                thesis: "Clarity increases hiring outcomes in field evidence.",
                readTime: "4 min",
                href: "/research/writing-quality-hire-probability"
            },
            {
                id: "signal-vs-clarity",
                title: "Signal vs. Clarity",
                thesis: "Two explanations for why good resumes work.",
                readTime: "4 min",
                href: "/research/signal-vs-clarity"
            },
            {
                id: "resume-length-myths",
                title: "The One-Page Myth",
                thesis: "What length signals for experienced candidates.",
                readTime: "4 min",
                href: "/research/resume-length-myths"
            },
            {
                id: "page-two-gate",
                title: "The Page-2 Gate",
                thesis: "Why page 2 is earned by page 1.",
                readTime: "3 min",
                href: "/research/page-two-gate"
            }
        ]
    },
    {
        id: "job-search-strategy",
        title: "Job Search Strategy",
        subtitle: "LinkedIn, networking, and negotiation",
        articles: [
            {
                id: "linkedin-vs-resume",
                title: "LinkedIn vs. Resume",
                thesis: "Discovery versus evaluation, and how each is used.",
                readTime: "4 min",
                href: "/research/linkedin-vs-resume"
            },
            {
                id: "linkedin-visibility",
                title: "LinkedIn Visibility",
                thesis: "Which profile elements influence discovery and clicks.",
                readTime: "5 min",
                href: "/research/linkedin-visibility"
            },
            {
                id: "recruiter-search-behavior",
                title: "Recruiter Search Behavior",
                thesis: "What LinkedIn discloses and what remains unknown.",
                readTime: "4 min",
                href: "/research/recruiter-search-behavior"
            },
            {
                id: "social-screening",
                title: "Social Screening",
                thesis: "What recruiters look for online across platforms.",
                readTime: "4 min",
                href: "/research/social-screening"
            },
            {
                id: "skills-based-hiring",
                title: "The Skills-Based Shift",
                thesis: "How skills-first hiring changes screening.",
                readTime: "5 min",
                href: "/research/skills-based-hiring"
            },
            {
                id: "skills-first-promise-reality",
                title: "Skills-First: Promise vs Reality",
                thesis: "Where skills-first expands pools and where adoption lags.",
                readTime: "4 min",
                href: "/research/skills-first-promise-reality"
            },
            {
                id: "offer-negotiation",
                title: "Offer Negotiation",
                thesis: "Negotiation is coordination, not combat.",
                readTime: "12 min",
                href: "/guides/offer-negotiation"
            },
            {
                id: "salary-history-bans",
                title: "Salary History Disclosure",
                thesis: "How disclosure shapes the first anchor.",
                readTime: "4 min",
                href: "/research/salary-history-bans"
            },
            {
                id: "salary-anchors",
                title: "Salary Anchors",
                thesis: "Avoid self-discounting early in negotiations.",
                readTime: "4 min",
                href: "/research/salary-anchors"
            },
            {
                id: "referral-advantage",
                title: "The Referral Advantage",
                thesis: "How referrals shift movement through hiring funnels.",
                readTime: "4 min",
                href: "/research/referral-advantage"
            },
            {
                id: "referral-advantage-quantified",
                title: "Referral Advantage, Quantified",
                thesis: "How referrals reduce uncertainty in field evidence.",
                readTime: "4 min",
                href: "/research/referral-advantage-quantified"
            }
        ]
    }
];

const featuredCount = featuredArticles.length;
const categoryCount = categories.length;
const totalArticles = categories.reduce((sum, category) => sum + category.articles.length, 0);
const totalEntries = featuredCount + totalArticles;

function FeaturedItem({ article }: { article: typeof featuredArticles[0] }) {
    return (
        <Link href={article.href} className="block py-4">
            <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 mb-2">
                        {article.label}
                    </div>
                    <h3 className="font-display text-lg md:text-xl font-medium text-foreground mb-2">
                        {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {article.thesis}
                    </p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 shrink-0">
                    {article.readTime}
                </span>
            </div>
        </Link>
    );
}

function CategorySection({ category, index }: { category: typeof categories[0]; index: number }) {
    return (
        <section className="border-t border-border/30 pt-8">
            <div className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
                <div className="space-y-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                        {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                        <h3 className="font-display text-lg font-semibold text-foreground tracking-tight">
                            {category.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {category.subtitle}
                        </p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                        {String(category.articles.length).padStart(2, "0")} pieces
                    </span>
                </div>
                <div className="border-t border-border/30 divide-y divide-border/30">
                    {category.articles.map((article) => (
                        <Link key={article.id} href={article.href} className="block py-4">
                            <div className="flex items-baseline justify-between gap-6">
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-foreground">
                                        {article.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {article.thesis}
                                    </div>
                                </div>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 shrink-0">
                                    {article.readTime}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function ResearchClient() {
    return (
        <div className="min-h-screen bg-background">
            <SiteHeader showResearchLink={false} />

            <main className="max-w-4xl mx-auto px-6 pt-12 pb-20 space-y-12">
                <header className="space-y-6">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                        The Hiring Playbook
                    </span>
                    <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground tracking-tight">
                        The rules they don&apos;t teach you.
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                        A curated library on how recruiters think, what they notice first, and how to present yourself.
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">
                        <span>{String(featuredCount).padStart(2, "0")} essentials</span>
                        <span className="h-px w-6 bg-border/40" />
                        <span>{String(categoryCount).padStart(2, "0")} sections</span>
                        <span className="h-px w-6 bg-border/40" />
                        <span>{String(totalEntries).padStart(2, "0")} pieces</span>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xl">
                        Sources and citations live inside each article. The index stays descriptive.
                    </p>
                </header>

                <section className="border-t border-border/30 pt-8">
                    <div className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
                        <div className="space-y-3">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                                01 / Start here
                            </div>
                            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-tight">
                                Essential Reading
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Three essentials that frame how recruiters evaluate resumes and how we score the signal.
                            </p>
                        </div>
                        <div className="border-t border-border/30 divide-y divide-border/30">
                            {featuredArticles.map((article) => (
                                <FeaturedItem key={article.id} article={article} />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="border-t border-border/30 pt-8">
                    <div className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
                        <div className="space-y-3">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                                02 / Methodology
                            </div>
                            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-tight">
                                Methodology
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                How we translate attention research into scoring logic and product decisions.
                            </p>
                        </div>
                        <div className="border-l-2 border-brand pl-4 space-y-4">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                                Methodology note
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-display text-xl font-medium text-foreground">
                                    First-Impression Signal Model
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    We translate early attention patterns into four scoring dimensions and map them to product decisions.
                                </p>
                            </div>
                            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                                Story · Impact · Clarity · Readability
                            </div>
                            <Link href="/research/how-we-score" className="text-sm text-foreground underline underline-offset-4 decoration-border">
                                See how we score
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="space-y-8">
                    <div className="border-t border-border/30 pt-8">
                        <div className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
                            <div className="space-y-3">
                                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                                    03 / Browse research
                                </div>
                                <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-tight">
                                    Research Library
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Browse by theme. Each section groups the sources and the product implications.
                                </p>
                            </div>
                            <div className="space-y-8">
                                {categories.map((category, i) => (
                                    <CategorySection key={category.id} category={category} index={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-t border-border/30 pt-8">
                    <div className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
                        <div className="space-y-3">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                                04 / Product translation
                            </div>
                            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-tight">
                                How this shapes the product
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Direct lines from insights to the features inside the workspace.
                            </p>
                        </div>
                        <div className="border-t border-border/30 divide-y divide-border/30">
                            {[
                                {
                                    title: "First Impressions Matter",
                                    desc: "Recruiter First Impression focuses on the early window where fit signals form."
                                },
                                {
                                    title: "Clarity over Keywords",
                                    desc: "Our engine rewards clarity and story and penalizes keyword stuffing."
                                },
                                {
                                    title: "Eye-Flow Optimization",
                                    desc: "Bullet Upgrades are designed for scan-first reading patterns."
                                },
                                {
                                    title: "Honest ATS Education",
                                    desc: "We teach how parsers work instead of selling fear."
                                }
                            ].map((principle, i) => (
                                <div key={i} className="flex gap-4 py-4">
                                    <span className="font-mono text-[10px] text-muted-foreground/40 mt-1">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <div>
                                        <strong className="block text-foreground font-medium text-sm mb-1">
                                            {principle.title}
                                        </strong>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {principle.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
