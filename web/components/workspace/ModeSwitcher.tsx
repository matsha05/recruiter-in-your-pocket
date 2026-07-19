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
        <div className="inline-flex items-center border-b border-border/80">
            <button type="button"
                onClick={() => onModeChange('resume')}
                disabled={disabled}
                className={cn(
                    "relative flex min-h-10 items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 after:absolute after:inset-x-2 after:bottom-[-1px] after:h-0.5 after:origin-center after:transition-transform",
                    mode === 'resume'
                        ? "text-foreground after:scale-x-100 after:bg-brand"
                        : "text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100 hover:after:bg-border",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                aria-pressed={mode === 'resume'}
            >
                <FileText className="size-4" />
                <span>Resume</span>
            </button>
            <button type="button"
                onClick={() => onModeChange('linkedin')}
                disabled={disabled}
                className={cn(
                    "relative flex min-h-10 items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 after:absolute after:inset-x-2 after:bottom-[-1px] after:h-0.5 after:origin-center after:transition-transform",
                    mode === 'linkedin'
                        ? "text-foreground after:scale-x-100 after:bg-brand"
                        : "text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100 hover:after:bg-border",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                aria-pressed={mode === 'linkedin'}
            >
                <Linkedin className="size-4" />
                <span>LinkedIn</span>
            </button>
        </div>
    );
}
