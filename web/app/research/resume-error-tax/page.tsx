import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";

export const metadata: Metadata = {
    title: "The Resume Error Tax | Hiring Research",
    description: "Why typos are treated as risk signals, not small mistakes.",
};

export default function ResumeErrorTaxPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Screening heuristics",
                title: "The Resume Error Tax",
                description: "Errors are read as risk signals. The penalty is not just about spelling.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The Mechanism",
                stat: "Signal of Risk",
                statDescription: (
                    <>
                        Studies show that spelling errors reduce interview chances and trigger negative trait inferences.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </>
                ),
                source: {
                    text: "Sterkens et al. (PLOS ONE)",
                    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10075394/"
                }
            }}
            visualization={
                <>
                    <h2 className="font-display text-2xl font-medium text-foreground mb-4">The inference ladder</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Errors are translated into traits, which become hiring risk.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <figure className="riyp-figure">
                        <div className="riyp-figure-frame p-6">
                            <ol className="space-y-3 text-sm text-muted-foreground">
                                <li>1. Error spotted</li>
                                <li>2. Inference: low conscientiousness or care</li>
                                <li>3. Risk assessment rises</li>
                                <li>4. Screening threshold tightens</li>
                            </ol>
                            <figcaption className="mt-4 text-xs text-muted-foreground">
                                Fig. 1 - How small errors translate into higher perceived risk.
                            </figcaption>
                        </div>
                    </figure>
                </>
            }
            productTieIn={{
                title: "How RIYP responds",
                items: [
                    {
                        title: "Error-first pass",
                        description: "We prioritize error detection before deep content rewrites."
                    },
                    {
                        title: "Conscientiousness signal",
                        description: "Formatting consistency is treated as a credibility feature, not a cosmetic one."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Spelling Errors Carry Weight", href: "/research/spelling-errors-impact", tag: "Research" },
                { title: "How People Scan Resumes", href: "/research/how-people-scan", tag: "Behavior" },
                { title: "How Recruiters Actually Read Resumes", href: "/research/how-recruiters-read", tag: "Eye-tracking" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Costly mistakes: Evidence on spelling errors in resumes",
                    publisher: "PLOS ONE (via PMC)",
                    year: "2023",
                    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10075394/"
                },
                {
                    id: "source-2",
                    title: "Costly mistakes: Evidence on spelling errors in resumes (working paper)",
                    publisher: "EconStor",
                    year: "2021",
                    href: "https://www.econstor.eu/bitstream/10419/235907/1/GLO-DP-0899.pdf"
                }
            ]}
            faq={[
                {
                    question: "Is one typo enough to get rejected?",
                    answer: "Not always, but the evidence shows that errors create negative inferences that can lower interview chances."
                },
                {
                    question: "Do recruiters see formatting issues as errors?",
                    answer: "Yes. Inconsistent spacing and alignment are read as carelessness during the first scan."
                },
                {
                    question: "What is the best first fix?",
                    answer: "Run a dedicated error pass before rewriting content."
                }
            ]}
        >
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Why the penalty feels harsh</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                In large resume stacks, recruiters use heuristics. Errors offer a quick justification to move on, even when experience is strong.
                <Citation id="source-1">1</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Trait Inference"
                    desc={
                        <>
                            Evaluators attribute errors to lower conscientiousness or professionalism.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Risk Compression"
                    desc="Recruiter lens: errors compress uncertainty into a single negative signal."
                />
            </div>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Definition: error tax</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                The error tax is the hiring penalty that results from avoidable mistakes. It is not just about spelling, it is about perceived care and reliability.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Practical fixes</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Run a spelling and grammar pass before any rewrite work.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Standardize dates, dashes, and punctuation.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Check for inconsistent capitalization in titles and section headers.</li>
            </ul>
        </ResearchArticle>
    );
}
