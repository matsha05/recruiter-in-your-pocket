"use client";

import { motion } from "framer-motion";

/**
 * Skills vs Credentials Shift Diagram
 * Visualizes the industry trend toward skills-based hiring
 * Style: Research-grade timeline/trend visualization
 */
export function SkillsShiftDiagram() {
    return (
        <div className="w-full max-w-lg mx-auto my-8">
            <div className="relative bg-card border border-border/20 rounded-md p-4 md:p-6 shadow-sm">
                {/* Timeline header */}
                <div className="flex justify-between mb-4 md:mb-6 text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <span>Traditional</span>
                    <span className="text-brand">Emerging</span>
                </div>

                {/* Comparison rows */}
                <div className="space-y-3 md:space-y-4">
                    {/* Row 1: Degree requirements */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="flex items-center gap-3"
                    >
                        <div className="flex-1 text-right">
                            <span className="text-xs text-muted-foreground line-through">Degree required</span>
                        </div>
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="w-12 h-px bg-gradient-to-r from-muted-foreground/30 to-brand/50"
                        />
                        <div className="flex-1">
                            <span className="text-xs text-brand font-medium">Skills demonstrated</span>
                        </div>
                    </motion.div>

                    {/* Row 2: Years of experience */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="flex items-center gap-3"
                    >
                        <div className="flex-1 text-right">
                            <span className="text-xs text-muted-foreground line-through">X years required</span>
                        </div>
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="w-12 h-px bg-gradient-to-r from-muted-foreground/30 to-brand/50"
                        />
                        <div className="flex-1">
                            <span className="text-xs text-brand font-medium">Relevant outcomes</span>
                        </div>
                    </motion.div>

                    {/* Row 3: Credentials */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                        className="flex items-center gap-3"
                    >
                        <div className="flex-1 text-right">
                            <span className="text-xs text-muted-foreground line-through">Pedigree/prestige</span>
                        </div>
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                            className="w-12 h-px bg-gradient-to-r from-muted-foreground/30 to-brand/50"
                        />
                        <div className="flex-1">
                            <span className="text-xs text-brand font-medium">Portfolio evidence</span>
                        </div>
                    </motion.div>
                </div>

                {/* Stats callout */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 }}
                    className="mt-8 pt-4 border-t border-border/20 text-center"
                >
                    <span className="font-serif text-3xl font-medium text-brand">45%</span>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        of companies plan to prioritize skills over degrees by 2025
                    </p>
                </motion.div>
            </div>

            {/* Figure Caption */}
            <p className="text-center mt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Fig. 1 — The skills-based hiring shift
                </span>
            </p>
        </div>
    );
}
