import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { ErrorImpactDiagram } from "@/components/research/diagrams/ErrorImpactDiagram";
import { InferenceLadderDiagram } from "@/components/research/diagrams/InferenceLadderDiagram";

export const metadata: Metadata = {
    title: "How Spelling Errors Changed Recruiter Ratings | Hiring Research",
    description: "What one 2023 experiment with 445 hiring professionals found about spelling errors and interview-probability ratings.",
};

export default function SpellingErrorsPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Screening heuristics",
                title: "How spelling errors changed recruiter ratings",
                description: "A recruiter experiment gives us a useful answer and a reason not to panic over one typo.",
                lastUpdated: "July 2026",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The clearest result",
                stat: "Five errors: −18.5 points on the interview rating",
                statDescription: (
                    <>
                        In the 2023 experiment, hiring professionals assigned graduate resumes containing five spelling errors an 18.5 percentage-point lower interview-probability rating than error-free resumes.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Sterkens et al. (2023), 445 hiring professionals",
                    href: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0283280"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">What the experiment actually tested</h2>
                    <p className="research-body mb-6">
                        Recruiters evaluated otherwise comparable resumes with zero, two, or five spelling errors across eight occupations. The penalty was clearest at five errors; the study does not establish that one typo ruins an application.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <ErrorImpactDiagram />
                </>
            }
            productTieIn={{
                title: "How this shows up in your report",
                items: [
                    {
                        title: "Run a separate spelling pass",
                        description: "Your report is not a spell-checker. Use a dedicated spelling and consistency check after the content review."
                    },
                    {
                        title: "No catastrophe language",
                        description: "One typo is worth fixing. It is not evidence that your whole application is doomed."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Clear Writing Changes How Evidence Is Judged", href: "/research/writing-quality-hire-probability", tag: "Writing" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" },
                { title: "Resume Length Myths", href: "/research/resume-length-myths", tag: "Structure" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Costly mistakes: Evidence on spelling errors in résumés",
                    publisher: "PLOS ONE",
                    year: "2023",
                    href: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0283280"
                }
            ]}
            faq={[
                {
                    question: "Do a few typos really matter?",
                    answer: "The strongest result here concerns five errors, not one. Fix any error you find, but do not treat a single typo as a proven automatic rejection."
                },
                {
                    question: "Is grammar more important than content?",
                    answer: "No. Relevant experience still matters. Repeated errors can create a preventable penalty around otherwise strong content."
                },
                {
                    question: "What is the fastest fix?",
                    answer: "Run a dedicated error pass, then fix spacing, punctuation, and tense consistency."
                }
            ]}
        >
            <h2 className="research-h2">The penalty grows when errors become a pattern</h2>
            <p className="research-body mb-6">
                In the 2023 study, hiring professionals evaluated fictitious resumes with a randomized number of spelling errors. They assigned the five-error version a lower interview-probability rating than the error-free version.
                <Citation id="source-1">1</Citation>
            </p>

            <div className="not-prose my-8">
                <ArticleInsight
                    title="What recruiters inferred"
                    desc={
                        <>
                            Recruiters associated repeated errors with lower communication ability, learning ability, mental ability, and conscientiousness. Those are inferences, not proof about the applicant.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
            </div>

            <div className="not-prose my-10">
                <InferenceLadderDiagram />
            </div>

            <h2 className="research-h2">What this does and does not justify</h2>
            <p className="research-body mb-6">
                It justifies a careful spelling pass. It does not justify pretending one typo always ends the process, extending the result to every language or labor market, or treating error-free writing as proof of job performance.
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
