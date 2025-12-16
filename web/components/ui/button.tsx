import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"
import { BUTTON_TAP } from "@/lib/animation"

/**
 * V2.1 Button Component
 * - 4px radius (uses --radius token)
 * - brand variant for primary CTAs (Teal)
 * - premium variant for unlock moments (Gold)
 * - Snappy transition timing
 */
const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-normal ease-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-[0.98]",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:opacity-90",
                outline:
                    "border border-border/20 bg-transparent hover:bg-secondary hover:text-secondary-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                ghost:
                    "hover:bg-secondary hover:text-secondary-foreground",
                link:
                    "text-slate-muted underline-offset-4 hover:underline hover:text-foreground",
                // V2.1 Brand: Teal primary CTA
                brand:
                    "bg-brand text-white shadow-sm hover:opacity-90 active:scale-[0.98] font-medium",
                // V2.1 Premium: Gold unlock moments
                premium:
                    "bg-premium text-white shadow-sm hover:opacity-90 active:scale-[0.98] font-medium",
                // Studio: Minimal ink/paper
                studio:
                    "bg-foreground text-background hover:opacity-90 dark:bg-foreground dark:text-background font-medium tracking-tight",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 px-3 text-xs",
                lg: "h-10 px-8",
                icon: "h-9 w-9",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : motion.button

        const motionProps = asChild ? {} : {
            whileTap: BUTTON_TAP,
            layout: "position" as const
        }

        return (
            // @ts-ignore - Radix Slot polymorphism vs Framer Motion types
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...motionProps}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
