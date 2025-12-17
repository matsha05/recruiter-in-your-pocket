import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

/**
 * V2.1 Input Component
 * - 4px radius
 * - No border by default, bg-secondary/50
 * - Focus: ring-1 ring-ring (Slate)
 * - Full state coverage: focus, disabled, error, success
 */
const inputVariants = cva(
    "flex h-9 w-full rounded-md border bg-secondary/50 px-3 py-1 text-sm transition-all duration-normal ease-snap placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium",
    {
        variants: {
            variant: {
                default:
                    "border-transparent focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-background focus-visible:border-border/30",
                error:
                    "border-destructive/50 bg-destructive/5 focus-visible:ring-1 focus-visible:ring-destructive focus-visible:border-destructive/50 text-foreground placeholder:text-destructive/60",
                success:
                    "border-success/50 bg-success/5 focus-visible:ring-1 focus-visible:ring-success focus-visible:border-success/50",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
    error?: boolean
    success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, variant, error, success, ...props }, ref) => {
        // Determine variant based on error/success props
        const computedVariant = error ? "error" : success ? "success" : variant

        return (
            <input
                type={type}
                className={cn(inputVariants({ variant: computedVariant, className }))}
                ref={ref}
                aria-invalid={error ? "true" : undefined}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input, inputVariants }

