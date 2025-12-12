import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "../../../components/shared/ThemeToggle";
import StudySnapshot from "../../../components/research/StudySnapshot";
import InsightCard from "../../../components/research/InsightCard";
import ProductConnection from "../../../components/research/ProductConnection";
import SourcesNotes from "../../../components/research/SourcesNotes";
import ExpandCollapse from "../../../components/research/ExpandCollapse";
import CalloutStrip from "../../../components/research/CalloutStrip";
import ScanPatternOverlay from "../../../components/research/diagrams/ScanPatternOverlay";
import "../../../styles/research.css";

export const metadata: Metadata = {
    title: "How People Scan Resumes | Hiring Research",
    description:
        "Eyetracking research shows people scan resumes using F-shaped patterns, focusing on headings, numbers, and the start of bullets.",
};

export default function HowPeopleScanPage() {
    return (
        <div className="research-container">
            <header className="research-header">
                <Link href="/research" className="back-link">
                    ← Back to Hiring Research
                </Link>
                <ThemeToggle />
            </header>

            <section className="page-hero">
                <span className="research-chip">Usability research</span>
                <h1 className="research-title">How People Scan Resumes</h1>
                <p className="research-subtitle">
                    People don&apos;t read resumes line by line. They scan for structure, signal, and proof
                    that it&apos;s worth their time to look closer.
                </p>
            </section>

            {/* Study Snapshot - Above the fold */}
            <StudySnapshot
                whatItStudied="How eyes move when reading web content and structured documents"
                methods={["Eye-tracking", "Usability testing", "Pattern analysis"]}
                sample="Multiple studies across thousands of participants"
                keyFinding="~80% of users scan pages rather than reading word-by-word"
                soWhat="Your resume structure matters as much as the content itself"
                sourceUrl="https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/"
                sourceName="Nielsen Norman Group"
            />

            {/* Hero Diagram */}
            <ScanPatternOverlay />

            <h2>People scan first, then decide whether to read</h2>

            <p>
                Eyetracking studies on web reading show that most users scan new pages instead of reading
                every word. One classic study found that close to 80 percent of users scanned a web page on
                first contact, while only a small minority read word by word.
            </p>

            <CalloutStrip
                type="recruiter"
                content="Recruiters are under time pressure. They start by scanning for role, level, recent companies, dates, and quick signals of scope. They only move into deeper reading if the scan gives them enough reason to care."
            />

            <ExpandCollapse title="View methodology details">
                <p>
                    The Nielsen Norman Group conducted extensive eye-tracking research using specialized
                    hardware to trace exactly where users look when consuming web content. Heat maps were
                    generated from thousands of reading sessions to identify consistent patterns like the
                    F-shape and spotted pattern.
                </p>
            </ExpandCollapse>

            <h2>Key insights from scanning research</h2>

            <div className="insight-cards">
                <InsightCard
                    icon="F"
                    title="The F-shaped pattern dominates"
                    research="Eyes sweep horizontally at top, then shorter horizontal sweep, then vertical scan down the left side."
                    riyp="We check that your most important info appears where F-pattern eyes land."
                />
                <InsightCard
                    icon="•••"
                    title="Eyes jump to anchors"
                    research="The 'spotted pattern' shows eyes jumping to numbers, names, titles, and keywords."
                    riyp="Bullet Upgrades encourage leading with metrics and strong verbs."
                />
                <InsightCard
                    icon="📑"
                    title="Headings create layers"
                    research="The 'layer cake pattern' shows eyes hopping from heading to heading, skimming content between."
                    riyp="We ensure your section headers are clear and distinct."
                />
                <InsightCard
                    icon="🎯"
                    title="One idea per bullet wins"
                    research="Multi-idea bullets get partially scanned; single-idea bullets get fully processed."
                    riyp="We flag compound bullets and suggest splitting them."
                />
                <InsightCard
                    icon="🔢"
                    title="Numbers near the front get seen"
                    research="Impact buried at the end of sentences often gets missed during scanning."
                    riyp="Bullet Upgrades move metrics toward the front of bullets."
                />
                <InsightCard
                    icon="📏"
                    title="Consistent alignment speeds scanning"
                    research="Predictable layouts let eyes move faster with more confidence."
                    riyp="Our Readability score factors in formatting consistency."
                />
            </div>

            <h2>Why dense bullets underperform</h2>

            <p>The eyetracking research shows that dense paragraphs and multi-idea bullets are often skimmed or skipped.</p>

            <CalloutStrip
                type="dont"
                label="Don't do this"
                content="Long bullets that mix tasks, tools, and outcomes in one line. No numbers. Impact buried at the end. Repeated filler phrases like 'responsible for' and 'worked on'."
            />

            <CalloutStrip
                type="do"
                label="Do this"
                content="Short, focused bullets with clear outcomes. Numbers early. Strong verb at the start. One idea per bullet."
            />

            <div className="highlight-box">
                <p>
                    When a recruiter scans dense bullets, their eyes don&apos;t find anything to latch onto.
                    The result is a weak first impression, even if the candidate has done strong work.
                </p>
            </div>

            {/* Product Connection */}
            <ProductConnection
                connections={[
                    {
                        feature: "Bullet Upgrades",
                        because:
                            "are designed to match what the eyetracking research says—one idea per bullet, clearer verbs, and numbers that show scope.",
                    },
                    {
                        feature: "Readability Score",
                        because:
                            "is influenced by how easy it is for a recruiter to scan and understand your recent experience, not just by grammar.",
                    },
                    {
                        feature: "What is Working / Missing",
                        because:
                            "calls out dense bullets and missing numbers because these patterns make your resume harder to scan.",
                    },
                    {
                        feature: "Report Structure",
                        because:
                            "uses headings, sections, and spacing aligned with scanning behavior—not just aesthetics.",
                    },
                ]}
            />

            <div className="highlight-box">
                <p>
                    Our goal is simple: make your resume match how people actually consume information, so
                    that the work you have already done is easier for a recruiter to see and act on.
                </p>
            </div>

            <div style={{ margin: "40px 0" }}>
                <Link href="/workspace" className="cta-link">
                    See how your resume scans → Get your free analysis
                </Link>
            </div>

            {/* Sources & Notes */}
            <SourcesNotes
                sources={[
                    {
                        name: "F-Shaped Pattern For Reading Web Content",
                        url: "https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/",
                        date: "2006, updated 2017",
                    },
                    {
                        name: "How People Read on the Web: The Eyetracking Evidence",
                        url: "https://www.nngroup.com/reports/how-people-read-web-eyetracking-evidence/",
                        date: "2020",
                    },
                ]}
                methodology={[
                    "Eye-tracking hardware recording gaze patterns",
                    "Multiple studies across diverse user populations",
                    "Heat map aggregation from thousands of sessions",
                    "Pattern classification (F, spotted, layer cake, commitment)",
                ]}
                limitations="Research primarily on web content; resume reading may vary. However, patterns are consistent across document types."
            />

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
