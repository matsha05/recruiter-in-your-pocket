"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, Target, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { SCROLL_REVEAL_VARIANTS, STAGGER_CONTAINER, STAGGER_ITEM, DURATION, EASE_SNAP } from "@/lib/animation";
import { StudioShell } from "@/components/layout/StudioShell";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";

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
        title: "How Recruiters Skim in 7.4 Seconds",
        thesis: "Eye-tracking research reveals exactly where recruiters look and how fast they decide.",
        readTime: "4 min",
        href: "/research/how-recruiters-read",
        icon: Target,
        badge: "Start Here"
    },
    {
        id: "quantifying-impact",
        title: "The Laszlo Bock Formula",
        thesis: "Google's former HR head on why numbers matter—and how to find them.",
        readTime: "5 min",
        href: "/research/quantifying-impact",
        icon: Sparkles,
        badge: "Most Actionable"
    },
    {
        id: "referral-advantage",
        title: "The Referral Advantage",
        thesis: "Referred candidates are 5-10x more likely to be hired. The data is overwhelming.",
        readTime: "4 min",
        href: "/research/referral-advantage",
        icon: Users,
        badge: "Highest Impact"
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
                thesis: "F-patterns, first-word scanning, and why structure beats substance.",
                readTime: "5 min",
                href: "/research/how-people-scan"
            },
            {
                id: "ats-myths",
                title: "ATS: What Actually Happens",
                thesis: "Human review—not algorithms—is the real bottleneck.",
                readTime: "4 min",
                href: "/research/ats-myths"
            },
            {
                id: "human-vs-algorithm",
                title: "Humans vs. Algorithms",
                thesis: "Recruiters punish algorithmic errors but forgive human inconsistency.",
                readTime: "5 min",
                href: "/research/human-vs-algorithm"
            },
            {
                id: "spelling-errors-impact",
                title: "Why Typos Kill Applications",
                thesis: "Form is a gateway. Bad spelling overrides strong experience.",
                readTime: "3 min",
                href: "/research/spelling-errors-impact"
            }
        ]
    },
    {
        id: "resume-craft",
        title: "Resume Craft",
        subtitle: "Evidence-based writing and structure",
        articles: [
            {
                id: "star-method",
                title: "The STAR Method",
                thesis: "Situation-Task-Action-Result: the framework that works.",
                readTime: "4 min",
                href: "/research/star-method"
            },
            {
                id: "resume-length-myths",
                title: "The One-Page Myth",
                thesis: "Two pages often score higher for experienced candidates.",
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
                thesis: "Recruiters find on LinkedIn, evaluate on resumes.",
                readTime: "4 min",
                href: "/research/linkedin-vs-resume"
            },
            {
                id: "linkedin-visibility",
                title: "LinkedIn Visibility",
                thesis: "Optimized profiles get 14x more views. Headlines are everything.",
                readTime: "5 min",
                href: "/research/linkedin-visibility"
            },
            {
                id: "skills-based-hiring",
                title: "The Skills-Based Shift",
                thesis: "Major employers are dropping degree requirements.",
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
                title: "Salary History Traps",
                thesis: "Revealing history anchors offers to your past.",
                readTime: "4 min",
                href: "/research/salary-history-bans"
            }
        ]
    }
];

