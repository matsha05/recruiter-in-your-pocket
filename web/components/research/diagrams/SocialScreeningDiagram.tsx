"use client";

import { motion } from "framer-motion";

/**
 * Social Screening Diagram (v2.0)
 * 
 * Shows how different platforms serve different evaluation stages
 */
export function SocialScreeningDiagram() {
    const platforms = [
        {
            name: "LinkedIn",
            color: "blue",
            uses: ["Discovery", "Identity validation", "Outreach channel"]
        },
        {
            name: "Portfolio Sites",
            color: "violet",
            uses: ["Work samples", "Craft proof"]
        },
        {
            name: "Other Social",
            color: "muted",
            uses: ["Reputation checks", "Culture fit signals"]
        }
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
                        Platform by purpose
                    </span>
                </div>

                <div className="p-6">
                    <div className="grid md:grid-cols-3 gap-3">
                        {platforms.map((platform, i) => (
                            <motion.div
                                key={platform.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 + i * 0.1 }}
                                viewport={{ once: true }}
                                className={`rounded-lg p-4 border ${platform.color === "blue"
                                        ? "border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10"
                                        : platform.color === "violet"
                                            ? "border-violet-500/30 bg-violet-500/5 dark:bg-violet-500/10"
                                            : "border-border/30 bg-muted/10"
                                    }`}
                            >
                                <p className={`text-xs font-mono uppercase tracking-wider mb-3 ${platform.color === "blue"
                                        ? "text-blue-600 dark:text-blue-400"
                                        : platform.color === "violet"
                                            ? "text-violet-600 dark:text-violet-400"
                                            : "text-muted-foreground"
                                    }`}>
                                    {platform.name}
                                </p>
                                <ul className="space-y-1.5">
                                    {platform.uses.map((use, j) => (
                                        <motion.li
                                            key={use}
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            transition={{ duration: 0.3, delay: 0.3 + i * 0.1 + j * 0.05 }}
                                            viewport={{ once: true }}
                                            className="text-[11px] text-muted-foreground"
                                        >
                                            {use}
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>

                    {/* Key insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
                        viewport={{ once: true }}
                        className="mt-6 bg-blue-500/5 dark:bg-blue-500/10 rounded-lg p-4 border border-blue-500/20"
                    >
                        <p className="text-xs text-muted-foreground leading-relaxed text-center">
                            <span className="font-medium text-blue-600 dark:text-blue-400">LinkedIn dominates discovery.</span> Other platforms fill specific evaluation gaps.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — Platform Roles</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Different platforms serve different evaluation stages
                </span>
            </figcaption>
        </figure>
    );
}
