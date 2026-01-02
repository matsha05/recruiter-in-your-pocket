"use client";

import { motion } from "framer-motion";

/**
 * LinkedIn vs Resume Comparison Diagram (v2.0)
 * 
 * Premium upgrade following diagram-visual-spec.md
 * Type B: Comparison Flow with visual depth and connection
 * 
 * Shows how LinkedIn and Resume work together in the hiring process
 */
export function LinkedInResumeFlow() {
    return (
        <figure className="w-full max-w-[540px] mx-auto my-12 group select-none">
            <motion.div
                className="relative bg-white dark:bg-card border border-border/40 rounded-xl overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                viewport={{ once: true, margin: "-50px" }}
            >
                {/* Header */}
                <div className="bg-muted/30 dark:bg-muted/10 px-6 py-4 border-b border-border/30">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                        Discovery vs Evaluation
                    </span>
                </div>

                <div className="p-6">
                    {/* Two columns comparison */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* LinkedIn Column */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                            viewport={{ once: true }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 border border-[#0A66C2]/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-display text-base font-semibold text-foreground">LinkedIn</h3>
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">Discovery</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {[
                                    {
                                        text: "Recruiters search here first", icon: (
                                            <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                            </svg>
                                        )
                                    },
                                    {
                                        text: "Shows you're a real person", icon: (
                                            <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" />
                                            </svg>
                                        )
                                    },
                                    {
                                        text: "Displays your network", icon: (
                                            <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                            </svg>
                                        )
                                    },
                                    {
                                        text: "Interviewers check it too", icon: (
                                            <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )
                                    },
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.text}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, ease: "easeOut", delay: 0.3 + i * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/20 dark:bg-muted/10 border border-border/20"
                                    >
                                        {item.icon}
                                        <span className="text-xs text-muted-foreground">{item.text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Resume Column */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                            viewport={{ once: true }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-brand/10 dark:bg-brand/20 border border-brand/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-display text-base font-semibold text-foreground">Resume</h3>
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">Evaluation</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {[
                                    {
                                        text: "Shows depth of experience", icon: (
                                            <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
                                            </svg>
                                        )
                                    },
                                    {
                                        text: "Details accomplishments", icon: (
                                            <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                            </svg>
                                        )
                                    },
                                    {
                                        text: "Tailored per application", icon: (
                                            <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
                                            </svg>
                                        )
                                    },
                                    {
                                        text: "The interview prep doc", icon: (
                                            <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                <line x1="9" y1="3" x2="9" y2="21" />
                                            </svg>
                                        )
                                    },
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.text}
                                        initial={{ opacity: 0, x: 10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, ease: "easeOut", delay: 0.4 + i * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/20 dark:bg-muted/10 border border-border/20"
                                    >
                                        {item.icon}
                                        <span className="text-xs text-muted-foreground">{item.text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Key Takeaway */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.9 }}
                        viewport={{ once: true }}
                        className="mt-6 bg-gradient-to-r from-[#0A66C2]/5 to-brand/5 dark:from-[#0A66C2]/10 dark:to-brand/10 rounded-lg p-4 border border-border/20"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-card border border-border/40 shadow-sm flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    You need both
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Without LinkedIn, recruiters can&apos;t find you. Without a strong resume, they can&apos;t evaluate you.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — Better Together</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    LinkedIn drives discovery, resumes drive evaluation
                </span>
            </figcaption>
        </figure>
    );
}
