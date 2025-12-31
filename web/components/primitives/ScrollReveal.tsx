"use client";

import { forwardRef, ReactNode } from "react";
import { motion, useReducedMotion, HTMLMotionProps } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { SCROLL_REVEAL_VARIANTS, SCROLL_REVEAL_FAST } from "@/lib/animation";

interface ScrollRevealProps extends Omit<HTMLMotionProps<"div">, "ref"> {
    children: ReactNode;
    /** Use faster variant (smaller y offset, quicker duration) */
    fast?: boolean;
    /** Custom threshold for intersection observer */
    threshold?: number;
    /** Additional class names */
    className?: string;
}

/**
 * ScrollReveal - Wrapper component for scroll-triggered entrance animations
 * Per motion-primitives.md: elements fade up from y:32 on scroll
 * 
 * @example
 * ```tsx
 * <ScrollReveal>
 *   <Card>Content appears on scroll</Card>
 * </ScrollReveal>
 * ```
 */
export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
    ({ children, fast = false, threshold, className, ...props }, forwardedRef) => {
        const { ref, isVisible } = useScrollReveal({ threshold });
        const prefersReducedMotion = useReducedMotion();

        const variants = prefersReducedMotion
            ? {}
            : fast
                ? SCROLL_REVEAL_FAST
                : SCROLL_REVEAL_VARIANTS;

        return (
            <motion.div
                ref={(node) => {
                    // Handle both refs
                    (ref as React.MutableRefObject<HTMLElement | null>).current = node;
                    if (typeof forwardedRef === "function") {
                        forwardedRef(node);
                    } else if (forwardedRef) {
                        forwardedRef.current = node;
                    }
                }}
                initial={prefersReducedMotion ? false : "hidden"}
                animate={isVisible ? "visible" : "hidden"}
                variants={variants}
                className={className}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

ScrollReveal.displayName = "ScrollReveal";

export default ScrollReveal;
