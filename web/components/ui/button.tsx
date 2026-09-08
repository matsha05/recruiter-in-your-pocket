"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { m as motion, HTMLMotionProps } from "motion/react"
import { BUTTON_TAP } from "@/lib/animation"
import { CircleNotch } from "@phosphor-icons/react"

/** Shared alpine controls: ink primary actions, quiet utility actions, visible focus. */
const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded-md text-base font-semibold leading-5 transition-[background-color,border-color,color,box-shadow,transform] duration-normal ease-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-[3px] focus-visible:ring-offset-background disabled:pointer-events-none disabled:bg-disabled-surface disabled:text-muted-foreground disabled:shadow-none",
    {
        variants: {
            variant: {
                default:
                    "rounded-full bg-primary text-primary-foreground hover:bg-primary/92 active:scale-[0.98] active:bg-primary/82",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
                outline:
                    "border border-control-line bg-card hover:bg-secondary hover:border-brand active:bg-secondary/90 active:scale-[0.98]",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70 active:scale-[0.98]",
                ghost:
                    "hover:bg-secondary/80 hover:text-secondary-foreground active:bg-secondary/90",
                link:
                    "text-slate-muted underline-offset-4 hover:underline hover:text-foreground",
                // The primary action stays visually consistent with the landing page.
                brand:
                    "rounded-full bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/82 active:scale-[0.98]",
                // Compatibility variant: paid actions use the same primary action hierarchy.
                premium:
                    "rounded-full bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/82 active:scale-[0.98]",
                studio:
                    "rounded-full bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/82 active:scale-[0.98]",
            },
            size: {
                default: "min-h-12 px-6 py-3",
                sm: "min-h-11 px-4 py-2 text-sm",
                lg: "min-h-12 px-6 py-3",
                xl: "min-h-[60px] px-8 py-4",
                icon: "size-11",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd" | "style">,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
        const Comp = asChild ? Slot : motion.button

        const motionProps = asChild ? {} : {
            whileTap: isLoading || disabled ? undefined : BUTTON_TAP,
            layout: "position" as const
        }

        const content = asChild ? (
            children
        ) : (
            <>
                {isLoading && (
                    <CircleNotch aria-hidden="true" className="size-4 animate-spin" weight="bold" />
                )}
                {isLoading ? <span className="opacity-70">{children}</span> : children}
            </>
        )

        return (
            // @ts-ignore - Radix Slot polymorphism vs Framer Motion types
            <Comp
                className={cn(
                    buttonVariants({ variant, size, className }),
                    isLoading && "relative cursor-wait"
                )}
                ref={ref}
                disabled={disabled || isLoading}
                aria-busy={isLoading || undefined}
                data-loading={isLoading || undefined}
                {...motionProps}
                {...props}
            >
                {content}
            </Comp>
        )
    }
)
Button.displayName = "Button"

export { Button }
