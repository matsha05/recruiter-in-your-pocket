import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { ErrorImpactDiagram } from "@/components/research/diagrams/ErrorImpactDiagram";

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
                stat: "Error Penalty",
                statDescription: (
                    <>
                        Spelling and grammar errors measurably reduce interview chances and trigger negative inferences.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </>
                ),
                source: {
                    text: "Sterkens et al. (2023) PLOS ONE synthesis",
                    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10075394/"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">Form vs. Content</h2>
                    <p className="research-body mb-6">
                        Evidence suggests errors are interpreted as signals of lower conscientiousness and weaker written communication, which affects screening outcomes.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </p>
                    <ErrorImpactDiagram />
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
                    title: "Costly mistakes: Evidence on spelling errors in résumés",
                    publisher: "PLOS ONE (via PMC)",
                    year: "2023",
                    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10075394/"
                },
                {
                    id: "source-2",
                    title: "Costly mistakes: Evidence on spelling errors in résumés (working paper)",
                    publisher: "EconStor",
                    year: "2021",
                    href: "https://www.econstor.eu/bitstream/10419/235907/1/GLO-DP-0899.pdf"
                },
                {
                    id: "source-3",
                    title: "Do Recruiters Infer Applicant Personality from Resumes?",
                    publisher: "International Journal of Selection and Assessment",
                    year: "2017",
                    href: "https://onlinelibrary.wiley.com/doi/10.1111/ijsa.12179"
                }
            ]}
            faq={[
                {
                    question: "Do a few typos really matter?",
                    answer: "The research suggests that even small errors can create negative trait inferences that reduce interview chances."
                },
                {
                    question: "Is grammar more important than content?",
                    answer: "Content still matters, but form errors can block the content from being evaluated at all."
                },
                {
                    question: "What is the fastest fix?",
                    answer: "Run a dedicated error pass, then fix spacing, punctuation, and tense consistency."
                }
            ]}
        >
            <h2 className="research-h2">Errors act as a gate</h2>
            <p className="research-body mb-6">
                In large resume stacks, screening shortcuts rule. Errors are interpreted as signals, not as isolated mistakes.
                The evidence links them to lower interview probabilities and to negative trait inferences.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="The 'Conscientiousness' Signal"
                    desc={
                        <>
                            Recruiters view spelling not as a literacy test, but as a proxy for attention to detail and professional care.
                            <Citation id="source-1">1</Citation>
                            <Citation id="source-2">2</Citation>
                        </>
                    }
                />
            </div>

            <h2 className="research-h2">Definition: form errors</h2>
            <p className="research-body mb-6">
                Form errors include spelling mistakes, grammar mistakes, inconsistent formatting, and layout artifacts that signal carelessness.
                These errors are processed quickly and often shape the initial decision.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">What to fix first</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Spelling and grammar consistency.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Date alignment and spacing.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Repeated tense shifts inside a single role.</li>
            </ul>
        </ResearchArticle>
    );
}
