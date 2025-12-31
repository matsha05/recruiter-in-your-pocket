"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { SCROLL_REVEAL_VARIANTS, STAGGER_CONTAINER, STAGGER_ITEM, DURATION, EASE_SNAP } from "@/lib/animation";
import { StudioShell } from "@/components/layout/StudioShell";
import Footer from "@/components/landing/Footer";

/**
 * RESEARCH PAGE CLIENT COMPONENT
 * Handles animations for the research hub
 */

// Reorganized by user intent/journey stage
const categories = [
    {
        id: "understand",
        title: "Understand the System",
        subtitle: "How recruiters actually think and decide",
        articles: [
            {
                id: "how-we-score",
                title: "The 6-Second Signal Model: How We Score",
                thesis: "Our research-backed framework: Story, Impact, Clarity, Readability — and why Story matters most.",
                readTime: "5 min",
                href: "/research/how-we-score",
                featured: true
            },
            {
                id: "how-recruiters-read",
                title: "How Recruiters Skim Resumes in 6 Seconds",
                thesis: "Recruiters make fit/no-fit decisions in seconds, focusing on titles, companies, and dates.",
                readTime: "4 min",
                href: "/research/how-recruiters-read",
                featured: true
            },
            {
                id: "how-people-scan",
                title: "How People Scan Text and Bullets",
                thesis: "People scan pages in F-patterns, latching onto headings, numbers, and the start of lines.",
                readTime: "5 min",
                href: "/research/how-people-scan"
            },
            {
                id: "ats-myths",
                title: "ATS: How Applicant Tracking Systems Actually Work",
                thesis: "ATS systems rank and filter candidates. Human review, not algorithms, is the primary bottleneck.",
                readTime: "4 min",
                href: "/research/ats-myths"
            },
            {
                id: "human-vs-algorithm",
                title: "Recruiters trust humans more than algorithms",
                thesis: "Recruiters punish algorithmic errors but forgive human inconsistency.",
                readTime: "5 min",
                href: "/research/human-vs-algorithm"
            }
        ]
    },
    {
        id: "craft",
        title: "Craft Your Resume",
        subtitle: "Evidence-based writing and formatting",
        articles: [
            {
                id: "quantifying-impact",
                title: "Quantifying Impact: The Laszlo Bock Formula",
                thesis: "Google's former HR head on why numbers matter—and how to find them.",
                readTime: "5 min",
                href: "/research/quantifying-impact",
                featured: true
            },
            {
                id: "star-method",
                title: "The STAR Method: Structure That Works",
                thesis: "The Situation-Task-Action-Result framework for interviews and resume bullets.",
                readTime: "4 min",
                href: "/research/star-method"
            },
            {
                id: "resume-length-myths",
                title: "Resume Length: What Research Actually Says",
                thesis: "The one-page rule is outdated. Two pages often score higher for experienced candidates.",
                readTime: "4 min",
                href: "/research/resume-length-myths"
            },
            {
                id: "spelling-errors-impact",
                title: "Spelling Errors Carry Real Weight",
                thesis: "For many recruiters, 'form' is a gateway. Bad spelling can override strong experience.",
                readTime: "3 min",
                href: "/research/spelling-errors-impact"
            }
        ]
    },
    {
        id: "strategy",
        title: "Win the Job",
        subtitle: "Job search, networking, and negotiation",
        articles: [
            {
                id: "referral-advantage",
                title: "The Referral Advantage",
                thesis: "Referred candidates are 5-10x more likely to be hired.",
                readTime: "4 min",
                href: "/research/referral-advantage",
                featured: true
            },
            {
                id: "linkedin-vs-resume",
                title: "LinkedIn vs. Resume: What Gets Seen",
                thesis: "Recruiters use LinkedIn to find candidates and resumes to evaluate them.",
                readTime: "4 min",
                href: "/research/linkedin-vs-resume"
            },
            {
                id: "linkedin-visibility",
                title: "LinkedIn Profile Visibility: What Research Shows",
                thesis: "Optimized profiles get up to 14x more views. Headlines with keywords are the single biggest factor.",
                readTime: "5 min",
                href: "/research/linkedin-visibility",
                featured: true
            },
            {
                id: "skills-based-hiring",
                title: "The Skills-Based Hiring Shift",
                thesis: "Major employers are dropping degree requirements. Skills demonstration matters more.",
                readTime: "5 min",
                href: "/research/skills-based-hiring"
            },
            {
                id: "offer-negotiation",
                title: "Offer Negotiation Strategy",
                thesis: "Negotiation is coordination, not combat. Treating it like a taboo reduces your leverage.",
                readTime: "12 min",
                href: "/guides/offer-negotiation"
            },
            {
                id: "salary-history-bans",
                title: "Salary History Bans: Why 'Just Being Honest' is a Trap",
                thesis: "Revealing salary history anchors offers to your past, not the market.",
                readTime: "4 min",
                href: "/research/salary-history-bans"
            }
        ]
    }
];

