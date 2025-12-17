"use client";

import { motion } from "framer-motion";

/**
 * STAR Method Structure Diagram
 * Visualizes the Situation-Task-Action-Result framework
 * Style: Research-grade step flow
 */
export function StarStructureDiagram() {
    const steps = [
        { letter: "S", label: "Situation", desc: "Context", color: "border-border/30 bg-secondary/20" },
        { letter: "T", label: "Task", desc: "Your role", color: "border-border/30 bg-secondary/20" },
        { letter: "A", label: "Action", desc: "What you did", color: "border-border/30 bg-secondary/30" },
        { letter: "R", label: "Result", desc: "The outcome", color: "border-brand/50 bg-brand/10" },
    ];

    return (
        <div className="w-full max-w-lg mx-auto my-8">
            <div className="relative bg-card border border-border/20 rounded-md p-4 md:p-6 shadow-sm">
                {/* STAR Flow */}
                <div className="flex items-start justify-between gap-1 md:gap-4">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.letter}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.15 * i }}
                            className="flex flex-col items-center flex-1"
                        >
                            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-sm border ${step.color} flex items-center justify-center`}>
                                <span className={`font-serif text-lg md:text-2xl font-medium ${i === 3 ? "text-brand" : "text-foreground"}`}>
                                    {step.letter}
                                </span>
                            </div>
                            <p className={`text-[10px] md:text-xs font-medium mt-2 ${i === 3 ? "text-brand" : "text-foreground"}`}>
                                {step.label}
                            </p>
                            <p className="text-[8px] md:text-[9px] text-muted-foreground hidden md:block">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Resume adaptation note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 1 }}
                    className="mt-8 pt-4 border-t border-border/20"
                >
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3 text-center">
                        On a resume
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs">
                        <span className="text-muted-foreground/60">[S+T implied]</span>
                        <span className="text-foreground">→</span>
                        <span className="px-2 py-1 bg-secondary/30 rounded-sm">Action</span>
                        <span className="text-foreground">→</span>
                        <span className="px-2 py-1 bg-brand/10 border border-brand/30 rounded-sm text-brand font-medium">Result</span>
                    </div>
                </motion.div>
            </div>

            {/* Figure Caption */}
            <p className="text-center mt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Fig. 1 — The STAR framework for behavioral response
                </span>
            </p>
        </div>
    );
}
