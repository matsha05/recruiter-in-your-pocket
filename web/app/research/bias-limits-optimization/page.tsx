import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { OptimizationBoundaryDiagram } from "@/components/research/diagrams/OptimizationBoundaryDiagram";

export const metadata: Metadata = {
    title: "Bias and the Limits of Resume Optimization | Hiring Research",
    description: "What resumes can improve, and what they cannot control.",
};

export default function BiasLimitsOptimizationPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Ethics",
                title: "Bias and the limits of resume optimization",
                description: "A premium product tells the truth about what resumes can and cannot fix.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The Boundary",
                stat: "Controllable vs Systemic",
                statDescription: (
                    <>Meta-analytic evidence shows discrimination persists across decades of field experiments. <Citation id="source-1">1</Citation></>
                ),
                source: {
                    text: "Quillian et al. (2017) meta-analysis",
                    href: "https://pubmed.ncbi.nlm.nih.gov/28696300/"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">Bounded control view</h2>
                    <p className="research-body mb-6">
                        Optimization can reduce noise, but it cannot erase systemic bias.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <OptimizationBoundaryDiagram />
                </>
            }
            productTieIn={{
                title: "How RIYP responds",
                items: [
                    {
                        title: "Clear the noise",
                        description: "We make sure poor writing is never the reason you are filtered out."
                    },
                    {
                        title: "Honest expectations",
                        description: "We say what is controllable and what is not."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Discrimination in Hiring", href: "/research/hiring-discrimination-meta-analysis", tag: "Research" },
                { title: "Automation and Bias", href: "/research/automation-and-bias", tag: "Systems" },
                { title: "ATS: How They Actually Work", href: "/research/ats-myths", tag: "ATS" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Meta-analysis of Field Experiments on Hiring Discrimination",
                    publisher: "American Sociological Review",
                    year: "2017",
                    href: "https://pubmed.ncbi.nlm.nih.gov/28696300/"
                },
                {
                    id: "source-2",
                    title: "Help Wanted: An Examination of Hiring Algorithms, Equity, and Bias",
                    publisher: "Upturn",
                    year: "2018",
                    href: "https://www.upturn.org/work/help-wanted/"
                }
            ]}
            faq={[
                {
                    question: "Can a resume solve bias?",
                    answer: "No. It can reduce avoidable noise, but it cannot eliminate systemic bias."
                },
                {
                    question: "Why include this in a resume product?",
                    answer: "Credibility requires naming limits. Honest framing builds trust."
                },
                {
                    question: "What should candidates focus on?",
                    answer: "Clarity, evidence, and consistency - the parts you can control."
                }
            ]}
        >
            <h2 className="research-h2">What this means</h2>
            <p className="research-body mb-6">
                A resume cannot fix systemic bias, but it can prevent avoidable loss by making evidence legible and credible.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Control what you can"
                    desc="Clarity, proof, and structure are within your control."
                />
                <ArticleInsight
                    title="Name the limits"
                    desc="Recruiter lens: systemic bias remains regardless of format."
                />
            </div>

            <h2 className="research-h2">Noise vs bias</h2>
            <p className="research-body mb-6">
                Recruiter lens: noise is avoidable friction, bias is systemic. A strong resume can remove noise, but it cannot erase bias.
                <Citation id="source-1">1</Citation>
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Noise is unclear writing, missing dates, or inconsistent titles.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Bias is a structural filter that can persist even with perfect materials.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Automation can compound bias when systems are not audited. <Citation id="source-2">2</Citation></li>
            </ul>

            <h2 className="research-h2">Definition: bounded optimization</h2>
            <p className="research-body mb-6">
                Bounded optimization is the idea that resume improvements can maximize clarity and evidence, but they cannot control systemic factors.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">Practical focus areas</h2>
            <p className="research-body mb-6">
                Recruiter lens: make it impossible to be rejected for avoidable reasons. That is the controllable upside.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Lead with evidence that proves scope and impact.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Remove ambiguous titles and clarify seniority.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Use consistent formatting to reduce parser errors.</li>
            </ul>

            <h2 className="research-h2">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Meta-analytic evidence reflects long-term patterns, not single-company behavior.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Automation practices vary widely and are not consistently disclosed.</li>
            </ul>
        </ResearchArticle>
    );
}
