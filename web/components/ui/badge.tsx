import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * V2.1 Badge Component
 * - 2px radius (--radius-sm)
 * - Brand and premium variants
 */
const badgeVariants = cva(
    "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground",
                outline:
                    "border-border/20 text-foreground bg-transparent",
                // V2.1 Brand: Teal
                brand:
                    "border-transparent bg-brand/10 text-brand font-medium",
                // V2.1 Premium: Gold
                premium:
                    "border-transparent bg-premium/10 text-premium font-medium",
                // Status badges
                success:
                    "border-transparent bg-moss/10 text-moss",
                warning:
                    "border-transparent bg-amber/10 text-amber",
                error:
                    "border-transparent bg-rose/10 text-rose",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
