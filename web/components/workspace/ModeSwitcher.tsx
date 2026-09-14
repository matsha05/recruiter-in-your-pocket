'use client';

import { useId } from 'react';
import { FileText, Linkedin } from 'lucide-react';
import { LayoutGroup, m } from 'motion/react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { UI_TRANSITION } from '@/lib/animation';
import { cn } from '@/lib/utils';

export type ReviewMode = 'resume' | 'linkedin';

interface ModeSwitcherProps {
    mode: ReviewMode;
    onModeChange: (mode: ReviewMode) => void;
    disabled?: boolean;
}

const MODES = [
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
] as const;

export function ModeSwitcher({ mode, onModeChange, disabled }: ModeSwitcherProps) {
    const layoutId = useId();
    const reducedMotion = useReducedMotion();

    return (
        <LayoutGroup id={layoutId}>
            <div className="inline-flex items-center border-b border-border/80">
                {MODES.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => onModeChange(id)}
                        disabled={disabled}
                        aria-pressed={mode === id}
                        className={cn(
                            'focus-ring relative flex min-h-11 items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-fast ease-snap motion-reduce:transition-none',
                            mode === id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                            disabled && 'cursor-not-allowed opacity-50',
                        )}
                    >
                        <Icon className="size-4" aria-hidden="true" />
                        <span>{label}</span>
                        {mode === id && (
                            <m.span
                                aria-hidden="true"
                                layoutId="review-mode-indicator"
                                className="pointer-events-none absolute inset-x-2 bottom-[-1px] h-0.5 bg-brand"
                                transition={reducedMotion ? { duration: 0 } : UI_TRANSITION}
                            />
                        )}
                    </button>
                ))}
            </div>
        </LayoutGroup>
    );
}
