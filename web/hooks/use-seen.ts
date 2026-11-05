"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * True once the element has scrolled into view, and immediately when motion is reduced. Every gesture on the
 * site is made once, on scroll-in, from this one hook (promoted from the research figure kit, Nov 4, 2026).
 */
export function useSeen<T extends Element>(threshold = 0.35) {
    const ref = useRef<T>(null);
    const reduced = useReducedMotion();
    const [seen, setSeen] = useState(false);
    useEffect(() => {
        if (reduced) {
            setSeen(true);
            return;
        }
        const node = ref.current;
        if (!node || typeof IntersectionObserver === "undefined") {
            setSeen(true);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setSeen(true);
                observer.disconnect();
            }
        }, { threshold });
        observer.observe(node);
        return () => observer.disconnect();
    }, [reduced, threshold]);
    return { ref, seen };
}
