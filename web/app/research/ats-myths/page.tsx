import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "../../../components/shared/ThemeToggle";
import StudySnapshot from "../../../components/research/StudySnapshot";
import InsightCard from "../../../components/research/InsightCard";
import ProductConnection from "../../../components/research/ProductConnection";
import SourcesNotes from "../../../components/research/SourcesNotes";
import ExpandCollapse from "../../../components/research/ExpandCollapse";
import CalloutStrip from "../../../components/research/CalloutStrip";
import FigureWrapper from "../../../components/research/FigureWrapper";
import Footnote from "../../../components/research/Footnote";
import OnThisPage from "../../../components/research/OnThisPage";
import MythRealityVisual from "../../../components/research/diagrams/MythRealityVisual";
import "../../../styles/research.css";

export const metadata: Metadata = {
    title: "ATS: How Applicant Tracking Systems Actually Work | Hiring Research",
    description:
        "Understanding how ATS systems store, rank, and surface candidates—and why human attention, not algorithms, is the real constraint in resume review.",
};

export default function ATSMythsPage() {
    return (
        <div className="research-container">
            <OnThisPage />

            <header className="research-header">
                <Link href="/research" className="back-link">
                    ← Back to Hiring Research
                </Link>
                <ThemeToggle />
            </header>

            <section className="page-hero">
                <span className="research-chip">Industry research</span>
                <h1 className="research-title">ATS: How Applicant Tracking Systems Actually Work</h1>
                <p className="research-subtitle">
                    ATS systems store, rank, and help recruiters search candidates. They rarely
                    auto-reject based on resume content alone. The real gate is human time and attention.
                </p>
            </section>

            {/* Study Snapshot */}
            <section id="study-snapshot">
                <StudySnapshot
                    whatItStudied="How ATS systems are used in hiring workflows, and where automation influences screening"
                    methods={["Peer-reviewed research", "Legal scholarship", "Vendor documentation"]}
                    sample="Academic studies, ATS vendor help docs (Greenhouse, Lever, Workday), eye-tracking research"
                    keyFinding="Human time and attention, not algorithmic rejection, is the primary bottleneck"
                    keyStat="Human review is the primary bottleneck"
                    soWhat="Resume clarity and structure matter because humans still skim under time pressure"
                    sourceName="Multi-source Analysis"
                    year="2021-2024"
                />
            </section>

            {/* Figure 1: ATS Workflow */}
            <FigureWrapper
                figureNumber={1}
                title="ATS workflow: database and ranking, not automatic deletion"
                caption="ATS systems organize candidates into searchable databases. Recruiters use filters, keyword search, and ranking to prioritize review. Auto-archive typically applies only to knockout questions (visa status, certifications), not resume formatting."
            >
                <MythRealityVisual />
            </FigureWrapper>

            <h2>What an ATS is designed to do</h2>

            <p>
                Most ATS systems function as databases and workflow engines that support ranking,
                shortlisting, and rediscovery.
                <Footnote
                    id={1}
                    title="Ethics of AI-Enabled Recruiting and Selection"
                    author="Hunkenschroer & Luetge"
                    year={2022}
                    evidence="Screening produces shortlists and rankings; ATS used for rediscovery and candidate tracking."
                    sourceUrl="https://link.springer.com/article/10.1007/s10551-022-05049-6"
                />
                {" "}They store candidate data, support filtering, and enable recruiters to search
                and manage applicant pipelines. This is fundamentally different from the popular
                image of a robot auto-deleting resumes.
            </p>

            <p>
                Automated hiring systems influence prioritization and review, but are rarely fully
                autonomous rejection mechanisms.
                <Footnote
                    id={2}
                    title="An Auditing Imperative for Automated Hiring Systems"
                    author="Ajunwa"
                    year={2021}
                    evidence="Automated hiring systems are operationally meaningful but require oversight; not autonomous decision-makers."
                    sourceUrl="https://jolt.law.harvard.edu/assets/articlePDFs/v34/5.-Ajunwa-An-Auditing-Imperative-for-Automated-Hiring-Systems.pdf"
                />
                {" "}They require human oversight and auditing, and their role is to support
                decisions, not make them independently.
            </p>

            <section id="key-insights">
                <h2>Where automation actually enters the process</h2>

                <div className="insight-cards">
                    <InsightCard
                        marker="KNOCKOUT"
                        title="Knockout questions filter for eligibility"
                        research="Auto-archive typically triggers on work authorization, required certifications, or location—not resume keywords."
                        riyp="We focus on clarity, not keyword stuffing, because content rarely triggers rejection."
                    />
                    <InsightCard
                        marker="RANKING"
                        title="Match scores rank, they don't delete"
                        research="Some ATS compute relevance scores, but these prioritize candidates for review rather than auto-rejecting."
                        riyp="Our scoring simulates human impression, not ATS optimization."
                    />
                    <InsightCard
                        marker="SEARCH"
                        title="Recruiters search the database"
                        research="Recruiters use keyword and boolean searches to find candidates. ATS surfaces results; humans decide."
                        riyp="We help your resume communicate clearly to both systems and humans."
                    />
                    <InsightCard
                        marker="WORKFLOW"
                        title="Stage rules manage pipeline flow"
                        research="Automated emails, interview scheduling, and status updates are workflow features, not rejection mechanisms."
                        riyp="Recruiter First Impression focuses on the human skim, where decisions actually happen."
                    />
                </div>
            </section>

            <section id="examples">
                <h2>Why it still feels like a filter</h2>

                <p>
                    When hundreds of people apply for one role, most resumes will not receive deep
                    attention. But this is not because an algorithm deleted them.
                </p>

                <p>
                    Recruiters typically spend only seconds on an initial resume review, making
                    attention, not algorithms, the primary constraint.
                    <Footnote
                        id={3}
                        title="Eye Tracking Study"
                        author="TheLadders"
                        year={2012}
                        evidence="Eye-tracking data showed recruiters spend approximately 6 seconds on initial resume review."
                        sourceUrl="https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf"
                    />
                </p>

                <ul>
                    <li>High applicant volume means limited review time per resume</li>
                    <li>Ranking and prioritization tools push some candidates higher</li>
                    <li>Fast skims determine who gets a closer look</li>
                    <li>Many resumes are technically &quot;in the system&quot; but never deeply reviewed</li>
                </ul>

                <div className="highlight-box">
                    <p>
                        The filter effect is real, but it is driven by human time constraints
                        and prioritization, not by secret algorithms parsing your formatting.
                    </p>
                </div>
            </section>

            <h2>Where the &quot;75% never read&quot; narrative comes from</h2>

            <p>
                The claim that &quot;75% of resumes are never seen by a human&quot; has circulated
                widely in career advice and media. However, it traces to media and vendor
                amplification, not peer-reviewed research.
            </p>

            <p>
                It persists because it feels emotionally true—job searching is frustrating, and
                the idea of a hidden algorithmic gatekeeper provides a simple explanation for
                rejection. But it oversimplifies how hiring systems actually work.
            </p>

            <CalloutStrip
                type="confidence"
                confidence="high"
                content="The 75% statistic has no credible research source. It is a misleading simplification that conflates ranking and prioritization with automatic deletion."
            />

            <section id="riyp-changes">
                <ProductConnection
                    title="What this means for resumes"
                    connections={[
                        {
                            feature: "Clarity over keywords",
                            because:
                                "resume content rarely triggers automatic rejection—but unclear writing loses the human skim.",
                        },
                        {
                            feature: "Structure matters",
                            because:
                                "well-organized resumes get parsed correctly AND scanned faster by recruiters.",
                        },
                        {
                            feature: "Recruiter First Impression",
                            because:
                                "focuses on what a human sees first, because that is where decisions happen.",
                        },
                        {
                            feature: "No ATS tricks",
                            because:
                                "we do not sell fear-based optimization because the evidence does not support it.",
                        },
                    ]}
                />
            </section>

            <div className="highlight-box">
                <p>
                    If you want guidance grounded in how hiring actually works, not in fear,
                    this is the foundation.
                </p>
            </div>

            <div style={{ margin: "40px 0" }}>
                <Link href="/workspace" className="cta-link">
                    See how your resume reads → Get your free analysis
                </Link>
            </div>

            <section id="sources-notes">
                <SourcesNotes
                    sources={[
                        {
                            name: "Hunkenschroer & Luetge (2022) — Ethics of AI-Enabled Recruiting",
                            url: "https://link.springer.com/article/10.1007/s10551-022-05049-6",
                            date: "2022",
                        },
                        {
                            name: "Ajunwa (2021) — Auditing Imperative for Automated Hiring",
                            url: "https://jolt.law.harvard.edu/assets/articlePDFs/v34/5.-Ajunwa-An-Auditing-Imperative-for-Automated-Hiring-Systems.pdf",
                            date: "2021",
                        },
                        {
                            name: "TheLadders Eye-Tracking Study",
                            url: "https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf",
                            date: "2012",
                        },
                        {
                            name: "Greenhouse: Candidate Filters",
                            url: "https://support.greenhouse.io/hc/en-us/articles/360043184152-Candidate-and-prospect-filters",
                            date: "2024",
                        },
                        {
                            name: "Lever: Searching the Database",
                            url: "https://help.lever.co/hc/en-us/articles/20087317030685-Searching-the-Database-for-Candidates",
                            date: "2024",
                        },
                    ]}
                    methodology={[
                        "Reviewed peer-reviewed research on automated hiring systems",
                        "Analyzed primary ATS vendor documentation (Greenhouse, Lever, Workday)",
                        "Cross-referenced with eye-tracking studies on recruiter behavior",
                        "Traced the 75% claim to its media/vendor origins",
                    ]}
                    limitations="ATS configurations vary by company. This analysis covers typical enterprise workflows; smaller organizations may differ. The 75% statistic origin is traced to media amplification, not a single identifiable source."
                />
            </section>

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
