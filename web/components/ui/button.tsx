import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"
import { BUTTON_TAP } from "@/lib/animation"
import { Loader2 } from "lucide-react"

/**
 * V2.1 Button Component
 * - 4px radius (uses --radius token)
 * - brand variant for primary CTAs (Teal)
 * - premium variant for unlock moments (Gold)
 * - Snappy transition timing
 * - Full state coverage: hover, active, focus, disabled, loading
 */
const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all duration-normal ease-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] active:bg-primary/80",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
                outline:
                    "border border-border/60 bg-transparent hover:bg-secondary hover:border-border/80 active:bg-secondary/80 active:scale-[0.98]",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70 active:scale-[0.98]",
                ghost:
                    "hover:bg-secondary hover:text-secondary-foreground active:bg-secondary/80",
                link:
                    "text-slate-muted underline-offset-4 hover:underline hover:text-foreground",
                // V2.1 Brand: Teal primary CTA
                brand:
                    "bg-brand text-white shadow-sm hover:bg-brand/90 active:bg-brand/80 active:scale-[0.98] font-medium",
                // V2.1 Premium: Gold unlock moments
                premium:
                    "bg-premium text-white shadow-sm hover:bg-premium/90 active:bg-premium/80 active:scale-[0.98] font-medium",
                // Studio: Minimal ink/paper
                studio:
                    "bg-foreground text-background hover:opacity-90 active:opacity-80 active:scale-[0.98] dark:bg-foreground dark:text-background font-medium tracking-tight",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 px-3 text-xs",
                lg: "h-10 px-6",
                xl: "h-12 px-8 text-base",
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
                    <Loader2 className="h-4 w-4 animate-spin" />
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

export { Button, buttonVariants }
