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
        tags: ["scanning", "structure"],
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
        tags: ["scanning", "bullets"],
        href: "/research/how-people-scan",
        productTie: "Bullet Upgrades",
    },
    {
        id: "ats-myths",
        number: "03",
        category: "Industry analysis",
        title: "ATS Myths vs Reality",
        thesis: "The '75% never read' claim is marketing, not research. ATS organizes—it rarely auto-rejects.",
        methods: ["Industry analysis", "Vendor research"],
        readTime: "4 min",
        tags: ["ats", "structure"],
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

            <section className="research-hero">
                <span className="research-chip">The foundation</span>
                <h1 className="research-title">Hiring Research Library</h1>
                <p className="research-subtitle">
                    Most resume tools lean on myths about bots and secret filters. Recruiter in Your Pocket
                    is built on how recruiters actually read resumes and decide who moves forward.
                </p>
            </section>

            {/* Filter chips - static for now, could be interactive later */}
            <div className="filter-chips">
                <span className="filter-chip active">All Studies</span>
                <span className="filter-chip">Scanning</span>
                <span className="filter-chip">Structure</span>
                <span className="filter-chip">Bullets</span>
                <span className="filter-chip">ATS</span>
            </div>

            {/* Core Studies Section */}
            <div className="core-studies-section">
                <h2 className="core-studies-label">Core Studies</h2>

                <div className="research-card-grid">
                    {studies.map((study) => (
                        <Link key={study.id} href={study.href} className="research-card">
                            <div className="research-card-source">
                                {study.number} · {study.category}
                            </div>
                            <div className="research-card-title">{study.title}</div>
                            <p className="research-card-excerpt">{study.thesis}</p>
                            <div className="research-card-meta">
                                <span className="research-card-read-time">📖 {study.readTime}</span>
                                <div className="research-card-methods">
                                    {study.methods.map((method) => (
                                        <span key={method} className="research-card-method">
                                            {method}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="research-card-takeaway">
                                We use this to design <strong>{study.productTie}</strong>
                            </div>
                            <span className="research-card-arrow">Read the deep dive →</span>
                        </Link>
                    ))}
                </div>
            </div>

            <h2 className="research-section-title">How this shapes Recruiter in Your Pocket</h2>

            <ul className="research-bullets">
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

            <div className="highlight-box">
                <p>
                    We will continue to add to this research section as we incorporate more evidence into
                    how we design and improve Recruiter in Your Pocket.
                </p>
            </div>

            <div className="cta-section" style={{ textAlign: "center", margin: "40px 0" }}>
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
