import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { SignalClarityDiagram } from "@/components/research/diagrams/SignalClarityDiagram";

export const metadata: Metadata = {
    title: "Clear Writing Changes Hiring Outcomes | Hiring Research",
    description: "Why clarity is not cosmetic, and what a large field experiment found.",
};

export default function WritingQualityHireProbabilityPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Writing quality",
                title: "Clear writing changes how evidence is judged",
                description: "A large field experiment found better outcomes when job seekers received writing assistance, even when their underlying experience did not change.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The result",
                stat: "8% more hires",
                statDescription: (
                    <>
                        In an online labor-market experiment with nearly half a million job seekers, people offered resume-writing assistance were hired 8% more often, with no evidence of lower employer satisfaction.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Wiles, Munyikwa & Horton (2023), NBER",
                    href: "https://www.nber.org/papers/w30886"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">What changed, and what did not</h2>
                    <p className="research-body mb-6">
                        The assistance changed the writing, not the job seekers&apos; underlying experience. The researchers&apos; model offers a useful explanation: better writing can help employers recognize ability that was already there.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <SignalClarityDiagram />
                </>
            }
            productTieIn={{
                title: "How this shows up in your report",
                items: [
                    {
                        title: "Clarity Pass",
                        description: "We flag dense bullets that make the main point harder to find."
                    },
                    {
                        title: "Rewrite Suggestions",
                        description: "We propose edits that surface outcomes earlier in the line."
                    }
                ]
            }}
            relatedArticles={[
                { title: "How Recruiters Actually Read Resumes", href: "/research/how-recruiters-read", tag: "Eye-tracking" },
                { title: "Quantifying Impact", href: "/research/quantifying-impact", tag: "Writing" },
                { title: "What Spelling Errors Cost", href: "/research/spelling-errors-impact", tag: "Writing" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Algorithmic Writing Assistance on Jobseekers’ Resumes Increases Hires",
                    publisher: "NBER Working Paper",
                    year: "2023",
                    href: "https://www.nber.org/papers/w30886"
                }
            ]}
            faq={[
                {
                    question: "Is writing quality just style?",
                    answer: "No. In this experiment, writing assistance changed a real hiring outcome. The researchers found no evidence that employers were less satisfied with the people they hired."
                },
                {
                    question: "Can AI rewriting replace human insight?",
                    answer: "AI can improve clarity, but it cannot invent evidence. You still need real outcomes."
                },
                {
                    question: "What is the fastest way to improve clarity?",
                    answer: "Start bullets with outcomes and remove filler phrases that delay the point."
                }
            ]}
        >
            <h2 className="research-h2">Why clarity beats polish</h2>
            <p className="research-body mb-6">
                Clear writing is useful when it makes your evidence easier to understand. That is different from making a weak claim sound elegant. The goal is not polish for its own sake. It is helping a reader find the ability and results that are already true.
                <Citation id="source-1">1</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Clarity Reveals Signal"
                    desc={
                        <>
                            Better writing can help an employer recognize ability that the resume was obscuring.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Polish Is Not Enough"
                    desc="Elegant phrasing without proof does not move the decision."
                />
            </div>

            <h2 className="research-h2">What the experiment found</h2>
            <p className="research-body mb-6">
                Job seekers offered algorithmic writing assistance were hired 8% more often. The study did not find evidence that employers were less satisfied, which argues against the idea that better writing merely disguised weaker candidates.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Writing quality helps, but it cannot replace missing experience.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>The experiment took place in one online labor market. The 8% effect should not be treated as a promise for every role, industry, or hiring process.</li>
            </ul>
        </ResearchArticle>
    );
}
