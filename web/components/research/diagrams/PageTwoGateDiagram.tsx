"use client";

import { motion } from "framer-motion";

/**
 * Page Two Gate Diagram (v2.0)
 * 
 * Unique diagram for page-two-gate article
 * Shows the conditional nature of page 2: earned by page 1
 */
export function PageTwoGateDiagram() {
    return (
        <figure className="w-full max-w-[480px] mx-auto my-12 group select-none">
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
                        The attention gate
                    </span>
                </div>

                <div className="p-6">
                    <div className="flex items-stretch gap-3">
                        {/* Page 1 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                            viewport={{ once: true }}
                            className="flex-1 rounded-lg border-2 border-brand/40 bg-brand/5 dark:bg-brand/10 p-4 text-center"
                        >
                            <div className="text-3xl font-display font-bold text-brand mb-2">1</div>
                            <p className="text-[10px] font-mono uppercase tracking-wider text-brand/70">Page one</p>
                            <p className="text-xs text-muted-foreground mt-2">
                                First scan happens here
                            </p>
                        </motion.div>

                        {/* Gate */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center justify-center"
                        >
                            <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                                <svg className="w-4 h-4 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <p className="text-[9px] text-muted-foreground/50 mt-1">Gate</p>
                        </motion.div>

                        {/* Page 2 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                            viewport={{ once: true }}
                            className="flex-1 rounded-lg border border-border/40 bg-muted/10 p-4 text-center"
                        >
                            <div className="text-3xl font-display font-bold text-muted-foreground/50 mb-2">2</div>
                            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50">Page two</p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Only read if page 1 earns it
                            </p>
                        </motion.div>
                    </div>

                    {/* Key insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
                        viewport={{ once: true }}
                        className="mt-6 bg-muted/20 dark:bg-muted/10 rounded-lg p-4 border border-border/20"
                    >
                        <p className="text-xs text-muted-foreground leading-relaxed text-center">
                            <span className="font-medium text-foreground">Rule:</span> Page 2 is earned, not given. If page 1 doesn&apos;t hook them, page 2 won&apos;t be read.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — The Gate</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Why page 2 depends entirely on page 1
                </span>
            </figcaption>
        </figure>
    );
}
