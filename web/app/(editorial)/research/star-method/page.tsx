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
                title: "STAR: useful structure, narrower evidence",
                description: "Situation, task, action, and result can organize an answer. The research supports structured interviews, not a universal STAR formula for resumes.",
                lastUpdated: "July 2026",
                readTime: "5 min read"
            }}
            keyFinding={{
                subtitle: "What the evidence supports",
                stat: "Same questions. Same standards. More consistent evaluation.",
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
                        title: "Interview bridge",
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
                    answer: "The research cited here is about interviews. On a resume, action plus outcome is a useful writing heuristic, not a scientifically validated requirement to squeeze all four STAR parts into every bullet."
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
                STAR solves a different problem for the candidate: it keeps a past-behavior answer from losing the action or outcome. That is a practical bridge, not the source of structured interviews&apos; research advantage.
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
                    desc="What you actually did. Be specific about your contributions, not the team&apos;s."
                />
                <ArticleInsight
                    title="Result"
                    desc="The outcome. Name what changed, and add a measure when you have one."
                />
            </div>

            <h2 className="research-h2">STAR on a resume</h2>
            <p className="research-body mb-6">
                Do not force four labeled parts into a bullet. A useful line usually needs a clear action, enough context to understand it, and an outcome when one is known. Situation and task often live in the role title or surrounding bullets.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
                Illustrative pair. The facts and numbers belong to the example and should never be invented in a real rewrite.
            </p>
            <p className="research-body mb-6">
                <strong>Weak:</strong> &quot;Worked on the customer support team handling inquiries.&quot;
            </p>
            <p className="research-body mb-6">
                <strong>Strong:</strong> &quot;Resolved 50+ daily customer escalations, reducing average
                resolution time from 4 hours to 45 minutes and improving satisfaction scores by 22%.&quot;
            </p>
            <p className="research-body">
                The situation (customer support) is implied. The action (resolved escalations) and
                result (faster resolution, higher satisfaction) are explicit. That&apos;s STAR in one sentence.
            </p>

            <h2 className="research-h2">Why interview structure matters</h2>
            <p className="research-body mb-6">
                Structured interviews use consistent, job-related questions and common scoring criteria. STAR can help a candidate answer a past-behavior question clearly, but it does not standardize the interview and it does not guarantee a high score.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>
        </ResearchArticle>
    );
}
