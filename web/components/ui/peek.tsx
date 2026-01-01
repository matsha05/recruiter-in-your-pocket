"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { DURATION } from "@/lib/animation"

/**
 * Peek Panel - Non-destructive overlay for evidence, citations, definitions
 * Per design-principles.md Layer Model: "Peek" layer
 * 
 * Behavior:
 * - Entry: 320ms, opacity 0→1, scale 0.985→1, y 8→0
 * - Exit: 140ms (faster than entry = responsive)
 * - Dismiss: click outside, Esc
 * - Never steals scroll position
 * - Max 420px desktop, bottom sheet on mobile
 */

const peekVariants = {
    initial: { opacity: 0, scale: 0.985, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.99, y: 4 },
}

const peekTransitionIn = {
    duration: DURATION.reveal, // 320ms
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number], // EASE_SNAP
}

const peekTransitionOut = {
    duration: DURATION.select, // 140ms
    ease: [0.33, 1, 0.68, 1] as [number, number, number, number], // outCubic
}

interface PeekProps {
    /** Whether the peek is open */
    open: boolean
    /** Callback when open state changes */
    onOpenChange: (open: boolean) => void
    /** The trigger element */
    trigger?: React.ReactNode
    /** Peek content */
    children: React.ReactNode
    /** Side to render the peek */
    side?: "top" | "right" | "bottom" | "left"
    /** Alignment relative to trigger */
    align?: "start" | "center" | "end"
    /** Additional className for content */
    className?: string
    /** Show close button */
    showClose?: boolean
    /** Title for accessibility */
    title?: string
}

export function Peek({
    open,
    onOpenChange,
    trigger,
    children,
    side = "right",
    align = "start",
    className,
    showClose = true,
    title,
}: PeekProps) {
    const prefersReducedMotion = useReducedMotion()

    return (
        <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
            {trigger && (
                <PopoverPrimitive.Trigger asChild>
                    {trigger}
                </PopoverPrimitive.Trigger>
            )}
            <AnimatePresence>
                {open && (
                    <PopoverPrimitive.Portal forceMount>
                        <PopoverPrimitive.Content
                            side={side}
                            align={align}
                            sideOffset={8}
                            className={cn(
                                // Base
                                "z-50 w-full max-w-[420px] rounded-lg border border-border/60 bg-background p-4",
                                // Shadow per design-system.md
                                "shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
                                // Responsive: bottom sheet on mobile could be added later
                                className
                            )}
                            asChild
                            onOpenAutoFocus={(e) => {
                                // Don't steal focus - let user maintain context
                                e.preventDefault()
                            }}
                            onCloseAutoFocus={(e) => {
                                // Return focus to trigger naturally
                            }}
                        >
                            <motion.div
                                variants={prefersReducedMotion ? {} : peekVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={prefersReducedMotion ? {} : peekTransitionIn}
                            >
                                {/* Close button */}
                                {showClose && (
                                    <PopoverPrimitive.Close
                                        className="absolute right-3 top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        aria-label="Close"
                                    >
                                        <X className="h-4 w-4" />
                                    </PopoverPrimitive.Close>
                                )}

                                {/* Title for screen readers */}
                                {title && (
                                    <div className="sr-only" role="heading" aria-level={2}>
                                        {title}
                                    </div>
                                )}

                                {/* Content */}
                                <div className={cn(showClose && "pr-6")}>
                                    {children}
                                </div>
                            </motion.div>
                        </PopoverPrimitive.Content>
                    </PopoverPrimitive.Portal>
                )}
            </AnimatePresence>
        </PopoverPrimitive.Root>
    )
}

/**
 * PeekHeader - Styled header for peek panels
 */
export function PeekHeader({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("mb-3 space-y-1", className)}
            {...props}
        />
    )
}

/**
 * PeekTitle - Title text for peek panels
 */
export function PeekTitle({
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn("font-medium leading-none tracking-tight", className)}
            {...props}
        />
    )
}

/**
 * PeekDescription - Description text for peek panels
 */
export function PeekDescription({
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    )
}

/**
 * PeekContent - Scrollable content area
 */
export function PeekContent({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("text-sm", className)}
            {...props}
        />
    )
}

/**
 * PeekFooter - Footer with actions
 */
export function PeekFooter({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("mt-4 flex items-center justify-end gap-2", className)}
            {...props}
        />
    )
}

export { peekVariants, peekTransitionIn, peekTransitionOut }
