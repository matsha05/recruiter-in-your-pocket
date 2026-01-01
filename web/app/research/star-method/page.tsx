import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { StarStructureDiagram } from "@/components/research/diagrams/StarStructureDiagram";

export const metadata: Metadata = {
    title: "The STAR Method: Structure That Works | Hiring Research",
    description: "The STAR method isn't just for interviews—it's also the best structure for resume bullets.",
};

export default function StarMethodPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Interview prep",
                title: "The STAR Method: Structure That Works",
                description: "The STAR method—Situation, Task, Action, Result—structures behavioral answers for interviews and resumes.",
                lastUpdated: "December 2025",
                readTime: "5 min read"
            }}
            keyFinding={{
                subtitle: "The Structure",
                stat: "Structured > Unstructured",
                statDescription: (
                    <>
                        Structured interviews consistently outperform unstructured interviews in validity and reliability.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </>
                ),
                source: {
                    text: "Levashina et al. (2014) structured interview review",
                    href: "https://www.morgeson.com/downloads/levashina_hartwell_morgeson_campion_2014.pdf"
                }
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">The STAR framework</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        A complete answer structure that works for behavioral interviews—and adapts to resume bullets.
                    </p>
                    <StarStructureDiagram />
                </>
            }
            productTieIn={{
                title: "How Recruiter in Your Pocket uses this",
                items: [
                    {
                        title: "Structure Detection",
                        description: "We identify bullets that lack clear results and suggest how to complete the story."
                    },
                    {
                        title: "Interview Prep Bridge",
                        description: "Strong resume bullets become the foundation for behavioral interview answers."
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
                    title: "The Structured Employment Interview: Narrative and Quantitative Review",
                    publisher: "Psychology of Personnel Assessment",
                    year: "2014",
                    href: "https://www.morgeson.com/downloads/levashina_hartwell_morgeson_campion_2014.pdf"
                },
                {
                    id: "source-2",
                    title: "Meta-analytic evidence on interview validity (100 years of research)",
                    publisher: "University of Baltimore",
                    year: "2016",
                    href: "https://home.ubalt.edu/tmitch/645/session%204/Schmidt%20%26%20Oh%20validity%20and%20util%20100%20yrs%20of%20research%20Wk%20PPR%202016.pdf"
                },
                {
                    id: "source-3",
                    title: "Structured Interviews and Behavioral Consistency",
                    publisher: "PLOS ONE (via PMC)",
                    year: "2016",
                    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4803420/"
                }
            ]}
            faq={[
                {
                    question: "Is STAR only for interviews?",
                    answer: "No. STAR is a structure for evidence. It works in resumes because it compresses a complete story into a single bullet."
                },
                {
                    question: "Do I need all four parts in every bullet?",
                    answer: "The action and result should be explicit. Situation and task can be implied by context."
                },
                {
                    question: "What if the result is small?",
                    answer: "Use scope or quality improvements when a hard metric is not available."
                }
            ]}
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Why structure matters</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Unstructured answers ramble. Structured answers communicate competence. The STAR method
                forces you to tell a complete story with a clear outcome—exactly what interviewers
                are trained to listen for.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                The same logic applies to resume bullets. A bullet that describes a situation and action
                but no result leaves the reader guessing. A complete STAR bullet answers: &quot;So what?&quot;
            </p>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-6 mt-12">Breaking down STAR</h2>
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
                    desc="The outcome. Quantify when possible. This is where most people undersell themselves."
                />
            </div>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-4 mt-12">STAR on a resume</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Resume bullets are compressed STAR stories. You don&apos;t have space for full narratives,
                but you should hit Action and Result explicitly, with Situation/Task implied by context.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                <strong>Weak:</strong> &quot;Worked on the customer support team handling inquiries.&quot;
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                <strong>Strong:</strong> &quot;Resolved 50+ daily customer escalations, reducing average
                resolution time from 4 hours to 45 minutes and improving satisfaction scores by 22%.&quot;
            </p>
            <p className="text-muted-foreground leading-relaxed">
                The situation (customer support) is implied. The action (resolved escalations) and
                result (faster resolution, higher satisfaction) are explicit. That&apos;s STAR in one sentence.
            </p>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-4 mt-12">Definition: structured interviews</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Structured interviews use consistent questions and scoring criteria to reduce bias and improve reliability. STAR is a candidate-facing version of that structure.
                <Citation id="source-1">1</Citation>
            </p>
        </ResearchArticle>
    );
}
