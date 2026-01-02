"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowDown, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: The Verdict
 * Elite-tier design inspired by Linear/Arc/Vercel
 * - Cinematic scroll-driven storytelling
 * - Real-time "verdict" being typed
 * - Glassmorphic UI elements
 * - Smooth parallax and reveal animations
 */

// Animated typing effect component
function TypedText({ text, delay = 0, speed = 40 }: { text: string; delay?: number; speed?: number }) {
    const [displayText, setDisplayText] = useState("");
    const [started, setStarted] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView && !started) {
            const timeout = setTimeout(() => {
                setStarted(true);
            }, delay);
            return () => clearTimeout(timeout);
        }
    }, [isInView, delay, started]);

    useEffect(() => {
        if (!started) return;
        let i = 0;
        const interval = setInterval(() => {
            if (i <= text.length) {
                setDisplayText(text.slice(0, i));
                i++;
            } else {
                clearInterval(interval);
            }
        }, speed);
        return () => clearInterval(interval);
    }, [started, text, speed]);

    return (
        <span ref={ref}>
            {displayText}
            {started && displayText.length < text.length && (
                <motion.span
                    className="inline-block w-0.5 h-[1em] bg-current ml-0.5"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                />
            )}
        </span>
    );
}

// Animated number counter
function AnimatedNumber({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const duration = 1500;
        const increment = value / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(decimals > 0 ? parseFloat(start.toFixed(decimals)) : Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [isInView, value, decimals]);

    return (
        <span ref={ref}>
            {decimals > 0 ? count.toFixed(decimals) : count}{suffix}
        </span>
    );
}

// Floating glassmorphic card
function GlassCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    return (
        <motion.div
            className={`relative backdrop-blur-xl bg-white/[0.08] border border-white/[0.15] rounded-2xl shadow-2xl ${className}`}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Gradient border glow */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            {children}
        </motion.div>
    );
}

// Animated resume scan line
function ScanLine() {
    return (
        <motion.div
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
            }}
        />
    );
}

// The verdict panel with live typing
function VerdictPanel() {
    const [stage, setStage] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (!isInView) return;
        const timers = [
            setTimeout(() => setStage(1), 500),
            setTimeout(() => setStage(2), 2000),
            setTimeout(() => setStage(3), 4000),
            setTimeout(() => setStage(4), 6000),
        ];
        return () => timers.forEach(clearTimeout);
    }, [isInView]);

    return (
        <div ref={ref} className="relative">
            <GlassCard className="p-8 md:p-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="text-xs text-white/40 font-mono">resume_verdict.txt</div>
                </div>

                {/* Terminal-style output */}
                <div className="font-mono text-sm space-y-4">
                    <AnimatePresence>
                        {stage >= 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-white/60"
                            >
                                <span className="text-cyan-400">→</span> Analyzing resume structure...
                            </motion.div>
                        )}
                        {stage >= 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-white/60"
                            >
                                <span className="text-cyan-400">→</span> Simulating 7.4-second recruiter scan...
                            </motion.div>
                        )}
                        {stage >= 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <div className="text-amber-400 mb-2">⚠ Critical miss detected:</div>
                                <div className="pl-4 border-l-2 border-amber-400/30 text-white/80">
                                    <TypedText text="Your first bullet says 'Responsible for managing team' - that's a red flag for passive ownership." speed={30} />
                                </div>
                            </motion.div>
                        )}
                        {stage >= 4 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-6 p-4 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30"
                            >
                                <div className="text-cyan-400 text-xs uppercase tracking-wider mb-2">Verdict</div>
                                <div className="text-white text-lg">
                                    <TypedText text="This resume needs stronger impact verbs and quantified achievements to pass the 7-second test." speed={25} delay={200} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {stage < 4 && (
                        <motion.div
                            className="flex items-center gap-2 text-white/40"
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <div className="w-2 h-2 rounded-full bg-cyan-400" />
                            Processing...
                        </motion.div>
                    )}
                </div>
            </GlassCard>

            {/* Decorative glow */}
            <div className="absolute -inset-20 -z-10 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-3xl rounded-full" />
        </div>
    );
}

