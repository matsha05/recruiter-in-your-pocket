import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { ResumeHeatmap } from "@/components/research/diagrams/ResumeHeatmap";
import { ScanPattern } from "@/components/research/diagrams/ScanPattern";

export const metadata: Metadata = {
    title: "What Recruiters Notice in the First Pass | Hiring Research",
    description: "Peer-reviewed eye-tracking research on recruiter attention, resume review, and the limits of the six-second claim.",
};

export default function HowRecruitersReadPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Recruiter attention",
                title: "What recruiters notice in the first pass",
                description: "The strongest evidence says more than a stopwatch can: attention is uneven, experience matters, and the whole document changes the judgment.",
                lastUpdated: "July 2026",
                readTime: "5 min read",
                sourceSummary: "2 peer-reviewed studies and 1 historical vendor report"
            }}
            keyFinding={{
                subtitle: "Strongest direct evidence",
                stat: "2,043 resume reviews",
                statDescription: (
                    <>
                        In a 2023 eye-tracking study, review time and attention to the Experience section were associated with decisions to move a resume forward. That is an association within one study, not a universal formula.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Pina et al., peer-reviewed eye-tracking study (2023)",
                    href: "https://doi.org/10.3390/make5030038"
                },
                sampleSize: (
                    <>
                        221 recruiters recruited; 24 incomplete sessions removed; 2,043 usable first-round reviews
                        <Citation id="source-1">1</Citation>
                    </>
                )
            }}
            visualization={
                <>
                    <h2 className="research-h2">Put each claim beside the evidence behind it</h2>
                    <p className="research-body mb-6">
                        Peer-reviewed studies carry the practical conclusion. The company report that popularized the six-second line is included only to explain where that claim came from and why it should not be treated as a rule.
                    </p>
                    <ResumeHeatmap figureNumber={1} />
                </>
            }
            productTieIn={{
                title: "How this shows up in your report",
                items: [
                    {
                        title: "First-pass clarity",
                        description: "We identify what the page communicates immediately and what still requires a reader to infer the story."
                    },
                    {
                        title: "Experience in context",
                        description: "We keep role, scope, ownership, and outcomes together because the full resume changes how individual details are judged."
                    }
                ]
            }}
            relatedArticles={[
                { title: "What Spelling Errors Cost", href: "/research/spelling-errors-impact", tag: "Screening" },
                { title: "Resume Length Myths", href: "/research/resume-length-myths", tag: "Research" },
                { title: "How the Report Score Works", href: "/research/how-we-score", tag: "Methodology" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Using Machine Learning with Eye-Tracking Data to Predict if a Recruiter Will Approve a Resume",
                    publisher: "Machine Learning and Knowledge Extraction",
                    year: "2023",
                    href: "https://doi.org/10.3390/make5030038"
                },
                {
                    id: "source-2",
                    title: "The Importance of Representative Design in Judgment Tasks: The Case of Resume Screening",
                    publisher: "Journal of Occupational and Organizational Psychology",
                    year: "2002",
                    href: "https://doi.org/10.1348/09631790260098749"
                },
                {
                    id: "source-3",
                    title: "Eye-Tracking Study",
                    publisher: "TheLadders",
                    year: "2012",
                    href: "https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf"
                }
            ]}
            faq={[
                {
                    question: "Do recruiters really spend six seconds on every resume?",
                    answer: "No. A company-sponsored 2012 report popularized an average of roughly six seconds in its study. It did not establish a universal timer for recruiters, roles, or hiring processes."
                },
                {
                    question: "What did the strongest eye-tracking study measure?",
                    answer: "The 2023 study recruited 221 people who hired computer science graduates. The researchers removed 24 incomplete sessions and analyzed 2,043 usable first-round resume reviews."
                },
                {
                    question: "Does more viewing time cause a resume to move forward?",
                    answer: "The study found an association, not proof of causation. A recruiter may spend longer because the resume is relevant, because it is difficult, or because they are weighing a decision."
                }
            ]}
        >
            <h2 className="research-h2">The six-second line is a reminder, not a law</h2>
            <p className="research-body mb-6">
                The memorable number comes from a small, company-sponsored eye-tracking report published in 2012. It is useful as category history, but it cannot support a universal claim about how every recruiter reads.
                <Citation id="source-3">3</Citation>
            </p>
            <p className="research-body mb-6">
                Better evidence supports a more useful conclusion. In a 2023 peer-reviewed study, recruiters did not distribute attention evenly. Total review time and time spent on Experience were associated with moving a resume to the next stage. The researchers did not identify one required reading time or one scan path.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">What deserves confidence</h2>
            <p className="research-body mb-6">
                Pina and colleagues recruited 221 people who hired computer science graduates. Each reviewed entry-level resumes in a simulated first-round screen with no time limit. After incomplete sessions and resumes were removed, the paper analyzed 2,043 reviews.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                The clearest section-level result involved Experience: longer viewing there was correlated with resumes moving forward. Education also appeared among the more informative areas. The study found no comparable result for Skills, Projects, Introduction, or Address, which does not mean those sections never matter.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">What should be easy to understand</h2>
            <div className="grid gap-4 sm:grid-cols-2 not-prose">
                <ArticleInsight
                    title="What kind of work you do"
                    desc="Use a recognizable professional identity and role language. A reader should not have to decode an internal title or a broad slogan."
                />
                <ArticleInsight
                    title="What you did in recent roles"
                    desc={
                        <>
                            Give Experience the context needed for a judgment: the work, your part, the scale, and the result when you can verify it.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="How the details fit together"
                    desc={
                        <>
                            Keep evidence attached to the real resume. Recruiters used cues differently when they judged full resumes instead of stripped-down profiles.
                            <Citation id="source-2">2</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Where the reader should look next"
                    desc="Stable headings, visible dates, and a predictable order help the reader move from orientation to evidence without hunting for it."
                />
            </div>

            <h2 className="research-h2">What the evidence changes</h2>
            <p className="research-body mb-6">
                Do not write for a stopwatch. Write so a quick orientation pass reveals the target role and recent experience, then gives the reader a reason to stay. The goal is not to force every recruiter through the same path. It is to remove avoidable searching.
            </p>

            <div className="not-prose my-10">
                <ScanPattern figureNumber={2} />
            </div>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>The 2023 study focused on entry-level computer science resumes and a simulated screen.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Eye-tracking associations do not prove that a resume section caused a decision.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>The 2002 study shows that the full artifact changes judgments; it does not prescribe one layout.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>The 2012 vendor report is historical context, not the foundation for our advice.</li>
            </ul>
        </ResearchArticle>
    );
}
