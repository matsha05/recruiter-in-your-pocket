"use client";

import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface DiffViewProps {
    original: string;
    improved: string;
    className?: string;
}

export function DiffView({ original, improved, className }: DiffViewProps) {
    return (
        <div className={cn("grid gap-4 rounded-lg border border-border bg-card overflow-hidden", className)}>

            {/* Header / Labels */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-b border-border bg-muted/30">
                <div className="p-2 px-4 text-xs font-medium text-destructive/80 uppercase tracking-wider flex items-center gap-2">
                    <X className="w-3 h-3" /> Original
                </div>
                <div className="hidden md:flex p-2 px-4 text-xs font-medium text-success uppercase tracking-wider items-center gap-2 border-l border-border">
                    <Check className="w-3 h-3" /> Improved
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Original (Red) */}
                <div className="p-4 bg-destructive/5 font-mono text-sm leading-relaxed text-destructive/90 line-through decoration-destructive/30">
                    {original}
                </div>

                {/* Mobile Label for Improved */}
                <div className="md:hidden border-t border-b border-border bg-muted/30 p-2 px-4 text-xs font-medium text-success uppercase tracking-wider flex items-center gap-2">
                    <Check className="w-3 h-3" /> Improved
                </div>

                {/* Improved (Green) */}
                <div className="p-4 bg-success/5 font-mono text-sm leading-relaxed text-foreground border-l border-border">
                    {improved}
                </div>
            </div>
        </div>
    );
}

