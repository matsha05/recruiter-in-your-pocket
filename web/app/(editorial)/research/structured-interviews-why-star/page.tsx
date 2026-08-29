import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { StarStructureDiagram } from "@/components/research/diagrams/StarStructureDiagram";

export const metadata: Metadata = {
    title: "Why Structured Interviews Are More Reliable | Hiring Research",
    description: "What interview research explains about consistent questions and scoring, plus the narrower role STAR can play in an answer.",
};

export default function StructuredInterviewsWhyStarPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Interview research",
                title: "Why structured interviews are more reliable",
                description: "The research advantage comes from job-related questions and consistent scoring. STAR is an answer organizer, not the intervention being validated.",
                lastUpdated: "July 2026",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The mechanism",
                stat: "Same questions. Same rubric. Better comparison.",
                statDescription: (
                    <>
                        Structured interviews constrain the questions and evaluation criteria. Research reviews and OPM guidance associate higher structure with stronger validity, rater reliability, and agreement.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </>
                ),
                source: {
                    text: "Levashina et al. structured interview review",
                    href: "https://apps.it.purdue.edu/sites/Home/DirectoryApi/Files/42d5154c-ccc5-403e-b3ed-edd69e3f6896/Download"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">How STAR borrows from structured interviews</h2>
                    <p className="research-body mb-6">
                        Past-behavior questions ask what you actually did in a relevant situation. STAR can keep that answer organized. The evidence below supports the employer&apos;s structured process, not one mandatory response acronym.
                    </p>
                    <StarStructureDiagram />
                </>
            }
            productTieIn={{
                title: "How this shows up in your report",
                items: [
                    {
                        title: "Action and result",
                        description: "We point out where the line leaves your contribution or the outcome unclear."
                    },
                    {
                        title: "Interview bridge",
                        description: "A specific bullet gives you facts to develop into an interview story."
                    }
                ]
            }}
            relatedArticles={[
                { title: "The STAR Method", href: "/research/star-method", tag: "Structure" },
                { title: "Quantifying Impact", href: "/research/quantifying-impact", tag: "Writing" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" }
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
                    answer: "STAR was designed as an answer structure. On a resume, action plus outcome can be useful, but the research cited here did not test STAR-formatted bullets."
                },
                {
                    question: "Why do structured interviews perform better?",
                    answer: "They reduce interviewer discretion by standardizing job-related questions and evaluation."
                },
                {
                    question: "How do I apply this to resume bullets?",
                    answer: "Make action and result explicit in the line. Keep situation and task implied by role context."
                }
            ]}
        >
            <h2 className="research-h2">What structured interviews actually structure</h2>
            <p className="research-body mb-6">
                The employer identifies job-related competencies, asks candidates the same predetermined questions, and evaluates responses against the same standards. That shared process, not an answer acronym, is the research-backed intervention.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Action + Result"
                    desc="An outcome can make the contribution easier to evaluate."
                />
                <ArticleInsight
                    title="More useful detail"
                    desc="A clear structure can add context without making the bullet much longer."
                />
            </div>

            <h2 className="research-h2">Use STAR on a resume</h2>
            <p className="research-body mb-6">
                Treat STAR as a check, not a template. Make your action visible, add the outcome when you know it, and include only the context the result needs. Situation and task may already be clear from the role.
            </p>
            <div className="border border-border/40 rounded-md p-4 text-sm text-muted-foreground not-prose mb-6">
                <div className="mb-2 text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">Illustrative example</div>
                <p className="text-foreground">
                    Ran a pricing test across three self-serve plans, lifting trial-to-paid conversion from 12% to 16% and adding $1.2M in annualized revenue without increasing 90-day churn.
                </p>
            </div>

            <h2 className="research-h2">What structured interviewing means</h2>
            <p className="research-body mb-6">
                Structured interviewing uses job-related, consistent questions and common scoring criteria. STAR can organize one candidate&apos;s response; it cannot make an employer&apos;s process structured by itself.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>

            <h2 className="research-h2">What this evidence does not prove</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>It does not show that every behavioral answer must use the STAR acronym.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>It does not test whether STAR-formatted resume bullets increase interviews or hires.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>It does not make a vague or invented result more credible.</li>
            </ul>

            <h2 className="research-h2">Common pitfalls</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Listing tasks without outcomes.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Overloading a single bullet with multiple situations.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Using vague results like improved or optimized without proof.</li>
            </ul>
        </ResearchArticle>
    );
}
