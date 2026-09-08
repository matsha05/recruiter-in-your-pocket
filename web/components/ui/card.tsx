"use client"

import * as React from "react"
import { m as motion, useReducedMotion, HTMLMotionProps } from "motion/react"
import { cn } from "@/lib/utils"
import { CARD_HOVER, CARD_TAP } from "@/lib/animation"

/** Alpine structural sheet. Prefer open layout unless grouping changes meaning. */
const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-2xl border border-line bg-card text-card-foreground shadow-sheet md:rounded-sheet",
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
                    "rounded-2xl border border-line bg-card text-card-foreground shadow-sheet md:rounded-sheet",
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
        className={cn("flex flex-col space-y-2 p-5 md:p-8", className)}
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
        className={cn("font-display text-2xl font-medium leading-[30px] tracking-tight", className)}
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
    <div ref={ref} className={cn("p-5 pt-0 md:p-8 md:pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-5 pt-0 md:p-8 md:pt-0", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardInteractive, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
