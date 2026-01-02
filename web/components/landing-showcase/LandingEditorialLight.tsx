"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Check, Shield, Lock, Trash2, Star } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Editorial Light
 * - Clean white with black text, red accents
 * - Magazine/editorial feel
 * - Strong typography hierarchy
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

export function LandingEditorialLight() {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PocketMark className="w-6 h-6 text-red-600" />
                        <span className="font-serif text-xl font-bold">RIYP</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#method" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Methodology</a>
                        <button className="px-5 py-2.5 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="px-6 py-32 border-b border-gray-200">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-red-600 font-medium uppercase tracking-wider text-sm mb-6">
                            Resume Intelligence
                        </p>

                        <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] mb-8 text-gray-900">
                            The verdict recruiters<br />
                            <em>won't</em> give you
                        </h1>

                        <p className="text-xl text-gray-600 max-w-2xl mb-12 leading-relaxed">
                            Studies show recruiters spend 7.4 seconds on a resume before deciding.
                            Find out what they really think in that window - and how to change it.
                        </p>

                        <div className="flex flex-wrap items-center gap-6">
                            <button className="group flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors">
                                Get Your Verdict
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <div className="text-sm text-gray-500">
                                Free analysis · No signup required
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Row */}
            <section className="px-6 py-16 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: 7, suffix: "s", label: "First impression" },
                            { value: 14, label: "Peer-reviewed studies" },
                            { value: 75, suffix: "%", label: "Quick rejections" },
                            { value: 250, suffix: "+", label: "Resumes per role" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-4xl font-serif font-bold text-gray-900 mb-1">
                                    <CountUp end={stat.value} suffix={stat.suffix || ""} />
                                </div>
                                <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Method Section */}
            <section id="method" className="px-6 py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-start">
                        <div>
                            <p className="text-red-600 font-medium uppercase tracking-wider text-sm mb-4">
                                The Methodology
                            </p>
                            <h2 className="font-serif text-4xl text-gray-900 mb-6">
                                Grounded in research, built for action
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                Our analysis methodology is based on 14 peer-reviewed studies of recruiter
                                behavior, eye-tracking research, and hiring outcome data from over 250,000
                                applications.
                            </p>
                            <button className="group flex items-center gap-2 text-red-600 font-medium hover:text-red-700 transition-colors">
                                Read our research
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {[
                                { title: "The 7-Second Verdict", desc: "What recruiters actually think in that first scan." },
                                { title: "The Critical Miss", desc: "The single gap that's holding you back." },
                                { title: "Red Pen Rewrites", desc: "Exact text replacements. Just copy and paste." },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.title}
                                    className="p-6 border-l-4 border-red-600 bg-gray-50"
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                                    <p className="text-gray-600 text-sm">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonial */}
            <section className="px-6 py-24 bg-gray-900 text-white">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="flex justify-center gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                    </div>
                    <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed mb-8">
                        "Finally - honest feedback on my resume. Not generic tips, but what a hiring manager would actually say."
                    </blockquote>
                    <div className="text-white/80">Sarah M., Software Engineer</div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-24">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="font-serif text-4xl text-gray-900 mb-6">Ready for the truth?</h2>
                    <p className="text-gray-600 mb-10 text-lg">
                        60 seconds. Free. No signup required.
                    </p>
                    <button className="group inline-flex items-center gap-2 px-10 py-5 bg-red-600 text-white font-medium text-lg hover:bg-red-700 transition-colors">
                        Get Your Verdict
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-gray-200">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Encrypted</div>
                        <div className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Auto-deleted</div>
                        <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Never trains AI</div>
                    </div>
                    <div className="text-sm text-gray-400">© 2026 RIYP</div>
                </div>
            </footer>
        </div>
    );
}
