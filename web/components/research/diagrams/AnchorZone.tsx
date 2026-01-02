"use client";

import { motion } from "framer-motion";

/**
 * Anchor Zone Diagram (v2.0)
 * 
 * Premium upgrade following diagram-visual-spec.md
 * Shows negotiation anchor zones relative to offer risk
 */
export function AnchorZone() {
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
                        Anchor placement strategy
                    </span>
                </div>

                <div className="p-6">
                    {/* Scale visualization */}
                    <div className="relative h-24">
                        {/* Scale line */}
                        <motion.div
                            initial={{ scaleX: 0, transformOrigin: "left" }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            viewport={{ once: true }}
                            className="absolute top-12 left-4 right-4 h-1 bg-gradient-to-r from-muted-foreground/20 via-brand/40 to-rose-400/50 rounded-full"
                        />

                        {/* Markers */}
                        {[
                            { pos: "10%", label: "First offer", value: "$130k", color: "muted" },
                            { pos: "50%", label: "Package ask", value: "$145k", color: "brand", highlight: true },
                            { pos: "90%", label: "Impasse risk", value: "$180k+", color: "rose" },
                        ].map((marker, i) => (
                            <motion.div
                                key={marker.label}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 + i * 0.15 }}
                                viewport={{ once: true }}
                                className="absolute"
                                style={{ left: marker.pos, top: 0, transform: "translateX(-50%)" }}
                            >
                                <div className="flex flex-col items-center">
                                    <div className={`w-4 h-4 rounded-full border-2 ${marker.highlight
                                            ? "border-brand bg-brand/20"
                                            : marker.color === "rose"
                                                ? "border-rose-400/60 bg-rose-400/10"
                                                : "border-muted-foreground/40 bg-muted"
                                        }`} />
                                    <div className="w-px h-4 bg-border/60 mt-1" />
                                    <div className="text-center mt-2">
                                        <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60">
                                            {marker.label}
                                        </p>
                                        <p className={`text-sm font-mono font-medium ${marker.highlight ? "text-brand" : "text-muted-foreground"
                                            }`}>
                                            {marker.value}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Strategy note */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut", delay: 0.9 }}
                        viewport={{ once: true }}
                        className="mt-8 text-center text-xs text-muted-foreground"
                    >
                        Anchor just below the impasse point, then justify with market data.
                    </motion.div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — The Zones</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    Anchor placement relative to offer risk
                </span>
            </figcaption>
        </figure>
    );
}
