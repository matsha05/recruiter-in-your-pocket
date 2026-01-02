"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, Lock, Shield, Trash2 } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Apple Dramatic
 * Inspiration: Apple.com
 * - Pure white hero, massive whitespace
 * - Scroll-triggered content reveals
 * - Single product shot as hero
 * - Minimal copy, maximum impact
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

export function LandingAppleDramatic() {
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);

    return (
        <div className="min-h-screen bg-white text-black selection:bg-blue-500/20">
            {/* Navigation - Minimal */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <PocketMark className="w-6 h-6 text-black" />
                    <button className="text-sm font-medium px-5 py-2 rounded-full bg-black text-white hover:bg-black/80 transition-colors">
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero - Massive Typography */}
            <motion.section
                className="min-h-screen flex flex-col items-center justify-center px-6 pt-20"
                style={{ opacity: heroOpacity, scale: heroScale }}
            >
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <h1 className="text-7xl md:text-9xl font-bold tracking-tight leading-none mb-8">
                        See what they see.
                    </h1>
                    <p className="text-2xl text-gray-500 max-w-xl mx-auto mb-12">
                        Get the recruiter's honest first impression in 60 seconds.
                    </p>
                    <button className="group inline-flex items-center gap-2 text-xl text-blue-600 font-medium hover:text-blue-700 transition-colors">
                        Get your verdict
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>
            </motion.section>

            {/* Scroll Reveal - The Number */}
            <section className="min-h-screen flex items-center justify-center px-6 bg-black text-white">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-20%" }}
                    transition={{ duration: 1 }}
                >
                    <div className="text-[10rem] md:text-[16rem] font-bold tracking-tighter leading-none">
                        7.4<span className="text-blue-500">s</span>
                    </div>
                    <p className="text-2xl text-gray-400 mt-8">
                        The time you have to make an impression.
                    </p>
                </motion.div>
            </section>

            {/* Features - Simple Grid */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.h2
                        className="text-5xl md:text-6xl font-bold text-center mb-24"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        What you'll discover.
                    </motion.h2>

                    <div className="space-y-24">
                        {[
                            {
                                title: "The Verdict",
                                desc: "What a recruiter thinks in 7 seconds. No filter.",
                            },
                            {
                                title: "The Critical Miss",
                                desc: "The one thing holding you back. Usually invisible to you.",
                            },
                            {
                                title: "Red Pen Rewrites",
                                desc: "Exact replacements for every weak line. Copy and paste.",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                className="text-center"
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-10%" }}
                                transition={{ duration: 0.8 }}
                            >
                                <h3 className="text-4xl font-bold mb-4">{item.title}</h3>
                                <p className="text-xl text-gray-500">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-32 px-6 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-16 text-center">
                        {[
                            { value: 14, label: "Peer-reviewed studies" },
                            { value: 75, suffix: "%", label: "Rejected in 10 seconds" },
                            { value: 250, suffix: "+", label: "Applications per role" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-6xl font-bold mb-2">
                                    <CountUp end={stat.value} suffix={stat.suffix || ""} />
                                </div>
                                <div className="text-gray-500">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-5xl md:text-7xl font-bold mb-8">
                        Your move.
                    </h2>
                    <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-black text-white text-lg font-medium hover:bg-black/80 transition-colors">
                        Get Your Verdict
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-gray-400 mt-6">Free. 60 seconds. No signup.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-gray-100">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-8 text-sm text-gray-400">
                        <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Encrypted</div>
                        <div className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Auto-deleted</div>
                        <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Never trains AI</div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <PocketMark className="w-4 h-4" />
                        © 2026 Recruiter in Your Pocket
                    </div>
                </div>
            </footer>
        </div>
    );
}
