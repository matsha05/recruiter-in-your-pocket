"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { CircleNotch } from "@phosphor-icons/react"
import { ActionFeedback } from "./action-feedback"

/**
 * The one Button (Highlighter 1.1). Three sizes (44, 48, 60) and three variants: an ink primary,
 * an outlined secondary, and a quiet text action. Destructive (outlined in the red pen) is only for deleting things.
 * Every variant shares the press grammar: a fast color change on hover and a 0.98 press.
 * Links that look like buttons use `asChild` so there is one build per size and variant.
 */
const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,border-color,color,text-decoration-color,transform] duration-fast ease-snap motion-safe:active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-[3px] focus-visible:ring-offset-background disabled:pointer-events-none disabled:bg-disabled-surface disabled:text-muted-foreground [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                primary:
                    "bg-primary text-primary-foreground hover:bg-primary/88 active:bg-primary/80",
                secondary:
                    "border border-control-line bg-card text-foreground hover:border-foreground active:bg-secondary",
                quiet:
                    "text-foreground underline decoration-[hsl(var(--link-line-quiet))] decoration-1 underline-offset-[var(--link-offset)] hover:decoration-current active:bg-secondary/60",
                // The red pen draws a line; it never fills.
                destructive:
                    "border border-destructive/50 bg-card text-destructive hover:border-destructive active:bg-destructive/5",
            },
            size: {
                sm: "min-h-11 px-4 text-sm",
                md: "min-h-12 px-6 text-base",
                lg: "min-h-[3.75rem] px-8 text-lg",
                icon: "size-11",
            },
        },
        compoundVariants: [
            // A quiet action is text: keep its edge on the text, not on padding.
            { variant: "quiet", size: ["sm", "md", "lg"], class: "px-2" },
            // An icon has no underline to deepen, so a quiet icon button takes the surface wash instead.
            { variant: "quiet", size: "icon", class: "no-underline hover:bg-secondary/55" },
        ],
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
)

export interface ButtonProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd" | "style">,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    isLoading?: boolean
    /** Keep children as the idle label so both states can reserve their space. */
    loadingLabel?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, isLoading, loadingLabel, disabled, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        const hasLoadingState = isLoading !== undefined || loadingLabel !== undefined

        const content = asChild || !hasLoadingState ? (
            children
        ) : (
            <ActionFeedback
                state={isLoading ? "pending" : "idle"}
                states={{
                    idle: { label: children },
                    pending: {
                        label: loadingLabel ?? children,
                        icon: <CircleNotch aria-hidden="true" className="size-4 motion-safe:animate-spin" weight="bold" />,
                    },
                }}
            />
        )

        return (
            <Comp
                className={cn(
                    buttonVariants({ variant, size, className }),
                    isLoading && "relative cursor-wait"
                )}
                ref={ref}
                disabled={disabled || isLoading}
                aria-busy={isLoading || undefined}
                data-loading={isLoading || undefined}
                {...props}
            >
                {content}
            </Comp>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