// Featured Hero Card Component
function FeaturedCard({ article, index }: { article: typeof featuredArticles[0]; index: number }) {
    const prefersReducedMotion = useReducedMotion();
    const Icon = article.icon;

    return (
        <motion.div
            variants={prefersReducedMotion ? {} : STAGGER_ITEM}
            className="h-full"
        >
            <Link
                href={article.href}
                className="group block h-full p-6 rounded-lg border border-brand/20 bg-gradient-to-br from-brand/5 via-transparent to-transparent hover:border-brand/40 hover:shadow-lg transition-all duration-300"
            >
                <div className="flex flex-col h-full">
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-brand bg-brand/10 rounded">
                            <Icon className="w-3 h-3" />
                            {article.badge}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground/50">
                            {article.readTime}
                        </span>
                    </div>

                    {/* Content */}
                    <h3 className="font-display text-lg font-medium text-foreground group-hover:text-brand transition-colors mb-2">
                        {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                        {article.thesis}
                    </p>

                    {/* Arrow */}
                    <div className="mt-4 flex items-center gap-2 text-brand text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Read article
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
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
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.slow, ease: EASE_SNAP, delay: 0.3 }}
            className="relative overflow-hidden rounded-lg border border-border/60 bg-card p-6 md:p-8"
        >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-brand" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-brand">
                            Our Methodology
                        </span>
                    </div>
                    <h3 className="font-display text-xl font-medium text-foreground mb-2">
                        The 7.4-Second Signal Model
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        How we score resumes: Story, Impact, Clarity, Readability — and why Story matters most.
                        This is the research framework behind every analysis.
                    </p>
                </div>
                <Link href="/research/how-we-score">
                    <Button variant="studio" className="whitespace-nowrap">
                        See How We Score
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>
            {/* Decorative gradient */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-brand/5 rounded-full blur-3xl" />
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
                className="group flex items-center justify-between p-4 rounded-lg border border-border/40 bg-card hover:border-brand/30 hover:shadow-sm transition-all duration-200"
            >
                <div className="flex-1 min-w-0 mr-4">
                    <h4 className="text-sm font-medium text-foreground group-hover:text-brand transition-colors mb-0.5">
                        {article.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                        {article.thesis}
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[10px] text-muted-foreground/40">
                        {article.readTime}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-brand transition-colors" />
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
        >
            <div className="flex items-baseline gap-4 mb-4 border-b border-border/10 pb-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
                    {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                    <h3 className="font-display text-base font-semibold text-foreground tracking-tight">
                        {category.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {category.subtitle}
                    </p>
                </div>
            </div>

            <motion.div
                className="grid gap-2"
                variants={prefersReducedMotion ? {} : STAGGER_CONTAINER}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
            >
                {category.articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </motion.div>
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
                className="mb-10"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.slow, ease: EASE_SNAP }}
            >
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-4 block">
                    The Hiring Playbook
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground mb-4 tracking-tight">
                    The rules they<br />don&apos;t teach you.
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                    Evidence-based research on how recruiters think, what they see, and how to present yourself.
                </p>
            </motion.header>

            {/* Featured Hero Section */}
            <motion.section
                ref={heroRef as React.RefObject<HTMLElement>}
                className="mb-12"
                variants={prefersReducedMotion ? {} : STAGGER_CONTAINER}
                initial="hidden"
                animate={heroVisible ? "visible" : "hidden"}
            >
                <div className="flex items-center gap-2 mb-6">
                    <div className="h-px flex-1 bg-border/40" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3">
                        Essential Reading
                    </span>
                    <div className="h-px flex-1 bg-border/40" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    {featuredArticles.map((article, i) => (
                        <FeaturedCard key={article.id} article={article} index={i} />
                    ))}
                </div>
            </motion.section>

            {/* Methodology Callout */}
            <div className="mb-12">
                <MethodologyCallout />
            </div>

            {/* Category Sections */}
            <div className="space-y-10 mb-16">
                {categories.map((category, i) => (
                    <CategorySection key={category.id} category={category} index={i} />
                ))}
            </div>

            <hr className="border-border/10 mb-12" />

            {/* Product Philosophy */}
            <motion.section
                ref={principlesRef as React.RefObject<HTMLElement>}
                className="mb-16"
                variants={prefersReducedMotion ? {} : SCROLL_REVEAL_VARIANTS}
                initial="hidden"
                animate={principlesVisible ? "visible" : "hidden"}
            >
                <h3 className="font-display text-base font-semibold text-foreground mb-6">
                    How this shapes the product
                </h3>
                <motion.div
                    className="grid md:grid-cols-2 gap-6"
                    variants={prefersReducedMotion ? {} : STAGGER_CONTAINER}
                    initial="hidden"
                    animate={principlesVisible ? "visible" : "hidden"}
                >
                    {[
                        {
                            title: "First Impressions Matter",
                            desc: "Recruiter First Impression models the 7.4-second window where fit decisions happen."
                        },
                        {
                            title: "Clarity over Keywords",
                            desc: "Our engine rewards clarity and story—penalizing keyword stuffing."
                        },
                        {
                            title: "Eye-Flow Optimization",
                            desc: "Bullet Upgrades are designed for F-pattern scanning."
                        },
                        {
                            title: "Honest ATS Education",
                            desc: "We teach how parsers work instead of selling fear."
                        }
                    ].map((principle, i) => (
                        <motion.div
                            key={i}
                            className="flex gap-4"
                            variants={prefersReducedMotion ? {} : STAGGER_ITEM}
                        >
                            <span className="font-mono text-[10px] text-muted-foreground/30 mt-1">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <div>
                                <strong className="block text-foreground font-medium text-sm mb-1">
                                    {principle.title}
                                </strong>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {principle.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.section>

            <Footer />

        </StudioShell>
    );
}
