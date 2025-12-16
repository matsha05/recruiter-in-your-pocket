"use client";

import Link from "next/link";
import { useRef, useEffect, useCallback } from "react";
import { ArrowRight, BookOpen, Clock, FileText } from "lucide-react";

/**
 * Premium Research Marquee
 * 
 * Features:
 * - requestAnimationFrame for 60fps smoothness
 * - Drag-to-scroll with momentum (touch + mouse)
 * - Auto-scroll that smoothly pauses on interaction
 * - Infinite loop via position reset
 */

const studies = [
    {
        title: "How Recruiters Skim Resumes",
        source: "Eye-tracking",
        description: "Recruiters make decisions in 6 seconds, focusing on titles and companies.",
        href: "/research/how-recruiters-read",
        readTime: "4 min"
    },
    {
        title: "The F-Pattern Scan",
        source: "Usability research",
        description: "People scan in F-patterns, latching onto headings and the start of lines.",
        href: "/research/how-people-scan",
        readTime: "5 min"
    },
    {
        title: "How ATS Actually Works",
        source: "Industry analysis",
        description: "ATS systems rank and filter. Human review is the real bottleneck.",
        href: "/research/ats-myths",
        readTime: "4 min"
    },
    {
        title: "Algorithm Aversion",
        source: "Behavioral study",
        description: "Recruiters punish algorithmic errors but forgive human inconsistency.",
        href: "/research/human-vs-algorithm",
        readTime: "5 min"
    },
    {
        title: "Spelling Errors Matter",
        source: "Screening heuristics",
        description: "Bad spelling can override strong experience for many recruiters.",
        href: "/research/spelling-errors-impact",
        readTime: "3 min"
    },
    {
        title: "Discrimination Persists",
        source: "25-year meta-analysis",
        description: "No decline in hiring discrimination. Resumes are necessary but not sufficient.",
        href: "/research/hiring-discrimination-meta-analysis",
        readTime: "6 min"
    },
    {
        title: "Where Bias Enters",
        source: "Automation audit",
        description: "Bias compounds across ad delivery, screening, and ranking algorithms.",
        href: "/research/automation-and-bias",
        readTime: "5 min"
    },
    {
        title: "Offer Negotiation",
        source: "Recruiter's Playbook",
        description: "Negotiation is coordination, not combat. Make it easy to say yes.",
        href: "/guides/offer-negotiation",
        readTime: "12 min"
    }
];