function ArticleCard({ article, index }: { article: typeof categories[0]["articles"][0]; index: number }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            variants={prefersReducedMotion ? {} : STAGGER_ITEM}
        >
            <Link
                href={article.href}
                className="group block p-4 rounded-lg border border-border/40 bg-card hover:border-brand/30 hover:shadow-sm transition-all duration-200"
            >
                <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-sm font-semibold transition-colors ${article.featured ? 'text-foreground' : 'text-foreground/80'} group-hover:text-brand`}>
                                {article.title}
                            </h3>
                            {article.featured && (
                                <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest text-brand bg-brand/5 border border-brand/10 rounded-sm">
                                    Essential
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 group-hover:text-muted-foreground/80 transition-colors">
                            {article.thesis}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="font-mono text-[10px] text-muted-foreground/30 mt-1">
                            {article.readTime}
                        </span>
                        <motion.span
                            initial={{ x: 0 }}
                            whileHover={prefersReducedMotion ? undefined : { x: 4 }}
                            transition={{ duration: DURATION.normal, ease: EASE_SNAP }}
                        >
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-brand transition-colors" />
                        </motion.span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

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
            {/* Category Header */}
            <div className="flex items-baseline gap-4 mb-6 border-b border-border/10 pb-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
                    {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                    <h2 className="font-display text-lg font-semibold text-foreground tracking-tight">
                        {category.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {category.subtitle}
                    </p>
                </div>
            </div>

            {/* Articles Grid with stagger */}
            <motion.div
                className="grid gap-3"
                variants={prefersReducedMotion ? {} : STAGGER_CONTAINER}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
            >
                {category.articles.map((article, artIndex) => (
                    <ArticleCard key={article.id} article={article} index={artIndex} />
                ))}
            </motion.div>
        </motion.section>
    );
}

export default function ResearchClient() {
    const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
    const { ref: principlesRef, isVisible: principlesVisible } = useScrollReveal();
    const prefersReducedMotion = useReducedMotion();

    return (
        <StudioShell showSidebar={true} className="max-w-4xl mx-auto py-12 px-6 md:px-0">

            {/* Editorial Header */}
            <motion.header
                ref={headerRef as React.RefObject<HTMLElement>}
                className="mb-12"
                variants={prefersReducedMotion ? {} : SCROLL_REVEAL_VARIANTS}
                initial="hidden"
                animate={headerVisible ? "visible" : "hidden"}
            >
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-4 block">
                    The Hiring Playbook
                </span>
                <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground mb-4 tracking-tight">
                    The rules they<br />don&apos;t teach you.
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                    Evidence-based research on how recruiters think, what they see, and how to present yourself.
                </p>
            </motion.header>

            {/* Category Sections */}
            <div className="space-y-12 mb-16">
                {categories.map((category, catIndex) => (
                    <CategorySection key={category.id} category={category} index={catIndex} />
                ))}
            </div>

            <hr className="border-border/10 mb-12" />

            {/* How This Shapes the Product */}
            <motion.section
                ref={principlesRef as React.RefObject<HTMLElement>}
                className="mb-16"
                variants={prefersReducedMotion ? {} : SCROLL_REVEAL_VARIANTS}
                initial="hidden"
                animate={principlesVisible ? "visible" : "hidden"}
            >
                <h3 className="font-display text-lg font-semibold text-foreground mb-6">
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
                            desc: "Recruiter First Impression models the first 6 seconds where fit decisions happen."
                        },
                        {
                            title: "Clarity over Keywords",
                            desc: "Our scoring engine rewards clarity, scope, and story—penalizing keyword stuffing."
                        },
                        {
                            title: "Eye-Flow Optimization",
                            desc: "Bullet Upgrades are designed to catch the eye's F-pattern scan."
                        },
                        {
                            title: "Honest ATS Education",
                            desc: "We teach how parsers actually work instead of selling 'beat the bot' fear."
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
