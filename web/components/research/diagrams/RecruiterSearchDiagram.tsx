"use client";

import { motion } from "framer-motion";

/**
 * Recruiter Search Behavior Diagram (v2.0)
 * 
 * Shows evidence boundary: what LinkedIn publishes vs what is not disclosed
 */
export function RecruiterSearchDiagram() {
    const published = [
        "Platform scale & activity metrics",
        "Recruiter usage surveys",
        "Skills-first sourcing outcomes"
    ];

    const notDisclosed = [
        "Exact ranking weights",
        "Search scoring algorithm",
        "Full visibility model"
    ];

    return (
        <figure className="w-full max-w-[520px] mx-auto my-12 group select-none">
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
                        Evidence boundary
                    </span>
                </div>

                <div className="p-6 grid md:grid-cols-2 gap-4">
                    {/* Published */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                        viewport={{ once: true }}
                        className="rounded-lg border border-brand/30 bg-brand/5 dark:bg-brand/10 p-4"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-brand">
                                Published
                            </span>
                        </div>
                        <ul className="space-y-2">
                            {published.map((item, i) => (
                                <motion.li
                                    key={item}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                                    viewport={{ once: true }}
                                    className="text-xs text-foreground flex items-center gap-2"
                                >
                                    <span className="text-brand">✓</span>
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Not Disclosed */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                        viewport={{ once: true }}
                        className="rounded-lg border border-border/30 bg-muted/10 p-4"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
                                Not disclosed
                            </span>
                        </div>
                        <ul className="space-y-2">
                            {notDisclosed.map((item, i) => (
                                <motion.li
                                    key={item}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                                    viewport={{ once: true }}
                                    className="text-xs text-muted-foreground flex items-center gap-2"
                                >
                                    <span className="text-muted-foreground/50">—</span>
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — Evidence Boundary</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    What LinkedIn discloses vs what remains opaque
                </span>
            </figcaption>
        </figure>
    );
}
