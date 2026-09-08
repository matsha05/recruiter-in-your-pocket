import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

/** Alpine input primitive with default, focus, disabled, error, and success states. */
const inputVariants = cva(
    "flex min-h-12 w-full rounded-md border bg-card px-4 py-3 text-base transition-[background-color,border-color,box-shadow] duration-normal ease-snap placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-[3px] focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:bg-disabled-surface disabled:text-muted-foreground file:border-0 file:bg-transparent file:text-base file:font-semibold",
    {
        variants: {
            variant: {
                default:
                    "border-control-line focus-visible:border-brand focus-visible:ring-ring",
                error:
                    "border-destructive bg-error-surface focus-visible:ring-destructive focus-visible:border-destructive text-foreground placeholder:text-muted-foreground",
                success:
                    "border-success bg-success-surface focus-visible:ring-success focus-visible:border-success",
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

export { Input }
