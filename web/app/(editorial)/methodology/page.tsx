import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";
import { ResearchArticle, Citation } from "@/components/research/ResearchArticle";
import { FirstReadModelDiagram } from "@/components/research/diagrams/FirstReadModelDiagram";
import { hubLink } from "@/components/research/ResearchHubData";
import sampleReport from "@/public/sample-report.json";
import { scoreBandFor } from "@/lib/reports/score-band";

const PATH = "/methodology";
// The first report shows a band, not the number (D5); the hero card shows the sample's band the same way.
const sampleBand = scoreBandFor(sampleReport.score);

export const metadata = pageMetadata({
    path: PATH,
    title: "How the resume report works: score, Verdict, Critical Miss",
    description: "How your report reaches its Verdict, where your resume stands, and its Critical Miss, what it can't tell you, and how suggested edits protect your facts.",
    type: "article",
});

export default function MethodologyPage() {
    return (
        <ResearchArticle
            path={PATH}
            header={{
                tag: "Methodology",
                title: "How the report works",
                description: "Every report applies a recruiter's criteria to your resume: a Verdict, a band that shows where your resume stands, and up to three Critical Misses, each a problem that could cost you the interview on its own, starting with the one to fix first. Here's how each part is made, and what it can't tell you.",
                sourceSummary: "2 peer-reviewed studies",
            }}
            keyFinding={{
                label: "Example band",
                subtitle: "From the sample report",
                stat: sampleBand.name,
                statDescription: sampleBand.anchor,
                source: { text: "Worked example. The band summarizes the written read; it doesn't predict interviews or offers." },
            }}
            productTieIn={{
                title: "What you'll see in your report",
                items: [
                    { title: "Verdict", description: "A plain-words read of what your resume says first, judged against a recruiter's criteria." },
                    { title: "Where your resume stands", description: "One of three bands, from Needs more context to Clear and specific, with a line on what it means. The number behind it is for comparing versions, in My reports and in a re-check." },
                    { title: "Critical Miss", description: "A problem that could cost you the interview on its own. The report flags up to three and starts with the one to fix first, each with its line and the questions to answer." },
                ],
            }}
            relatedArticles={["/research/how-recruiters-read", "/research/quantifying-impact", "/research/star-method"].map(hubLink)}
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
                    question: "What does the band summarize?",
                    answer: "How clearly your resume shows your work today. Behind it is a score out of 100. The main driver is how many of your important recent lines show the scope of the work or what changed. The report also rates four parts, the results you show, how clearly each line reads, how your experience fits together, and how easy the text is to follow, and keeps the score close to them. It isn't a simple average of the four, which is why they aren't shown as separate numbers. The report shows the band; the number is for comparing versions, in My reports and in a re-check. It doesn't predict interviews or offers.",
                },
                {
                    question: "Why a band instead of a number?",
                    answer: "A number invites you to chase points, and four numbers invite you to chase the lowest one. A band plus a written read keeps you on the change that matters most, which is your first Critical Miss. When you revise, a re-check shows how far the number moved.",
                },
                {
                    question: "Should I chase a better band?",
                    answer: "Not for its own sake. Start with your first Critical Miss and check every suggestion against what you actually did. A better band on a less accurate resume doesn't help you.",
                },
                {
                    question: "Does a person read my report?",
                    answer: "No. A recruiter with 14 years in hiring wrote the review criteria; AI applies them to your resume.",
                },
            ]}
            visualization={
                <>
                    <h2 className="research-h2">The sample report, start to finish</h2>
                    <p className="research-body mb-6">Everything in this figure comes from our sample report, written for a fictional candidate: the Verdict, the band, the Critical Miss, and the four things behind the band.</p>
                    <FirstReadModelDiagram />
                </>
            }
        >
            <h2 className="research-h2">What we look for</h2>
            <p className="research-body mb-6">
                A recruiter should be able to tell what kind of work you do, what you owned, how big it was, and what changed because of it. The report looks for those details in your resume. If one is missing, it asks you for it instead of guessing.
            </p>
            <p className="research-body mb-6">
                It reads the whole document, not a stripped-down summary. In one recruiter study, judgments changed when reviewers saw real resumes instead of simplified candidate profiles. That&apos;s one reason every finding stays tied to the line it came from.
                <Citation id="source-0">1</Citation>
            </p>

            <h2 className="research-h2">How the Critical Miss is chosen</h2>
            <p className="research-body mb-6">
                A Critical Miss is a problem that could cost you the interview on its own. The report flags up to three, in order, and starts with the one to fix first. Often it&apos;s a strong example that stops short of its result, or a responsibility that hides how much you owned. For each one, the report quotes the line, says what&apos;s missing, and lists the questions that would fill it in. The choice applies our criteria; it isn&apos;t a prediction of what a particular recruiter will notice.
            </p>

            <h2 className="research-h2">How suggested edits protect your facts</h2>
            <p className="research-body mb-6">
                For each fix, the report asks what&apos;s missing, and the revised line is your line plus the answers you type, word for word. Skip a question, or say you didn&apos;t do it, and it stays out. When we offer a smoother version, it can drop filler words but never add one. If you edit the line and add something that isn&apos;t in your line or your answers, we flag it, and it can&apos;t be copied until you add it as an answer. Wording suggested for other lines uses only what&apos;s already on your resume: where a number or a team size is missing, the report asks for it instead of guessing, and a draft that changes one of your facts can&apos;t be copied.
            </p>

            <h2 className="research-h2">What comes from research, and what is ours</h2>
            <dl className="not-prose mb-12 divide-y divide-border/40 border-y border-border/40">
                <div className="grid gap-2 py-5 md:grid-cols-[10rem_1fr] md:gap-8">
                    <dt className="text-sm font-semibold text-brand">From research</dt>
                    <dd className="text-sm text-muted-foreground">In one study, recruiters judged real resumes differently from simplified profiles. In another, longer looks at the Experience section went with moving a resume forward.</dd>
                </div>
                <div className="grid gap-2 py-5 md:grid-cols-[10rem_1fr] md:gap-8">
                    <dt className="text-sm font-semibold text-foreground">Ours</dt>
                    <dd className="text-sm text-muted-foreground">The four things behind the band, how the Critical Miss is chosen, and how findings are written. A recruiter designed the criteria; the studies did not test our score.</dd>
                </div>
            </dl>

            <h2 id="how-we-write-research" className="research-h2 riyp-jump-target">How we write the research</h2>
            <p className="research-body mb-6">
                The research library is where the report&apos;s advice comes from, so it has to survive a skeptic. The authority is the studies, not us: every one is linked, so you can check our reading against the source.
            </p>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>Every page opens with the question you asked and a straight answer, with the study behind it linked right there.</li>
                <li>We link the full study when it&apos;s public. If we could read only the abstract, the page says so.</li>
                <li>Each finding travels with its limits: who was studied, where, how many, and what the study can&apos;t tell you.</li>
                <li>When something is our advice, or a recruiter&apos;s experience rather than a finding, we label it, usually &ldquo;Our take&rdquo; or &ldquo;Our advice.&rdquo;</li>
                <li>We&apos;d rather print a small, honest number than a big, round one. If hires went from 3.1% to 3.3%, that&apos;s what you&apos;ll read.</li>
                <li>Each page shows when it last changed. That date moves for a corrected claim or a new section, never for a redesign.</li>
            </ul>
            <p className="research-body mb-6">
                <Link href="/research">Read the research</Link>, starting with the question that&apos;s been keeping you up.
            </p>

            <h2 className="research-h2">How to use the band</h2>
            <p className="research-body mb-6">
                Start with your first Critical Miss and check it against your experience. In a 2023 eye-tracking study, longer review time and attention to the Experience section were associated with resumes moving forward. That study shaped how we think about experience; it didn&apos;t test our score or show that an edit causes more attention.
                <Citation id="source-1">2</Citation>
            </p>

            <h2 className="research-h2">What it can&apos;t tell you</h2>
            <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span aria-hidden="true">–</span>Whether you&apos;ll get an interview or an offer.</li>
                <li className="flex gap-2"><span aria-hidden="true">–</span>How a specific employer, team, or hiring process weighs things.</li>
                <li className="flex gap-2"><span aria-hidden="true">–</span>How your file looks. The report reads the text we pull from it, not the layout, fonts, or columns.</li>
                <li className="flex gap-2"><span aria-hidden="true">–</span>Anything about referrals, the job market, or bias in hiring.</li>
            </ul>
        </ResearchArticle>
    );
}
