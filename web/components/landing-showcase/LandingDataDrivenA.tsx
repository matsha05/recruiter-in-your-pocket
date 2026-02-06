"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Lock, Shield, Trash2, ArrowRight, Check, ExternalLink, BookOpen, BarChart2, Target, TrendingUp, Quote } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Data-Driven Variation A: Verdict-First
 * 
 * Design Philosophy Alignment:
 * - Editorial Authority: Strong headline hierarchy with Fraunces energy
 * - Quiet Power: Verdict-driven structure, one dramatic moment (the score reveal)
 * - Raycast Density: Tighter spacing, monospace for stats
 * - Same content as OG, reordered to lead with judgment
 */

function AnimatedBar({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });

    return (
        <div ref={ref} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-mono text-slate-900">{value}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-teal-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: isInView ? `${value}%` : 0 }}
                    transition={{ duration: 0.35, delay, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

function Citation({ source, year }: { source: string; year: string }) {
    return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-500">
            {source}, {year}
        </span>
    );
}

export function LandingDataDrivenA() {
    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-500/20">
            {/* Nav - Quiet, minimal */}
            <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5 text-teal-600" />
                        <span className="text-sm font-medium">RIYP</span>
                    </div>
                    <button className="text-sm font-medium px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-200">
                        Analyze Resume
                    </button>
                </div>
            </nav>

            {/* Hero - Verdict First */}
            <section className="px-6 py-16 border-b border-slate-100">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-5 gap-12 items-start">
                        {/* Left: The Verdict */}
                        <div className="lg:col-span-2">
                            <motion.div
                                className="p-6 rounded-lg border border-slate-200 bg-slate-50"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35 }}
                            >
                                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-4">
                                    The Verdict
                                </div>
                                <div className="text-6xl font-bold text-teal-600 font-mono mb-2">
                                    7.4<span className="text-2xl">s</span>
                                </div>
                                <div className="text-sm text-slate-600 mb-6">
                                    Average recruiter scan time
                                </div>
                                <div className="space-y-3">
                                    <AnimatedBar value={92} label="Story" delay={0.1} />
                                    <AnimatedBar value={78} label="Impact" delay={0.15} />
                                    <AnimatedBar value={85} label="Clarity" delay={0.2} />
                                    <AnimatedBar value={68} label="Readability" delay={0.25} />
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Overall</span>
                                    <span className="text-lg font-bold text-teal-600 font-mono">87/100</span>
                                </div>
                            </motion.div>
                            <div className="mt-3 text-center">
                                <Citation source="Ladders" year="2018" />
                            </div>
                        </div>

                        {/* Right: Context */}
                        <motion.div
                            className="lg:col-span-3"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.35, delay: 0.1 }}
                        >
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-slate-200 text-xs text-slate-500 mb-5">
                                <BookOpen className="w-3 h-3" />
                                Based on 14 peer-reviewed studies
                            </div>

                            <h1 className="font-display text-3xl md:text-4xl font-normal tracking-tight leading-tight mb-5">
                                Understand how you're <span className="text-teal-600">actually</span> being evaluated
                            </h1>

                            <p className="text-slate-600 leading-relaxed mb-6 max-w-lg">
                                Recruiters spend 7.4 seconds on initial review. <strong>75%</strong> are rejected in under 10 seconds. We use eye-tracking research to show you exactly what they see.
                            </p>

                            <div className="flex flex-wrap items-center gap-3">
                                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors duration-200">
                                    Get Your Analysis
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                                <a href="#methodology" className="text-sm text-slate-500 hover:text-teal-600 transition-colors duration-200 flex items-center gap-1">
                                    Our methodology
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Methodology - Quiet Grid */}
            <section id="methodology" className="px-6 py-16 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-2 mb-8">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                            The 6-Second Signal Model
                        </span>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                        {[
                            { icon: Target, title: "Story", weight: "35%", desc: "Career narrative clarity", source: ["NBER", "2019"] },
                            { icon: TrendingUp, title: "Impact", weight: "30%", desc: "Quantified achievements", source: ["Bock", "2015"] },
                            { icon: BarChart2, title: "Clarity", weight: "20%", desc: "Role-level parsing", source: ["Ladders", "2018"] },
                            { icon: BookOpen, title: "Readability", weight: "15%", desc: "Visual hierarchy", source: ["Eye-tracking", "2018"] },
                        ].map((signal, i) => (
                            <motion.div
                                key={signal.title}
                                className="p-4 rounded-lg border border-slate-200 bg-white"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05, duration: 0.2 }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <signal.icon className="w-4 h-4 text-teal-600" />
                                    <span className="text-xs font-mono text-teal-600">{signal.weight}</span>
                                </div>
                                <h3 className="font-medium text-sm mb-1">{signal.title}</h3>
                                <p className="text-xs text-slate-500 mb-2">{signal.desc}</p>
                                <Citation source={signal.source[0]} year={signal.source[1]} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof - Dense */}
            <section className="px-6 py-16">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {[
                            { value: "14", label: "Peer-reviewed studies" },
                            { value: "7.4s", label: "Average scan time" },
                            { value: "75%", label: "Rejected in 10 seconds" },
                        ].map((stat, i) => (
                            <div key={stat.label} className="text-center p-5 rounded-lg border border-slate-100">
                                <div className="text-3xl font-bold text-slate-900 font-mono mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                quote: "The data-backed approach made me trust the recommendations. This isn't guesswork.",
                                name: "Dr. Sarah Chen",
                                role: "Senior Data Scientist, prev. Meta",
                            },
                            {
                                quote: "I've reviewed thousands of resumes. This tool catches what we actually look for.",
                                name: "Marcus Williams",
                                role: "VP Engineering, Series C",
                            },
                        ].map((testimonial) => (
                            <div key={testimonial.name} className="p-5 rounded-lg border border-slate-100">
                                <Quote className="w-5 h-5 text-slate-300 mb-3" />
                                <p className="text-slate-700 mb-4">"{testimonial.quote}"</p>
                                <div className="text-sm">
                                    <span className="font-medium text-slate-900">{testimonial.name}</span>
                                    <span className="text-slate-400"> · </span>
                                    <span className="text-slate-500">{testimonial.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA - One dramatic moment */}
            <section className="px-6 py-16 bg-teal-600 text-white">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">See what they see</h2>
                    <p className="text-teal-100 mb-8">Free. 60 seconds. Research-backed.</p>
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-700 font-medium rounded hover:bg-teal-50 transition-colors duration-200">
                        Get Your Analysis
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </section>

            {/* Footer - Minimal */}
            <footer className="px-6 py-6 border-t border-slate-100">
                <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-4 h-4" />
                        <span>© 2026 RIYP</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Encrypted</span>
                        <span className="flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete anytime</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
