"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SCROLL_START = 48;

/**
 * The recruiter's screen in the hero. The reviewer note starts blurred and clears once, when the visitor
 * has started scrolling and the card is fully in view: right away on a laptop, and once the card scrolls
 * up into view on a phone. Without JavaScript the note simply stays blurred.
 */
export function NoteReveal({ className, revealedClassName, children }: {
    className: string;
    revealedClassName: string;
    children: ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        const card = ref.current;
        if (!card || revealed) return;
        let inView = false;
        const check = () => {
            if (inView && window.scrollY > SCROLL_START) setRevealed(true);
        };
        const observer = new IntersectionObserver(([entry]) => {
            // The pane is tall at content width, so "in view" means most of it, not all of it.
            inView = entry.intersectionRatio >= 0.6;
            check();
        }, { threshold: [0, 0.6, 1] });
        observer.observe(card);
        window.addEventListener("scroll", check, { passive: true });
        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", check);
        };
    }, [revealed]);

    return (
        <div ref={ref} className={cn(className, revealed && revealedClassName)} data-revealed={revealed ? "true" : undefined}>
            {children}
        </div>
    );
}
