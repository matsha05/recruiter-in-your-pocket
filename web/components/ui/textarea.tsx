import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

/**
 * V2.1 Textarea Component
 * - Consistent with Input styling
 * - Full state coverage: focus, disabled, error, success
 */
const textareaVariants = cva(
    "flex min-h-[80px] w-full rounded-md border bg-secondary/50 px-3 py-2 text-sm transition-all duration-normal ease-snap placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none",
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

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
    error?: boolean
    success?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, variant, error, success, ...props }, ref) => {
        const computedVariant = error ? "error" : success ? "success" : variant

        return (
            <textarea
                className={cn(textareaVariants({ variant: computedVariant, className }))}
                ref={ref}
                aria-invalid={error ? "true" : undefined}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }

