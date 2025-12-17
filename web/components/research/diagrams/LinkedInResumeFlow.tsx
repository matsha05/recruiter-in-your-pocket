"use client";

import { motion } from "framer-motion";

/**
 * LinkedIn vs Resume Comparison Diagram (v4)
 * 
 * Design improvements:
 * - Remove jargon ("cold outreach" → clearer language)
 * - Emphasize they work TOGETHER (hand-in-hand)
 * - Stress importance of having LinkedIn profile
 * - Keep the two-list format user liked
 */
export function LinkedInResumeFlow() {
    return (
        <div className="w-full max-w-lg mx-auto my-8">
            <div className="relative bg-card border border-border/20 rounded-md p-4 md:p-6 shadow-sm">
                {/* Header */}
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center mb-6">
                    Better together
                </p>

                {/* Side by side comparison */}
                <div className="grid grid-cols-2 gap-6">
                    {/* LinkedIn Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="text-center"
                    >
                        {/* Icon */}
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-md border border-[#0A66C2]/30 bg-[#0A66C2]/10 mb-4">
                            <svg className="w-7 h-7 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </div>

                        <h3 className="font-serif text-lg font-medium text-foreground mb-2">
                            LinkedIn
                        </h3>

                        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
                            How they find you
                        </p>

                        {/* What it does */}
                        <div className="space-y-2 text-left">
                            <div className="flex items-start gap-2">
                                <span className="text-brand mt-0.5">→</span>
                                <span className="text-sm text-muted-foreground">Recruiters search here first</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-brand mt-0.5">→</span>
                                <span className="text-sm text-muted-foreground">Shows you're a real person</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-brand mt-0.5">→</span>
                                <span className="text-sm text-muted-foreground">Displays your network</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-brand mt-0.5">→</span>
                                <span className="text-sm text-muted-foreground">Interviewers check it too</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Resume Column */}
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="text-center"
                    >
                        {/* Icon */}
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-md border border-brand/30 bg-brand/10 mb-4">
                            <svg className="w-7 h-7 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                        </div>

                        <h3 className="font-serif text-lg font-medium text-foreground mb-2">
                            Resume
                        </h3>

                        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
                            How they evaluate you
                        </p>

                        {/* What it does */}
                        <div className="space-y-2 text-left">
                            <div className="flex items-start gap-2">
                                <span className="text-brand mt-0.5">→</span>
                                <span className="text-sm text-muted-foreground">Shows depth of experience</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-brand mt-0.5">→</span>
                                <span className="text-sm text-muted-foreground">Details your accomplishments</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-brand mt-0.5">→</span>
                                <span className="text-sm text-muted-foreground">Tailored per application</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-brand mt-0.5">→</span>
                                <span className="text-sm text-muted-foreground">The interview prep doc</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Key insight - simplified */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="mt-8 pt-6 border-t border-border/20"
                >
                    <div className="bg-secondary/30 rounded-sm p-4 text-center">
                        <p className="text-sm text-foreground font-medium mb-1">
                            You need both.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Without a LinkedIn profile, recruiters can't find you. Without a strong resume,
                            they can't evaluate you. They work hand-in-hand.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Figure Caption */}
            <p className="text-center mt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Fig. 1 — They work together
                </span>
            </p>
        </div>
    );
}
