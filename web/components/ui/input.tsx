import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * V2.1 Input Component
 * - 4px radius
 * - No border by default, bg-secondary/50
 * - Focus: ring-1 ring-ring (Slate)
 */
export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-9 w-full rounded-md border-0 bg-secondary/50 px-3 py-1 text-sm transition-all duration-normal ease-snap",
                    "placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-background",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
