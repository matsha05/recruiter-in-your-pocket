import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "../../../components/shared/ThemeToggle";
import StudySnapshot from "../../../components/research/StudySnapshot";
import InsightCard from "../../../components/research/InsightCard";
import ProductConnection from "../../../components/research/ProductConnection";
import SourcesNotes from "../../../components/research/SourcesNotes";
import ExpandCollapse from "../../../components/research/ExpandCollapse";
import CalloutStrip from "../../../components/research/CalloutStrip";
import MythRealityVisual from "../../../components/research/diagrams/MythRealityVisual";
import "../../../styles/research.css";

export const metadata: Metadata = {
    title: "ATS Myths and Reality | Hiring Research",
    description:
        "The '75% of resumes are never read' claim isn't backed by solid research. Here's what actually happens with Applicant Tracking Systems.",
};

export default function ATSMythsPage() {
    return (
        <div className="research-container">
            <header className="research-header">
                <Link href="/research" className="back-link">
                    ← Back to Hiring Research
                </Link>
                <ThemeToggle />
            </header>

            <section className="page-hero">
                <span className="research-chip">Industry research</span>
                <h1 className="research-title">ATS Myths and Reality</h1>
                <p className="research-subtitle">
                    The claim that &quot;75% of resumes are never read&quot; comes from marketing, not
                    credible hiring data. Here&apos;s what ATS tools actually do.
                </p>
            </section>

            {/* Study Snapshot - Above the fold */}
            <StudySnapshot
                whatItStudied="Source verification of common ATS statistics and vendor claims"
                methods={["Industry analysis", "Vendor research", "Recruiter interviews"]}
                sample="Multiple ATS vendors, recruiter testimonials, and hiring literature"
                keyFinding="No credible source for '75% auto-rejected' claim"
                soWhat="Focus on human clarity, not ATS tricks—because humans still make the decision"
                sourceUrl="https://www.linkedin.com/pulse/75-resumes-never-seen-human-eyes-myth-fact-john-sullivan/"
                sourceName="Industry Analysis"
            />

            {/* Hero Diagram */}
            <MythRealityVisual />

            <h2>The &quot;75% never read&quot; myth</h2>

            <p>
                If you have searched for resume advice online, you have probably seen a claim like:
            </p>

            <div className="callout-quote">
                &quot;Seventy five percent of resumes are never read by a human.&quot;
            </div>

            <CalloutStrip
                type="confidence"
                confidence="high"
                content="This statistic has no credible source. Independent analysis traces it back to marketing content from resume optimization vendors, not peer-reviewed research or employer surveys."
            />

            <ExpandCollapse title="Why this matters for job seekers">
                <p>
                    When you believe most resumes are auto-deleted, you focus on gaming the system instead
                    of communicating clearly. You stuff keywords, use tricks, and optimize for machines
                    instead of the human who will actually evaluate you. This often backfires.
                </p>
            </ExpandCollapse>

            <h2>Key insights about ATS</h2>

            <div className="insight-cards">
                <InsightCard
                    icon="🗄️"
                    title="ATS is a database, not a gatekeeper"
                    research="Modern ATS platforms parse resumes into searchable fields—like a filing cabinet, not a trash can."
                    riyp="We keep your resume ATS-friendly by default with clean structure."
                />
                <InsightCard
                    icon="🔍"
                    title="Recruiters search, ATS surfaces"
                    research="Recruiters use keyword searches to find candidates. ATS helps them search, not auto-reject."
                    riyp="We focus on clarity that helps both ATS parsing AND human reading."
                />
                <InsightCard
                    icon="📊"
                    title="Match scores inform, don't delete"
                    research="Some ATS compute relevance scores, but these rank candidates—they rarely auto-reject."
                    riyp="Our scoring is about human impression, not ATS optimization."
                />
                <InsightCard
                    icon="👤"
                    title="Humans still make the call"
                    research="Even with automation, a recruiter decides who moves forward. The skim happens."
                    riyp="Recruiter First Impression simulates that real human decision."
                />
            </div>

            <h2>What ATS tools actually do</h2>

            <p>Modern ATS platforms are essentially structured databases for candidates. In most cases they:</p>

            <ul>
                <li>Parse resumes into fields so recruiters can search and filter</li>
                <li>Store candidates against job postings</li>
                <li>Allow recruiters to rank, tag, and shortlist people</li>
                <li>Sometimes compute a &quot;match&quot; or &quot;relevance&quot; score</li>
            </ul>

            <CalloutStrip
                type="myth"
                content="ATS silently deletes 75% of resumes based on formatting or keywords."
            />

            <CalloutStrip
                type="reality"
                content="Most ATS tools organize and rank resumes. Full auto-rejection is rare and usually limited to strict eligibility filters (visa status, required certifications)."
            />

            <div className="highlight-box">
                <p>
                    The real constraint is human time and attention, not a robot trash can.
                </p>
            </div>

            <h2>Why it still feels like a filter</h2>

            <p>When hundreds of people apply for one role:</p>

            <ul>
                <li>Recruiters use search filters and match tools to find likely fits</li>
                <li>They only have time to engage deeply with a small percentage of applicants</li>
                <li>Many resumes are technically &quot;in the system&quot; but never read beyond a quick skim</li>
            </ul>

            <CalloutStrip
                type="confidence"
                confidence="high"
                content="There IS a filter effect, but it's usually ranking and prioritization, not a single big delete button. The recruiter's 6-second skim is the real gate."
            />

            {/* Product Connection */}
            <ProductConnection
                title="How RIYP responds to this reality"
                connections={[
                    {
                        feature: "Clarity over keywords",
                        because:
                            "we optimize your resume for human clarity and impact, not keyword stuffing.",
                    },
                    {
                        feature: "ATS-friendly by default",
                        because:
                            "simple layouts, real text, no tricks that break parsing—without gaming.",
                    },
                    {
                        feature: "Recruiter First Impression",
                        because:
                            "focuses on what a human sees first, not a secret ATS score.",
                    },
                    {
                        feature: "Honest education",
                        because:
                            "we don't exaggerate what ATS tools do or sell fear-based optimization.",
                    },
                ]}
            />

            <div className="highlight-box">
                <p>
                    If you want a tool that is grounded in how hiring actually works, not in fear, this is
                    the foundation.
                </p>
            </div>

            <div style={{ margin: "40px 0" }}>
                <Link href="/workspace" className="cta-link">
                    See how your resume reads → Get your free analysis
                </Link>
            </div>

            {/* Sources & Notes */}
            <SourcesNotes
                sources={[
                    {
                        name: "Is 75% of Resumes Never Seen Myth or Fact?",
                        url: "https://www.linkedin.com/pulse/75-resumes-never-seen-human-eyes-myth-fact-john-sullivan/",
                    },
                    {
                        name: "ATS Vendor Documentation (Greenhouse, Lever, Workday)",
                        url: "https://www.greenhouse.io/",
                    },
                ]}
                methodology={[
                    "Traced common statistics back to original sources",
                    "Reviewed ATS vendor documentation and capabilities",
                    "Interviewed recruiters about actual workflow",
                    "Cross-referenced marketing claims vs. technical reality",
                ]}
                limitations="No single comprehensive study of ATS rejection rates exists. Our analysis synthesizes available evidence and practitioner experience."
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
