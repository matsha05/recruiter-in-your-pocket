"use client";

import { motion } from "framer-motion";

/**
 * Level Ladder Diagram (v2.0)
 * 
 * Premium upgrade following diagram-visual-spec.md
 * Shows compensation progression across levels
 */
export function LevelLadder() {
    const levels = [
        { name: "L3", title: "Junior", scope: "Tasks", comp: "1.0x" },
        { name: "L4", title: "Mid-Level", scope: "Features", comp: "1.3x" },
        { name: "L5", title: "Senior", scope: "Strategy", comp: "1.8x" },
        { name: "L6", title: "Staff", scope: "Direction", comp: "2.5x" },
    ];

    return (
        <figure className="w-full max-w-[560px] mx-auto my-12 group select-none">
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
                        Engineering levels
                    </span>
                </div>

                <div className="p-6">
                    <div className="flex items-end justify-center gap-4 h-48">
                        {levels.map((lvl, i) => (
                            <motion.div
                                key={lvl.name}
                                initial={{ opacity: 0, y: 20, scaleY: 0 }}
                                whileInView={{ opacity: 1, y: 0, scaleY: 1 }}
                                transition={{
                                    duration: 0.5,
                                    ease: "easeOut",
                                    delay: 0.2 + i * 0.1,
                                    scaleY: { duration: 0.6, delay: 0.3 + i * 0.1 }
                                }}
                                viewport={{ once: true }}
                                style={{ transformOrigin: "bottom" }}
                                className="flex flex-col items-center w-1/4"
                            >
                                <div
                                    className={`w-full rounded-t-lg border border-b-0 ${i === levels.length - 1
                                            ? "border-brand/40 bg-gradient-to-t from-brand/10 to-brand/20"
                                            : "border-border/40 bg-gradient-to-t from-muted/10 to-muted/20"
                                        }`}
                                    style={{ height: `${40 + i * 32}px` }}
                                />
                                <div className="w-full pt-3 pb-1 border-t-2 border-border/60 text-center">
                                    <span className={`text-lg font-display font-semibold ${i === levels.length - 1 ? "text-brand" : "text-foreground"
                                        }`}>
                                        {lvl.name}
                                    </span>
                                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 mt-1">
                                        {lvl.title}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {lvl.scope} · <span className={i === levels.length - 1 ? "text-brand" : ""}>{lvl.comp}</span>
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — The Ladder</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Compensation increases step with role scope
                </span>
            </figcaption>
        </figure>
    );
}
