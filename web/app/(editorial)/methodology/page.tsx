import type { Metadata } from "next";
import { ResearchArticle, Citation } from "@/components/research/ResearchArticle";
import { FirstReadModelDiagram } from "@/components/research/diagrams/FirstReadModelDiagram";
import sampleReport from "@/public/sample-report.json";

export const metadata: Metadata = {
    title: "How the Report Works",
    description: "How your report reaches its Verdict, First Impression score, and Critical Miss, what the score can't tell you, and how suggested edits protect your facts.",
    alternates: { canonical: "/methodology" },
};

export default function MethodologyPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Methodology",
                title: "How the report works",
                description: "Every report reads your resume the way a recruiter would: a Verdict, one First Impression score, and the one thing a recruiter is most likely to miss. Here's how each part is made, and what it can't tell you.",
                lastUpdated: "October 2026",
                sourceSummary: "2 peer-reviewed studies",
            }}
            keyFinding={{
                label: "Example score",
                subtitle: "From the sample report",
                stat: `${sampleReport.score} / 100`,
                statDescription: sampleReport.score_comment_short,
                source: { text: "Worked example. The score summarizes the written read; it doesn't predict interviews or offers." },
            }}
            productTieIn={{
                title: "What you'll see in your report",
                items: [
                    { title: "Verdict", description: "What a recruiter would take away on a first read, in plain words." },
                    { title: "First Impression score", description: "One number that summarizes the read. The written findings explain it." },
                    { title: "Critical Miss", description: "The one change to make first, with the line it comes from and the questions to answer." },
                ],
            }}
            relatedArticles={[
                { title: "What recruiters notice in the first pass", href: "/research/how-recruiters-read", tag: "Eye-tracking" },
                { title: "Show what changed and your part in it", href: "/research/quantifying-impact", tag: "Research" },
                { title: "Tell the story behind the line", href: "/research/star-method", tag: "Story" },
            ]}
            sources={[
                {
                    id: "source-0",
                    title: "The Importance of Representative Design in Judgment Tasks: The Case of Resume Screening",
                    publisher: "Journal of Occupational and Organizational Psychology",
                    year: "2002",
                    href: "https://doi.org/10.1348/09631790260098749",
                },
                {
                    id: "source-1",
                    title: "Using Machine Learning with Eye-Tracking Data to Predict if a Recruiter Will Approve a Resume",
                    publisher: "Machine Learning and Knowledge Extraction",
                    year: "2023",
                    href: "https://doi.org/10.3390/make5030038",
                },
            ]}
            faq={[
                {
                    question: "What does the score summarize?",
                    answer: "How clearly your resume shows your work today: the results you show, how clearly each line reads, how your experience fits together, and how easy the page is to scan. It's not a simple average, and it doesn't predict interviews or offers.",
                },
                {
                    question: "Why one score instead of four?",
                    answer: "Four numbers invite you to chase the lowest one. One number plus a written read keeps you focused on the change that matters most, which is the Critical Miss.",
                },
                {
                    question: "Should I optimize for the number?",
                    answer: "No. Fix the Critical Miss and check every suggestion against what you actually did. A higher number on a less accurate resume doesn't help you.",
                },
                {
                    question: "Does a person read my report?",
                    answer: "No. Matt Shaw wrote the review criteria from 14 years in recruiting; AI applies them to your resume.",
                },
            ]}
            visualization={
                <>
                    <h2 className="research-h2">A real report, start to finish</h2>
                    <p className="research-body mb-6">Everything in this figure comes from the sample report: the Verdict, the score, the Critical Miss, and what the score weighed.</p>
                    <FirstReadModelDiagram />
                </>
            }
        >
            <h2 className="research-h2">What we look for</h2>
            <p className="research-body mb-6">
                A recruiter should be able to tell what kind of work you do, what you owned, how big it was, and what changed because of it. The report looks for those details in your resume. If one is missing, it asks you for it instead of guessing.
            </p>
            <p className="research-body mb-6">
                It reads the whole document, not a stripped-down summary. In one recruiter study, judgments changed when reviewers saw real resumes instead of simplified candidate profiles, which is why every finding stays tied to the line it came from.
                <Citation id="source-0">1</Citation>
            </p>

            <h2 className="research-h2">How the Critical Miss is chosen</h2>
            <p className="research-body mb-6">
                Of everything that could be clearer, the Critical Miss is the gap most likely to cost you on a first read: usually your strongest example stopping short of its result, or a responsibility that hides how much you owned. The report quotes the line, says what&apos;s missing, and lists the questions that would fill it in.
            </p>

            <h2 className="research-h2">How suggested edits protect your facts</h2>
            <p className="research-body mb-6">
                Rewrites use only what&apos;s already on your resume. Anything we can&apos;t know, like a number or a team size, stays in brackets for you to fill in. You can&apos;t copy a draft until those brackets hold real details, and a draft that changes one of your facts is flagged.
            </p>

            <h2 className="research-h2">What comes from research, and what is ours</h2>
            <dl className="not-prose mb-12 divide-y divide-border/40 border-y border-border/40">
                <div className="grid gap-2 py-5 md:grid-cols-[10rem_1fr] md:gap-8">
                    <dt className="text-sm font-semibold text-brand">From research</dt>
                    <dd className="text-sm leading-7 text-muted-foreground">Real resumes change recruiter judgments, and attention during a first review concentrates on experience.</dd>
                </div>
                <div className="grid gap-2 py-5 md:grid-cols-[10rem_1fr] md:gap-8">
                    <dt className="text-sm font-semibold text-foreground">Ours</dt>
                    <dd className="text-sm leading-7 text-muted-foreground">The four things the score weighs, how the Critical Miss is chosen, and how findings are written. Matt designed the criteria; the studies did not test our score.</dd>
                </div>
            </dl>

            <h2 className="research-h2">How to use the score</h2>
            <p className="research-body mb-6">
                Start with the Critical Miss and check it against your experience. In a 2023 eye-tracking study, longer review time and attention to the Experience section were associated with resumes moving forward. That study shaped how we think about experience; it didn&apos;t test our score or show that an edit causes more attention.
                <Citation id="source-1">2</Citation>
            </p>

            <h2 className="research-h2">What it can&apos;t tell you</h2>
            <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span aria-hidden="true">–</span>Whether you&apos;ll get an interview or an offer.</li>
                <li className="flex gap-2"><span aria-hidden="true">–</span>How a specific employer, team, or hiring process weighs things.</li>
                <li className="flex gap-2"><span aria-hidden="true">–</span>Anything about referrals, the job market, or bias in hiring.</li>
            </ul>
        </ResearchArticle>
    );
}
