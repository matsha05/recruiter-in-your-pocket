"use client";

import Link from "next/link";
import type { StudyData } from "../../types/research";
import ThemeToggle from "../shared/ThemeToggle";
import StudySnapshot from "./StudySnapshot";
import InsightCard from "./InsightCard";
import ProductConnection from "./ProductConnection";
import SourcesNotes from "./SourcesNotes";
import FigureWrapper from "./FigureWrapper";
import Footnote from "./Footnote";
import OnThisPage from "./OnThisPage";

// Import diagram components
import ResumeScanZones from "./diagrams/ResumeScanZones";
import ScanPatternOverlay from "./diagrams/ScanPatternOverlay";
import MythRealityVisual from "./diagrams/MythRealityVisual";

import "../../styles/research.css";

// Map component names to actual components
const diagramComponents: Record<string, React.ComponentType> = {
    ResumeScanZones,
    ScanPatternOverlay,
    MythRealityVisual,
};

interface ResearchPageProps {
    study: StudyData;
    /** Optional additional sections to render between standard sections */
    children?: React.ReactNode;
}

/**
 * ResearchPage - Shared component for rendering research deep dives from JSON data
 * 
 * Follows the Research UI Contract for editorial design.
 */
export default function ResearchPage({ study, children }: ResearchPageProps) {
    const DiagramComponent = study.figures[0]?.component
        ? diagramComponents[study.figures[0].component]
        : null;

    return (
        <div className="research-container">
            <OnThisPage />

            <header className="research-header">
                <Link href="/research" className="back-link">
                    ← Back to Hiring Research
                </Link>
                <ThemeToggle />
            </header>

            {/* Page Hero */}
            <section className="page-hero">
                <span className="research-chip">{study.category[0]}</span>
                <h1 className="research-title">{study.title}</h1>
                <p className="research-subtitle">{study.subtitle}</p>
            </section>

            {/* Study Snapshot */}
            <section id="study-snapshot">
                <StudySnapshot
                    whatItStudied={study.studySnapshot.whatItStudied}
                    methods={study.studySnapshot.method}
                    sample={study.studySnapshot.sample}
                    keyFinding={study.studySnapshot.keyFinding}
                    keyStat={study.studySnapshot.keyStat}
                    soWhat={study.studySnapshot.soWhatForResumes}
                    sourceUrl={study.primarySource?.link || undefined}
                    sourceName={study.sources[0]?.name.split(" —")[0] || "Multi-source Analysis"}
                    year={study.year}
                />
            </section>

            {/* Figure 1 */}
            {study.figures[0] && DiagramComponent && (
                <FigureWrapper
                    figureNumber={1}
                    title={study.figures[0].title}
                    caption={study.figures[0].caption}
                >
                    <DiagramComponent />
                </FigureWrapper>
            )}

            {/* Custom content injection point */}
            {children}

            {/* Key Insights */}
            <section id="key-insights">
                <h2>Key insights</h2>
                <div className="insight-cards">
                    {study.keyInsights.map((insight, i) => (
                        <InsightCard
                            key={i}
                            marker={insight.marker}
                            index={insight.index ?? (insight.marker ? undefined : i)}
                            title={insight.title}
                            research={insight.explanation}
                            riyp={insight.riypImplication}
                        />
                    ))}
                </div>
            </section>

            {/* RIYP Changes */}
            <section id="riyp-changes">
                <ProductConnection
                    connections={study.riypChanges.map(c => ({
                        feature: c.feature,
                        because: c.why,
                    }))}
                />
            </section>

            {/* CTA */}
            <div style={{ margin: "40px 0" }}>
                <Link href="/workspace" className="cta-link">
                    See how your resume reads → Get your free analysis
                </Link>
            </div>

            {/* Sources & Notes */}
            <section id="sources-notes">
                <SourcesNotes
                    sources={study.sources.map(s => ({
                        name: s.name,
                        url: s.url,
                        date: s.date,
                    }))}
                    methodology={[]}
                    limitations={study.limitations.join(" ")}
                />
            </section>

            {/* Footer */}
            <footer className="research-footer">
                <p>Made with care in Boulder, CO 🤍</p>
                <p>
                    <Link href="/">Home</Link> · <Link href="/research">Hiring Research</Link> ·{" "}
                    <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link>
                </p>
            </footer>
        </div>
    );
}
