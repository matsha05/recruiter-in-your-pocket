import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "../../../components/shared/ThemeToggle";
import "../../../styles/research.css";

export const metadata: Metadata = {
    title: "How People Scan Resumes | Hiring Research",
    description: "Eyetracking research shows people scan resumes using F-shaped patterns, focusing on headings, numbers, and the start of bullets."
};

export default function HowPeopleScanPage() {
    return (
        <div className="research-container">
            <header className="research-header">
                <Link href="/research" className="back-link">← Back to Hiring Research</Link>
                <ThemeToggle />
            </header>

            <section className="page-hero">
                <span className="research-chip">Usability research</span>
                <h1 className="research-title">How People Scan Resumes</h1>
            </section>

            <p>
                Most people do not read resumes line by line. They scan for structure, signal, and proof that it is worth
                their time to look closer.
            </p>

            <p>
                This is not a guess. It comes from years of eyetracking research on how people read on screens, including
                work from the Nielsen Norman Group on scanning patterns like the F shape and spotted pattern.
            </p>

            <div className="source-callout"
                style={{ background: "var(--accent-soft)", borderRadius: "var(--radius-md)", padding: "20px 24px", margin: "24px 0" }}>
                <div
                    style={{ fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", marginBottom: "8px" }}>
                    Research Source</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)", marginBottom: "4px" }}>Nielsen Norman
                    Group Eye-Tracking Studies</div>
                <div style={{ fontSize: "14px", color: "var(--text-soft)" }}>F-Pattern and Spotted Pattern reading behavior
                    research</div>
            </div>

            <p>
                This page explains what that research says and how it connects to the way Recruiter in Your Pocket evaluates
                your resume.
            </p>

            <h2>People scan first, then decide whether to read</h2>

            <p>
                Eyetracking studies on web reading show that most users scan new pages instead of reading every word. One
                classic study found that close to 80 percent of users scanned a web page on first contact, while only a small
                minority read word by word.
            </p>

            <p>That behavior shows up in resume reviews too. Recruiters are under time pressure. They start by scanning for:</p>

            <ul>
                <li>Role and level</li>
                <li>Recent companies</li>
                <li>Dates and gaps</li>
                <li>Quick signals of scope</li>
                <li>Obvious red or green flags</li>
            </ul>

            <p>They only move into deeper reading if the scan gives them enough reason to care.</p>

            <div className="highlight-box">
                <p>This is why small improvements in clarity, headings, and bullet structure can have a big impact on real
                    outcomes.</p>
            </div>

            <h2>The F shaped pattern and other scanning patterns</h2>

            <p>
                Nielsen Norman Group popularized the idea of the <strong>F shaped pattern</strong> for reading on the web.
                In many eyetracking tests, users:
            </p>

            <ol>
                <li>Read in a horizontal line near the top of the content</li>
                <li>Move down and read another shorter horizontal line</li>
                <li>Scan down the left side, picking up the starts of lines and headings</li>
            </ol>

            <p>The heatmaps often look like the letter F.</p>

            <p>Later research found other patterns too, such as:</p>

            <ul>
                <li><strong>Spotted pattern</strong> — eyes jump to numbers, names, and visually distinct items</li>
                <li><strong>Layer cake pattern</strong> — eyes move from heading to heading, skimming the content in between</li>
                <li><strong>Commitment pattern</strong> — more careful reading, but only when the user is highly motivated
                    and the content earns their trust</li>
            </ul>

            <p>
                Resumes are usually scanned in some mix of these patterns. Recruiters skim for headings, job titles, dates,
                and the first few words of bullets. They are not reading every line in full.
            </p>

            <h2>What this means for resume layout</h2>

            <p>These scanning patterns support some very practical rules for resumes:</p>

            <ul>
                <li>Clear headings (Experience, Skills, Education) are not decoration. They are anchors for scanning.</li>
                <li>Job titles and company names should be easy to spot and consistent across roles.</li>
                <li>Dates should be aligned and readable at a glance.</li>
                <li>Bullets should start with impact, not warm up slowly.</li>
                <li>Numbers and proper nouns (teams, products, user counts, revenue, latency, tickets, ARR) attract attention.</li>
            </ul>

            <div className="highlight-box">
                <p>When you ignore these patterns and pack your resume with dense text, you are asking a rushed recruiter to
                    work harder than they have time for.</p>
            </div>

            <h2>Why dense bullets underperform</h2>

            <p>The eyetracking research shows that dense paragraphs and multi idea bullets are often skimmed or skipped.</p>

            <p>On a resume, that shows up as:</p>

            <ul>
                <li>Long bullets that mix tasks, tools, and outcomes in one line</li>
                <li>No numbers of any kind</li>
                <li>Impact buried at the end of the sentence</li>
                <li>Repeated filler phrases like &quot;responsible for&quot; and &quot;worked on&quot;</li>
            </ul>

            <p>
                When a recruiter scans these bullets, their eyes do not find anything to latch onto. The result is a weak
                first impression, even if the candidate has done strong work in reality.
            </p>

            <p>
                On the other hand, short, focused bullets with clear outcomes and early numbers tend to get more attention
                in that first pass.
            </p>

            <h2>Patterns that make resumes easier to scan</h2>

            <p>Research on scanning and readability points to a few consistent winners:</p>

            <ul>
                <li><strong>Headings that look like headings</strong> — Make section titles clearly larger or bolder than
                    body text so a scanning eye can follow the structure.</li>
                <li><strong>One idea per bullet</strong> — This matches how people scan. It also makes it easier for
                    recruiters to turn your bullet into an interview question later.</li>
                <li><strong>Numbers near the front of the bullet</strong> — Eyes land on numbers. Putting metrics early
                    makes the scale of your work obvious during a quick skim.</li>
                <li><strong>Consistent alignment and layout</strong> — When titles, companies, and dates follow a
                    predictable pattern, the eye can move faster and with more confidence.</li>
                <li><strong>Reasonable line length</strong> — Very long lines of text are tiring to scan. Keeping line
                    length moderate improves both scanning and reading.</li>
            </ul>

            <div className="highlight-box">
                <p>These patterns are not design preferences. They are responses to how human attention works on screens.</p>
            </div>

            <h2>How this shapes Recruiter in Your Pocket</h2>

            <p>We use these scanning insights directly in how we analyze and upgrade your resume.</p>

            <ul>
                <li><strong>Bullet Upgrades</strong> are designed to match what the eyetracking research says. We push you
                    toward one idea per bullet, clearer verbs, and numbers that show scope.</li>
                <li>Our <strong>Readability</strong> and <strong>Clarity</strong> subscores are influenced by how easy it is
                    for a recruiter to scan and understand your recent experience, not just by grammar.</li>
                <li>In <strong>What is Working</strong> and <strong>What is Missing</strong>, we call out dense bullets and
                    missing numbers because these patterns make your resume harder to scan in that first pass.</li>
                <li>The structure of your report — headings, sections, spacing — is intentionally aligned with scanning
                    behavior, not just aesthetics.</li>
            </ul>

            <p>
                Our goal is simple: make your resume match how people actually consume information, so that the work you
                have already done is easier for a recruiter to see and act on.
            </p>

            <div className="highlight-box">
                <p>As we add more research, this page will grow. For now, the headline is clear. People scan. Recruiters
                    scan. Your resume should be built for that reality.</p>
            </div>

            <div style={{ margin: "40px 0" }}>
                <Link href="/workspace" className="cta-link">
                    See how your resume scans → Get your free analysis
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
