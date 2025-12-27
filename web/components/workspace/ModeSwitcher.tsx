'use client';

import { cn } from '@/lib/utils';
import { FileText, Linkedin } from 'lucide-react';

export type ReviewMode = 'resume' | 'linkedin';

interface ModeSwitcherProps {
    mode: ReviewMode;
    onModeChange: (mode: ReviewMode) => void;
    disabled?: boolean;
}

export function ModeSwitcher({ mode, onModeChange, disabled }: ModeSwitcherProps) {
    return (
        <div className="inline-flex items-center gap-0.5 p-1 rounded-full bg-muted/60 border border-border/80 shadow-sm">
            <button
                onClick={() => onModeChange('resume')}
                disabled={disabled}
                className={cn(
                    "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                    mode === 'resume'
                        ? "bg-background text-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                aria-pressed={mode === 'resume'}
            >
                <FileText className="w-4 h-4" />
                <span>Resume</span>
            </button>
            <button
                onClick={() => onModeChange('linkedin')}
                disabled={disabled}
                className={cn(
                    "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                    mode === 'linkedin'
                        ? "bg-background text-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                aria-pressed={mode === 'linkedin'}
            >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
            </button>
        </div>
    );
}
