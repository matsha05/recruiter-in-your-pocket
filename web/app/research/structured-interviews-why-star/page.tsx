import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { StarStructureDiagram } from "@/components/research/diagrams/StarStructureDiagram";

export const metadata: Metadata = {
    title: "Structured Interviews Beat Vibes | Hiring Research",
    description: "Why STAR exists and why structure outperforms intuition.",
};

export default function StructuredInterviewsWhyStarPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Interview research",
                title: "Structured interviews beat vibes: why STAR exists",
                description: "STAR compresses evidence-based structured interviewing into a format candidates can use.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The Evidence",
                stat: "Structured > Unstructured",
                statDescription: (
                    <>
                        Meta-analyses show structured interviews consistently outperform unstructured ones in validity.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </>
                ),
                source: {
                    text: "Levashina et al. structured interview review",
                    href: "https://www.morgeson.com/downloads/levashina_hartwell_morgeson_campion_2014.pdf"
                }
            }}
            visualization={
                <>
                    <h2 className="font-display text-2xl font-medium text-foreground mb-4">From rubric to STAR</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        STAR is a candidate-facing compression of structured interview evidence.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <StarStructureDiagram />
                </>
            }
            productTieIn={{
                title: "How RIYP uses this",
                items: [
                    {
                        title: "STAR-aligned bullets",
                        description: "We identify where action and result are missing and suggest fixes."
                    },
                    {
                        title: "Interview bridge",
                        description: "Strong bullets become immediate interview stories."
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
                }
            ]}
            faq={[
                {
                    question: "Is STAR only for interviews?",
                    answer: "No. STAR compresses structured interview evidence into a resume-friendly format."
                },
                {
                    question: "Why do structured interviews perform better?",
                    answer: "They reduce variance and bias by standardizing questions and evaluation."
                },
                {
                    question: "How do I apply this to resume bullets?",
                    answer: "Make action and result explicit in the line. Keep situation and task implied by role context."
                }
            ]}
        >
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Why STAR works on resumes</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                STAR ensures the reader sees context, action, and result. That is the same structure structured interviews aim to elicit.
                <Citation id="source-1">1</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Action + Result"
                    desc="Recruiter lens: if the result is missing, the story feels incomplete."
                />
                <ArticleInsight
                    title="Evidence density"
                    desc="Structured formats increase evidence per line without adding length." 
                />
            </div>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">What structured interviews measure</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Structured interviews improve reliability by asking consistent questions and scoring against a rubric.
                That same structure is what makes STAR readable on a resume.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Situation and task define context.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Action shows decision-making and ownership.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Result shows measurable impact and scope.</li>
            </ul>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Resume translation</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Recruiter lens: you only need to make action and result explicit. Situation and task are implied by the role title.
            </p>
            <div className="border border-border/40 rounded-md p-4 text-sm text-muted-foreground not-prose mb-6">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-2">Example</div>
                <p className="text-foreground">
                    Built a pricing experiment that lifted conversion and reduced churn drivers, enabling sales to land larger enterprise deals.
                </p>
            </div>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Definition: structured interviewing</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Structured interviewing uses consistent questions and scoring criteria to improve reliability and reduce bias. STAR is a candidate-facing version of that approach.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Common pitfalls</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Listing tasks without outcomes.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Overloading a single bullet with multiple situations.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Using vague results like improved or optimized without proof.</li>
            </ul>
        </ResearchArticle>
    );
}
