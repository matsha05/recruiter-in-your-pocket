import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { ResumeHeatmap } from "@/components/research/diagrams/ResumeHeatmap";
import { ScanPattern } from "@/components/research/diagrams/ScanPattern";

export const metadata: Metadata = {
    title: "What recruiters notice in the first pass",
    description: "Peer-reviewed eye-tracking research on recruiter attention, resume review, and the limits of the six-second claim.",
    alternates: { canonical: "/research/how-recruiters-read" },
};

export default function HowRecruitersReadPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Recruiter attention",
                title: "What recruiters notice in the first pass",
                description: "Eye-tracking studies show where recruiters spent time. They do not establish a six-second deadline for every resume.",
                lastUpdated: "July 2026",
                readTime: "5 min read",
                sourceSummary: "2 peer-reviewed studies and 1 historical vendor report"
            }}
            keyFinding={{
                subtitle: "Strongest direct evidence",
                stat: "Longer looks at Experience",
                statDescription: (
                    <>
                        In a 2023 eye-tracking study, recruiters who spent longer on a resume&apos;s Experience section were more likely to move it forward.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Pina et al., peer-reviewed eye-tracking study (2023)",
                    href: "https://doi.org/10.3390/make5030038"
                },
                sampleSize: (
                    <>
                        221 recruiters from one southwestern US state; 24 with incomplete data removed; 2,043 usable resume reviews
                        <Citation id="source-1">1</Citation>
                    </>
                )
            }}
            visualization={
                <>
                    <h2 className="research-h2">What the studies measured</h2>
                    <p className="research-body mb-6">
                        Three studies, three different setups. Together they say more about where attention goes than one famous number does.
                    </p>
                    <ResumeHeatmap figureNumber={1} />
                </>
            }
            productTieIn={{
                title: "Where this shows up in your report",
                items: [
                    {
                        title: "The Verdict",
                        description: "A plain-words summary of what your resume says first. It isn't an eye-tracking measure, and it can't tell you how long anyone will look."
                    },
                    {
                        title: "The Critical Miss",
                        description: "If a recruiter would be left asking about your role, scope, or results, that question leads your report."
                    }
                ]
            }}
            relatedArticles={[
                { title: "How spelling errors changed recruiter ratings", href: "/research/spelling-errors-impact", tag: "Screening" },
                { title: "There is no universal one-page rule", href: "/research/resume-length-myths", tag: "Research" },
                { title: "How the report works", href: "/methodology", tag: "Methodology" }
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
                    answer: "The 2023 study recruited 221 people who hired computer science graduates, at career fairs and businesses in one southwestern US state. The researchers removed 24 participants whose data was incomplete and analyzed 2,043 usable resume reviews."
                },
                {
                    question: "Does more viewing time cause a resume to move forward?",
                    answer: "The study found an association, not proof of causation. A recruiter may spend longer because the resume is relevant, because it is difficult, or because they are weighing a decision."
                }
            ]}
        >
            <h2 className="research-h2">Where the six-second claim came from</h2>
            <p className="research-body mb-6">
                The memorable number comes from a 2012 eye-tracking report by TheLadders, a job site, about its own product. It watched 30 recruiters. It is useful as category history, but it cannot support a universal claim about how every recruiter reads.
                <Citation id="source-3">3</Citation>
            </p>
            <p className="research-body mb-6">
                Better evidence supports a more useful conclusion. In a 2023 peer-reviewed study, recruiters did not distribute attention evenly. Total review time and time spent on Experience were associated with moving a resume to the next stage. The researchers did not identify one required reading time or one scan path.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">What the larger eye-tracking study found</h2>
            <p className="research-body mb-6">
                Pina and colleagues recruited 221 people who hired computer science graduates, all from one southwestern US state. Each decided whether to move resumes forward in a simulated screen with no time limit and no specific job named. After incomplete data was removed, the paper analyzed 2,043 reviews.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                The clearest section-level result involved Experience: longer viewing there was correlated with resumes moving forward. Education mattered to a lesser extent. The study found no comparable result for Skills, Projects, Introduction, or Address, which does not mean those sections never matter.
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
                    desc="Keep useful context beside the achievement: the team, the scale, and what changed."
                />
                <ArticleInsight
                    title="Where the reader should look next"
                    desc="Stable headings, visible dates, and a predictable order help the reader move from orientation to evidence without hunting for it."
                />
            </div>

            <h2 className="research-h2">What the evidence changes</h2>
            <p className="research-body mb-6">
                <strong>Our editing advice:</strong> put your recent, relevant experience where it is easy to find. Use recognizable headings and explain your part in the work. The studies do not tell you to design around one reading speed or scan path.
            </p>

            <div className="not-prose my-10">
                <ScanPattern figureNumber={2} />
            </div>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>The 2023 study used recruiters from one US state, computer science graduates&apos; resumes, and a simulated screen with no specific job.</li>
                <li>Eye-tracking associations do not prove that a resume section caused a decision.</li>
                <li>The 2002 study is about how to study screening: recruiters judged real resumes differently from simplified profiles. It isn&apos;t writing advice, and we read only its abstract.</li>
                <li>The 2012 vendor report is historical context, not the foundation for our advice.</li>
            </ul>
        </ResearchArticle>
    );
}
