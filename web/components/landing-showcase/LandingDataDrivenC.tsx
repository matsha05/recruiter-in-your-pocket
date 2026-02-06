"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Lock, Trash2, ArrowRight, BookOpen, BarChart2, Target, TrendingUp, Shield, Check } from "lucide-react";
import { PocketMark } from "@/components/icons";

/**
 * Data-Driven Variation C: Dense Dashboard
 * 
 * Design Philosophy Alignment:
 * - Raycast Density: Maximum information density
 * - Quiet Power: Data speaks for itself
 * - Editorial Authority: Strong hierarchy through weight, not size
 * - Reference: Raycast, Linear command palette feel
 */

function StatCell({ value, label, sublabel }: { value: string; label: string; sublabel?: string }) {
    return (
        <div className="p-4 border-r border-slate-100 last:border-r-0">
            <div className="text-2xl font-bold font-mono text-slate-900">{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
            {sublabel && <div className="text-[10px] text-slate-400 mt-0.5">{sublabel}</div>}
        </div>
    );
}

function SignalRow({ icon: Icon, label, value, source }: { icon: any; label: string; value: number; source: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });

    return (
        <div ref={ref} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-b-0">
            <Icon className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
            <span className="text-sm text-slate-700 flex-1">{label}</span>
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-teal-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: isInView ? `${value}%` : 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                />
            </div>
            <span className="w-10 text-right text-xs font-mono text-slate-900">{value}%</span>
            <span className="text-[10px] text-slate-400 w-16">{source}</span>
        </div>
    );
}

export function LandingDataDrivenC() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-500/20">
            {/* Nav - Compact */}
            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
                <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-4 h-4 text-teal-600" />
                        <span className="text-sm font-medium">RIYP</span>
                        <span className="text-xs text-slate-400 hidden sm:inline">Research-backed resume analysis</span>
                    </div>
                    <button className="text-xs font-medium px-3 py-1.5 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-200">
                        Analyze
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 py-6">
                {/* Top row - Stats bar */}
                <div className="bg-white rounded-lg border border-slate-200 mb-4">
                    <div className="grid grid-cols-4 divide-x divide-slate-100">
                        <StatCell value="7.4s" label="Avg. scan time" sublabel="Ladders 2018" />
                        <StatCell value="75%" label="Rejected <10s" sublabel="Indeed 2021" />
                        <StatCell value="250+" label="Apps per role" sublabel="LinkedIn 2023" />
                        <StatCell value="14" label="Studies cited" sublabel="Peer-reviewed" />
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-4">
                    {/* Main panel */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Hero card */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-xl font-medium mb-1">
                                        Understand how you're actually being evaluated
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        See what recruiters see in 7.4 seconds. Research-backed.
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold font-mono text-teal-600">87</div>
                                    <div className="text-[10px] text-slate-400">Sample score</div>
                                </div>
                            </div>
                            <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded bg-teal-600 text-white font-medium text-sm hover:bg-teal-700 transition-colors duration-200">
                                Get Your Analysis
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-slate-400">
                                <span>Free</span>
                                <span>•</span>
                                <span>60 seconds</span>
                                <span>•</span>
                                <span>No signup</span>
                            </div>
                        </div>

                        {/* Signal model */}
                        <div className="bg-white rounded-lg border border-slate-200 p-4">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3">
                                The 6-Second Signal Model
                            </div>
                            <SignalRow icon={Target} label="Story Signal" value={35} source="NBER '19" />
                            <SignalRow icon={TrendingUp} label="Impact Signal" value={30} source="Bock '15" />
                            <SignalRow icon={BarChart2} label="Clarity Signal" value={20} source="Ladders '18" />
                            <SignalRow icon={BookOpen} label="Readability Signal" value={15} source="Eye-track" />
                        </div>

                        {/* What you get */}
                        <div className="bg-white rounded-lg border border-slate-200 p-4">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3">
                                What you'll receive
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    "7-Second Verdict",
                                    "Critical Miss Identification",
                                    "Red Pen Rewrites",
                                    "4-Dimension Score",
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                                        <Check className="w-3.5 h-3.5 text-teal-600" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Trust badges */}
                        <div className="bg-white rounded-lg border border-slate-200 p-4">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3">
                                Data Security
                            </div>
                            <div className="space-y-2">
                                {[
                                    { icon: Lock, label: "End-to-end encrypted" },
                                    { icon: Trash2, label: "Delete anytime" },
                                    { icon: Shield, label: "Never trains AI models" },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-2 text-xs text-slate-500">
                                        <item.icon className="w-3.5 h-3.5 text-slate-400" />
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Testimonial */}
                        <div className="bg-white rounded-lg border border-slate-200 p-4">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3">
                                Testimonial
                            </div>
                            <p className="text-sm text-slate-600 mb-3 italic">
                                "The data-backed approach made me trust the recommendations."
                            </p>
                            <div className="text-xs">
                                <span className="font-medium text-slate-700">Dr. Sarah Chen</span>
                                <span className="text-slate-400"> · prev. Meta</span>
                            </div>
                        </div>

                        {/* Methodology link */}
                        <div className="bg-white rounded-lg border border-slate-200 p-4">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                                Research
                            </div>
                            <a href="#" className="text-sm text-teal-600 hover:text-teal-700 transition-colors duration-200">
                                View full methodology →
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="px-4 py-4 border-t border-slate-200 bg-white mt-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                        <PocketMark className="w-3 h-3" />
                        <span>© 2026 RIYP</span>
                    </div>
                    <div>Methodology reviewed by hiring professionals from Google, Meta, and Stripe</div>
                </div>
            </footer>
        </div>
    );
}
