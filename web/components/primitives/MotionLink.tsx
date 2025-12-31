"use client";

import { forwardRef, ReactNode } from "react";
import Link, { LinkProps } from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ARROW_SLIDE, DURATION, EASE_SNAP } from "@/lib/animation";

interface MotionLinkProps extends LinkProps {
    children: ReactNode;
    className?: string;
    /** Show animated underline on hover (Lizi Standard) */
    underline?: boolean;
    /** Show arrow that slides on hover */
    arrow?: boolean;
    /** External link (opens in new tab) */
    external?: boolean;
}

/**
 * MotionLink - Animated link component
 * Per motion-primitives.md: 
 * - Underline: width 0% → 100% on hover (The Lizi Standard)
 * - Arrow: translateX(4px) on hover (Link-Arrow Slide Standard)
 */
export const MotionLink = forwardRef<HTMLAnchorElement, MotionLinkProps>(
    ({
        children,
        className,
        underline = false,
        arrow = false,
        external = false,
        ...props
    }, ref) => {
        const prefersReducedMotion = useReducedMotion();

        const externalProps = external ? {
            target: "_blank",
            rel: "noopener noreferrer"
        } : {};

        return (
            <Link
                ref={ref}
                className={cn(
                    "group inline-flex items-center gap-1.5",
                    "text-foreground transition-colors",
                    "hover:text-brand",
                    underline && "relative",
                    className
                )}
                {...externalProps}
                {...props}
            >
                <span className="relative">
                    {children}
                    {underline && (
                        <motion.span
                            className="absolute bottom-0 left-0 h-[1.5px] bg-current"
                            initial={{ width: "0%" }}
                            whileHover={prefersReducedMotion ? undefined : { width: "100%" }}
                            transition={{
                                duration: DURATION.normal,
                                ease: EASE_SNAP
                            }}
                            style={{
                                // For group hover to work, we use CSS fallback
                            }}
                        />
                    )}
                </span>
                {arrow && (
                    <motion.span
                        className="inline-flex"
                        initial={{ x: 0 }}
                        whileHover={prefersReducedMotion ? undefined : ARROW_SLIDE}
                    >
                        <ArrowRight className="w-4 h-4" />
                    </motion.span>
                )}
            </Link>
        );
    }
);

MotionLink.displayName = "MotionLink";

/**
 * ArrowLink - Simple link with sliding arrow
 * Shorthand for common CTA pattern
 */
interface ArrowLinkProps extends LinkProps {
    children: ReactNode;
    className?: string;
}

export const ArrowLink = forwardRef<HTMLAnchorElement, ArrowLinkProps>(
    ({ children, className, ...props }, ref) => {
        const prefersReducedMotion = useReducedMotion();

        return (
            <Link
                ref={ref}
                className={cn(
                    "group inline-flex items-center gap-1.5",
                    "text-brand hover:text-brand/80 transition-colors",
                    "font-medium",
                    className
                )}
                {...props}
            >
                {children}
                <motion.span
                    className="inline-flex transition-transform"
                    initial={false}
                    animate={{ x: 0 }}
                    whileHover={prefersReducedMotion ? undefined : { x: 4 }}
                    transition={{ duration: DURATION.normal, ease: EASE_SNAP }}
                >
                    <ArrowRight className="w-4 h-4" />
                </motion.span>
            </Link>
        );
    }
);

ArrowLink.displayName = "ArrowLink";

export default MotionLink;
