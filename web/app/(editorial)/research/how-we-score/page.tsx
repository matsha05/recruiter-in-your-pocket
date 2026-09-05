import type { Metadata } from "next";
import { ResearchArticle, Citation } from "@/components/research/ResearchArticle";
import { FirstReadModelDiagram } from "@/components/research/diagrams/FirstReadModelDiagram";

export const metadata: Metadata = {
    title: "How the Report Score Works | Methodology",
    description: "The four parts of the resume review, how the written findings become a score, and how to use it.",
};

export default function HowWeScorePage() {
    return (
        <ResearchArticle
            header={{
                tag: "Methodology",
                title: "How the report score works",
                description: "Your score summarizes the resume review. The written findings explain what is clear, what is missing, and where to start.",
                lastUpdated: "July 2026",
                sourceSummary: "2 peer-reviewed studies"
            }}
            keyFinding={{
                subtitle: "Bottom line",
                stat: "85 / 100",
                statDescription: "Your recent roles and results are easy to follow. One important responsibility needs more detail.",
                source: {
                    text: "Worked example. The score summarizes a document review, not hiring odds."
                }
            }}
            productTieIn={{
                title: "What this means in your report",
                items: [
                    {
                        title: "First impression",
                        description: "The opening view shows what is clear, what may make a recruiter pause, and what to fix first."
                    },
                    {
                        title: "Score breakdown",
                        description: "Story, Impact, Clarity, and Readability show which parts of the document need attention."
                    }
                ]
            }}
            relatedArticles={[
                { title: "How Recruiters Actually Read Resumes", href: "/research/how-recruiters-read", tag: "Eye-tracking" },
                { title: "Quantifying Impact on Resumes", href: "/research/quantifying-impact", tag: "Research" },
                { title: "The STAR Method", href: "/research/star-method", tag: "Format" }
            ]}
            sources={[
                {
                    id: "source-0",
                    title: "The Importance of Representative Design in Judgment Tasks: The Case of Resume Screening",
                    publisher: "Journal of Occupational and Organizational Psychology",
                    year: "2002",
                    href: "https://doi.org/10.1348/09631790260098749"
                },
                {
                    id: "source-1",
                    title: "Using Machine Learning with Eye-Tracking Data to Predict if a Recruiter Will Approve a Resume",
                    publisher: "Machine Learning and Knowledge Extraction",
                    year: "2023",
                    href: "https://doi.org/10.3390/make5030038"
                }
            ]}
            faq={[
                {
                    question: "Does the score predict interviews?",
                    answer: "No. It summarizes our review of this resume. It is not hiring odds, an ATS score, or a promise of outcomes."
                },
                {
                    question: "Why these four dimensions?",
                    answer: "Together they cover whether a reader can follow the career story, see results, understand ownership, and find the useful evidence quickly."
                },
                {
                    question: "Should I optimize for the number?",
                    answer: "No. Use the written findings to improve the document. A higher number without a clearer, more accurate resume is not useful."
                }
            ]}
            visualization={
                <>
                    <h2 className="research-h2">A score tied to visible evidence</h2>
                    <p className="research-body mb-6">The number is the summary. The four diagnostics and the quoted evidence explain what drove it.</p>
                    <FirstReadModelDiagram />
                </>
            }
        >
            {/* The Why */}
            <h2 className="research-h2">What we look for</h2>
            <p className="research-body mb-6">
                A recruiter should be able to tell what kind of work you do, what you owned, how large or complex the work was, and what changed because of it.
            </p>
            <p className="research-body mb-6">
                We look for those details in your resume. If one is missing, we point out the question instead of guessing.
            </p>
            <p className="research-body mb-6">
                That whole-document view matters. In one recruiter study, judgments changed when reviewers saw real resumes rather than stripped-down candidate profiles, which is why the written review stays attached to the document&apos;s context.
                <Citation id="source-0">1</Citation>
            </p>

            <h2 className="research-h2">What comes from research, and what is ours</h2>
            <p className="research-body mb-6">
                The cited studies inform the whole-document review and our view of first-pass attention. The scoring method itself is ours.
            </p>
            <dl className="not-prose mb-12 border-y border-border/40 divide-y divide-border/40">
                <div className="grid gap-2 py-5 md:grid-cols-[10rem_1fr] md:gap-8">
                    <dt className="text-sm font-semibold text-brand-strong">What comes from research</dt>
                    <dd className="text-sm leading-7 text-muted-foreground">How real resumes can change recruiter judgments, and how attention moves during an initial review.</dd>
                </div>
                <div className="grid gap-2 py-5 md:grid-cols-[10rem_1fr] md:gap-8">
                    <dt className="text-sm font-semibold text-foreground">What we designed</dt>
                    <dd className="text-sm leading-7 text-muted-foreground">We chose the four dimensions, the score bands, and how the evidence is organized in the report.</dd>
                </div>
            </dl>

            <h2 className="research-h2">Why the overall score is not a simple average</h2>
            <p className="research-body mb-6">
                Clean formatting does not answer a missing question about what you did. Uneven writing does not erase a well-supported achievement. We consider how the strengths and gaps affect the resume as a whole, rather than averaging the four categories.
            </p>

            {/* The Thresholds */}
            <h2 className="research-h2">What the scores mean</h2>
            <p className="research-body mb-6">
                We set these score ranges as part of our review method. They organize the findings; they do not predict hiring outcomes.
            </p>

            <div className="not-prose border-t border-border/30 divide-y divide-border/30 mb-8">
                <div className="flex items-start gap-5 py-4">
                    <span className="text-2xl font-display font-semibold text-foreground">85+</span>
                    <div>
                        <p className="text-sm font-medium text-foreground">Clear and specific</p>
                        <p className="text-sm text-muted-foreground">The career story, ownership, results, and structure are consistently easy to understand.</p>
                    </div>
                </div>
                <div className="flex items-start gap-5 py-4">
                    <span className="text-2xl font-display font-semibold text-foreground">70-84</span>
                    <div>
                        <p className="text-sm font-medium text-foreground">Mostly clear</p>
                        <p className="text-sm text-muted-foreground">Most of the document is understandable, with a few important details still missing or buried.</p>
                    </div>
                </div>
                <div className="flex items-start gap-5 py-4">
                    <span className="text-2xl font-display font-semibold text-foreground">&lt;70</span>
                    <div>
                        <p className="text-sm font-medium text-foreground">Needs more context</p>
                        <p className="text-sm text-muted-foreground">Several parts of the document are difficult to evaluate. Start with the first recommended change.</p>
                    </div>
                </div>
            </div>

            {/* The Bottom Line */}
            <h2 className="research-h2">How to use the score</h2>
            <p className="research-body mb-6">
                Start with the first recommended change and check it against your experience. In a 2023 eye-tracking study, longer review time and attention to the Experience section were associated with resumes moving forward. That study informed our interest in how recruiters review experience; it did not test our score or prove that an edit causes more attention.
                <Citation id="source-1">2</Citation>
            </p>
            <p className="research-body">Use the score alongside the feedback. If an edit raises the number but makes the resume less accurate, do not use it.</p>

            <h2 className="research-h2">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>The scores are guideposts, not predictions. Read them with the written feedback.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Industry and role context can change what matters most.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>A resume score cannot account for bias, referrals, the job market, or an employer&apos;s hiring process.</li>
            </ul>

        </ResearchArticle>
    );
}
