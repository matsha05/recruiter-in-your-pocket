"use client";

import { useState, useRef, useEffect } from "react";
import { Tag, Check, Plus } from "lucide-react";

interface VariantPickerProps {
    value?: string;
    existingVariants: string[];
    onSelect: (variant: string) => void;
    className?: string;
}

const SUGGESTED_VARIANTS = [
    "Leadership",
    "IC Engineering",
    "Product Management",
    "Consulting",
    "General"
];

export function VariantPicker({ value, existingVariants, onSelect, className = "" }: VariantPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Combine existing + suggested, dedupe
    const allVariants = Array.from(new Set([
        ...existingVariants,
        ...SUGGESTED_VARIANTS.filter(s => !existingVariants.includes(s))
    ]));

    const filteredVariants = allVariants.filter(v =>
        v.toLowerCase().includes(search.toLowerCase())
    );

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (variant: string) => {
        onSelect(variant);
        setIsOpen(false);
        setSearch("");
    };

    const handleCreate = () => {
        if (search.trim()) {
            onSelect(search.trim());
            setIsOpen(false);
            setSearch("");
        }
    };

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            {/* Trigger */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${value
                        ? 'bg-muted text-foreground border border-border hover:border-border/80'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
            >
                <Tag className="w-3 h-3" />
                {value || "Add variant"}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    {/* Search input */}
                    <div className="p-2 border-b border-border">
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && search.trim()) {
                                    if (filteredVariants.length > 0) {
                                        handleSelect(filteredVariants[0]);
                                    } else {
                                        handleCreate();
                                    }
                                }
                                if (e.key === 'Escape') {
                                    setIsOpen(false);
                                    setSearch("");
                                }
                            }}
                            placeholder="Search or create..."
                            className="w-full px-2 py-1 text-xs bg-muted/50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                    </div>

                    {/* Options */}
                    <div className="max-h-40 overflow-y-auto">
                        {filteredVariants.map((variant) => (
                            <button
                                key={variant}
                                onClick={() => handleSelect(variant)}
                                className="w-full px-3 py-2 text-xs text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                            >
                                <span>{variant}</span>
                                {value === variant && <Check className="w-3 h-3 text-brand" />}
                            </button>
                        ))}

                        {/* Create new option */}
                        {search.trim() && !filteredVariants.includes(search.trim()) && (
                            <button
                                onClick={handleCreate}
                                className="w-full px-3 py-2 text-xs text-left flex items-center gap-2 text-brand hover:bg-brand/5 border-t border-border"
                            >
                                <Plus className="w-3 h-3" />
                                Create "{search.trim()}"
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
