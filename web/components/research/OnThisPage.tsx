"use client";

import { useState, useEffect } from "react";

interface Section {
    id: string;
    label: string;
}

/**
 * OnThisPage - Sticky right rail for research pages
 * 
 * Design intent: Credibility cue, not navigation feature.
 * Feels like internal research docs from a serious hiring team.
 * 
 * Fixed sections (hard-coded for consistency):
 * - Study Snapshot
 * - Key Insights
 * - Examples
 * - What this changes in RIYP
 * - Sources & Notes
 */

const SECTIONS: Section[] = [
    { id: "study-snapshot", label: "Study Snapshot" },
    { id: "key-insights", label: "Key Insights" },
    { id: "examples", label: "Examples" },
    { id: "riyp-changes", label: "What this changes in RIYP" },
    { id: "sources-notes", label: "Sources & Notes" },
];

export default function OnThisPage() {
    const [activeSection, setActiveSection] = useState<string>("");
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show rail after scrolling past hero (approximately 400px)
            const scrollY = window.scrollY;
            setIsVisible(scrollY > 400);

            // Hide when Sources section is in lower viewport (near bottom)
            const sourcesEl = document.getElementById("sources-notes");
            if (sourcesEl) {
                const rect = sourcesEl.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.3) {
                    setIsVisible(false);
                }
            }

            // Scroll-spy: determine active section
            let currentSection = "";
            for (const section of SECTIONS) {
                const el = document.getElementById(section.id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    // Section is active if its top is within the upper third of viewport
                    if (rect.top <= window.innerHeight * 0.4) {
                        currentSection = section.id;
                    }
                }
            }
            setActiveSection(currentSection);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Initial check

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleClick = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const offset = 100; // Account for sticky header
            const top = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: "smooth" });
        }
    };

    if (!isVisible) return null;

    return (
        <nav className="on-this-page" aria-label="On this page">
            <ul className="on-this-page-list">
                {SECTIONS.map((section) => (
                    <li key={section.id} className="on-this-page-item">
                        <button
                            onClick={() => handleClick(section.id)}
                            className={`on-this-page-link ${activeSection === section.id ? "on-this-page-link--active" : ""
                                }`}
                        >
                            <span className="on-this-page-indicator" />
                            <span className="on-this-page-text">{section.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
