"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { SCROLL_REVEAL_VARIANTS, STAGGER_CONTAINER, STAGGER_ITEM } from "@/lib/animation";
import { ArrowRight, Eye, BarChart3, Users } from "lucide-react";

/**
 * BackedByResearch v2 - Premium Landing Page Research Section
 * 
 * Upgraded from plain text list to premium cards matching Research Hub design
 */

const featuredStudies = [
    {
        title: "How Recruiters Skim in 7.4 Seconds",
        category: "Eye-tracking research",
        description: "Where attention goes first and which fields decide the pass.",
        href: "/research/how-recruiters-read",
        readTime: "4 min",
        label: "Start here",
        icon: Eye
    },
    {
        title: "The Laszlo Bock Formula",
        category: "Resume writing",
        description: "Why measurable outcomes shape perceived impact.",
        href: "/research/quantifying-impact",
        readTime: "5 min",
        label: "Most actionable",
        icon: BarChart3
    },
    {
        title: "The Referral Advantage",
        category: "Job search strategy",
        description: "How referrals shift movement through hiring funnels.",
        href: "/research/referral-advantage",
        readTime: "4 min",
        label: "Highest impact",
        icon: Users
    }
];

function FeaturedCard({ study, index }: { study: typeof featuredStudies[0]; index: number }) {
    const prefersReducedMotion = useReducedMotion();
    const IconComponent = study.icon;

    return (
        <motion.div
            variants={prefersReducedMotion ? {} : STAGGER_ITEM}
        >
            <Link
                href={study.href}
                className="group block h-full rounded-xl border border-border/40 bg-white dark:bg-card p-5 transition-all duration-300 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5"
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                            <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 bg-muted/30 px-2 py-0.5 rounded">
                            {study.label}
                        </span>
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-1.5">
                        {study.category}
                    </div>
                    <h3 className="font-display text-base font-medium text-foreground mb-1.5 group-hover:text-brand transition-colors leading-snug">
                        {study.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                        {study.description}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                            {study.readTime}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export function BackedByResearch() {
    const { ref: sectionRef, isVisible } = useScrollReveal();
    const prefersReducedMotion = useReducedMotion();

    return (
        <section className="w-full py-20 border-t border-border/30 bg-muted/20">
            <div className="max-w-5xl mx-auto px-6">
                {/* Header with scroll reveal */}
                <motion.div
                    ref={sectionRef as React.RefObject<HTMLDivElement>}
                    className="mb-10 max-w-xl mx-auto text-center"
                    variants={prefersReducedMotion ? {} : SCROLL_REVEAL_VARIANTS}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                        The Hiring Playbook
                    </div>
                    <h2 className="font-display text-3xl md:text-4xl text-foreground leading-tight tracking-tight mb-3">
                        Built on how recruiters decide.
                    </h2>
                    <p className="text-muted-foreground">
                        Research-backed guidance, presented like a document, not a marketing page.
                    </p>
                </motion.div>

                {/* Premium Cards Grid */}
                <motion.div
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
                    variants={prefersReducedMotion ? {} : STAGGER_CONTAINER}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    {featuredStudies.map((study, index) => (
                        <FeaturedCard key={study.href} study={study} index={index} />
                    ))}
                </motion.div>

                {/* CTAs */}
                <motion.div
                    className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
                    variants={prefersReducedMotion ? {} : SCROLL_REVEAL_VARIANTS}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    <Link href="/research" className="group inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-brand transition-colors">
                        Explore all research
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <span className="text-border">|</span>
                    <Link href="/guides" className="group inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-brand transition-colors">
                        Negotiation playbooks
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <span className="text-border">|</span>
                    <Link href="/research/how-we-score" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        See our scoring model
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