export function LandingTheVerdict() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });
    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
            {/* Gradient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[80px]" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-full px-6 py-3">
                        <div className="flex items-center gap-2">
                            <PocketMark className="w-6 h-6 text-cyan-400" />
                            <span className="font-medium">RIYP</span>
                        </div>
                        <button className="px-5 py-2 bg-white text-black font-medium text-sm rounded-full hover:bg-white/90 transition-colors">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 pt-20">
                <motion.div
                    className="max-w-4xl mx-auto text-center"
                    style={{ opacity: heroOpacity, y: heroY }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.1] text-sm text-white/70 mb-8">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                            The truth about your resume
                        </div>

                        <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-[0.95] mb-8">
                            <span className="block">
                                <AnimatedNumber value={7} />.
                                <AnimatedNumber value={4} /> seconds
                            </span>
                            <span className="block text-white/40">to impress.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
                            That's how long you have. See exactly what recruiters see - and what they miss.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-semibold rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                                Get Your Verdict
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <span className="text-sm text-white/40">Free · 60 seconds · No signup</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-12 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <ArrowDown className="w-6 h-6 text-white/30" />
                </motion.div>
            </section>

            {/* Verdict Demo */}
            <section className="relative px-6 py-32">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Watch it happen</h2>
                        <p className="text-white/50 text-lg">This is what a real verdict looks like</p>
                    </motion.div>

                    <VerdictPanel />
                </div>
            </section>

            {/* Stats */}
            <section className="px-6 py-32">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { value: 7.4, suffix: "s", decimals: 1, label: "Average resume scan", desc: "That's all you get to make an impression" },
                            { value: 75, suffix: "%", label: "Rejected instantly", desc: "Most resumes fail in the first pass" },
                            { value: 3, suffix: "x", label: "More callbacks", desc: "After applying our methodology" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                                    <AnimatedNumber value={stat.value} suffix={stat.suffix} decimals={stat.decimals || 0} />
                                </div>
                                <div className="text-white font-medium mb-1">{stat.label}</div>
                                <div className="text-sm text-white/40">{stat.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What you get */}
            <section className="px-6 py-32">
                <div className="max-w-5xl mx-auto">
                    <motion.h2
                        className="text-3xl md:text-5xl font-bold text-center mb-16"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        Three things you'll know
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: "01",
                                title: "The raw verdict",
                                description: "What a recruiter actually thinks in those 7.4 seconds. No sugarcoating.",
                                gradient: "from-cyan-500/20 to-cyan-500/5",
                            },
                            {
                                icon: "02",
                                title: "Your critical miss",
                                description: "The single biggest gap killing your chances. Usually invisible to you.",
                                gradient: "from-purple-500/20 to-purple-500/5",
                            },
                            {
                                icon: "03",
                                title: "The rewrites",
                                description: "Exact replacement text for every weak line. Copy, paste, done.",
                                gradient: "from-pink-500/20 to-pink-500/5",
                            },
                        ].map((item, i) => (
                            <GlassCard key={item.title} className="p-8" delay={i * 0.1}>
                                <div className="text-xs font-mono text-cyan-400 mb-4">{item.icon}</div>
                                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                                <p className="text-white/50 leading-relaxed">{item.description}</p>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-32">
                <div className="max-w-3xl mx-auto text-center">
                    <GlassCard className="p-12 md:p-16">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Ready for the truth?
                            </h2>
                            <p className="text-white/50 text-lg mb-10">
                                60 seconds. Free. No signup required.
                            </p>
                            <button className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-semibold text-lg rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                                Get Your Verdict
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </GlassCard>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-12 border-t border-white/[0.05]">
                <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-white/40">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-5 h-5" />
                        <span>© 2026 RIYP</span>
                    </div>
                    <div>Private · Secure · Research-backed</div>
                </div>
            </footer>
        </div>
    );
}