function ResearchCard({ study }: { study: typeof studies[0] }) {
    return (
        <Link
            href={study.href}
            className="group block flex-shrink-0 w-[280px] md:w-[320px] select-none"
            draggable={false}
        >
            <article className="h-full p-5 rounded-md bg-card border border-border/50 hover:border-border hover:shadow-sm transition-all duration-200 flex flex-col justify-between pointer-events-auto">
                <div className="space-y-2">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <FileText className="w-2.5 h-2.5" />
                        {study.source}
                    </div>
                    <h3 className="font-display text-base leading-snug text-foreground group-hover:text-brand transition-colors">
                        {study.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {study.description}
                    </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {study.readTime}
                    </span>
                    <span className="text-brand opacity-0 group-hover:opacity-100 transition-opacity">Read →</span>
                </div>
            </article>
        </Link>
    );
}

export function BackedByResearch() {
    const trackRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);
    const positionRef = useRef(0);
    const velocityRef = useRef(0);
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const startScrollRef = useRef(0);
    const lastXRef = useRef(0);
    const lastTimeRef = useRef(0);
    const autoScrollSpeedRef = useRef(0.3); // pixels per frame (subtle)
    const isHoveredRef = useRef(false);
    const cardWidthRef = useRef(320 + 16); // card width + gap

    // Calculate total width of one set of cards
    const getSetWidth = useCallback(() => {
        return studies.length * cardWidthRef.current;
    }, []);

    // Animation loop
    const animate = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;

        // Apply velocity (momentum)
        if (Math.abs(velocityRef.current) > 0.1) {
            positionRef.current += velocityRef.current;
            velocityRef.current *= 0.95; // friction
        }

        // Auto-scroll when not interacting
        if (!isDraggingRef.current && !isHoveredRef.current) {
            positionRef.current -= autoScrollSpeedRef.current;
        }

        // Infinite loop: reset position when past first set
        const setWidth = getSetWidth();
        if (positionRef.current <= -setWidth) {
            positionRef.current += setWidth;
        } else if (positionRef.current > 0) {
            positionRef.current -= setWidth;
        }

        // Apply transform
        track.style.transform = `translateX(${positionRef.current}px)`;

        animationRef.current = requestAnimationFrame(animate);
    }, [getSetWidth]);

    // Start animation on mount
    useEffect(() => {
        // Measure actual card width
        const firstCard = trackRef.current?.children[0] as HTMLElement;
        if (firstCard) {
            cardWidthRef.current = firstCard.offsetWidth + 16; // + gap
        }

        animationRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationRef.current);
    }, [animate]);

    // Mouse/Touch handlers
    const handlePointerDown = (e: React.PointerEvent) => {
        isDraggingRef.current = true;
        startXRef.current = e.clientX;
        startScrollRef.current = positionRef.current;
        lastXRef.current = e.clientX;
        lastTimeRef.current = Date.now();
        velocityRef.current = 0;

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDraggingRef.current) return;

        const deltaX = e.clientX - startXRef.current;
        positionRef.current = startScrollRef.current + deltaX;

        // Track velocity for momentum
        const now = Date.now();
        const dt = now - lastTimeRef.current;
        if (dt > 0) {
            velocityRef.current = (e.clientX - lastXRef.current) / dt * 16; // normalize to ~60fps
        }
        lastXRef.current = e.clientX;
        lastTimeRef.current = now;
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        isDraggingRef.current = false;
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    const handleMouseEnter = () => {
        isHoveredRef.current = true;
    };

    const handleMouseLeave = () => {
        isHoveredRef.current = false;
    };

    // Trackpad / Mouse wheel scroll
    const handleWheel = (e: React.WheelEvent) => {
        // Use horizontal scroll (deltaX) or vertical scroll (deltaY) as horizontal
        const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;

        // Prevent browser back/forward gesture when scrolling primarily horizontal
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 0.5) {
            e.preventDefault();
        }

        // Apply scroll with momentum
        velocityRef.current = -delta * 0.5; // Invert and scale for natural feel

        // Temporarily pause auto-scroll
        isHoveredRef.current = true;

        // Resume auto-scroll after interaction stops
        clearTimeout((handleWheel as any).timeout);
        (handleWheel as any).timeout = setTimeout(() => {
            isHoveredRef.current = false;
        }, 2000);
    };

    return (
        <section className="w-full py-20 border-t border-border/30 bg-background overflow-hidden">
            {/* Header */}
            <div className="max-w-2xl mx-auto px-6 mb-12 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <BookOpen className="w-4 h-4 text-brand" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">The Hiring Playbook</span>
                </div>
                <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight tracking-tight mb-4">
                    The rules they <span className="text-brand italic">don't</span> teach you.
                </h2>
                <p className="text-memo text-lg text-muted-foreground mb-6">
                    Built on how recruiters actually make decisions. Not myths.
                </p>
                <Link href="/research">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-brand transition-colors group">
                        See all Research <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                </Link>
            </div>

            {/* Marquee Container */}
            <div
                className="relative cursor-grab active:cursor-grabbing"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
            >
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                {/* Scrollable Track */}
                <div
                    ref={trackRef}
                    className="flex gap-4 pl-6 will-change-transform"
                    style={{ touchAction: 'pan-y' }}
                >
                    {/* Two sets for seamless loop */}
                    {[...studies, ...studies].map((study, i) => (
                        <ResearchCard key={i} study={study} />
                    ))}
                </div>
            </div>
        </section>
    );
}
