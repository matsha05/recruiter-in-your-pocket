import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "../../components/shared/ThemeToggle";
import "../../styles/research.css";

export const metadata: Metadata = {
    title: "Hiring Research | Recruiter in Your Pocket",
    description: "Recruiter In Your Pocket is built on how recruiters actually read resumes, not on myths about bots and secret scores. Here is the research that informs our product."
};

export default function ResearchPage() {
    return (
        <div className="research-container">
            <header className="research-header">
                <Link href="/" className="back-link">← Back to Home</Link>
                <ThemeToggle />
            </header>

            <section className="research-hero">
                <span className="research-chip">The foundation</span>
                <h1 className="research-title">Backed by Hiring Research</h1>
                <p className="research-subtitle">
                    Most resume tools lean on myths about bots and secret filters. Recruiter in Your Pocket is built on how
                    recruiters actually read resumes and decide who moves forward.
                </p>
            </section>

            <p>
                We use hiring and usability research to shape how our product works, how we score your resume, and which
                changes we recommend first.
            </p>

            <h2 className="research-section-title">Three studies that shape our approach</h2>

            <div className="research-card-grid">
                <Link href="/research/how-recruiters-read" className="research-card">
                    <div className="research-card-source">01 · Eye-tracking research</div>
                    <div className="research-card-title">How recruiters skim resumes in 6 seconds</div>
                    <p className="research-card-excerpt">
                        Eye tracking research shows that recruiters spend only a few seconds on their initial fit or no fit
                        decision. They focus on titles, companies, dates, and the first signals of scope.
                    </p>
                    <div className="research-card-takeaway">
                        We use this to design <strong>Recruiter First Impression</strong> and decide what our main score
                        should measure.
                    </div>
                    <span className="research-card-arrow">Read the deep dive →</span>
                </Link>

                <Link href="/research/how-people-scan" className="research-card">
                    <div className="research-card-source">02 · Usability research</div>
                    <div className="research-card-title">How people scan text and bullet points</div>
                    <p className="research-card-excerpt">
                        Usability research on reading patterns shows that people scan pages rather than reading every word. They pay
                        special attention to headings, bullets, numbers, and names.
                    </p>
                    <div className="research-card-takeaway">
                        We use this to design <strong>Bullet Upgrades</strong> and encourage one idea per bullet.
                    </div>
                    <span className="research-card-arrow">Read the deep dive →</span>
                </Link>

                <Link href="/research/ats-myths" className="research-card">
                    <div className="research-card-source">03 · Industry analysis</div>
                    <div className="research-card-title">ATS myths versus reality</div>
                    <p className="research-card-excerpt">
                        The claim that &quot;75% of resumes are never read&quot; comes from marketing, not credible hiring data. Modern ATS
                        tools mostly parse and organize resumes, not silently delete them.
                    </p>
                    <div className="research-card-takeaway">
                        We use this to avoid fear-based messaging and focus on <strong>human clarity</strong> instead.
                    </div>
                    <span className="research-card-arrow">Read the deep dive →</span>
                </Link>
            </div>

            <h2 className="research-section-title">How this shapes Recruiter in Your Pocket</h2>

            <ul className="research-bullets">
                <li><strong>Recruiter First Impression</strong> models the first few seconds where a recruiter decides
                    whether to move you forward or move on.</li>
                <li>Our <strong>main score</strong> focuses on clarity, scope, and story, not keyword stuffing.</li>
                <li><strong>Bullet Upgrades</strong> are designed to match how eyes actually scan impact, numbers, and
                    verbs.</li>
                <li>Our <strong>ATS education</strong> is honest and simple. We keep your resume parser friendly and recruiter
                    clear instead of selling tricks.</li>
            </ul>

            <div className="highlight-box">
                <p>We will continue to add to this research section as we incorporate more evidence into how we design and
                    improve Recruiter in Your Pocket.</p>
            </div>

            <div className="cta-section" style={{ textAlign: "center", margin: "40px 0" }}>
                <Link href="/workspace" className="cta-link">
                    Try it on your resume → Get your free analysis
                </Link>
            </div>

            <footer className="research-footer">
                <p>Made with care in Boulder, CO 🤍</p>
                <p>
                    <Link href="/">Home</Link> · <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link>
                </p>
            </footer>
        </div>
    );
}
