"use client";

import { motion } from "framer-motion";

export function CompStack() {
    const stack = [
        { label: "Level & Title", value: "Multi-year trajectory", h: 48, color: "neutral", sub: "The scope promise" },
        { label: "Sign-on Bonus", value: "$20k - $50k", h: 56, color: "brand", sub: "Easy cash lever" },
        { label: "Equity / RSUs", value: "$100k / 4yr", h: 72, color: "neutral", sub: "High variance lever" },
        { label: "Annual Bonus", value: "15% Target", h: 40, color: "neutral", sub: "Performance tied" },
        { label: "Base Salary", value: "$165k", h: 80, color: "neutral", sub: "Hardest to move" },
    ];

    return (
        <div className="w-full max-w-sm mx-auto my-12 font-sans">
            <h3 className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8">
                The Compensation Stack
            </h3>

            <div className="flex flex-col gap-1">
                {stack.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`relative w-full rounded-none border-l border-r border-t bg-background hover:bg-secondary/20 transition-colors group ${i === stack.length - 1 ? 'border-b' : ''} ${item.color.includes('brand') ? 'z-10 -mx-1 w-[calc(100%+8px)] border border-brand/40 rounded-sm bg-background' : 'border-border/10'}`}
                        style={{ height: item.h }}
                    >
                        <div className="flex items-center justify-between px-6 h-full">
                            <div className="flex flex-col justify-center">
                                <span className={`text-sm font-medium ${item.color.includes('brand') ? 'text-brand' : 'text-foreground'} font-display tracking-tight`}>
                                    {item.label}
                                </span>
                                <span className={`text-[10px] uppercase tracking-widest ${item.color.includes('brand') ? 'text-brand/60' : 'text-muted-foreground'}`}>
                                    {item.sub}
                                </span>
                            </div>
                            <span className={`font-mono text-xs ${item.color.includes('brand') ? 'text-brand' : 'text-muted-foreground'}`}>
                                {item.value}
                            </span>
                        </div>
                        {/* Subtle Grid Lines for non-highlight items */}
                        {!item.color.includes('brand') && (
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-neutral-900 dark:group-hover:bg-white transition-colors" />
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                    Items lower in the stack are rigid. Items higher up are flexible. <br />
                    <strong>Trade up the stack, not down.</strong>
                </p>
            </div>
        </div>
    );
}
