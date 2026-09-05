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
                description: "Consistent questions and scoring help employers compare candidates. Here is what that means when you prepare for an interview.",
                lastUpdated: "July 2026",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The mechanism",
                stat: "Candidates are evaluated against shared criteria",
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
                    <h2 className="research-h2">Where STAR fits</h2>
                    <p className="research-body mb-6">
                        Past-behavior questions ask what you actually did in a relevant situation. STAR can keep that answer organized. The evidence below supports the employer&apos;s structured process, not one mandatory response acronym.
                    </p>
                    <StarStructureDiagram />
                </>
            }
            productTieIn={{
                title: "Use your resume to prepare examples",
                items: [
                    {
                        title: "Action and result",
                        description: "Choose a relevant achievement and be ready to explain what you did, why, and what happened."
                    },
                    {
                        title: "Details beyond the bullet",
                        description: "Your resume may summarize the result. Prepare the context, tradeoffs, and your own contribution for follow-up questions."
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
                    question: "Will every question ask about past experience?",
                    answer: "No. Structured interviews can ask what you did in the past or what you would do in a hypothetical job situation. Answer the question asked rather than forcing a prepared story into it."
                },
                {
                    question: "Why do structured interviews perform better?",
                    answer: "They reduce interviewer discretion by standardizing job-related questions and evaluation."
                },
                {
                    question: "Do I need a perfectly memorized answer?",
                    answer: "Prepare the facts and sequence of relevant examples. Leave room to answer the specific question and explain details the interviewer asks about."
                }
            ]}
        >
            <h2 className="research-h2">What structured interviews actually structure</h2>
            <p className="research-body mb-6">
                The employer identifies skills relevant to the job and sets the questions and rating criteria in advance. Higher levels of structure limit how much individual interviewers can change the questions or their evaluation standards.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Past experience"
                    desc="A behavioral question asks you to describe something you did. Choose a real example that addresses the skill being assessed."
                />
                <ArticleInsight
                    title="A hypothetical situation"
                    desc="A situational question asks what you would do. Explain your reasoning and the information you would need before deciding."
                />
            </div>

            <h2 className="research-h2">Prepare examples, then listen to the question</h2>
            <p className="research-body mb-6">
                <strong>Our preparation advice:</strong> use the job description to choose relevant examples from your work. For each one, note the problem, your responsibility, the choices you made, and the outcome. During the interview, choose the example that answers the actual question.
            </p>
            <div className="border border-border/40 rounded-md p-4 text-sm text-muted-foreground not-prose mb-6">
                <div className="mb-2 text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">Example preparation notes</div>
                <p className="text-foreground">
                    If you plan to discuss a delayed launch, be ready to explain what caused the delay, which decision was yours, who you involved, and what happened after you changed the plan.
                </p>
            </div>

            <h2 className="research-h2">What this evidence does not prove</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>It does not show that every behavioral answer must use the STAR acronym.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>It does not test whether STAR-formatted resume bullets increase interviews or hires.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>It does not make a vague or invented result more credible.</li>
            </ul>

            <h2 className="research-h2">Check your answer before the interview</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Can someone tell what you did, separate from the team&apos;s work?</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Have you explained why you chose that approach?</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Can you describe the outcome accurately, including what did not work?</li>
            </ul>
        </ResearchArticle>
    );
}
