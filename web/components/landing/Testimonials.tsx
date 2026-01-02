"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { SCROLL_REVEAL_VARIANTS, STAGGER_CONTAINER, STAGGER_ITEM } from "@/lib/animation";
import { Quote } from "lucide-react";

/**
 * Testimonials v2 - Premium card layout matching Research Hub
 */

interface Testimonial {
    name: string;
    role: string;
    company: string;
    quote: string;
}

const testimonials: Testimonial[] = [
    {
        name: "Marcus Chen",
        role: "Senior Product Manager",
        company: "Stripe → Figma",
        quote: "I'd been getting ghosted for months. Ran my resume through and realized I was burying my biggest wins in generic language. Made the changes, landed 3 interviews that week.",
    },
    {
        name: "Sarah Okonkwo",
        role: "Software Engineer",
        company: "Series B Startup",
        quote: "The 'recruiter first impression' section was brutal but accurate. I was leading with the wrong story. Fixed my top 3 bullets and heard back from a company I'd applied to twice before.",
    },
    {
        name: "James Rivera",
        role: "Director of Engineering",
        company: "Meta",
        quote: "I've reviewed thousands of resumes. This catches what I'd catch in my first 10-second scan — and gives you the fix, not just the problem.",
    }
];

export function Testimonials() {
    const { ref: sectionRef, isVisible } = useScrollReveal();
    const prefersReducedMotion = useReducedMotion();

    return (
        <section className="py-20 px-6 bg-background border-t border-border/30">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    ref={sectionRef as React.RefObject<HTMLDivElement>}
                    className="text-center mb-10 max-w-xl mx-auto"
                    variants={prefersReducedMotion ? {} : SCROLL_REVEAL_VARIANTS}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                        From Job Seekers
                    </div>
                    <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3 tracking-tight">
                        Real feedback. Real results.
                    </h2>
                    <p className="text-muted-foreground">
                        From people who fixed it before recruiters saw it.
                    </p>
                </motion.div>

                {/* Testimonial Cards */}
                <motion.div
                    className="grid md:grid-cols-3 gap-4"
                    variants={prefersReducedMotion ? {} : STAGGER_CONTAINER}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            variants={prefersReducedMotion ? {} : STAGGER_ITEM}
                            className="group p-5 rounded-xl border border-border/40 bg-white dark:bg-card transition-all duration-300 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5"
                        >
                            <Quote className="w-5 h-5 text-muted-foreground/30 mb-3" />
                            <blockquote className="text-sm text-foreground/90 leading-relaxed mb-4">
                                "{t.quote}"
                            </blockquote>
                            <div className="pt-3 border-t border-border/20">
                                <div className="text-sm font-medium text-foreground">{t.name}</div>
                                <div className="text-xs text-muted-foreground">
                                    {t.role} · {t.company}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
