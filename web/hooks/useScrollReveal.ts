"use client";

import { useEffect, useRef, useState, RefObject } from "react";

interface UseScrollRevealOptions {
    /** Visibility threshold (0-1). Default: 0.1 */
    threshold?: number;
    /** Root margin. Default: "0px 0px -50px 0px" per motion-primitives.md */
    rootMargin?: string;
    /** Only trigger once. Default: true */
    triggerOnce?: boolean;
}

interface UseScrollRevealReturn {
    ref: RefObject<HTMLElement | null>;
    isVisible: boolean;
}

/**
 * useScrollReveal - IntersectionObserver hook for scroll-triggered animations
 * Per motion-primitives.md: threshold 0.1, margin -50px bottom
 * 
 * @example
 * ```tsx
 * const { ref, isVisible } = useScrollReveal();
 * return (
 *   <motion.div
 *     ref={ref}
 *     variants={SCROLL_REVEAL_VARIANTS}
 *     initial="hidden"
 *     animate={isVisible ? "visible" : "hidden"}
 *   >
 *     Content
 *   </motion.div>
 * );
 * ```
 */
export function useScrollReveal({
    threshold = 0.1,
    rootMargin = "0px 0px -50px 0px",
    triggerOnce = true,
}: UseScrollRevealOptions = {}): UseScrollRevealReturn {
    const ref = useRef<HTMLElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) {
            // Immediately show content if user prefers reduced motion
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [threshold, rootMargin, triggerOnce]);

    return { ref, isVisible };
}

export default useScrollReveal;
