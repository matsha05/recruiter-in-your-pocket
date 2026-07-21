import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { m as motion, HTMLMotionProps } from "motion/react"
import { BUTTON_TAP } from "@/lib/animation"
import { CircleNotch } from "@phosphor-icons/react"

/**
 * Lifted Line button primitive.
 * Brand actions use ink with citron directional accents. Legacy premium remains
 * available for paid-product moments until those surfaces are migrated.
 */
const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-sm hover:bg-primary/92 active:scale-[0.98] active:bg-primary/82",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
                outline:
                    "border border-border/55 bg-card/70 hover:bg-secondary/80 hover:border-brand/30 active:bg-secondary/90 active:scale-[0.98]",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70 active:scale-[0.98]",
                ghost:
                    "hover:bg-secondary/80 hover:text-secondary-foreground active:bg-secondary/90",
                link:
                    "text-slate-muted underline-offset-4 hover:underline hover:text-foreground",
                // Recruiter-first primary CTA: ink; arrow/icon picks up citron
                brand:
                    "bg-foreground text-background hover:bg-foreground/90 active:bg-foreground/82 active:scale-[0.98] font-medium [&_svg]:text-citron",
                // Legacy paid-product emphasis; do not use as a general brand accent
                premium:
                    "bg-premium text-white shadow-[inset_0_1px_0_rgb(255_255_255_/0.2),0_14px_30px_-20px_rgb(217_119_6_/0.6)] hover:bg-premium/92 hover:shadow-[inset_0_1px_0_rgb(255_255_255_/0.2),0_20px_34px_-22px_rgb(217_119_6_/0.68)] active:bg-premium/82 active:scale-[0.98] font-medium",
                // Studio: Minimal ink/paper
                studio:
                    "bg-foreground text-background hover:opacity-90 active:opacity-80 active:scale-[0.98] dark:bg-foreground dark:text-background font-medium tracking-tight",
            },
            size: {
                default: "min-h-11 px-4 py-2",
                sm: "min-h-11 px-3 py-2 text-xs",
                lg: "min-h-12 px-6 py-3",
                xl: "min-h-12 px-8 py-3 text-base",
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
