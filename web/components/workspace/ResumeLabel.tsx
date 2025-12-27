"use client";

import { useState } from "react";
import { Tag, X, Lightbulb } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface ResumeLabelProps {
    value?: string;
    existingLabels: string[];
    onSelect: (label: string) => void;
    onClear?: () => void;
    className?: string;
}

// Minimal examples - users can type anything they want
const QUICK_LABELS = ["General"];

export function ResumeLabel({ value, existingLabels, onSelect, onClear, className = "" }: ResumeLabelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // User's existing labels (for quick reuse)
    const userLabels = existingLabels.slice(0, 5);

    // Filter based on input
    const getFilteredLabels = () => {
        if (!inputValue) return [];
        const searchLower = inputValue.toLowerCase();
        const allLabels = [
            ...existingLabels,
            ...QUICK_LABELS,
        ];
        return [...new Set(allLabels)].filter(l =>
            l.toLowerCase().includes(searchLower)
        ).slice(0, 5);
    };

    const handleSubmit = () => {
        const trimmed = inputValue.trim();
        if (trimmed) {
            onSelect(trimmed);
        }
        setIsOpen(false);
        setInputValue("");
    };

    const handleSelect = (label: string) => {
        onSelect(label);
        setIsOpen(false);
        setInputValue("");
    };

    // Already has a label - show it with option to clear
    if (value) {
        return (
            <div
                className={`inline-flex items-center gap-1 ${className}`}
                onClick={(e) => e.stopPropagation()}
                data-no-card-click
            >
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted text-foreground text-xs border border-border">
                    <Tag className="w-3 h-3 text-muted-foreground" />
                    {value}
                    {onClear && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onClear(); }}
                            className="hover:text-destructive transition-colors ml-0.5"
                            type="button"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </span>
            </div>
        );
    }

    const filteredLabels = getFilteredLabels();
    const showFiltered = inputValue.length > 0;
    const canCreate = inputValue.trim() && !filteredLabels.some(l => l.toLowerCase() === inputValue.toLowerCase());

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            data-no-card-click
            className={className}
        >
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                        <Tag className="w-3 h-3" />
                        Label this resume
                    </button>
                </PopoverTrigger>

                <PopoverContent
                    className="w-64 p-0"
                    align="start"
                    side="bottom"
                    sideOffset={4}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Input */}
                    <div className="p-3 border-b border-border">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (inputValue.trim()) {
                                        handleSubmit();
                                    } else if (filteredLabels.length > 0) {
                                        handleSelect(filteredLabels[0]);
                                    }
                                }
                                if (e.key === 'Escape') {
                                    setIsOpen(false);
                                    setInputValue("");
                                }
                            }}
                            placeholder="e.g., General, Google PM, Senior Role..."
                            className="w-full px-3 py-2 text-sm bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand/50"
                            autoFocus
                        />
                    </div>

                    {/* Scrollable content area - allow mouse wheel */}
                    <div
                        className="max-h-64 overflow-y-auto overscroll-contain"
                        onWheel={(e) => e.stopPropagation()}
                    >
                        {/* Filtered results when typing */}
                        {showFiltered && filteredLabels.length > 0 && (
                            <div className="py-1">
                                {filteredLabels.map((label) => (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => handleSelect(label)}
                                        className="w-full px-4 py-2 text-sm text-left hover:bg-muted/50 transition-colors"
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Create new */}
                        {canCreate && (
                            <div className="border-t border-border">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="w-full px-4 py-2.5 text-sm text-left text-brand hover:bg-brand/5 transition-colors font-medium"
                                >
                                    + Create &quot;{inputValue.trim()}&quot;
                                </button>
                            </div>
                        )}

                        {/* Suggestions when NOT typing */}
                        {!showFiltered && (
                            <>
                                {/* User's existing labels - shown first if they have any */}
                                {userLabels.length > 0 && (
                                    <div className="py-2 border-b border-border">
                                        <div className="px-4 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Your Labels
                                        </div>
                                        {userLabels.map((label) => (
                                            <button
                                                key={label}
                                                type="button"
                                                onClick={() => handleSelect(label)}
                                                className="w-full px-4 py-2 text-sm text-left hover:bg-muted/50 transition-colors"
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Helpful hint - only for new users */}
                                {userLabels.length === 0 && (
                                    <div className="px-4 py-2 flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 border-b border-border">
                                        <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-brand shrink-0" />
                                        <span>Labels help you track progress across different resume versions</span>
                                    </div>
                                )}

                                {/* Quick labels - minimal, just to get started */}
                                <div className="py-2">
                                    <div className="px-4 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        Quick Pick
                                    </div>
                                    {QUICK_LABELS.map((label) => (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => handleSelect(label)}
                                            className="w-full px-4 py-1.5 text-sm text-left hover:bg-muted/50 transition-colors"
                                        >
                                            {label}
                                        </button>
                                    ))}
                                    <div className="px-4 py-2 text-xs text-muted-foreground italic">
                                        Or type your own above
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
