import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "../../components/shared/ThemeToggle";
import "../../styles/research.css";

export const metadata: Metadata = {
    title: "Hiring Research | Recruiter in Your Pocket",
    description:
        "Recruiter In Your Pocket is built on how recruiters actually read resumes, not on myths about bots and secret scores. Here is the research that informs our product.",
};

const studies = [
    {
        id: "how-recruiters-read",
        number: "01",
        category: "Eye-tracking research",
        title: "How Recruiters Skim Resumes in 6 Seconds",
        thesis: "Recruiters make fit/no-fit decisions in seconds, focusing on titles, companies, and dates.",
        methods: ["Eye-tracking", "Heat mapping"],
        readTime: "4 min",
        href: "/research/how-recruiters-read",
        productTie: "Recruiter First Impression",
    },
    {
        id: "how-people-scan",
        number: "02",
        category: "Usability research",
        title: "How People Scan Text and Bullets",
        thesis: "People scan pages in F-patterns, latching onto headings, numbers, and the start of lines.",
        methods: ["Usability testing", "Pattern analysis"],
        readTime: "5 min",
        href: "/research/how-people-scan",
        productTie: "Bullet Upgrades",
    },
    {
        id: "ats-myths",
        number: "03",
        category: "Industry analysis",
        title: "ATS: How Applicant Tracking Systems Actually Work",
        thesis: "ATS systems rank and filter candidates. Human review, not algorithms, is the primary bottleneck.",
        methods: ["Peer-reviewed research", "Vendor documentation"],
        readTime: "4 min",
        href: "/research/ats-myths",
        productTie: "Human clarity focus",
    },
];

export default function ResearchPage() {
    return (
        <div className="research-container">
            <header className="research-header">
                <Link href="/" className="back-link">
                    ← Back to Home
                </Link>
                <ThemeToggle />
            </header>

            {/* Hero - no container, just text on background */}
            <section className="library-hero">
                <span className="library-label">The foundation</span>
                <h1 className="library-title">Hiring Research Library</h1>
                <p className="library-subtitle">
                    Most resume tools lean on myths about bots and secret filters. Recruiter in Your Pocket
                    is built on how recruiters actually read resumes and decide who moves forward.
                </p>
            </section>

            {/* Filter tabs - text-only with underline */}
            <nav className="filter-tabs">
                <button className="filter-tab active">All Studies</button>
                <button className="filter-tab">Scanning</button>
                <button className="filter-tab">Structure</button>
                <button className="filter-tab">Bullets</button>
                <button className="filter-tab">ATS</button>
            </nav>

            {/* Study list - editorial rows, not cards */}
            <section className="study-index">
                {studies.map((study) => (
                    <article key={study.id} className="study-row">
                        <span className="study-row-category">{study.category}</span>
                        <h2 className="study-row-title">
                            <Link href={study.href}>{study.title}</Link>
                        </h2>
                        <p className="study-row-thesis">{study.thesis}</p>
                        <div className="study-row-meta">
                            <span className="study-row-time">{study.readTime} read</span>
                            <span className="study-row-dot">·</span>
                            <span className="study-row-methods">
                                Methods: {study.methods.join(", ").toLowerCase()}
                            </span>
                        </div>
                        <p className="study-row-riyp">
                            Informs <strong>{study.productTie}</strong>
                        </p>
                    </article>
                ))}
            </section>

            {/* How this shapes RIYP - simple editorial list */}
            <section className="riyp-section">
                <h2 className="riyp-heading">How this shapes Recruiter in Your Pocket</h2>
                <ul className="riyp-list">
                    <li>
                        <strong>Recruiter First Impression</strong> models the first few seconds where a
                        recruiter decides whether to move you forward or move on.
                    </li>
                    <li>
                        Our <strong>main score</strong> focuses on clarity, scope, and story, not keyword
                        stuffing.
                    </li>
                    <li>
                        <strong>Bullet Upgrades</strong> are designed to match how eyes actually scan impact,
                        numbers, and verbs.
                    </li>
                    <li>
                        Our <strong>ATS education</strong> is honest and simple. We keep your resume parser
                        friendly and recruiter clear instead of selling tricks.
                    </li>
                </ul>
            </section>

            {/* Note */}
            <p className="library-note">
                We will continue to add to this research section as we incorporate more evidence into
                how we design and improve Recruiter in Your Pocket.
            </p>

            {/* CTA */}
            <div className="cta-section" style={{ textAlign: "center", margin: "48px 0" }}>
                <Link href="/workspace" className="cta-link">
                    Try it on your resume → Get your free analysis
                </Link>
            </div>

            <footer className="research-footer">
                <p>Made with care in Boulder, CO 🤍</p>
                <p>
                    <Link href="/">Home</Link> · <Link href="/terms">Terms</Link> ·{" "}
                    <Link href="/privacy">Privacy</Link>
                </p>
            </footer>
        </div>
    );
}
