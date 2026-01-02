"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Lock, Shield, Trash2, ArrowRight, Check, BookOpen, Quote } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Rolex Narrative
 * Inspiration: Rolex.com
 * - Dark emerald green gradients
 * - Storytelling approach: heritage, craftsmanship, precision
 * - Serif headlines (elegant)
 * - Slow, purposeful animations
 */

function CountUp({ end, suffix = "", duration = 2 }: { end: number; suffix?: string; duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const increment = end / (duration * 60);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 1000 / 60);
        return () => clearInterval(timer);
    }, [isInView, end, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
}

export function LandingRolexNarrative() {
    return (
        <div className="min-h-screen bg-[#0c1a14] text-white selection:bg-emerald-500/30">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-emerald-900/30 bg-[#0c1a14]/95 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PocketMark className="w-6 h-6 text-emerald-400" />
                        <span className="font-serif text-lg tracking-wide">Recruiter in Your Pocket</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#story" className="text-sm text-emerald-200/70 hover:text-white transition-colors">Our Story</a>
                        <a href="#craft" className="text-sm text-emerald-200/70 hover:text-white transition-colors">The Craft</a>
                        <button className="text-sm font-medium px-5 py-2.5 rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
                            Begin Your Journey
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero - Narrative Style */}
            <section className="relative px-6 py-32 overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-[#0c1a14]" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <p className="text-emerald-400 text-sm uppercase tracking-[0.3em] mb-8">Est. 2024 · Precision Resume Analysis</p>

                        <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] mb-8 text-white">
                            The art of the<br />
                            <span className="text-emerald-400">first impression</span>
                        </h1>

                        <p className="text-xl text-emerald-100/70 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                            For over a decade, we have studied the precise moments that define a recruiter's decision.
                            Each analysis is crafted with the same attention to detail that separates the exceptional from the ordinary.
                        </p>

                        <div className="flex flex-col items-center gap-6">
                            <button className="group inline-flex items-center gap-3 px-8 py-4 rounded bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-all">
                                Discover Your Potential
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <span className="text-sm text-emerald-200/50">Complimentary analysis · No commitment required</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Legacy Stats */}
            <section className="px-6 py-24 border-t border-emerald-900/30">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { value: 7.4, suffix: "s", label: "The Critical Window" },
                            { value: 14, suffix: "", label: "Peer-Reviewed Studies" },
                            { value: 75, suffix: "%", label: "Decided in Seconds" },
                            { value: 250, suffix: "+", label: "Applications Per Role" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15, duration: 0.8 }}
                            >
                                <div className="text-5xl font-serif text-emerald-400 mb-3">
                                    <CountUp end={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className="text-sm text-emerald-200/60 uppercase tracking-wider">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Craft */}
            <section id="craft" className="px-6 py-24 bg-gradient-to-b from-[#0c1a14] to-emerald-950/30">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-emerald-400 text-sm uppercase tracking-[0.3em] mb-4">The Methodology</p>
                        <h2 className="font-serif text-4xl md:text-5xl mb-6 text-white">Crafted with precision</h2>
                        <p className="text-emerald-100/60 max-w-2xl mx-auto">
                            Every element of our analysis is grounded in rigorous research and refined through experience.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "The Seven-Second Verdict",
                                description: "The unfiltered first impression. What a recruiter thinks, feels, and decides in the crucial opening moments.",
                            },
                            {
                                title: "The Critical Miss",
                                description: "The single most impactful gap in your narrative. Often invisible to you, always visible to them.",
                            },
                            {
                                title: "The Red Pen Treatment",
                                description: "Precise rewrites for every weak passage. Not suggestions—exact replacements you can use immediately.",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                className="p-8 rounded-lg border border-emerald-800/30 bg-emerald-900/10"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-emerald-400 font-serif text-lg mb-4">{item.title}</div>
                                <p className="text-emerald-100/60 leading-relaxed">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial */}
            <section className="px-6 py-24">
                <div className="max-w-3xl mx-auto text-center">
                    <Quote className="w-12 h-12 text-emerald-600 mx-auto mb-8" />
                    <blockquote className="font-serif text-2xl md:text-3xl text-emerald-100 leading-relaxed mb-8">
                        "The level of detail and precision in this analysis rivals what I've seen from executive recruiters charging thousands.
                        This is the standard."
                    </blockquote>
                    <div className="text-emerald-400">Dr. Sarah Chen</div>
                    <div className="text-sm text-emerald-200/50">Senior Data Scientist · Previously at Meta</div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-24 bg-emerald-900/20 border-t border-emerald-800/30">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="font-serif text-4xl md:text-5xl mb-6 text-white">Begin your transformation</h2>
                    <p className="text-emerald-100/60 mb-10 text-lg">
                        Join those who refuse to leave their career to chance.
                    </p>
                    <button className="group inline-flex items-center gap-3 px-10 py-5 rounded bg-emerald-600 text-white font-medium text-lg hover:bg-emerald-500 transition-all">
                        Get Your Verdict
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-sm text-emerald-200/40 mt-6">Free · 60 seconds · No signup required</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-12 border-t border-emerald-900/30">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-8 text-sm text-emerald-200/50">
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Encrypted
                        </div>
                        <div className="flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Auto-deleted
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Never trains AI
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-emerald-200/50">
                        <PocketMark className="w-4 h-4 text-emerald-400" />
                        © 2026 Recruiter in Your Pocket
                    </div>
                </div>
            </footer>
        </div>
    );
}
