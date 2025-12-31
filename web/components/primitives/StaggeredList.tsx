"use client";

import { forwardRef, ReactNode, Children } from "react";
import { motion, useReducedMotion, HTMLMotionProps } from "framer-motion";
import { STAGGER_CONTAINER, STAGGER_CONTAINER_SLOW, STAGGER_ITEM } from "@/lib/animation";

interface StaggeredListProps extends Omit<HTMLMotionProps<"div">, "ref" | "children"> {
    children: ReactNode;
    /** Use slower stagger (150ms vs 75ms) */
    slow?: boolean;
    /** Additional class names */
    className?: string;
}

/**
 * StaggeredList - Container that staggers children entrance animations
 * Per motion-primitives.md: 75ms - 150ms stagger per item
 * 
 * @example
 * ```tsx
 * <StaggeredList>
 *   <StaggeredItem><Card /></StaggeredItem>
 *   <StaggeredItem><Card /></StaggeredItem>
 * </StaggeredList>
 * ```
 */
export const StaggeredList = forwardRef<HTMLDivElement, StaggeredListProps>(
    ({ children, slow = false, className, ...props }, ref) => {
        const prefersReducedMotion = useReducedMotion();

        const containerVariants = prefersReducedMotion
            ? {}
            : slow
                ? STAGGER_CONTAINER_SLOW
                : STAGGER_CONTAINER;

        return (
            <motion.div
                ref={ref}
                initial={prefersReducedMotion ? false : "hidden"}
                animate="visible"
                variants={containerVariants}
                className={className}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

StaggeredList.displayName = "StaggeredList";

interface StaggeredItemProps extends Omit<HTMLMotionProps<"div">, "ref"> {
    children: ReactNode;
    className?: string;
}

/**
 * StaggeredItem - Individual item within a StaggeredList
 */
export const StaggeredItem = forwardRef<HTMLDivElement, StaggeredItemProps>(
    ({ children, className, ...props }, ref) => {
        const prefersReducedMotion = useReducedMotion();

        return (
            <motion.div
                ref={ref}
                variants={prefersReducedMotion ? {} : STAGGER_ITEM}
                className={className}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

StaggeredItem.displayName = "StaggeredItem";

export default StaggeredList;
