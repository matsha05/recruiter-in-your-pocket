"use client";

import { motion } from "framer-motion";
import { DiagramFigure, DiagramFrame } from "@/components/shared/diagrams/DiagramPrimitives";

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
            color: "teal",
            uses: ["Work samples", "Craft proof"]
        },
        {
            name: "Other Social",
            color: "muted",
            uses: ["Reputation checks", "Culture fit signals"]
        }
    ];

    return (
        <DiagramFigure className="w-full max-w-[520px] mx-auto my-12 group select-none">
            <DiagramFrame
                className="riyp-diagram-shell"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: "-50px" }}
            >
                {/* Header */}
                <div className="riyp-diagram-head">
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
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.1 }}
                                viewport={{ once: true }}
                                className={`rounded-lg p-4 border ${platform.color === "blue"
                                        ? "border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10"
                                        : platform.color === "teal"
                                            ? "border-brand/30 bg-brand/5 dark:bg-brand/10"
                                            : "border-border/30 bg-muted/10"
                                    }`}
                            >
                                <p className={`text-xs font-mono uppercase tracking-wider mb-3 ${platform.color === "blue"
                                        ? "text-blue-600 dark:text-blue-400"
                                        : platform.color === "teal"
                                            ? "text-brand"
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
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
                        viewport={{ once: true }}
                        className="mt-6 bg-blue-500/5 dark:bg-blue-500/10 rounded-lg p-4 border border-blue-500/20"
                    >
                        <p className="text-xs text-muted-foreground leading-relaxed text-center">
                            <span className="font-medium text-blue-600 dark:text-blue-400">LinkedIn dominates discovery.</span> Other platforms fill specific evaluation gaps.
                        </p>
                    </motion.div>
                </div>
            </DiagramFrame>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — Platform Roles</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Different platforms serve different evaluation stages
                </span>
            </figcaption>
        </DiagramFigure>
    );
}
