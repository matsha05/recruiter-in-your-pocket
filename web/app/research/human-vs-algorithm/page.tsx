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
                        Recruiters punish algorithmic errors but forgive human inconsistency.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                sampleSize: (
                    <>
                        N=694 recruiters
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
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">The Trust/Choice Matrix</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Recruiters generally prefer human recommendations. However, when an algorithm is consistent (predictable), it is accepted. When it errs, it is rejected immediately, whereas humans are &quot;forgiven.&quot;
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
                }
            ]}
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Where automation breaks recruiter judgment</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                The study reveals a phenomenon known as &quot;algorithm aversion.&quot; Even when algorithms perform well, people are quicker to lose trust in them after a mistake compared to a human making the same mistake.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                For job seekers, this means relying solely on &quot;beating the ATS&quot; is a flawed strategy. The end user is a human who values consistency, narrative, and trust signals that algorithms often miss.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Trust is Fragile"
                    desc={
                        <>
                            One obvious keyword-stuffing attempt can break a recruiter&apos;s trust in your entire profile.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
            </div>
        </ResearchArticle>
    );
}
