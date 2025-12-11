import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "../../../components/shared/ThemeToggle";
import "../../../styles/research.css";

export const metadata: Metadata = {
    title: "ATS Myths and Reality | Hiring Research",
    description: "The '75% of resumes are never read' claim isn't backed by solid research. Here's what actually happens with Applicant Tracking Systems."
};

export default function ATSMythsPage() {
    return (
        <div className="research-container">
            <header className="research-header">
                <Link href="/research" className="back-link">← Back to Hiring Research</Link>
                <ThemeToggle />
            </header>

            <section className="page-hero">
                <span className="research-chip">Industry research</span>
                <h1 className="research-title">ATS Myths and Reality</h1>
            </section>

            <p>
                If you have searched for resume advice online, you have probably seen a claim like:
            </p>

            <div className="callout-quote">
                &quot;Seventy five percent of resumes are never read by a human.&quot;
            </div>

            <p>
                This number is repeated often, but when you trace the sources, it comes from marketing content, not from
                serious hiring research. It is used to sell fear and ATS optimization services.
            </p>

            <p>
                This page explains what is myth, what is real, and how Recruiter in Your Pocket responds.
            </p>

            <h2>The &quot;75 percent of resumes are never read&quot; myth</h2>

            <p>
                A popular article once claimed that 75 percent of resumes are never seen by a human because an Applicant
                Tracking System (ATS) filters them out. Later pieces repeated this number without linking to solid evidence.
            </p>

            <p>Independent breakdowns of this claim show:</p>

            <ul>
                <li>The statistic is not tied to a transparent, peer reviewed study.</li>
                <li>The sources usually come from vendors who sell resume or ATS tools.</li>
                <li>No major ATS provider or large employer has published data that confirms &quot;three quarters of resumes are
                    auto rejected and never viewed.&quot;</li>
            </ul>

            <div className="highlight-box">
                <p>In other words, the line is memorable, but it is not reliable.</p>
            </div>

            <h2>What ATS tools actually do</h2>

            <p>
                Modern ATS platforms are essentially structured databases for candidates. In most cases they:
            </p>

            <ul>
                <li>Parse resumes into fields so recruiters can search and filter.</li>
                <li>Store candidates against job postings.</li>
                <li>Allow recruiters to rank, tag, and shortlist people.</li>
                <li>Sometimes compute a &quot;match&quot; or &quot;relevance&quot; score.</li>
            </ul>

            <p>
                Most do <strong>not</strong> silently delete the majority of resumes based purely on formatting. Interviews
                with recruiters and vendors suggest that full auto rejection is used sparingly, and mainly for strict eligibility
                filters, not for most applicants.
            </p>

            <div className="highlight-box">
                <p>The real constraint is human time and attention, not a robot trash can.</p>
            </div>

            <h2>Why this still feels like a filter</h2>

            <p>When hundreds of people apply for one role:</p>

            <ul>
                <li>Recruiters use search filters and match tools to find likely fits.</li>
                <li>They only have time to engage deeply with a small percentage of applicants.</li>
                <li>Many resumes are technically &quot;in the system&quot; but never read beyond a quick skim.</li>
            </ul>

            <p>
                So there is a filter effect, but it is usually <strong>ranking and prioritization</strong>, not a single big
                delete button.
            </p>

            <h2>How Recruiter in Your Pocket responds</h2>

            <p>Our product is built around a simple idea:</p>

            <div className="callout-quote">
                Your resume still needs to convince a real recruiter in a few seconds, even if an ATS helps them manage the
                pile.
            </div>

            <p>That means:</p>

            <ul>
                <li>We optimize your resume for <strong>clarity and impact</strong>, not for keyword games.</li>
                <li>We keep your structure <strong>ATS friendly by default</strong>: simple layouts, real text, no tricks
                    that break parsing.</li>
                <li>Our <strong>Recruiter First Impression</strong> and main score focus on what a human sees first, not on
                    a secret ATS score.</li>
                <li>Our education and help content <strong>does not exaggerate</strong> what ATS tools do.</li>
            </ul>

            <p>
                We will tell you how to make your resume easier for systems to parse and for humans to scan. We will not
                tell you that a bot is silently blocking you 75 percent of the time when the evidence does not support that.
            </p>

            <div className="highlight-box">
                <p>If you want a tool that is grounded in how hiring actually works, not in fear, this is the foundation.</p>
            </div>

            <div style={{ margin: "40px 0" }}>
                <Link href="/workspace" className="cta-link">
                    See how your resume reads → Get your free analysis
                </Link>
            </div>

            <footer className="research-footer">
                <p>Made with care in Boulder, CO 🤍</p>
                <p>
                    <Link href="/">Home</Link> · <Link href="/research">Hiring Research</Link> · <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link>
                </p>
            </footer>
        </div>
    );
}
