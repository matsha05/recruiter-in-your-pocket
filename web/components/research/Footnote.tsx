"use client";

import { useState, useRef, useEffect } from "react";

interface FootnoteProps {
    id: number;
    title: string;
    author: string;
    year: string | number;
    evidence: string;
    sourceUrl: string;
}

/**
 * Footnote - Superscript citation marker with hover card
 * 
 * Design intent: Credibility signal, not interaction feature.
 * Card shows: title, author/year, one-sentence evidence, source link.
 * No abstracts, no scrolling, no extra UI.
 */
export default function Footnote({
    id,
    title,
    author,
    year,
    evidence,
    sourceUrl,
}: FootnoteProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState<"above" | "below">("above");
    const markerRef = useRef<HTMLSpanElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    // Determine if card should appear above or below based on viewport position
    useEffect(() => {
        if (isVisible && markerRef.current) {
            const rect = markerRef.current.getBoundingClientRect();
            const spaceAbove = rect.top;
            const cardHeight = 160; // Approximate card height

            if (spaceAbove < cardHeight + 20) {
                setPosition("below");
            } else {
                setPosition("above");
            }
        }
    }, [isVisible]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                cardRef.current &&
                markerRef.current &&
                !cardRef.current.contains(e.target as Node) &&
                !markerRef.current.contains(e.target as Node)
            ) {
                setIsVisible(false);
            }
        };

        if (isVisible) {
            document.addEventListener("click", handleClickOutside);
        }
        return () => document.removeEventListener("click", handleClickOutside);
    }, [isVisible]);

    return (
        <span className="footnote-container">
            <span
                ref={markerRef}
                className="footnote-marker"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onClick={() => setIsVisible(!isVisible)}
                role="button"
                tabIndex={0}
                aria-label={`Footnote ${id}: ${title}`}
            >
                {id}
            </span>

            {isVisible && (
                <div
                    ref={cardRef}
                    className={`footnote-card footnote-card--${position}`}
                    onMouseEnter={() => setIsVisible(true)}
                    onMouseLeave={() => setIsVisible(false)}
                >
                    <div className="footnote-card-title">{title}</div>
                    <div className="footnote-card-meta">
                        {author}, {year}
                    </div>
                    <p className="footnote-card-evidence">{evidence}</p>
                    <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footnote-card-link"
                    >
                        View source →
                    </a>
                </div>
            )}
        </span>
    );
}
