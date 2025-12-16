"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, X, Copy, CheckCircle } from "lucide-react";

interface DiffViewProps {
    original: string;
    improved: string;
    className?: string;
}

export function DiffView({ original, improved, className }: DiffViewProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(improved);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = improved;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className={cn("grid gap-4 rounded-lg border border-border bg-card overflow-hidden", className)}>

            {/* Header / Labels */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-b border-border bg-muted/30">
                <div className="p-2 px-4 text-xs font-medium text-destructive/80 uppercase tracking-wider flex items-center gap-2">
                    <X className="w-3 h-3" /> Original
                </div>
                <div className="hidden md:flex p-2 px-4 text-xs font-medium text-success uppercase tracking-wider items-center justify-between border-l border-border">
                    <div className="flex items-center gap-2">
                        <Check className="w-3 h-3" /> Improved
                    </div>
                    <button
                        onClick={handleCopy}
                        className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider transition-all",
                            copied
                                ? "bg-success/10 text-success"
                                : "text-muted-foreground hover:text-brand hover:bg-brand/10"
                        )}
                    >
                        {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied" : "Copy"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Original (Red) */}
                <div className="p-4 bg-destructive/5 font-mono text-sm leading-relaxed text-destructive/90 line-through decoration-destructive/30">
                    {original}
                </div>

                {/* Mobile Label for Improved */}
                <div className="md:hidden border-t border-b border-border bg-muted/30 p-2 px-4 text-xs font-medium text-success uppercase tracking-wider flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Check className="w-3 h-3" /> Improved
                    </div>
                    <button
                        onClick={handleCopy}
                        className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider transition-all",
                            copied
                                ? "bg-success/10 text-success"
                                : "text-muted-foreground hover:text-brand hover:bg-brand/10"
                        )}
                    >
                        {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied" : "Copy"}
                    </button>
                </div>

                {/* Improved (Green) */}
                <div className="p-4 bg-success/5 font-mono text-sm leading-relaxed text-foreground border-l border-border">
                    {improved}
                </div>
            </div>
        </div>
    );
}

