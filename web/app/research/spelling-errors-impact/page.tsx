import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { FormContentSplit } from "@/components/research/diagrams/FormContentSplit";

export const metadata: Metadata = {
    title: "Spelling errors carry real weight in recruiter judgment | Hiring Research",
    description: "How form and content shape first impressions in screening.",
};

export default function SpellingErrorsPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Screening heuristics",
                title: "Spelling errors carry real weight in recruiter judgment",
                description: "Practical research that makes the product feel like a recruiter wrote it.",
                lastUpdated: "December 2025",
                readTime: "3 min read"
            }}
            keyFinding={{
                subtitle: "The Penalty",
                stat: "Form > Content",
                statDescription: (
                    <>
                        Process-oriented recruiters penalize spelling errors as heavily as missing experience.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Martin-Lacroux (2017) Int. J. Selection & Assessment",
                    href: "https://onlinelibrary.wiley.com/doi/10.1111/ijsa.12179"
                }
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Form vs. Content</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                The study found that for many recruiters, &quot;form&quot; (spelling, grammar, layout) acts as a gateway. If the form is bad, the content (skills, experience) is never evaluated fully.
                <Citation id="source-1">1</Citation>
            </p>
                    <FormContentSplit />
                </>
            }
            productTieIn={{
                title: "What this changes in RIYP",
                items: [
                    {
                        title: "Dedicated &apos;Error Pass&apos;",
                        description: "In Top Fixes, we prioritize a dedicated error check before deep content analysis."
                    },
                    {
                        title: "Visual Credibility",
                        description: "We enforce consistent formatting because inconsistency reads as &apos;error&apos; to the scanning eye."
                    }
                ]
            }}
            relatedArticles={[
                { title: "How People Scan", href: "/research/how-people-scan", tag: "Psychology" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" },
                { title: "Resume Length Myths", href: "/research/resume-length-myths", tag: "Structure" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Do Recruiters Infer Applicant Personality from Résumés?",
                    publisher: "International Journal of Selection and Assessment",
                    year: "2017",
                    href: "https://onlinelibrary.wiley.com/doi/10.1111/ijsa.12179"
                }
            ]}
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Credibility is lost in milliseconds</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                It seems unfair that a typo matters more than a degree, but in large resume stacks, heuristic shortcuts rule.
                An error signals &quot;lack of conscientiousness&quot; to a recruiter, providing a quick, guilt-free reason to reject and move to the next candidate.
                <Citation id="source-1">1</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="The 'Conscientiousness' Signal"
                    desc={
                        <>
                            Recruiters view spelling not as a literacy test, but as a proxy for attention to detail and professional care.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
            </div>
        </ResearchArticle>
    );
}
