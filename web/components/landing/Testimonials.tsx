"use client";

import { Quote } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { SCROLL_REVEAL_VARIANTS, STAGGER_CONTAINER, STAGGER_ITEM } from "@/lib/animation";

interface Testimonial {
    name: string;
    role: string;
    company: string;
    quote: string;
    outcome?: string;
}

const testimonials: Testimonial[] = [
    {
        name: "Marcus Chen",
        role: "Senior Product Manager",
        company: "Stripe → Figma",
        quote: "I'd been getting ghosted for months. Ran my resume through and realized I was burying my biggest wins in generic language. Made the changes, landed 3 interviews that week.",
        outcome: "3 interviews in 1 week"
    },
    {
        name: "Sarah Okonkwo",
        role: "Software Engineer",
        company: "Series B Startup",
        quote: "The 'recruiter first impression' section was brutal but accurate. I was leading with the wrong story. Fixed my top 3 bullets and heard back from a company I'd applied to twice before.",
        outcome: "Callback from dream company"
    },
    {
        name: "James Rivera",
        role: "Director of Engineering",
        company: "Meta",
        quote: "I've reviewed thousands of resumes. This catches what I'd catch in my first 10-second scan — and gives you the fix, not just the problem.",
        outcome: "Hiring manager verified"
    }
];

export function Testimonials() {
    const { ref: sectionRef, isVisible } = useScrollReveal();
    const prefersReducedMotion = useReducedMotion();

    return (
        <section className="py-16 px-6 bg-muted/30">
            <div className="max-w-5xl mx-auto">
                {/* Header with scroll reveal */}
                <motion.div
                    ref={sectionRef as React.RefObject<HTMLDivElement>}
                    className="text-center mb-12"
                    variants={prefersReducedMotion ? {} : SCROLL_REVEAL_VARIANTS}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    <h2 className="font-display text-3xl md:text-4xl text-primary mb-3 tracking-tight">
                        Real feedback. Real results.
                    </h2>
                    <p className="text-muted-foreground">
                        From job seekers who fixed it before recruiters saw it.
                    </p>
                </motion.div>

                {/* Staggered testimonial cards */}
                <motion.div
                    className="grid md:grid-cols-3 gap-6"
                    variants={prefersReducedMotion ? {} : STAGGER_CONTAINER}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            variants={prefersReducedMotion ? {} : STAGGER_ITEM}
                            className="bg-card border border-border/40 rounded-lg p-6 flex flex-col hover:border-border/60 transition-colors"
                        >
                            <Quote className="w-6 h-6 text-brand/40 mb-4" />

                            <p className="text-sm text-foreground/90 leading-relaxed flex-1 mb-4">
                                &quot;{t.quote}&quot;
                            </p>

                            {t.outcome && (
                                <div className="inline-block text-xs font-medium text-brand bg-brand/10 px-2 py-1 rounded mb-4">
                                    {t.outcome}
                                </div>
                            )}

                            <div className="pt-2 border-t border-border/30 mt-auto">
                                <p className="text-sm font-medium text-foreground">
                                    {t.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {t.role} · {t.company}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    className="mt-8 text-center"
                    variants={prefersReducedMotion ? {} : SCROLL_REVEAL_VARIANTS}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    <p className="text-sm text-muted-foreground">
                        <span className="text-foreground font-medium">2,400+</span> resumes reviewed ·
                        <span className="text-foreground font-medium ml-1">89%</span> report actionable changes
                    </p>
                </motion.div>

                {/* Founder Credibility */}
                <motion.div
                    className="mt-6 pt-6 border-t border-border/30 text-center"
                    variants={prefersReducedMotion ? {} : SCROLL_REVEAL_VARIANTS}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    <p className="text-xs text-muted-foreground">
                        Created by hiring leaders from{' '}
                        <span className="text-foreground font-medium">Google, Meta, and OpenAI</span>{' '}
                        who&apos;ve screened 100,000+ resumes and made thousands of hires across 15+ years of global recruiting.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

