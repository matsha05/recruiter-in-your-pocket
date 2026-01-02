"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/layout/SiteHeader";
import Footer from "@/components/landing/Footer";

/**
 * Research Hub v2.0 — Premium Landing Page
 * Document-first layout with visual polish per design philosophy.
 */

const featuredArticles = [
    {
        id: "how-recruiters-read",
        title: "How Recruiters Actually Read Resumes",
        thesis: "Eye-tracking studies on attention patterns and decision flow.",
        readTime: "4 min",
        href: "/research/how-recruiters-read",
        label: "Start here",
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            </svg>
        )
    },
    {
        id: "quantifying-impact",
        title: "The Laszlo Bock Formula",
        thesis: "How measurable outcomes shape perceived impact.",
        readTime: "5 min",
        href: "/research/quantifying-impact",
        label: "Most actionable",
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
            </svg>
        )
    },
    {
        id: "referral-advantage",
        title: "The Referral Advantage",
        thesis: "How referrals shift movement through hiring funnels.",
        readTime: "4 min",
        href: "/research/referral-advantage",
        label: "Highest impact",
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        )
    }
];

const categories = [
    {
        id: "recruiter-psychology",
        title: "Inside the Recruiter's Mind",
        subtitle: "How hiring decisions actually get made",
        articles: [
            { id: "how-people-scan", title: "How People Scan Text and Bullets", thesis: "F-patterns, first-word scanning, and structure for faster comprehension.", readTime: "4 min", href: "/research/how-people-scan" },
            { id: "ats-myths", title: "ATS: What Actually Happens", thesis: "Where humans step in and where automation stops.", readTime: "4 min", href: "/research/ats-myths" },
            { id: "automation-filter-points", title: "Where Automation Filters You Out", thesis: "Exposure, eligibility, and ranking touchpoints.", readTime: "4 min", href: "/research/automation-filter-points" },
            { id: "automation-and-bias", title: "Hiring Algorithms and Bias", thesis: "How automated systems compound bias across stages.", readTime: "4 min", href: "/research/automation-and-bias" },
            { id: "human-vs-algorithm", title: "Humans vs. Algorithms", thesis: "How recruiters interpret machine scores versus human signals.", readTime: "4 min", href: "/research/human-vs-algorithm" },
            { id: "spelling-errors-impact", title: "Spelling Errors Carry Weight", thesis: "How small errors affect perceived rigor and clarity.", readTime: "3 min", href: "/research/spelling-errors-impact" },
            { id: "resume-error-tax", title: "The Resume Error Tax", thesis: "Why typos are treated as risk signals.", readTime: "4 min", href: "/research/resume-error-tax" },
            { id: "hiring-discrimination-meta-analysis", title: "Discrimination in Hiring", thesis: "What resumes can and cannot control.", readTime: "5 min", href: "/research/hiring-discrimination-meta-analysis" },
            { id: "bias-limits-optimization", title: "Limits of Resume Optimization", thesis: "A bounded-control view of bias and signal.", readTime: "4 min", href: "/research/bias-limits-optimization" }
        ]
    },
    {
        id: "resume-craft",
        title: "Resume Craft",
        subtitle: "Writing and structure fundamentals",
        articles: [
            { id: "how-we-score", title: "The 7.4-Second Signal Model", thesis: "How we score story, impact, clarity, and readability.", readTime: "5 min", href: "/research/how-we-score" },
            { id: "star-method", title: "The STAR Method", thesis: "Structure for behavioral narratives and resume bullets.", readTime: "4 min", href: "/research/star-method" },
            { id: "structured-interviews-why-star", title: "Structured Interviews Beat Vibes", thesis: "Why STAR exists and why structure wins.", readTime: "4 min", href: "/research/structured-interviews-why-star" },
            { id: "quantifying-impact", title: "The Laszlo Bock Formula", thesis: "How measurable outcomes shape perceived impact.", readTime: "5 min", href: "/research/quantifying-impact" },
            { id: "writing-quality-hire-probability", title: "Writing Quality Changes Hiring", thesis: "Clarity increases hiring outcomes in field evidence.", readTime: "4 min", href: "/research/writing-quality-hire-probability" },
            { id: "signal-vs-clarity", title: "Signal vs. Clarity", thesis: "Two explanations for why good resumes work.", readTime: "4 min", href: "/research/signal-vs-clarity" },
            { id: "resume-length-myths", title: "The One-Page Myth", thesis: "What length signals for experienced candidates.", readTime: "4 min", href: "/research/resume-length-myths" },
            { id: "page-two-gate", title: "The Page-2 Gate", thesis: "Why page 2 is earned by page 1.", readTime: "3 min", href: "/research/page-two-gate" }
        ]
    },
    {
        id: "job-search-strategy",
        title: "Job Search Strategy",
        subtitle: "LinkedIn, networking, and negotiation",
        articles: [
            { id: "linkedin-vs-resume", title: "LinkedIn vs. Resume", thesis: "Discovery versus evaluation, and how each is used.", readTime: "4 min", href: "/research/linkedin-vs-resume" },
            { id: "linkedin-visibility", title: "LinkedIn Visibility", thesis: "Which profile elements influence discovery and clicks.", readTime: "5 min", href: "/research/linkedin-visibility" },
            { id: "recruiter-search-behavior", title: "Recruiter Search Behavior", thesis: "What LinkedIn discloses and what remains unknown.", readTime: "4 min", href: "/research/recruiter-search-behavior" },
            { id: "social-screening", title: "Social Screening", thesis: "What recruiters look for online across platforms.", readTime: "4 min", href: "/research/social-screening" },
            { id: "skills-based-hiring", title: "The Skills-Based Shift", thesis: "How skills-first hiring changes screening.", readTime: "5 min", href: "/research/skills-based-hiring" },
            { id: "skills-first-promise-reality", title: "Skills-First: Promise vs Reality", thesis: "Where skills-first expands pools and where adoption lags.", readTime: "4 min", href: "/research/skills-first-promise-reality" },
            { id: "offer-negotiation", title: "Offer Negotiation", thesis: "Negotiation is coordination, not combat.", readTime: "12 min", href: "/guides/offer-negotiation" },
            { id: "salary-history-bans", title: "Salary History Disclosure", thesis: "How disclosure shapes the first anchor.", readTime: "4 min", href: "/research/salary-history-bans" },
            { id: "salary-anchors", title: "Salary Anchors", thesis: "Avoid self-discounting early in negotiations.", readTime: "4 min", href: "/research/salary-anchors" },
            { id: "referral-advantage", title: "The Referral Advantage", thesis: "How referrals shift movement through hiring funnels.", readTime: "4 min", href: "/research/referral-advantage" },
            { id: "referral-advantage-quantified", title: "Referral Advantage, Quantified", thesis: "How referrals reduce uncertainty in field evidence.", readTime: "4 min", href: "/research/referral-advantage-quantified" }
        ]
    }
];

