"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Shield, ArrowRight, Check, Play, Pause, AlertTriangle, TrendingUp, Star, Zap, ChevronRight } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page Variation: Immersive Product Preview
 * 
 * Style: Story-driven with interactive product demo
 * - Dark theme with glowing teal accents
 * - Live product preview in hero
 * - Micro-animations showing functionality
 * - Problem-to-solution narrative flow
 */

// Animated typing effect for the verdict
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
    const [displayText, setDisplayText] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            let index = 0;
            const interval = setInterval(() => {
                if (index <= text.length) {
                    setDisplayText(text.slice(0, index));
                    index++;
                } else {
                    setIsComplete(true);
                    clearInterval(interval);
                }
            }, 30);
            return () => clearInterval(interval);
        }, delay);
        return () => clearTimeout(timeout);
    }, [text, delay]);

    return (
        <span>
            {displayText}
            {!isComplete && <span className="animate-pulse">|</span>}
        </span>
    );
}

// Live scanning animation
function ScanningAnimation() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400 to-transparent"
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </div>
    );
}

export function LandingImmersivePreview() {
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);

    // Cycle through demo steps
    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % 4);
        }, 3000);
        return () => clearInterval(interval);
    }, [isPlaying]);

    const demoSteps = [
        { label: "Scanning resume...", detail: "Analyzing 47 data points" },
        { label: "Calculating signal strength", detail: "Story: 92% | Impact: 78%" },
        { label: "Detecting critical gaps", detail: "1 major issue found" },
        { label: "Generating verdict", detail: "Your report is ready" },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-teal-500/30">
            {/* Ambient glow effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <PocketMark className="w-6 h-6 text-teal-400" />
                            <div className="absolute inset-0 bg-teal-400/50 blur-md" />
                        </div>
                        <span className="font-medium text-sm tracking-tight">Recruiter in Your Pocket</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Research</a>
                        <button className="text-sm font-medium px-4 py-2 rounded-lg bg-teal-500 text-black hover:bg-teal-400 transition-colors">
                            Try Free
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section with Live Preview */}
            <section className="relative px-6 py-20 lg:py-32">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Story-driven copy */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            {/* Problem statement */}
                            <div className="flex items-center gap-2 mb-6">
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                <span className="text-sm text-amber-400/80">250+ applicants per role. 7 seconds per resume.</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] mb-6">
                                Watch your resume through a
                                <span className="text-teal-400"> recruiter's eyes</span>
                            </h1>

                            <p className="text-lg text-white/50 mb-8 max-w-lg">
                                See exactly what gets noticed, what gets missed, and what needs to change. In real-time.
                            </p>

                            {/* CTA with glow */}
                            <div className="flex flex-wrap items-center gap-4 mb-10">
                                <button className="relative group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-500 text-black font-medium hover:bg-teal-400 transition-colors">
                                    <span>Upload & Watch</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    <div className="absolute inset-0 rounded-lg bg-teal-400/50 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
                                </button>
                                <span className="text-sm text-white/30">Free • Takes 60 seconds</span>
                            </div>

                            {/* Trust signals as subtle text */}
                            <div className="flex items-center gap-4 text-xs text-white/30">
                                <span className="flex items-center gap-1.5">
                                    <Lock className="w-3 h-3" />
                                    Encrypted
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Shield className="w-3 h-3" />
                                    Never stored
                                </span>
                            </div>
                        </motion.div>

                        {/* Right: Live product preview */}
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            {/* Preview window */}
                            <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                                <ScanningAnimation />

                                {/* Window header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-white/10" />
                                            <div className="w-3 h-3 rounded-full bg-white/10" />
                                            <div className="w-3 h-3 rounded-full bg-white/10" />
                                        </div>
                                        <span className="text-[10px] font-mono text-white/30 ml-2">Live Preview</span>
                                    </div>
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="p-1.5 rounded hover:bg-white/10 transition-colors"
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-3.5 h-3.5 text-white/40" />
                                        ) : (
                                            <Play className="w-3.5 h-3.5 text-white/40" />
                                        )}
                                    </button>
                                </div>

                                {/* Demo content */}
                                <div className="p-6 min-h-[300px]">
                                    {/* Progress steps */}
                                    <div className="flex items-center gap-2 mb-8">
                                        {demoSteps.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`flex-1 h-1 rounded-full transition-colors duration-500 ${i <= currentStep ? "bg-teal-400" : "bg-white/10"
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Current step */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentStep}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-3"
                                        >
                                            <div className="text-lg font-medium text-white">
                                                {demoSteps[currentStep].label}
                                            </div>
                                            <div className="text-sm text-white/50">
                                                {demoSteps[currentStep].detail}
                                            </div>

                                            {currentStep === 3 && (
                                                <motion.div
                                                    className="mt-6 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    <div className="text-teal-400 font-medium mb-1">Verdict Ready</div>
                                                    <p className="text-sm text-white/70">
                                                        <TypewriterText
                                                            text="Strong founder story, but your $2M impact is buried. Lead with outcomes."
                                                            delay={500}
                                                        />
                                                    </p>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Floating glow behind */}
                            <div className="absolute -inset-4 bg-teal-500/10 rounded-3xl blur-xl -z-10" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Problem → Solution Flow */}
            <section className="px-6 py-24 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "The Problem",
                                description: "Recruiters spend 7.4 seconds on your resume. Most candidates never know what's being missed.",
                                color: "text-rose-400",
                            },
                            {
                                step: "02",
                                title: "The Insight",
                                description: "We reverse-engineered thousands of hiring decisions to understand exactly what recruiters scan for.",
                                color: "text-amber-400",
                            },
                            {
                                step: "03",
                                title: "The Solution",
                                description: "A real-time analysis that shows you what they see, what they miss, and how to fix it.",
                                color: "text-teal-400",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
                                className="relative"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                            >
                                <div className={`text-5xl font-bold ${item.color} opacity-20 mb-4`}>
                                    {item.step}
                                </div>
                                <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                                <p className="text-sm text-white/50 leading-relaxed">{item.description}</p>

                                {i < 2 && (
                                    <ChevronRight className="hidden md:block absolute top-1/2 -right-4 w-6 h-6 text-white/10" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="px-6 py-24 bg-white/[0.02]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-medium tracking-tight mb-4">
                            Everything you need to stand out
                        </h2>
                        <p className="text-white/50 max-w-lg mx-auto">
                            From instant analysis to actionable rewrites, we've got every angle covered.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                icon: Zap,
                                title: "7-Second Verdict",
                                description: "The recruiter's honest first impression, generated in real-time as they would see it.",
                            },
                            {
                                icon: AlertTriangle,
                                title: "Critical Miss Detection",
                                description: "The single most damaging gap in your resume — not a list, the priority.",
                            },
                            {
                                icon: TrendingUp,
                                title: "Signal Analysis",
                                description: "Four-dimension scoring: Story, Impact, Clarity, Readability. Know exactly where to focus.",
                            },
                            {
                                icon: Star,
                                title: "Red Pen Rewrites",
                                description: "Before and after for every weak bullet. Copy, paste, and watch your score climb.",
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-teal-500/20 transition-all"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 group-hover:bg-teal-500/20 transition-colors">
                                    <feature.icon className="w-5 h-5 text-teal-400" />
                                </div>
                                <h3 className="font-medium text-lg mb-2">{feature.title}</h3>
                                <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="px-6 py-24 border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                quote: "Watching my resume get scanned in real-time was a wake-up call. I fixed it that night.",
                                name: "Rachel M.",
                                role: "Product Manager → Google",
                            },
                            {
                                quote: "The live preview is genius. I finally understood why I wasn't getting callbacks.",
                                name: "James T.",
                                role: "Engineering Lead → Stripe",
                            },
                        ].map((t, i) => (
                            <motion.div
                                key={t.name}
                                className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-teal-400 text-teal-400" />
                                    ))}
                                </div>
                                <p className="text-white/80 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                                <div>
                                    <div className="font-medium">{t.name}</div>
                                    <div className="text-sm text-white/40">{t.role}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="px-6 py-24 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-medium tracking-tight mb-4">Simple, transparent pricing</h2>
                        <p className="text-white/50">Start free. Upgrade when you need more.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {/* Free */}
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                            <div className="text-sm text-white/40 mb-2">Free</div>
                            <div className="text-4xl font-bold mb-6">$0</div>
                            <ul className="space-y-3 mb-6">
                                {["3 live analyses", "Full recruiter verdict", "Red Pen rewrites", "Critical Miss detection"].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                                        <Check className="w-4 h-4 text-teal-400" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-3 rounded-xl border border-white/10 font-medium hover:bg-white/5 transition-colors">
                                Start Free
                            </button>
                        </div>

                        {/* Pro */}
                        <div className="p-6 rounded-2xl border-2 border-teal-500 bg-teal-500/5 relative">
                            <div className="absolute -top-3 right-6 px-3 py-1 bg-teal-500 text-black text-xs font-bold uppercase rounded-full">
                                Most Popular
                            </div>
                            <div className="text-sm text-teal-400 mb-2">Pro</div>
                            <div className="text-4xl font-bold mb-6">$12<span className="text-lg text-white/40">/mo</span></div>
                            <ul className="space-y-3 mb-6">
                                {["Unlimited analyses", "LinkedIn reviews", "Job matching", "Chrome extension", "Priority support"].map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                                        <Check className="w-4 h-4 text-teal-400" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-3 rounded-xl bg-teal-500 text-black font-medium hover:bg-teal-400 transition-colors">
                                Get Pro
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-4 h-4 text-teal-400" />
                        <span className="text-sm text-white/40">© 2026 Recruiter in Your Pocket</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-white/40">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Research</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
