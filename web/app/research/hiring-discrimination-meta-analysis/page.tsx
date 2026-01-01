import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { MetaTimeline } from "@/components/research/diagrams/MetaTimeline";

export const metadata: Metadata = {
    title: "Meta-analysis: discrimination in hiring | Hiring Research",
    description: "A long-view synthesis of hiring discrimination research and what resumes can and cannot control.",
};

export default function DiscriminationMetaPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Industry Analysis",
                title: "Discrimination in hiring has not disappeared",
                description: "A meta-analysis gives us a principled way to talk about what resumes can and cannot control, without sounding naïve or cynical.",
                lastUpdated: "December 2025",
                readTime: "5 min read"
            }}
            keyFinding={{
                subtitle: "The Trend",
                stat: "No Clear Decline",
                statDescription: (
                    <>
                        Meta-analytic evidence finds little indication that hiring discrimination has declined across decades of field experiments.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Quillian, Pager, Hexel, Midtbøen (2017)",
                    href: "https://pubmed.ncbi.nlm.nih.gov/28696300/"
                }
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">The Limits of Optimization</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        The research emphasizes structural bias that individual resume quality cannot fully offset.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <MetaTimeline />
                </>
            }
            productTieIn={{
                title: "What this changes in RIYP",
                items: [
                    {
                        title: "Set Expectations",
                        description: "We are honest that a 'perfect' resume cannot fix systemic bias. We focus on what you can control."
                    },
                    {
                        title: "Reduce Self-Blame",
                        description: "Sometimes rejection is not about your skills or your resume. It's the market."
                    },
                    {
                        title: "Focus on Controllables",
                        description: "We strengthen signal so bias isn't compounded by avoidable noise."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Automation and Bias", href: "/research/automation-and-bias", tag: "Systems" },
                { title: "Human vs. Algorithm", href: "/research/human-vs-algorithm", tag: "Trust" },
                { title: "The Referral Advantage", href: "/research/referral-advantage", tag: "Strategy" }
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
                    question: "Does a better resume eliminate discrimination?",
                    answer: "No. A stronger resume reduces avoidable noise, but it cannot remove systemic bias."
                },
                {
                    question: "Why include this in a resume product?",
                    answer: "Premium guidance is honest about limitations. It builds trust and helps candidates focus on controllables."
                },
                {
                    question: "What can I control?",
                    answer: "Clarity, consistency, proof, and narrative cohesion."
                }
            ]}
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">The resume is necessary, not sufficient</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                This research is sobering. It reminds us that &quot;optimizing keywords&quot; is a trivial concern compared to the structural barriers many candidates face.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                However, it also clarifies our mission: to ensure that <strong>poor communication</strong> is never the reason you are rejected. We clear the noise so your merit has the best possible chance to shine through, while acknowledging the reality of the system you are navigating.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Automation can compound inequities when exposure and ranking systems are opaque. That makes clarity and documentation even more important at the individual level.
                <Citation id="source-2">2</Citation>
            </p>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Definition: bounded control</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Bounded control means separating factors you can influence from systemic factors you cannot. The resume is in the first category, bias is not.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Structural vs. Individual"
                    desc="We distinguish between fixing your resume (individual) and fixing the funnel (structural). We help you max out the former."
                />
            </div>
        </ResearchArticle>
    );
}
