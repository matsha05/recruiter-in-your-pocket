"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Command, Search, Folder, Star } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Landing Page: Arc Sidebar
 * Inspiration: Arc Browser
 * - Command palette aesthetic
 * - Sidebar-centric design
 * - Clean, focused, productivity-oriented
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

export function LandingArcSidebar() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#3730a3] text-white selection:bg-violet-500/30">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center">
                            <PocketMark className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium">RIYP</span>
                    </div>
                    <button className="text-sm font-medium px-5 py-2.5 rounded-full bg-white text-violet-900 hover:bg-gray-100 transition-colors">
                        Get started
                    </button>
                </div>
            </nav>

            {/* Hero with Command Palette Aesthetic */}
            <section className="px-6 py-24">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight mb-6">
                            A better way to<br />
                            <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                                analyze your resume
                            </span>
                        </h1>

                        <p className="text-xl text-white/60 max-w-xl mx-auto mb-10">
                            See what recruiters see in 7.4 seconds. Get the verdict. Fix what matters.
                        </p>
                    </motion.div>

                    {/* Command Palette Style UI */}
                    <motion.div
                        className="max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
                            {/* Search bar */}
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                                <Search className="w-5 h-5 text-white/60" />
                                <span className="text-white/60">Upload resume or paste job URL...</span>
                                <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded bg-white/10 text-xs text-white/60">
                                    <Command className="w-3 h-3" /> K
                                </div>
                            </div>

                            {/* Actions list */}
                            <div className="p-2">
                                {[
                                    { icon: Star, label: "Get 7-Second Verdict", active: true },
                                    { icon: Search, label: "Find Critical Miss", active: false },
                                    { icon: Folder, label: "Get Red Pen Rewrites", active: false },
                                ].map((item, i) => (
                                    <div
                                        key={item.label}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg ${item.active ? "bg-white/10" : "hover:bg-white/5"
                                            } transition-colors cursor-pointer`}
                                    >
                                        <item.icon className={`w-5 h-5 ${item.active ? "text-pink-400" : "text-white/60"}`} />
                                        <span className={item.active ? "text-white" : "text-white/60"}>{item.label}</span>
                                        {item.active && (
                                            <ArrowRight className="w-4 h-4 text-pink-400 ml-auto" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Bottom bar */}
                            <div className="flex items-center justify-between px-5 py-3 bg-white/5 text-xs text-white/60">
                                <span>Free · 60 seconds · Private</span>
                                <span>↵ to select</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="px-6 py-24">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: 7.4, suffix: "s", decimals: 1, label: "Scan time" },
                            { value: 14, label: "Studies" },
                            { value: 75, suffix: "%", label: "Quick reject" },
                            { value: 3, suffix: "x", label: "More callbacks" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent mb-2">
                                    <CountUp end={stat.value} suffix={stat.suffix || ""} decimals={stat.decimals || 0} />
                                </div>
                                <div className="text-sm text-white/60">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="px-6 py-24">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "The Verdict",
                                description: "Raw 7-second first impression. No filter.",
                            },
                            {
                                title: "Critical Miss",
                                description: "The one thing killing your chances.",
                            },
                            {
                                title: "Red Pen Rewrites",
                                description: "Exact fixes. Copy and paste.",
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <h3 className="text-white text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-white/70 text-sm">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-32">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-white text-4xl font-bold mb-8">Ready for the truth?</h2>
                    <button className="group inline-flex items-center gap-2 px-10 py-5 rounded-full bg-white text-violet-900 font-medium text-lg hover:bg-gray-100 transition-colors">
                        Get your verdict
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-white/70 mt-6">Press ⌘K to start</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-white/70">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-gradient-to-br from-pink-500 to-violet-600" />
                        <span>© 2026 RIYP</span>
                    </div>
                    <span>Encrypted · Private · Auto-deleted</span>
                </div>
            </footer>
        </div>
    );
}
