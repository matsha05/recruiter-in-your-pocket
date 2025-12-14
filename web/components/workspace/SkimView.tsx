"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface SkimData {
    dates: string[];
    titles: string[];
    education: string[];
    metrics: string[];
}

interface SkimViewProps {
    text: string;
    skimData: SkimData;
    className?: string;
}

export function SkimView({ text, skimData, className }: SkimViewProps) {
    const [isEnabled, setIsEnabled] = useState(true);

    // Combine all signals into a single set for fast lookup
    // We normalize to lowercase for matching, but keep original for display if needed
    const signals = useMemo(() => {
        const all = [
            ...skimData.dates,
            ...skimData.titles,
            ...skimData.metrics,
            ...skimData.education
        ];
        return new Set(all.map(s => s.toLowerCase().trim()));
    }, [skimData]);

    // Logic to render text with "Selective Blur"
    // We split by newlines first to preserve paragraph structure
    const renderContent = () => {
        return text.split("\n").map((line, i) => {
            if (!line.trim()) return <div key={i} className="h-4" />; // Preserve spacing

            // Check if line contains any signal. 
            // For a true "Skim", we highlight the specific *words*, but to keep the DOM sane 
            // effectively we can highlight the *phrase* if it matches directly, 
            // or split the line by word. Splitting by word is expensive but accurate.
            // Let's try a simpler approach: check if the line *looks like* a header (short, caps)
            // or contains a signal.

            // Split line into word chunks to check against signals
            // This is a naive implementation but fast enough for ~500 words
            const words = line.split(/(\s+)/);

            return (
                <div key={i} className="mb-1 leading-relaxed text-sm md:text-base text-foreground/80 font-mono">
                    {words.map((word, w) => {
                        const clean = word.toLowerCase().trim().replace(/[.,]/g, "");
                        // Is this word part of a signal? 
                        // This creates a "scattered" effect which is exactly what we want.
                        // It shows how fragmented the reading is.

                        // Simple check: is this word in our signals set? 
                        // (NOTE: This misses multi-word signals like "Senior Engineer". 
                        // For a v1 prototype, emphasizing *Metrics* (numbers) and *Dates* is usually enough impact.)

                        const isSignal =
                            signals.has(word.toLowerCase().trim()) || // Exact match
                            /^\d{4}$/.test(clean) || // Year
                            /^\d+%$/.test(clean) || // Percentage
                            /^\$\d+/.test(clean);   // Money

                        return (
                            <span
                                key={w}
                                className={cn(
                                    "transition-all duration-500",
                                    isEnabled
                                        ? (isSignal ? "bg-yellow-100/20 text-foreground font-bold" : "blur-[2.5px] opacity-40 select-none")
                                        : ""
                                )}
                            >
                                {word}
                            </span>
                        )
                    })}
                </div>
            )
        });
    };

    return (
        <div className={cn("relative w-full max-w-3xl mx-auto", className)}>

            {/* Control Bar */}
            <div className="sticky top-0 z-10 mb-6 p-4 rounded-xl border bg-background/80 backdrop-blur-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-md bg-secondary transition-colors", isEnabled && "bg-primary/10 text-primary")}>
                        {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold tracking-tight">Recruiter Vision</h3>
                        <p className="text-[11px] text-muted-foreground">Simulating the 6-second scan</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-medium transition-colors", isEnabled ? "text-primary" : "text-muted-foreground")}>
                        {isEnabled ? "On" : "Off"}
                    </span>
                    <Switch
                        checked={isEnabled}
                        onCheckedChange={setIsEnabled}
                    />
                </div>
            </div>

            {/* The Resume Canvas */}
            <motion.div
                layout
                className="relative min-h-[500px] p-8 md:p-12 rounded-xl bg-white border shadow-sm"
            >
                {/* Paper Texture/Feel */}

                {renderContent()}

                {/* The "Lesson" Overlay (Only when enabled) */}
                {isEnabled && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 pointer-events-none flex items-center justify-center"
                    >
                        {/* Could add heat-map overlays here later */}
                    </motion.div>
                )}

            </motion.div>

            {/* Explanation Footer */}
            <div className="mt-6 flex gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50 text-sm">
                <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="space-y-1">
                    <p className="font-medium text-foreground">Why is most of my resume blurred?</p>
                    <p className="text-muted-foreground leading-relaxed">
                        This simulates "Cognitive Tunnel Vision." Recruiters ignore paragraphs and dense bullets.
                        They only "see" titles, dates, and metrics in the first pass.
                        <span className="text-foreground font-medium"> If your key achievements are blurred, you need to isolate them.</span>
                    </p>
                </div>
            </div>

        </div>
    );
}
