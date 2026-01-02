"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, ArrowUpRight, BookOpen, Quote } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Fashion Editorial
 * Inspiration: Louis Vuitton, Givenchy, Vogue
 * - Full-bleed imagery sections
 * - Fashion magazine grid
 * - Pull quotes and bylines
 * - Elegant sans-serif
 */

function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const increment = end / 120;
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
    }, [isInView, end]);

    return <span ref={ref}>{count}{suffix}</span>;
}

export function LandingFashionEditorial() {
    return (
        <div className="min-h-screen bg-[#f8f6f3] text-[#1a1a1a] selection:bg-stone-300">
            {/* Navigation - Editorial */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f8f6f3]/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between border-b border-stone-200">
                    <span className="text-sm uppercase tracking-[0.3em] font-light">Recruiter in Your Pocket</span>
                    <div className="flex items-center gap-8">
                        <a href="#story" className="text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors">The Story</a>
                        <a href="#method" className="text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors">Method</a>
                        <button className="text-xs uppercase tracking-[0.2em] border-b border-stone-900 pb-0.5 hover:text-stone-600 transition-colors">
                            Begin
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero - Editorial Split */}
            <section className="min-h-screen pt-24 grid lg:grid-cols-2">
                {/* Left - Typography */}
                <div className="flex flex-col justify-center px-8 lg:px-16 py-24">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <p className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-8">Issue 001 · The Impression</p>

                        <h1 className="text-5xl md:text-7xl font-light leading-[1.1] mb-8 tracking-tight">
                            The Seven-Second<br />
                            <em className="font-serif">Verdict</em>
                        </h1>

                        <p className="text-lg text-stone-600 max-w-md leading-relaxed mb-12 font-light">
                            A recruiter's first impression is formed before the coffee cools.
                            We reveal exactly what they see—and what they miss.
                        </p>

                        <button className="group inline-flex items-center gap-3 text-sm uppercase tracking-[0.2em] border-b border-stone-900 pb-1">
                            Read On
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>

                {/* Right - Feature Visual */}
                <motion.div
                    className="bg-stone-200 flex items-center justify-center p-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                >
                    <div className="text-center">
                        <div className="text-[8rem] md:text-[12rem] font-extralight tracking-tighter text-stone-800">
                            7.4
                        </div>
                        <div className="text-sm uppercase tracking-[0.3em] text-stone-500">Seconds</div>
                    </div>
                </motion.div>
            </section>

            {/* Pull Quote */}
            <section className="px-8 py-32 border-t border-stone-200">
                <div className="max-w-4xl mx-auto text-center">
                    <Quote className="w-8 h-8 text-stone-300 mx-auto mb-8" />
                    <blockquote className="text-3xl md:text-4xl font-light leading-relaxed mb-8 font-serif italic">
                        "In the time it takes to read this sentence, a recruiter has already decided your fate."
                    </blockquote>
                    <cite className="text-sm uppercase tracking-[0.2em] text-stone-400 not-italic">
                        The Ladders Eye-Tracking Study, 2018
                    </cite>
                </div>
            </section>

            {/* Editorial Grid */}
            <section id="method" className="px-8 py-24 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-px bg-stone-200">
                        {[
                            {
                                num: "01",
                                title: "The Verdict",
                                desc: "The unfiltered first impression. What they thought, felt, decided.",
                            },
                            {
                                num: "02",
                                title: "The Miss",
                                desc: "The single most damaging gap. Often invisible to you.",
                            },
                            {
                                num: "03",
                                title: "The Rewrite",
                                desc: "Every weak line, transformed. Copy and paste.",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={item.num}
                                className="bg-white p-12"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <span className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-6 block">{item.num}</span>
                                <h3 className="text-2xl font-light mb-4">{item.title}</h3>
                                <p className="text-stone-500 font-light leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats - Minimal */}
            <section className="px-8 py-24 border-t border-stone-200">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        {[
                            { value: 14, label: "Studies" },
                            { value: 75, suffix: "%", label: "Rejected Fast" },
                            { value: 250, suffix: "+", label: "Applications" },
                            { value: 3, suffix: "x", label: "More Callbacks" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-4xl font-light mb-2">
                                    <CountUp end={stat.value} suffix={stat.suffix || ""} />
                                </div>
                                <div className="text-xs uppercase tracking-[0.2em] text-stone-400">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-8 py-32 bg-[#1a1a1a] text-white">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-8">Begin Your Story</p>
                    <h2 className="text-4xl md:text-6xl font-light mb-12">
                        Get the <em className="font-serif">verdict</em>.
                    </h2>
                    <button className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-sm uppercase tracking-[0.2em] hover:bg-stone-100 transition-colors">
                        Analyze Your Resume
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-sm text-stone-500 mt-8">Complimentary · 60 seconds · No commitment</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-8 py-8 bg-[#1a1a1a] border-t border-white/10">
                <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-stone-500 uppercase tracking-[0.2em]">
                    <span>© 2026</span>
                    <span>Recruiter in Your Pocket</span>
                </div>
            </footer>
        </div>
    );
}
