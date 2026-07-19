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
                description: "A large review of hiring studies shows both why resume quality matters and why it cannot explain every rejection.",
                lastUpdated: "December 2025",
                readTime: "5 min read"
            }}
            keyFinding={{
                subtitle: "The Trend",
                stat: "Bias remains",
                statDescription: (
                    <>
                        Across US field experiments from 1989 through 2015, the study found no significant decline in discrimination against Black applicants and modest evidence of decline for Latino applicants.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Quillian, Pager, Hexel & Midtbøen (2017)",
                    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5642692/"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">What a better resume cannot fix</h2>
                    <p className="research-body mb-6">
                        The research emphasizes structural bias that individual resume quality cannot fully offset.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <MetaTimeline />
                </>
            }
            productTieIn={{
                title: "How this shows up in your report",
                items: [
                    {
                        title: "Name the limit",
                        description: "We make the boundary explicit: stronger materials can reduce avoidable doubt, but they cannot fix systemic bias."
                    },
                    {
                        title: "Keep rejection in perspective",
                        description: "Sometimes rejection is not about your skills or your resume. It's the market."
                    },
                    {
                        title: "Improve what you can",
                        description: "We make relevant experience easier to see so unclear writing does not create another obstacle."
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
                    title: "Meta-analysis of field experiments shows no change in racial discrimination in hiring over time",
                    publisher: "Proceedings of the National Academy of Sciences",
                    year: "2017",
                    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5642692/"
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
                    answer: "Useful guidance has to name its limits. That helps candidates focus on what they can change without turning every rejection into self-blame."
                },
                {
                    question: "What can I control?",
                    answer: "You can make your experience clear, consistent, specific, and easy to verify."
                }
            ]}
        >
            <h2 className="research-h2">The resume is necessary, not sufficient</h2>
            <p className="research-body mb-6">
                This research is sobering. It reminds us that &quot;optimizing keywords&quot; is a trivial concern compared to the structural barriers many candidates face.
            </p>
            <p className="research-body mb-6">
                It also clarifies the useful role of this product: make <strong>poor communication</strong> less likely to hide relevant experience, while being honest about the system you are navigating.
            </p>
            <p className="research-body mb-6">
                Automation can compound inequities when exposure and ranking systems are opaque. That makes clarity and documentation even more important at the individual level.
                <Citation id="source-2">2</Citation>
            </p>

            <h2 className="research-h2">Focus on what you can change</h2>
            <p className="research-body mb-6">
                You can improve how clearly your resume shows your experience. You cannot remove bias from the hiring process. Good advice should help with the first without pretending it solves the second.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Resume quality is only one factor"
                    desc="We can help you present your experience clearly. We will not imply that every hiring outcome is under your control."
                />
            </div>
        </ResearchArticle>
    );
}
