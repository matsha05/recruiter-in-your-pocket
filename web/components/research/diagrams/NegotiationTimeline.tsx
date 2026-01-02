"use client";

import { motion } from "framer-motion";

/**
 * Negotiation Timeline Diagram (v2.0)
 * 
 * Premium upgrade following diagram-visual-spec.md
 * Type E: Process/Timeline with connected steps and staggered reveal
 * 
 * Shows the five-step negotiation cadence from offer to close
 */
export function NegotiationTimeline() {
    const steps = [
        {
            title: "Receive offer",
            desc: "You get the initial numbers",
            action: "Ask for time to review",
        },
        {
            title: "Clarify package",
            desc: "Understand constraints",
            action: "Ask for band, level, levers",
        },
        {
            title: "Counter once",
            desc: "Don't negotiate piecemeal",
            action: "Package ask + rationale",
            highlight: true,
        },
        {
            title: "Trade levers",
            desc: "If base is stuck, shift",
            action: "Sign-on, equity, start date",
        },
        {
            title: "Close fast",
            desc: "Commit when aligned",
            action: "Confirm in writing",
        }
    ];

    return (
        <figure className="w-full max-w-[720px] mx-auto my-12 group select-none">
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
                        Negotiation playbook
                    </span>
                </div>

                <div className="p-6 overflow-x-auto">
                    <div className="relative min-w-[650px]">
                        {/* Connection Line */}
                        <motion.div
                            className="absolute top-6 left-6 right-6 h-0.5 bg-gradient-to-r from-muted/40 via-brand/40 to-muted/40 z-0"
                            initial={{ scaleX: 0, transformOrigin: "left" }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                            viewport={{ once: true }}
                        />

                        <div className="relative z-10 grid grid-cols-5 gap-3">
                            {steps.map((step, i) => (
                                <motion.div
                                    key={step.title}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 + i * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex flex-col items-center text-center"
                                >
                                    {/* Step indicator */}
                                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-sm ${step.highlight
                                            ? "border-brand/50 bg-brand/10 dark:bg-brand/20"
                                            : "border-border/40 bg-white dark:bg-card"
                                        }`}>
                                        <span className={`font-mono text-sm font-bold ${step.highlight ? "text-brand" : "text-muted-foreground"
                                            }`}>
                                            {i + 1}
                                        </span>
                                    </div>

                                    <div className="mt-3 space-y-1">
                                        <h4 className={`text-sm font-semibold ${step.highlight ? "text-brand" : "text-foreground"
                                            }`}>
                                            {step.title}
                                        </h4>
                                        <p className="text-[11px] text-muted-foreground leading-snug">
                                            {step.desc}
                                        </p>
                                    </div>

                                    <div className={`mt-3 px-2 py-1 rounded text-[9px] font-mono uppercase tracking-wider ${step.highlight
                                            ? "bg-brand/10 text-brand"
                                            : "bg-muted/30 text-muted-foreground"
                                        }`}>
                                        {step.action}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            <figcaption className="mt-4 space-y-1">
                <span className="block riyp-figure-kicker">Fig. 1 — The Five Steps</span>
                <span className="block text-sm text-foreground/80 font-medium">
                    A negotiation cadence from offer to close
                </span>
            </figcaption>
        </figure>
    );
}
