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
import ResumeScanZones from "../../../components/research/diagrams/ResumeScanZones";
import "../../../styles/research.css";

export const metadata: Metadata = {
    title: "How Recruiters Actually Read Resumes | Hiring Research",
    description:
        "Eye tracking research reveals recruiters spend about 6 seconds on their initial decision. Here's what they look at first.",
};

export default function HowRecruitersReadPage() {
    return (
        <div className="research-container">
            {/* Sticky "On this page" rail */}
            <OnThisPage />

            <header className="research-header">
                <Link href="/research" className="back-link">
                    ← Back to Hiring Research
                </Link>
                <ThemeToggle />
            </header>

            <section className="page-hero">
                <span className="research-chip">Eye-tracking research</span>
                <h1 className="research-title">How Recruiters Actually Read Resumes</h1>
                <p className="research-subtitle">
                    Most advice about resumes is based on guesswork or recycled tips. This page is based on
                    eye tracking research that watched recruiters as they reviewed resumes in real time.
                </p>
            </section>

            {/* Study Snapshot - Above the fold */}
            <section id="study-snapshot">
                <StudySnapshot
                    whatItStudied="Where recruiters' eyes focus during initial resume review"
                    methods={["Eye-tracking", "Heat mapping", "Time analysis"]}
                    sample="30 professional recruiters reviewing 300+ resumes"
                    keyFinding="~6 seconds for the initial fit/no-fit decision"
                    keyStat="~6 seconds for initial screening"
                    soWhat="The top of your resume carries more weight than the rest of the page combined"
                    sourceUrl="https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf"
                    sourceName="TheLadders Eye-Tracking Study"
                    year={2012}
                />
            </section>

            {/* Figure 1: Resume Scan Zones */}
            <FigureWrapper
                figureNumber={1}
                title="Recruiter attention zones during initial skim"
                caption="Eye-tracking heatmaps reveal 5 distinct attention zones. Recruiters concentrate on the header and current role (zones 1-2), with decreasing attention toward the bottom. This pattern suggests front-loading your strongest signals."
            >
                <ResumeScanZones />
            </FigureWrapper>

            <h2>The 6 second skim</h2>

            <p>
                The study found that recruiters spend about <strong>6 seconds</strong>
                <Footnote
                    id={1}
                    title="Eye Tracking Study"
                    author="TheLadders"
                    year={2012}
                    evidence="Eye-tracking data from 30 recruiters reviewing 300+ resumes showed the initial fit/no-fit decision averaged 6 seconds."
                    sourceUrl="https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf"
                /> on their initial fit or no fit decision for each resume before deciding whether to keep reading or move on.
                Later replications and summaries put this skim window at roughly 6 to 8 seconds.
            </p>

            <CalloutStrip
                type="recruiter"
                content="In that time they are not reading every bullet point. They are scanning for fast answers: Who is this person now? Where do they work? What is their title? How long have they been doing it?"
            />

            <ExpandCollapse title="View methodology details">
                <p>
                    Recruiters wore eye-tracking devices while reviewing resumes in a controlled
                    environment. Their gaze patterns were recorded and analyzed to create heatmaps showing
                    where attention concentrated. The study measured both fixation duration (time spent on
                    each area) and fixation frequency (how often eyes returned to each area).
                </p>
            </ExpandCollapse>

            <section id="key-insights">
                <h2>Key insights from the research</h2>

                <div className="insight-cards">
                    <InsightCard
                        index={0}
                        title="Name and title get the most attention"
                        research="Eye tracking heatmaps show the name/title area receives the longest fixation time during initial scan."
                        riyp="Recruiter First Impression highlights how clearly your title and current role come across."
                    />
                    <InsightCard
                        index={1}
                        title="Current role is scanned second"
                        research="After the header, eyes move to the most recent job—title, company, and dates."
                        riyp="Our main score weights your current role description heavily."
                    />
                    <InsightCard
                        index={2}
                        title="Numbers catch the eye"
                        research="The 'spotted pattern' shows eyes jump to metrics, dollar amounts, and percentages."
                        riyp="Bullet Upgrades push numbers toward the front of each bullet."
                    />
                    <InsightCard
                        index={3}
                        title="Dense text gets skimmed over"
                        research="Resumes with clear headings and consistent formatting got more focused attention."
                        riyp="We flag overly long bullets and suggest breaking them up."
                    />
                </div>
            </section>

            <section id="examples">
                <h2>Why dense text hurts you</h2>

                <p>The same study found that resumes with:</p>

                <ul>
                    <li>Clear section headings</li>
                    <li>Consistent formatting</li>
                    <li>Clean bullet structure</li>
                </ul>

                <p>
                    were rated &quot;easier to read&quot; and got more focused attention. Resumes that looked
                    cluttered or inconsistent pushed recruiters into faster skimming and faster rejection.
                </p>

                <div className="highlight-box">
                    <p>
                        If those answers are easy to see, your resume earns more attention. If they are hard to
                        see, it is likely skipped.
                    </p>
                </div>
            </section>

            {/* Product Connection */}
            <section id="riyp-changes">
                <ProductConnection
                    connections={[
                        {
                            feature: "Recruiter First Impression",
                            because:
                                "sits at the top of your report because that is how important the first few seconds are.",
                        },
                        {
                            feature: "Main Score",
                            because:
                                "focuses on how clearly your recent roles, titles, and scope come across in a quick skim.",
                        },
                        {
                            feature: "Top Fixes",
                            because:
                                "often prioritizes clarifying your most recent role, scope, and outcomes before anything else.",
                        },
                        {
                            feature: "Bullet Upgrades",
                            because:
                                "push you toward one idea per bullet, numbers near the front, and clear verbs so recruiters don't have to dig.",
                        },
                    ]}
                />
            </section>

            <div className="highlight-box">
                <p>
                    We are not guessing when we tell you what to change. We are aligning your resume with
                    what eye tracking shows recruiters actually do.
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start", margin: "40px 0" }}>
                <a
                    href="https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf"
                    className="cta-link"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View the Original Study (PDF) →
                </a>

                <Link href="/workspace" className="cta-link">
                    See how your resume reads → Get your free analysis
                </Link>
            </div>

            {/* Sources & Notes */}
            <section id="sources-notes">
                <SourcesNotes
                    sources={[
                        {
                            name: "TheLadders Eye-Tracking Study",
                            url: "https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf",
                            date: "2012",
                        },
                    ]}
                    methodology={[
                        "30 professional recruiters with 2+ years experience",
                        "Eye-tracking hardware recorded gaze patterns",
                        "Heat maps generated from fixation data",
                        "Both real resumes and designed variants tested",
                    ]}
                    limitations="Single study with moderate sample size. Results have been replicated informally but not in peer-reviewed follow-ups."
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
