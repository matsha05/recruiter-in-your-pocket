"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check, BookOpen, BarChart2, Target, TrendingUp, Lock, Shield, Trash2 } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Data-Driven V4: Scroll-Driven Reveal
 * 
 * Same research content but with:
 * - Dramatic scroll-triggered reveals
 * - Full-height sections
 * - Bold typography with number reveals
 * - Emerald/green accent color
 */

function BigNumber({ value, suffix = "", label }: { value: string; suffix?: string; label: string }) {
    return (
        <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
        >
            <div className="text-7xl md:text-9xl font-bold text-emerald-500 mb-4">
                {value}<span className="text-4xl md:text-6xl">{suffix}</span>
            </div>
            <div className="text-xl md:text-2xl text-slate-600">{label}</div>
        </motion.div>
    );
}

function ProgressRing({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (value / 100) * circumference;

    return (
        <motion.div
            ref={ref}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
        >
            <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90">
                    <circle
                        cx="56"
                        cy="56"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-slate-100"
                    />
                    <motion.circle
                        cx="56"
                        cy="56"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-emerald-500"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: isInView ? offset : circumference }}
                        transition={{ duration: 1.5, delay, ease: "easeOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-slate-900">{value}%</span>
                </div>
            </div>
            <div className="mt-3 text-sm text-slate-600 text-center">{label}</div>
        </motion.div>
    );
}

export function LandingDataDrivenV4() {
    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-500/20">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-6 h-6 text-emerald-500" />
                        <span className="font-semibold">RIYP</span>
                    </div>
                    <button className="px-5 py-2.5 bg-emerald-500 text-white font-medium rounded-full hover:bg-emerald-600 transition-colors">
                        Analyze Resume
                    </button>
                </div>
            </nav>

            {/* Hero - The Number */}
            <section className="min-h-screen flex items-center justify-center px-6 pt-16">
                <div className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="text-sm uppercase tracking-widest text-slate-400 mb-8">
                            Based on 14 peer-reviewed studies
                        </div>
                        <div className="text-8xl md:text-[12rem] font-bold text-emerald-500 leading-none mb-4">
                            7.4
                        </div>
                        <div className="text-3xl md:text-4xl text-slate-600 mb-8">
                            seconds to impress
                        </div>
                        <p className="text-lg text-slate-500 max-w-xl mx-auto mb-12">
                            That's how long recruiters spend on your resume before deciding.
                            Our research-backed analysis shows you exactly what they see.
                        </p>
                        <button className="group inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white font-semibold rounded-full hover:bg-emerald-600 transition-colors">
                            Get Your Analysis
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Big Stats Scroll */}
            <section className="py-32 space-y-48">
                <BigNumber value="75" suffix="%" label="of resumes rejected in under 10 seconds" />
                <BigNumber value="250" suffix="+" label="applications per open role" />
                <BigNumber value="14" label="peer-reviewed studies inform our model" />
            </section>

            {/* Signal Model */}
            <section className="px-6 py-32 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className="text-sm uppercase tracking-widest text-emerald-600 mb-4">
                            The 6-Second Signal Model
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold">
                            What we measure
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-8">
                        <ProgressRing value={35} label="Story Signal" delay={0} />
                        <ProgressRing value={30} label="Impact Signal" delay={0.1} />
                        <ProgressRing value={20} label="Clarity Signal" delay={0.2} />
                        <ProgressRing value={15} label="Readability Signal" delay={0.3} />
                    </div>

                    <div className="mt-16 grid md:grid-cols-4 gap-6">
                        {[
                            { icon: Target, title: "Story", desc: "Career narrative in first scan", source: "NBER, 2019" },
                            { icon: TrendingUp, title: "Impact", desc: "Quantified achievements", source: "Google, 2015" },
                            { icon: BarChart2, title: "Clarity", desc: "Role and level parsing", source: "Ladders, 2018" },
                            { icon: BookOpen, title: "Readability", desc: "Visual hierarchy support", source: "Eye-tracking, 2018" },
                        ].map((signal, i) => (
                            <motion.div
                                key={signal.title}
                                className="p-6 rounded-xl bg-white border border-slate-200"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <signal.icon className="w-6 h-6 text-emerald-500 mb-4" />
                                <h3 className="font-semibold mb-2">{signal.title}</h3>
                                <p className="text-sm text-slate-500 mb-3">{signal.desc}</p>
                                <div className="text-xs text-slate-400">{signal.source}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Simple CTA */}
            <section className="px-6 py-32">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready for the data?</h2>
                    <p className="text-xl text-slate-500 mb-12">
                        Free analysis. 60 seconds. Research-backed methodology.
                    </p>
                    <button className="group inline-flex items-center gap-2 px-10 py-5 bg-emerald-500 text-white font-semibold text-lg rounded-full hover:bg-emerald-600 transition-colors">
                        Analyze My Resume
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Trust Footer */}
            <footer className="px-6 py-8 border-t border-slate-200">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm text-slate-500">© 2026 Recruiter in Your Pocket</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Lock className="w-4 h-4" /> Encrypted</span>
                        <span className="flex items-center gap-1"><Trash2 className="w-4 h-4" /> Delete anytime</span>
                        <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Never trains AI</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
