"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Check, Sparkles, FileText, Target } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Notion Playful
 * Inspiration: Notion.so
 * - Light theme, warm, approachable
 * - Illustrations and playful elements
 * - Clean but friendly
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

export function LandingNotionPlayful() {
    return (
        <div className="min-h-screen bg-[#fffcf7] text-gray-900 selection:bg-orange-200">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-[#fffcf7]/80 backdrop-blur-md border-b border-gray-200/50">
                <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-6 h-6 text-gray-900" />
                        <span className="font-semibold">Recruiter in Your Pocket</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="#how" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How it works</a>
                        <button className="text-sm font-medium px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                            Get started free
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="px-6 py-24">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-8">
                            <Sparkles className="w-4 h-4" />
                            See what recruiters really see
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                            Your resume,<br />
                            <span className="text-orange-500">through their eyes</span> 👀
                        </h1>

                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                            Recruiters spend just 7.4 seconds on your resume. Find out exactly what they think—and how to fix it.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="group flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                                Get your verdict free
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <span className="text-sm text-gray-500">Takes 60 seconds ✨</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { value: 7, suffix: "s", label: "Avg. scan time", emoji: "⏱️" },
                            { value: 14, label: "Research studies", emoji: "📚" },
                            { value: 75, suffix: "%", label: "Quick rejections", emoji: "📉" },
                            { value: 3, suffix: "x", label: "More callbacks", emoji: "📈" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="text-center p-6 rounded-xl bg-white border border-gray-200"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-2xl mb-2">{stat.emoji}</div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">
                                    <CountUp end={stat.value} suffix={stat.suffix || ""} />
                                </div>
                                <div className="text-sm text-gray-500">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how" className="px-6 py-24 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">How it works</h2>
                        <p className="text-gray-600">Three things that actually help</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                emoji: "🎯",
                                title: "The 7-Second Verdict",
                                description: "The raw, unfiltered first impression. What they thought, felt, and would do next.",
                            },
                            {
                                emoji: "🔍",
                                title: "Your Critical Miss",
                                description: "The single biggest gap holding you back. Usually invisible to you, obvious to them.",
                            },
                            {
                                emoji: "✍️",
                                title: "Red Pen Rewrites",
                                description: "Exact replacement text for every weak line. Just copy and paste.",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                className="p-6 rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-4xl mb-4">{item.emoji}</div>
                                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial */}
            <section className="px-6 py-24">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-2xl">⭐</span>
                        ))}
                    </div>
                    <blockquote className="text-2xl font-medium mb-6 leading-relaxed">
                        "Finally, honest feedback on my resume. Not generic tips—actual insight into what recruiters think."
                    </blockquote>
                    <div className="text-gray-600">— Sarah, Software Engineer</div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-24 bg-orange-50">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to see the truth? 🚀</h2>
                    <p className="text-gray-600 mb-10">
                        60 seconds. Free. No signup required.
                    </p>
                    <button className="group inline-flex items-center gap-2 px-10 py-5 bg-gray-900 text-white font-medium text-lg rounded-lg hover:bg-gray-800 transition-colors">
                        Get your verdict
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-gray-200">
                <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-4 h-4" />
                        <span>© 2026 RIYP</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>🔐 Encrypted</span>
                        <span>🗑️ Auto-deleted</span>
                        <span>🤖 Never trains AI</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
