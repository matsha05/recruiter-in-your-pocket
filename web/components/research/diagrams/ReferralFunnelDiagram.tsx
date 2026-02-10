"use client";

import { motion } from "framer-motion";
import { DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";

/**
 * Referral Information Channel Diagram (v2.0)
 * 
 * Premium upgrade following diagram-visual-spec.md
 * Type C: Funnel/Stack with layered depth and animated build
 * 
 * Shows how referrals inject additional signal into the hiring pipeline.
 */
export function ReferralFunnelDiagram() {
    const coldStages = ["Apply", "Screen", "Interview"];
    const referredStages = ["Apply", "Screen", "Interview"];

    return (
        <DiagramFigure className="w-full max-w-[480px] mx-auto my-12 group select-none">
            <DiagramFrame
                className="riyp-diagram-shell"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: "-50px" }}
            >
                {/* Header */}
                <div className="riyp-diagram-head">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                        Information flow comparison
                    </span>
                </div>

                <div className="p-6 space-y-6">
                    {/* Cold Apply Flow */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        viewport={{ once: true }}
                        className="space-y-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-20 shrink-0">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                                    Cold
                                </span>
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                                {coldStages.map((stage, i) => (
                                    <motion.div
                                        key={stage}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex-1 relative"
                                    >
                                        <div className="border border-slate-200 bg-slate-50 rounded-lg p-3 text-center">
                                            <span className="text-xs text-slate-500 font-medium">
                                                {stage}
                                            </span>
                                        </div>
                                        {i < coldStages.length - 1 && (
                                            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 text-center z-10">
                                                <span className="text-slate-300 text-sm">→</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <div className="ml-20 pl-3">
                            <div className="h-1 bg-slate-200 rounded-full" />
                        </div>
                    </motion.div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-dashed border-slate-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-3 text-[9px] font-mono uppercase tracking-widest text-slate-400">
                                vs
                            </span>
                        </div>
                    </div>

                    {/* Referred Flow */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                        viewport={{ once: true }}
                        className="space-y-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-20 shrink-0">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-700 font-medium">
                                    Referred
                                </span>
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                                {referredStages.map((stage, i) => (
                                    <motion.div
                                        key={stage}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.6 + i * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex-1 relative"
                                    >
                                        <div className={`border rounded-lg p-3 text-center ${stage === "Screen"
                                            ? "border-slate-300 bg-slate-50"
                                            : "border-slate-200 bg-slate-50"
                                            }`}>
                                            <span className={`text-xs font-medium ${stage === "Screen"
                                                ? "text-slate-900"
                                                : "text-slate-500"
                                                }`}>
                                                {stage}
                                            </span>
                                        </div>
                                        {i < referredStages.length - 1 && (
                                            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 text-center z-10">
                                                <span className="text-slate-400 text-sm">→</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Info Packet Injection */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 8 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
                            viewport={{ once: true }}
                            className="ml-20 pl-3 flex items-center gap-3"
                        >
                            <div className="h-6 w-px bg-slate-300" />
                            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5">
                                <div className="w-2 h-2 rounded-full bg-slate-500" />
                                <span className="text-[10px] font-medium text-slate-700">
                                    + Referrer context injected
                                </span>
                            </div>
                        </motion.div>

                        <div className="ml-20 pl-3">
                            <div className="h-1 bg-slate-300 rounded-full" />
                        </div>
                    </motion.div>

                    {/* Key Insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 1.0 }}
                        viewport={{ once: true }}
                        className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-900">
                                    Information asymmetry
                                </p>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Referred candidates enter screening with additional context the cold candidate cannot provide.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </DiagramFrame>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — Information Channel</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    How referrals inject signal into the hiring pipeline
                </span>
            </figcaption>
        </DiagramFigure>
    );
}
