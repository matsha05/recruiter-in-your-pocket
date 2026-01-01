"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { SCROLL_REVEAL_VARIANTS, STAGGER_CONTAINER, STAGGER_ITEM, DURATION, EASE_SNAP } from "@/lib/animation";
import { StudioShell } from "@/components/layout/StudioShell";
import Footer from "@/components/landing/Footer";

/**
 * RESEARCH HUB - PREMIUM IA REDESIGN
 * 
 * Structure:
 * 1. Editorial Header
 * 2. Featured "Start Here" Hero (3 essential reads)
 * 3. Methodology Callout (How We Score - special treatment)
 * 4. Categorized Articles (3 balanced sections)
 * 5. Product Philosophy
 */

// Featured articles for the hero section
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

// Reorganized categories with better balance
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
                readTime: "5 min",
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
                id: "human-vs-algorithm",
                title: "Humans vs. Algorithms",
                thesis: "How recruiters interpret machine scores versus human signals.",
                readTime: "5 min",
                href: "/research/human-vs-algorithm"
            },
            {
                id: "spelling-errors-impact",
                title: "Spelling Errors Carry Weight",
                thesis: "How small errors affect perceived rigor and clarity.",
                readTime: "3 min",
                href: "/research/spelling-errors-impact"
            }
        ]
    },
    {
        id: "resume-craft",
        title: "Resume Craft",
        subtitle: "Writing and structure fundamentals",
        articles: [
            {
                id: "star-method",
                title: "The STAR Method",
                thesis: "Structure for behavioral narratives and resume bullets.",
                readTime: "4 min",
                href: "/research/star-method"
            },
            {
                id: "resume-length-myths",
                title: "The One-Page Myth",
                thesis: "What length signals for experienced candidates.",
                readTime: "4 min",
                href: "/research/resume-length-myths"
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
                id: "skills-based-hiring",
                title: "The Skills-Based Shift",
                thesis: "How skills-first hiring changes screening.",
                readTime: "5 min",
                href: "/research/skills-based-hiring"
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
            }
        ]
    }
];

const featuredCount = featuredArticles.length;
const categoryCount = categories.length;
const totalArticles = categories.reduce((sum, category) => sum + category.articles.length, 0);
const totalEntries = featuredCount + totalArticles;

// Featured Hero Card Component
function FeaturedCard({ article }: { article: typeof featuredArticles[0] }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            variants={prefersReducedMotion ? {} : STAGGER_ITEM}
        >
            <Link
                href={article.href}
                className="group block py-4"
            >
                <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 mb-2">
                            {article.label}
                        </div>
                        <h3 className="font-display text-lg md:text-xl font-medium text-foreground group-hover:text-brand transition-colors mb-2">
                            {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {article.thesis}
                        </p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 shrink-0">
                        {article.readTime}
                    </span>
                </div>
            </Link>
        </motion.div>
    );
}

// Methodology Callout Component
function MethodologyCallout() {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.slow, ease: EASE_SNAP }}
            className="border-l-2 border-brand pl-4 space-y-4"
        >
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
            <Link
                href="/research/how-we-score"
                className="text-sm text-brand hover:underline underline-offset-4"
            >
                See how we score
            </Link>
        </motion.div>
    );
}

// Article Card Component
function ArticleCard({ article }: { article: typeof categories[0]["articles"][0] }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div variants={prefersReducedMotion ? {} : STAGGER_ITEM}>
            <Link
                href={article.href}
                className="group flex items-center justify-between py-4 transition-colors"
            >
                <div className="flex-1 min-w-0 mr-4">
                    <h4 className="text-sm font-medium text-foreground group-hover:text-brand transition-colors">
                        {article.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 sm:line-clamp-1">
                        {article.thesis}
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                        {article.readTime}
                    </span>
                </div>
            </Link>
        </motion.div>
    );
}

// Category Section Component
function CategorySection({ category, index }: { category: typeof categories[0]; index: number }) {
    const { ref, isVisible } = useScrollReveal();
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.section
            ref={ref as React.RefObject<HTMLElement>}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={prefersReducedMotion ? {} : SCROLL_REVEAL_VARIANTS}
            className="border-t border-border/20 pt-8 first:border-t-0 first:pt-0"
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
                <motion.div
                    className="border-t border-border/30 divide-y divide-border/30"
                    variants={prefersReducedMotion ? {} : STAGGER_CONTAINER}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    {category.articles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </motion.div>
            </div>
        </motion.section>
    );
}

export default function ResearchClient() {
    const { ref: heroRef, isVisible: heroVisible } = useScrollReveal();
    const { ref: principlesRef, isVisible: principlesVisible } = useScrollReveal();
    const prefersReducedMotion = useReducedMotion();

    return (
        <StudioShell showSidebar={true} className="max-w-4xl mx-auto py-12 px-6 md:px-0">

            {/* Editorial Header */}
            <motion.header
                className="mb-12 space-y-5 md:space-y-6"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.slow, ease: EASE_SNAP }}
            >
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                    The Hiring Playbook
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground tracking-tight">
                    The rules they<br />don&apos;t teach you.
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
            </motion.header>

            {/* Featured Hero Section */}
            <motion.section
                ref={heroRef as React.RefObject<HTMLElement>}
                className="border-t border-border/20 pt-8 md:pt-10 mb-12 md:mb-16"
                variants={prefersReducedMotion ? {} : STAGGER_CONTAINER}
                initial="hidden"
                animate={heroVisible ? "visible" : "hidden"}
            >
                <div className="grid md:grid-cols-[200px_1fr] gap-8 items-start">
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
                            <FeaturedCard key={article.id} article={article} />
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Methodology Callout */}
            <section className="border-t border-border/20 pt-8 mb-12 md:mb-14">
                <div className="grid md:grid-cols-[200px_1fr] gap-8 items-start">
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
                    <MethodologyCallout />
                </div>
            </section>

            {/* Category Sections */}
            <section className="border-t border-border/20 pt-8 mb-12 md:mb-16">
                <div className="grid md:grid-cols-[200px_1fr] gap-8 items-start">
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
                    <div className="space-y-6 md:space-y-8">
                        {categories.map((category, i) => (
                            <CategorySection key={category.id} category={category} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            <hr className="border-border/10 mb-12" />

            {/* Product Philosophy */}
            <motion.section
                ref={principlesRef as React.RefObject<HTMLElement>}
                className="border-t border-border/20 pt-8 mb-12 md:mb-16"
                variants={prefersReducedMotion ? {} : SCROLL_REVEAL_VARIANTS}
                initial="hidden"
                animate={principlesVisible ? "visible" : "hidden"}
            >
                <div className="grid md:grid-cols-[200px_1fr] gap-8 items-start">
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
                    <motion.div
                        className="border-t border-border/30 divide-y divide-border/30"
                        variants={prefersReducedMotion ? {} : STAGGER_CONTAINER}
                        initial="hidden"
                        animate={principlesVisible ? "visible" : "hidden"}
                    >
                        {[
                            {
                                title: "First Impressions Matter",
                                desc: "Recruiter First Impression focuses on the early window where fit signals form."
                            },
                            {
                                title: "Clarity over Keywords",
                                desc: "Our engine rewards clarity and story—penalizing keyword stuffing."
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
                            <motion.div
                                key={i}
                                className="flex gap-4 py-4"
                                variants={prefersReducedMotion ? {} : STAGGER_ITEM}
                            >
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
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            <Footer />

        </StudioShell>
    );
}
