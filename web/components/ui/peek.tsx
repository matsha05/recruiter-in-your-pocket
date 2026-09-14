"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/** Supporting evidence with the same opening and dismissal behavior as popovers. */
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
    return (
        <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
            {trigger && (
                <PopoverPrimitive.Trigger asChild>
                    {trigger}
                </PopoverPrimitive.Trigger>
            )}
            <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content
                    side={side}
                    align={align}
                    sideOffset={8}
                    aria-label={title}
                    className={cn(
                        "riyp-floating-motion z-50 w-full max-w-[420px] border border-border bg-background p-4",
                        "origin-[--radix-popover-content-transform-origin] shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
                        className
                    )}
                >
                    {showClose && (
                        <PopoverPrimitive.Close
                            className="absolute right-0.5 top-0.5 inline-flex size-11 items-center justify-center rounded-sm opacity-70 ring-offset-background transition-opacity duration-fast ease-snap hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </PopoverPrimitive.Close>
                    )}
                    {title && (
                        <div className="sr-only" role="heading" aria-level={2}>
                            {title}
                        </div>
                    )}
                    <div className={cn(showClose && "pr-6")}>{children}</div>
                </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
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
            className={cn("mb-3 gap-y-1", className)}
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
function PeekFooter({
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
