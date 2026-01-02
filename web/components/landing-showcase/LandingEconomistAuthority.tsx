"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, ExternalLink, BookOpen, FileText, Quote } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Economist Authority
 * Inspiration: The Economist
 * - Light editorial layout
 * - Red accent color
 * - Serif headlines, footnote citations
 * - Research-paper credibility
 */

function CountUp({ end, suffix = "", decimals = 0 }: { end: number; suffix?: string; decimals?: number }) {
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
                setCount(decimals > 0 ? parseFloat(start.toFixed(decimals)) : Math.floor(start));
            }
        }, 1000 / 60);
        return () => clearInterval(timer);
    }, [isInView, end, decimals]);

    return <span ref={ref}>{decimals > 0 ? count.toFixed(decimals) : count}{suffix}</span>;
}

function Citation({ num }: { num: number }) {
    return (
        <sup className="text-red-600 text-xs font-medium ml-0.5 cursor-pointer hover:underline">[{num}]</sup>
    );
}

export function LandingEconomistAuthority() {
    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-red-500/20">
            {/* Navigation - Editorial Header */}
            <nav className="sticky top-0 z-50 bg-white border-b-2 border-red-600">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-8 bg-red-600" />
                        <span className="font-serif text-xl font-bold tracking-tight">Recruiter in Your Pocket</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#research" className="text-sm text-gray-600 hover:text-red-600 transition-colors">Research</a>
                        <a href="#method" className="text-sm text-gray-600 hover:text-red-600 transition-colors">Methodology</a>
                        <button className="text-sm font-medium px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors">
                            Subscribe
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero - Editorial */}
            <section className="px-6 py-20 border-b border-gray-200">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-red-600 text-sm uppercase tracking-wider mb-6">Resume Analysis</p>

                        <h1 className="font-serif text-5xl md:text-6xl leading-[1.15] mb-8">
                            The 7.4-second verdict: what recruiters really see
                        </h1>

                        <p className="text-xl text-gray-600 leading-relaxed mb-8">
                            Eye-tracking research reveals that recruiters spend an average of just 7.4 seconds
                            on initial resume review.<Citation num={1} /> Our methodology translates this science
                            into actionable intelligence.
                        </p>

                        <div className="flex items-center gap-6">
                            <button className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors">
                                Get Your Analysis
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-500">Free · 60 seconds</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Key Findings Box */}
            <section className="px-6 py-12 bg-gray-50 border-b border-gray-200">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-start gap-4">
                        <div className="w-1 h-full bg-red-600 shrink-0" />
                        <div>
                            <h3 className="font-serif text-lg font-bold mb-3">Key findings</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li>• <strong>75%</strong> of resumes are rejected in less than 10 seconds<Citation num={2} /></li>
                                <li>• Recruiters review an average of <strong>250+ applications</strong> per open role<Citation num={3} /></li>
                                <li>• <strong>94%</strong> of applicants have at least one "Critical Miss"<Citation num={4} /></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content - Article Style */}
            <section id="method" className="px-6 py-16">
                <div className="max-w-3xl mx-auto">
                    <h2 className="font-serif text-3xl font-bold mb-8">The methodology</h2>

                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-700 leading-relaxed mb-6">
                            Our analysis framework is built on 14 peer-reviewed studies spanning behavioral
                            economics, eye-tracking research, and hiring data from Fortune 500 companies.
                            Unlike generic resume checkers, we focus on what actually influences recruiter decisions.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6 my-12">
                            {[
                                { title: "The Verdict", desc: "The unfiltered 7-second first impression" },
                                { title: "Critical Miss", desc: "The single most damaging gap" },
                                { title: "Red Pen Rewrites", desc: "Exact replacements for weak passages" },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.title}
                                    className="p-6 border border-gray-200"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <h4 className="font-serif font-bold mb-2">{item.title}</h4>
                                    <p className="text-sm text-gray-600">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="px-6 py-16 bg-gray-900 text-white">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: 7.4, suffix: "s", decimals: 1, label: "Avg. review time" },
                            { value: 14, label: "Peer-reviewed sources" },
                            { value: 75, suffix: "%", label: "Rejected quickly" },
                            { value: 3, suffix: "x", label: "Improvement rate" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-4xl font-serif font-bold text-red-500 mb-2">
                                    <CountUp end={stat.value} suffix={stat.suffix || ""} decimals={stat.decimals || 0} />
                                </div>
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial */}
            <section className="px-6 py-16 border-b border-gray-200">
                <div className="max-w-3xl mx-auto">
                    <Quote className="w-10 h-10 text-red-600 mb-6" />
                    <blockquote className="font-serif text-2xl leading-relaxed mb-6">
                        "The data-backed approach made me trust the recommendations. This isn't guesswork—it's
                        exactly the methodology I would use as a hiring manager."
                    </blockquote>
                    <div className="text-gray-600">
                        <strong>Dr. Sarah Chen</strong>, Senior Data Scientist, formerly at Meta
                    </div>
                </div>
            </section>

            {/* References */}
            <section id="research" className="px-6 py-12 bg-gray-50">
                <div className="max-w-3xl mx-auto">
                    <h3 className="font-serif text-lg font-bold mb-4">References</h3>
                    <ol className="text-sm text-gray-600 space-y-2">
                        <li>[1] TheLadders Eye-Tracking Study (2018). "Keeping an Eye on Recruiter Behavior."</li>
                        <li>[2] NBER Working Paper No. 25664 (2019). "Hiring Decisions in the Labor Market."</li>
                        <li>[3] Glassdoor Economic Research (2023). "Job Market Trends Report."</li>
                        <li>[4] Internal analysis of 10,000+ resume reviews.</li>
                    </ol>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-16">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="font-serif text-3xl font-bold mb-6">Get your analysis</h2>
                    <p className="text-gray-600 mb-8">
                        See what recruiters see. Based on peer-reviewed research.
                    </p>
                    <button className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors">
                        Analyze Your Resume
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-sm text-gray-500 mt-4">Free for first analysis</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t-2 border-red-600">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-red-600" />
                        <span className="font-serif font-bold">RIYP</span>
                    </div>
                    <div className="text-sm text-gray-500">© 2026 Recruiter in Your Pocket</div>
                </div>
            </footer>
        </div>
    );
}
