import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { StarStructureDiagram } from "@/components/research/diagrams/StarStructureDiagram";

export const metadata: Metadata = {
    title: "The STAR Method: What Research Supports | Hiring Research",
    description: "What structured-interview research supports, and where STAR becomes a practical writing heuristic rather than a tested resume rule.",
};

export default function StarMethodPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Interview prep",
                title: "How to use STAR without forcing the formula",
                description: "Situation, task, action, and result can organize an answer. The research supports structured interviews, not a universal STAR formula for resumes.",
                lastUpdated: "July 2026",
                readTime: "5 min read"
            }}
            keyFinding={{
                subtitle: "What the evidence supports",
                stat: "Interview structure helps reviewers compare answers",
                statDescription: (
                    <>
                        Structured interviews limit interviewer discretion by using job-related questions and common rating standards. Higher structure is associated with stronger validity, rater reliability, and agreement.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </>
                ),
                source: {
                    text: "Levashina et al. (2014) structured interview review",
                    href: "https://apps.it.purdue.edu/sites/Home/DirectoryApi/Files/42d5154c-ccc5-403e-b3ed-edd69e3f6896/Download"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">The STAR framework</h2>
                    <p className="research-body mb-6">
                        STAR is one way to organize a past-behavior answer. Using action and result in a resume can be a useful adaptation, but the cited studies did not test STAR-formatted resume bullets.
                    </p>
                    <StarStructureDiagram />
                </>
            }
            productTieIn={{
                title: "How this shows up in your report",
                items: [
                    {
                        title: "Action and outcome",
                        description: "We point out when the line does not make your part or the result clear."
                    },
                    {
                        title: "Prepare an interview example",
                        description: "A specific bullet gives you facts to develop into a behavioral interview answer."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Quantifying Your Impact", href: "/research/quantifying-impact", tag: "Impact" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" },
                { title: "Resume Length Myths", href: "/research/resume-length-myths", tag: "Format" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "The Structured Employment Interview: Narrative and Quantitative Review of the Research Literature",
                    publisher: "Personnel Psychology",
                    year: "2014",
                    href: "https://apps.it.purdue.edu/sites/Home/DirectoryApi/Files/42d5154c-ccc5-403e-b3ed-edd69e3f6896/Download"
                },
                {
                    id: "source-2",
                    title: "Structured Interviews",
                    publisher: "U.S. Office of Personnel Management",
                    year: "Current guidance",
                    href: "https://www.opm.gov/policy-data-oversight/assessment-and-selection/other-assessment-methods/structured-interviews/"
                }
            ]}
            faq={[
                {
                    question: "Is STAR only for interviews?",
                    answer: "You can also use it to check whether a resume bullet explains what you did and what changed. The studies cited here did not test STAR-formatted resumes, and you do not need all four parts in every bullet."
                },
                {
                    question: "Do I need all four parts in every bullet?",
                    answer: "No. Action and outcome are usually the most useful pieces. Situation and task can be implied by the role or surrounding context."
                },
                {
                    question: "What if the result is small?",
                    answer: "Use scope or quality improvements when a hard metric is not available."
                }
            ]}
        >
            <h2 className="research-h2">Why structure matters</h2>
            <p className="research-body mb-6">
                In a structured interview, the employer standardizes job-related questions and scoring. That makes candidates easier to compare and reduces the room for each interviewer to invent a different test.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>
            <p className="research-body mb-6">
                STAR helps you organize an example from your own experience. It can remind you to explain what you did and what happened, but it does not determine the employer&apos;s questions or scoring.
            </p>

            <h2 className="research-h2">Breaking down STAR</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    title="Situation"
                    desc="The context. What was happening? What was the problem or opportunity? Keep it brief."
                />
                <ArticleInsight
                    title="Task"
                    desc="Your specific responsibility. What were you asked to do? What was your role?"
                />
                <ArticleInsight
                    title="Action"
                    desc="What you actually did. Explain your contribution and distinguish it from the team's work."
                />
                <ArticleInsight
                    title="Result"
                    desc="The outcome. Name what changed, and add a measure when you have one."
                />
            </div>

            <h2 className="research-h2">STAR on a resume</h2>
            <p className="research-body mb-6">
                Do not force four labeled parts into a bullet. A useful line usually needs a clear action, the context needed to understand it, and an outcome when one is known. Situation and task often live in the role title or surrounding bullets.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
                These are fictional examples. Only add details like these to your own resume if they are true.
            </p>
            <p className="research-body mb-6">
                <strong>Weak:</strong> &quot;Worked on the customer support team handling inquiries.&quot;
            </p>
            <p className="research-body mb-6">
                <strong>With more detail:</strong> &quot;Handled customer escalations and created a troubleshooting guide that helped the support team resolve repeat billing issues.&quot;
            </p>
            <p className="research-body">
                The role supplies the context. The revision explains the action, identifies the problem, and names a useful outcome. A verified measure could add detail, but the sentence does not need an invented number.
            </p>

        </ResearchArticle>
    );
}
