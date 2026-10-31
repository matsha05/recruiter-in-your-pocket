import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { MetaTimeline } from "@/components/research/diagrams/MetaTimeline";

export const metadata: Metadata = {
    title: "Discrimination in hiring hasn't gone away",
    description: "A long-view synthesis of hiring discrimination research and what resumes can and cannot control.",
};

export default function DiscriminationMetaPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Industry analysis",
                title: "Discrimination in hiring hasn't gone away",
                description: "A review of US hiring experiments found persistent racial discrimination, even when applicants had comparable qualifications.",
                lastUpdated: "December 2025",
                readTime: "5 min read"
            }}
            keyFinding={{
                subtitle: "The trend",
                stat: "36% more callbacks",
                statDescription: (
                    <>
                        In US field experiments from 1989 to 2015, white applicants got 36% more callbacks than equally qualified Black applicants, with no significant decline over that time. The gap for Latino applicants was 24%, with modest evidence of decline.
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
                        These experiments sent comparable resumes. The gap came from how applicants were treated, not from what their resumes said. Our read: a better resume can&apos;t close it.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <MetaTimeline />
                </>
            }
            productTieIn={{
                title: "What your report can and can't tell you",
                items: [
                    {
                        title: "It can't explain a rejection",
                        description: "No resume report can tell you why you were turned down, or whether bias played a part."
                    },
                    {
                        title: "It can clear up avoidable doubt",
                        description: "Your Critical Miss points at the gap a recruiter is most likely to stumble on. Fixing it won't close a gap that lives in the hiring process itself."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Where automation enters hiring", href: "/research/automation-and-bias", tag: "Systems" },
                { title: "What recruiters trust and what they follow", href: "/research/human-vs-algorithm", tag: "Trust" },
                { title: "What a referral changes", href: "/research/referral-advantage", tag: "Strategy" }
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
                    desc="We can help you present your experience clearly. We won't pretend every hiring outcome is under your control."
                />
            </div>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>These are US field experiments. Most measured callbacks, the first response, not who got hired.</li>
                <li>The meta-analysis ends in 2015. Later studies aren&apos;t included.</li>
                <li>Callback gaps for other groups and other countries need their own evidence.</li>
            </ul>
        </ResearchArticle>
    );
}
