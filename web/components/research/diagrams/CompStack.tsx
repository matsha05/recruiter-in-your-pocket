"use client";

import { motion } from "framer-motion";

export function CompStack() {
    const stack = [
        { label: "Level & Title", value: "Multi-year trajectory", h: 48, color: "bg-neutral-900 dark:bg-neutral-100", text: "text-bg dark:text-bg-inv", sub: "The scope promise" },
        { label: "Sign-on Bonus", value: "$20k - $50k", h: 56, color: "bg-emerald-500", text: "text-white", sub: "Easy cash lever" },
        { label: "Equity / RSUs", value: "$100k / 4yr", h: 72, color: "bg-indigo-500", text: "text-white", sub: "High variance lever" },
        { label: "Annual Bonus", value: "15% Target", h: 40, color: "bg-blue-500", text: "text-white", sub: "Performance tied" },
        { label: "Base Salary", value: "$165k", h: 80, color: "bg-slate-700", text: "text-white", sub: "Hardest to move" },
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
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`relative w-full rounded-md shadow-sm overflow-hidden group hover:scale-[1.02] transition-transform duration-300 ease-out`}
                        style={{ height: item.h }}
                    >
                        <div className={`absolute inset-0 ${item.color} opacity-90`} />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-white/5 to-black/10" />

                        <div className={`relative z-10 flex items-center justify-between px-5 h-full ${item.text}`}>
                            <div>
                                <span className="font-semibold text-sm block">{item.label}</span>
                                <span className="text-[10px] opacity-80 font-medium tracking-wide uppercase">{item.sub}</span>
                            </div>
                            <span className="font-mono text-xs opacity-90">{item.value}</span>
                        </div>
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
