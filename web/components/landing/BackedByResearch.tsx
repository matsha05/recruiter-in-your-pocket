"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { SCROLL_REVEAL_VARIANTS, STAGGER_CONTAINER, STAGGER_ITEM } from "@/lib/animation";

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
        description: "Where attention goes first and which fields decide the pass.",
        href: "/research/how-recruiters-read",
        readTime: "4 min",
        featured: true
    },
    {
        title: "Quantifying Impact: The Laszlo Bock Formula",
        category: "Resume writing",
        description: "Why measurable outcomes shape perceived impact.",
        href: "/research/quantifying-impact",
        readTime: "5 min"
    },
    {
        title: "The Referral Advantage",
        category: "Job search strategy",
        description: "How referrals shift movement through hiring funnels.",
        href: "/research/referral-advantage",
        readTime: "4 min"
    }
];

function FeaturedCard({ study }: { study: typeof featuredStudies[0] }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <Link
            href={study.href}
            className="group block"
        >
            <div className="py-4 flex items-start justify-between gap-6">
                <div className="min-w-0">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 mb-2">
                        {study.category}
                    </div>
                    <div className="text-base font-display text-foreground group-hover:text-brand transition-colors">
                        {study.title}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                        {study.description}
                    </div>
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 shrink-0">
                    {study.readTime}
                </div>
            </div>
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
                    className="mb-12"
                    variants={prefersReducedMotion ? {} : SCROLL_REVEAL_VARIANTS}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
                        The Hiring Playbook
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight tracking-tight mb-4">
                        Built on how recruiters decide.
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-xl mb-3">
                        Research-backed guidance, presented like a document, not a marketing page.
                    </p>
                    <Link href="/research/how-we-score" className="text-sm text-foreground hover:underline underline-offset-4 decoration-border">
                        See our scoring model
                    </Link>
                </motion.div>

                {/* Editorial List */}
                <motion.div
                    className="border-t border-border/30 divide-y divide-border/30 mb-10"
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
                    className="text-left"
                    variants={prefersReducedMotion ? {} : SCROLL_REVEAL_VARIANTS}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    <Link href="/research">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-brand transition-colors group">
                            Explore all research
                        </span>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
