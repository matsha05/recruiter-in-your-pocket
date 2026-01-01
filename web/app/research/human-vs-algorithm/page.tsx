import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { TrustChoiceGrid } from "@/components/research/diagrams/TrustChoiceGrid";

export const metadata: Metadata = {
    title: "Recruiters trust humans more than algorithms | Hiring Research",
    description: "Why recruiters often trust human judgment over opaque algorithms.",
};

export default function HumanVsAlgorithmPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Algorithmic aversion",
                title: "Recruiters trust humans more than algorithms",
                description: "How algorithmic aversion shapes recruiter trust and decision-making.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The Trust Gap",
                stat: "Human Preference",
                statDescription: (
                    <>
                        The study finds lower tolerance for algorithm errors than for human errors in recruiter contexts.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Lacroux & Martin-Lacroux (2022)",
                    href: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.895997/full"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">The Error Penalty Curve</h2>
                    <p className="research-body mb-6">
                        Recruiters generally prefer human recommendations. When an algorithm makes a mistake, trust drops faster than when a human makes the same mistake.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <TrustChoiceGrid />
                </>
            }
            productTieIn={{
                title: "What this changes in RIYP",
                items: [
                    {
                        title: "We prioritize clarity over &apos;perfect scores&apos;",
                        description: "Because a human is reading, clarity and signal strength matter more than gaming a specific score."
                    },
                    {
                        title: "Human-first decision model",
                        description: "We model the heuristic, context-heavy judgment recruiters actually use."
                    }
                ]
            }}
            relatedArticles={[
                { title: "ATS Myths", href: "/research/ats-myths", tag: "Industry" },
                { title: "Automation and Bias", href: "/research/automation-and-bias", tag: "Systems" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Algorithm Aversion in Recruitment",
                    publisher: "Frontiers in Psychology",
                    year: "2022",
                    href: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.895997/full"
                },
                {
                    id: "source-2",
                    title: "Data-Driven Discrimination at Work",
                    publisher: "North Carolina Journal of Law & Technology",
                    year: "2017",
                    href: "https://scholarship.law.unc.edu/cgi/viewcontent.cgi?article=1001&context=aidr_collection"
                }
            ]}
            faq={[
                {
                    question: "Why do recruiters distrust algorithms?",
                    answer: "The study shows lower tolerance for algorithm errors than human errors, which creates an aversion effect."
                },
                {
                    question: "Does this mean scores are useless?",
                    answer: "No. Scores can help structure evaluation, but the final decision still leans on human trust signals."
                },
                {
                    question: "How should candidates respond?",
                    answer: "Optimize for clarity and credibility so a human reviewer feels confident in the narrative."
                }
            ]}
        >
            <h2 className="research-h2">Where automation breaks recruiter judgment</h2>
            <p className="research-body mb-6">
                The study reveals a phenomenon known as &quot;algorithm aversion.&quot; Even when algorithms perform well, people are quicker to lose trust in them after a mistake compared to a human making the same mistake.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                Governance pressures around auditing and explainability further reinforce why human judgment remains central in high-stakes decisions.
                <Citation id="source-2">2</Citation>
            </p>
            <p className="research-body mb-6">
                Recruiter lens: optimizing only for a score can miss the trust signals that humans look for. The end user is a person who values consistency, narrative, and credibility.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Trust is Fragile"
                    desc="Recruiter lens: manipulation signals are hard to recover from once trust is lost."
                />
            </div>

            <h2 className="research-h2">Definition: algorithm aversion</h2>
            <p className="research-body mb-6">
                Algorithm aversion is the tendency to reject algorithmic recommendations after observing errors, even when the algorithm performs well on average.
                <Citation id="source-1">1</Citation>
            </p>
        </ResearchArticle>
    );
}
