"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Clock, FileText } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { SCROLL_REVEAL_VARIANTS, STAGGER_CONTAINER, STAGGER_ITEM, ARROW_SLIDE, DURATION, EASE_SNAP } from "@/lib/animation";

/**
 * BackedByResearch - Landing Page Research Section (v2)
 * 
 * Design rationale:
 * - 3 featured studies (not 15) — respects cognitive load
 * - Static grid (not marquee) — users scan, not chase
 * - Curated selection — signals editorial quality
 * - Single CTA — clear next step for curious users
 * - "15 studies" indicator — signals depth without displaying it
 */

const featuredStudies = [
    {
        title: "How Recruiters Skim in 7.4 Seconds",
        category: "Eye-tracking research",
        description: "Recruiters make fit/no-fit decisions in seconds, focusing on titles, companies, and dates.",
        href: "/research/how-recruiters-read",
        readTime: "4 min",
        featured: true
    },
    {
        title: "Quantifying Impact: The Laszlo Bock Formula",
        category: "Resume writing",
        description: "Google's former HR head on why numbers matter—and how to find them when you think you don't have any.",
        href: "/research/quantifying-impact",
        readTime: "5 min"
    },
    {
        title: "The Referral Advantage",
        category: "Job search strategy",
        description: "Referred candidates are 5-10x more likely to be hired. Networking is the highest-leverage activity.",
        href: "/research/referral-advantage",
        readTime: "4 min"
    }
];

function FeaturedCard({ study }: { study: typeof featuredStudies[0] }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <Link
            href={study.href}
            className="group block h-full"
        >
            <article className="h-full p-5 rounded bg-card/50 backdrop-blur-sm border border-border/50 hover:border-brand/30 hover:shadow-sm transition-all duration-200 flex flex-col">
                {/* Category */}
                <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {study.category}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-brand transition-colors mb-2 leading-snug">
                    {study.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {study.description}
                </p>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3 h-3" /> {study.readTime}
                    </span>
                    <span className="text-brand font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Read
                        <motion.span
                            initial={{ x: 0 }}
                            whileHover={prefersReducedMotion ? undefined : { x: 4 }}
                            transition={{ duration: DURATION.normal, ease: EASE_SNAP }}
                        >
                            <ArrowRight className="w-3 h-3" />
                        </motion.span>
                    </span>
                </div>
            </article>
        </Link>
    );
}

export function BackedByResearch() {
    const { ref: sectionRef, isVisible } = useScrollReveal();
    const prefersReducedMotion = useReducedMotion();

    return (
        <section className="w-full py-20 border-t border-border/30 bg-background">
            <div className="max-w-5xl mx-auto px-6">
                {/* Header with scroll reveal */}
                <motion.div
                    ref={sectionRef as React.RefObject<HTMLDivElement>}
                    className="text-center mb-12"
                    variants={prefersReducedMotion ? {} : SCROLL_REVEAL_VARIANTS}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <BookOpen className="w-4 h-4 text-brand" />
                        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                            The Hiring Playbook
                        </span>
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight tracking-tight mb-4">
                        Built on how recruiters <span className="text-brand italic">decide</span>.
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-2">
                        Not career center advice.
                    </p>
                    <Link href="/research/how-we-score" className="text-sm text-brand hover:underline inline-flex items-center gap-1">
                        See our scoring model <ArrowRight className="w-3 h-3" />
                    </Link>
                </motion.div>

                {/* Staggered Featured Cards Grid */}
                <motion.div
                    className="grid md:grid-cols-3 gap-6 mb-10"
                    variants={prefersReducedMotion ? {} : STAGGER_CONTAINER}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    {featuredStudies.map((study) => (
                        <motion.div
                            key={study.href}
                            variants={prefersReducedMotion ? {} : STAGGER_ITEM}
                            className="h-full"
                        >
                            <FeaturedCard study={study} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA with animated arrow */}
                <motion.div
                    className="text-center"
                    variants={prefersReducedMotion ? {} : SCROLL_REVEAL_VARIANTS}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    <Link href="/research">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-brand transition-colors group">
                            Explore all 15 studies
                            <motion.span
                                initial={{ x: 0 }}
                                whileHover={prefersReducedMotion ? undefined : { x: 4 }}
                                transition={{ duration: DURATION.normal, ease: EASE_SNAP }}
                            >
                                <ArrowRight className="w-4 h-4" />
                            </motion.span>
                        </span>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

