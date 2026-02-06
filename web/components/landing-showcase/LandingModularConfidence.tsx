"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Check, ArrowUpRight, Minus, Plus, Eye, Edit3, Target, Zap, Star, ChevronRight } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page Variation: Modular Confidence
 * 
 * Style: Minimal distraction-free, futuristic aesthetic
 * - Floating elements with subtle borders
 * - Extreme minimalism, lots of whitespace (on dark)
 * - Modular sections that feel like independent units
 * - Futuristic but warm, confident restraint
 */

// Interactive FAQ accordion
function FAQItem({ question, answer, isOpen, onToggle }: {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="border-b border-white/5">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-5 text-left group"
            >
                <span className="text-base font-medium text-white/90 group-hover:text-white transition-colors">
                    {question}
                </span>
                {isOpen ? (
                    <Minus className="w-4 h-4 text-white/40" />
                ) : (
                    <Plus className="w-4 h-4 text-white/40" />
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-5 text-sm text-white/50 leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function LandingModularConfidence() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const faqs = [
        {
            question: "How long does an analysis take?",
            answer: "Under 60 seconds. We analyze 47 data points and generate your full verdict, critical gaps, and rewrites in real-time.",
        },
        {
            question: "What makes this different from other resume tools?",
            answer: "We don't give you generic scores. We show you what a recruiter actually thinks in their 7-second scan — and exactly what to fix.",
        },
        {
            question: "Is my resume data secure?",
            answer: "Yes. All data is encrypted in transit and at rest. We let you delete your resume data anytime and never use it to train AI models.",
        },
        {
            question: "Can I use this for LinkedIn profiles?",
            answer: "Pro users get LinkedIn profile reviews. Same recruiter lens, applied to your public professional presence.",
        },
    ];

    return (
        <div className="min-h-screen bg-[#030303] text-white selection:bg-teal-500/30">
            {/* Navigation - Ultra minimal */}
            <nav className="fixed top-0 left-0 right-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PocketMark className="w-5 h-5 text-teal-400" />
                    </div>
                    <button className="text-sm font-medium px-4 py-2 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all">
                        Get started
                    </button>
                </div>
            </nav>

            {/* Hero Section - Clean and Confident */}
            <section className="relative min-h-screen flex items-center px-6 pt-20">
                <div className="max-w-5xl mx-auto w-full">
                    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
                        {/* Left: Copy */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.05] mb-8">
                                What recruiters
                                <br />
                                <span className="text-teal-400">actually</span> think.
                            </h1>

                            <p className="text-lg text-white/40 mb-10 max-w-md leading-relaxed">
                                7.4 seconds. That's your window. We show you what happens in that window — and how to own it.
                            </p>

                            <div className="flex items-center gap-4">
                                <button className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-black font-medium hover:bg-teal-400 transition-colors">
                                    Upload resume
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <span className="text-sm text-white/30">Free • 60 seconds</span>
                            </div>
                        </motion.div>

                        {/* Right: Floating modules */}
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.15 }}
                        >
                            {/* Module 1: Score */}
                            <motion.div
                                className="absolute top-0 right-0 p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">Signal Score</div>
                                <div className="text-4xl font-bold text-teal-400">87</div>
                            </motion.div>

                            {/* Module 2: Verdict */}
                            <motion.div
                                className="mt-20 ml-8 p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm max-w-xs"
                                animate={{ y: [0, 8, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            >
                                <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">Verdict</div>
                                <p className="text-sm text-white/80 leading-relaxed">
                                    "Strong founder energy, but your $2M impact is buried."
                                </p>
                            </motion.div>

                            {/* Module 3: Critical */}
                            <motion.div
                                className="mt-6 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm max-w-[280px]"
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            >
                                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 mb-2">Critical Miss</div>
                                <p className="text-sm text-white/70 leading-relaxed">
                                    Title signals strategy, evidence reads execution.
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features as Modular Cards */}
            <section className="px-6 py-32">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        className="text-center mb-20"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
                            Everything you need
                        </h2>
                        <p className="text-white/40">Four signals. One clear path forward.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            {
                                icon: Eye,
                                title: "7-Second Verdict",
                                description: "The recruiter's actual first impression. Not a score — a judgment.",
                                accent: "teal",
                            },
                            {
                                icon: Target,
                                title: "Critical Miss",
                                description: "The one thing hurting you most. Not a list — the priority.",
                                accent: "amber",
                            },
                            {
                                icon: Edit3,
                                title: "Red Pen Rewrites",
                                description: "Before and after for every weak bullet. Copy, paste, done.",
                                accent: "violet",
                            },
                            {
                                icon: Zap,
                                title: "Signal Analysis",
                                description: "Story, Impact, Clarity, Readability. Know exactly where to focus.",
                                accent: "cyan",
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="group p-8 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feature.accent === "teal" ? "bg-teal-500/10 text-teal-400" :
                                            feature.accent === "amber" ? "bg-amber-500/10 text-amber-400" :
                                                feature.accent === "violet" ? "bg-violet-500/10 text-violet-400" :
                                                    "bg-cyan-500/10 text-cyan-400"
                                        }`}>
                                        <feature.icon className="w-5 h-5" />
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                                <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof - Minimal */}
            <section className="px-6 py-24 border-y border-white/5">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        {[
                            { value: "10,000+", label: "Resumes analyzed" },
                            { value: "3.2x", label: "More interviews" },
                            { value: "4.9/5", label: "User rating" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                                <div className="text-sm text-white/30">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials - Single Focus */}
            <section className="px-6 py-24">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex justify-center gap-1 mb-8">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-teal-400 text-teal-400" />
                            ))}
                        </div>
                        <blockquote className="text-2xl md:text-3xl font-medium leading-snug mb-8">
                            "I've reviewed thousands of resumes as a hiring manager. This tool catches exactly what we look for."
                        </blockquote>
                        <div className="text-white/60">
                            <span className="font-medium text-white">Marcus Williams</span>
                            <span className="text-white/30 mx-2">·</span>
                            VP Engineering, Series C Startup
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FAQ */}
            <section className="px-6 py-24">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-medium tracking-tight text-center mb-12">
                        Common questions
                    </h2>

                    <div className="divide-y divide-white/5 border-y border-white/5">
                        {faqs.map((faq, i) => (
                            <FAQItem
                                key={i}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openFaq === i}
                                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing - Clean Cards */}
            <section className="px-6 py-24">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-medium tracking-tight mb-4">Pricing</h2>
                        <p className="text-white/40">Start free. Upgrade when ready.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {/* Free */}
                        <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01]">
                            <div className="text-sm text-white/40 mb-3">Free</div>
                            <div className="text-4xl font-bold mb-8">$0</div>
                            <ul className="space-y-4 mb-8">
                                {["3 analyses", "Full verdict", "Rewrites", "Critical Miss"].map((f) => (
                                    <li key={f} className="flex items-center gap-3 text-sm text-white/50">
                                        <Check className="w-4 h-4 text-white/20" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-3.5 rounded-full border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors">
                                Get started
                            </button>
                        </div>

                        {/* Pro */}
                        <div className="p-8 rounded-3xl border border-teal-500/30 bg-teal-500/5 relative">
                            <div className="text-sm text-teal-400 mb-3">Pro</div>
                            <div className="text-4xl font-bold mb-8">
                                $12<span className="text-lg text-white/40 font-normal">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {["Unlimited analyses", "LinkedIn reviews", "Job matching", "Chrome extension", "Priority support"].map((f) => (
                                    <li key={f} className="flex items-center gap-3 text-sm text-white/50">
                                        <Check className="w-4 h-4 text-teal-400" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-3.5 rounded-full bg-teal-500 text-black text-sm font-medium hover:bg-teal-400 transition-colors">
                                Upgrade to Pro
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-6 py-24">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-6">
                        Ready to see the truth?
                    </h2>
                    <p className="text-white/40 mb-10">
                        Get your 7-second verdict in 60 seconds.
                    </p>
                    <button className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-teal-400 transition-colors">
                        Upload your resume
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Footer - Minimal */}
            <footer className="px-6 py-8 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-4 h-4 text-teal-400" />
                        <span className="text-sm text-white/30">© 2026</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-white/30">
                        <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
