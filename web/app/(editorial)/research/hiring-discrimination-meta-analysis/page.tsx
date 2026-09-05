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
                description: "A review of US hiring experiments found persistent racial discrimination, even when applicants had comparable qualifications.",
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
                        title: "Do not diagnose a rejection from a resume",
                        description: "A resume report cannot tell you why an employer rejected an application, including whether discrimination played a part."
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
                    answer: "No. Clearer writing can help someone understand your experience. It cannot remove discrimination from hiring decisions."
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
            <h2 className="research-h2">What a rejection cannot tell you</h2>
            <p className="research-body mb-6">
                A rejection does not, by itself, tell you what was wrong with your resume. These experiments found different treatment of applicants with comparable qualifications.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                Our report can identify details that are missing or hard to understand. It cannot explain a particular employer&apos;s decision or assign responsibility for a rejection to the candidate.
            </p>
            <p className="research-body mb-6">
                The Upturn report describes additional risks when automated tools affect advertising, screening, and ranking. Those are risks employers and platform operators need to address; resume edits are not a remedy.
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
