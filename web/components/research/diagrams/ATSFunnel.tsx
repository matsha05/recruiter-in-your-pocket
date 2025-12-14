"use client";

import { motion } from "framer-motion";
import { User, Server, Eye, Ban } from "lucide-react";

export function ATSFunnel() {
    return (
        <div className="w-full max-w-[500px] mx-auto my-12 font-sans">
            <div className="space-y-6">

                {/* Stage 1: Applied */}
                <div className="relative">
                    <div className="flex justify-between text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        <span className="flex items-center gap-2"><User className="w-3 h-3" /> 1. Applicants</span>
                        <span>1,000 Candidates</span>
                    </div>
                    <div className="h-12 w-full bg-secondary rounded-md border border-border flex items-center px-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-neutral-200/50 dark:bg-neutral-800/50" />
                        <span className="relative z-10 text-sm font-medium">The Applicant Pool</span>
                    </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center -my-2 opacity-20">
                    <div className="h-4 w-px bg-foreground" />
                </div>

                {/* Stage 2: ATS Automated Filter */}
                <div className="relative">
                    <div className="flex justify-between text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        <span className="flex items-center gap-2"><Server className="w-3 h-3" /> 2. ATS Screening</span>
                        <span>800 Pass (80%)</span>
                    </div>
                    <div className="relative h-12 w-full bg-transparent rounded-md flex">
                        {/* The Passers */}
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "80%" }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-emerald-500/10 border border-emerald-500/20 rounded-l-md flex items-center px-4"
                        >
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Qualified</span>
                        </motion.div>
                        {/* The Knockouts */}
                        <div className="flex-1 h-full bg-destructive/10 border-y border-r border-destructive/20 rounded-r-md flex items-center justify-center">
                            <span className="text-xs font-medium text-destructive flex items-center gap-1">
                                <Ban className="w-3 h-3" /> Knockout Qs
                            </span>
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 text-right w-full">
                        *Only ~20% are auto-rejected (Visa, Missing License, etc.)
                    </p>
                </div>

                {/* Arrow */}
                <div className="flex justify-center -my-2 opacity-20">
                    <div className="h-4 w-px bg-foreground" />
                </div>

                {/* Stage 3: Human Review (The Bottleneck) */}
                <div className="relative">
                    <div className="flex justify-between text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        <span className="flex items-center gap-2 text-primary"><Eye className="w-3 h-3" /> 3. Human Review</span>
                        <span className="text-primary font-bold">25 Seen (2.5%)</span>
                    </div>
                    <div className="h-12 w-full bg-secondary/30 rounded-md border border-border border-dashed flex relative overflow-hidden">
                        {/* The actual processed volume */}
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "2.5%" }}
                            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                            className="h-full bg-primary absolute left-0 top-0"
                        />
                        <div className="absolute inset-0 flex items-center px-4">
                            <span className="text-sm text-muted-foreground ml-6">
                                The "Black Hole" (Recruiters ran out of time)
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