const totalArticles = categories.reduce((sum, category) => sum + category.articles.length, 0);

function FeaturedCard({ article, index }: { article: typeof featuredArticles[0]; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
        >
            <Link
                href={article.href}
                className="group block h-full rounded-xl border border-border/40 bg-white dark:bg-card p-6 transition-all duration-300 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5"
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                            {article.icon}
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 bg-muted/30 px-2 py-1 rounded">
                            {article.label}
                        </span>
                    </div>
                    <h3 className="font-display text-lg font-medium text-foreground mb-2 group-hover:text-brand transition-colors">
                        {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                        {article.thesis}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/20">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                            {article.readTime}
                        </span>
                        <svg className="w-4 h-4 text-muted-foreground/40 group-hover:text-brand group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function CategorySection({ category, index }: { category: typeof categories[0]; index: number }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className="border-t border-border/30 pt-8"
        >
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
                        <Link key={article.id} href={article.href} className="group block py-4">
                            <div className="flex items-baseline justify-between gap-6">
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-foreground group-hover:text-brand transition-colors">
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
        </motion.section>
    );
}

function MethodologyDiagram() {
    const dimensions = [
        { name: "Story", weight: 30, color: "bg-brand" },
        { name: "Impact", weight: 25, color: "bg-blue-500" },
        { name: "Clarity", weight: 25, color: "bg-violet-500" },
        { name: "Readability", weight: 20, color: "bg-emerald-500" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="rounded-xl border border-border/40 bg-white dark:bg-card p-6 shadow-lg shadow-slate-200/50 dark:shadow-none"
        >
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-4">
                Scoring dimensions
            </div>
            <div className="space-y-3">
                {dimensions.map((dim, i) => (
                    <motion.div
                        key={dim.name}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4"
                    >
                        <span className="text-xs text-muted-foreground w-20">{dim.name}</span>
                        <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${dim.weight}%` }}
                                transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                                viewport={{ once: true }}
                                className={`h-full rounded-full ${dim.color}`}
                            />
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground/60 w-8">{dim.weight}%</span>
                    </motion.div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border/20">
                <Link href="/research/how-we-score" className="text-sm text-brand hover:underline flex items-center gap-2">
                    See full methodology
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </motion.div>
    );
}

export default function ResearchClient() {
    return (
        <div className="min-h-screen bg-background">
            <SiteHeader showResearchLink={false} />

            <main className="max-w-5xl mx-auto px-6 pt-12 pb-20 space-y-16">
                {/* Hero Section */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="space-y-6 text-center max-w-2xl mx-auto"
                >
                    <span className="inline-block font-mono text-[10px] uppercase tracking-widest text-brand bg-brand/10 px-3 py-1.5 rounded-full">
                        The Hiring Playbook
                    </span>
                    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-foreground tracking-tight leading-tight">
                        The rules they don&apos;t teach you.
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        A curated library on how recruiters think, what they notice first, and how to present yourself.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand" />
                            {String(featuredArticles.length).padStart(2, "0")} essentials
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                            {String(categories.length).padStart(2, "0")} sections
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                            {String(totalArticles).padStart(2, "0")} pieces
                        </span>
                    </div>
                </motion.header>

                {/* Featured Articles */}
                <section>
                    <div className="text-center mb-8">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                            01 / Start here
                        </span>
                        <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-tight mt-2">
                            Essential Reading
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {featuredArticles.map((article, i) => (
                            <FeaturedCard key={article.id} article={article} index={i} />
                        ))}
                    </div>
                </section>

                {/* Methodology Section */}
                <section className="border-t border-border/30 pt-12">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                                02 / Methodology
                            </span>
                            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-tight">
                                First-Impression Signal Model
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We translate early attention patterns into four scoring dimensions and map them to product decisions.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Sources and citations live inside each article. The index stays descriptive.
                            </p>
                        </div>
                        <MethodologyDiagram />
                    </div>
                </section>

                {/* Research Library */}
                <section className="space-y-8">
                    <div className="text-center">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                            03 / Browse research
                        </span>
                        <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-tight mt-2">
                            Research Library
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2">
                            Browse by theme. Each section groups the sources and the product implications.
                        </p>
                    </div>
                    <div className="space-y-8">
                        {categories.map((category, i) => (
                            <CategorySection key={category.id} category={category} index={i} />
                        ))}
                    </div>
                </section>

                {/* Product Translation */}
                <section className="border-t border-border/30 pt-12">
                    <div className="text-center mb-8">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                            04 / Product translation
                        </span>
                        <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-tight mt-2">
                            How this shapes the product
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2">
                            Direct lines from insights to the features inside the workspace.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            { title: "First Impressions Matter", desc: "Recruiter First Impression focuses on the early window where fit signals form.", icon: "👁️" },
                            { title: "Clarity over Keywords", desc: "Our engine rewards clarity and story and penalizes keyword stuffing.", icon: "✨" },
                            { title: "Eye-Flow Optimization", desc: "Bullet Upgrades are designed for scan-first reading patterns.", icon: "📖" },
                            { title: "Honest ATS Education", desc: "We teach how parsers work instead of selling fear.", icon: "🔍" }
                        ].map((principle, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-xl border border-border/40 bg-white dark:bg-card p-5"
                            >
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl">{principle.icon}</span>
                                    <div>
                                        <strong className="block text-foreground font-medium text-sm mb-1">
                                            {principle.title}
                                        </strong>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {principle.desc}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
