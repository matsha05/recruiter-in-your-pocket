"use client"

import * as React from "react"
import { motion, useReducedMotion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { CARD_HOVER, CARD_TAP } from "@/lib/animation"

/**
 * V2.1 Card Component
 * - 4px radius (rounded-md = --radius)
 * - No heavy shadows, only shadow-sm
 * - Border uses --border with opacity
 */
const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-lg border border-border/60 bg-card text-card-foreground shadow-sm",
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"

/**
 * CardInteractive - Card with Framer Motion hover/tap micro-animation
 * Per "Alive, Not Static" principle and motion-primitives.md
 */
interface CardInteractiveProps extends Omit<HTMLMotionProps<"div">, "ref"> {
    className?: string;
    children?: React.ReactNode;
}

const CardInteractive = React.forwardRef<HTMLDivElement, CardInteractiveProps>(
    ({ className, children, ...props }, ref) => {
        const prefersReducedMotion = useReducedMotion();

        return (
            <motion.div
                ref={ref}
                className={cn(
                    "rounded-lg border border-border/60 bg-card text-card-foreground shadow-sm",
                    "cursor-pointer",
                    className
                )}
                whileHover={prefersReducedMotion ? undefined : CARD_HOVER}
                whileTap={prefersReducedMotion ? undefined : CARD_TAP}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);
CardInteractive.displayName = "CardInteractive"

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-4", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("font-display font-medium leading-none tracking-tight", className)}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-4 pt-0", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardInteractive, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }

