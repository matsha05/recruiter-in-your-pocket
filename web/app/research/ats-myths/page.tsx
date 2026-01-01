import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { ATSFunnel } from "@/components/research/diagrams/ATSFunnel";

export const metadata: Metadata = {
    title: "ATS: How Applicant Tracking Systems Actually Work | Hiring Research",
    description: "Understanding how ATS systems store, rank, and surface candidates.",
};

export default function ATSMythsPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Industry research",
                title: "ATS: How They Actually Work",
                description: "How ATS platforms store and surface candidates, and where human review shapes outcomes.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The Reality",
                stat: "It's a Database, not a Guard",
                statDescription: (
                    <>
                        "Auto-reject" typically only triggers on knockout questions (Visa, License), not keywords.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Hunkenschroer & Luetge (2022) Ethics of AI Recruiting",
                    href: "https://link.springer.com/article/10.1007/s10551-022-05049-6"
                }
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Visualizing the Bottleneck</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        The real reason resumes don&apos;t get seen isn&apos;t an algorithm. It&apos;s math. There are too many applicants for the number of recruiters.
                    </p>
                    <ATSFunnel />
                </>
            }
            productTieIn={{
                title: "How we optimize for this",
                items: [
                    {
                        title: "Clarity over Keywords",
                        description: "We focus on clear, standard language so both the parser AND the human understand you."
                    },
                    {
                        title: "No \"Beat the Bot\" Tricks",
                        description: "We don't sell fear. We sell standard, readable formatting."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Human vs. Algorithm", href: "/research/human-vs-algorithm", tag: "AI" },
                { title: "Automation and Bias", href: "/research/automation-and-bias", tag: "Research" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "The Ethics of AI in Recruiting",
                    publisher: "Journal of Business Ethics",
                    year: "2022",
                    href: "https://link.springer.com/article/10.1007/s10551-022-05049-6"
                }
            ]}
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">What an ATS actually does</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Most ATS systems function as workflow engines. They store candidate data, support filtering, and enable recruiters to search.
                They are fundamentally different from the popular image of a robot auto-deleting resumes.
                <Citation id="source-1">1</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose not-prose my-8">
                <ArticleInsight
                    title="Knockout Questions"
                    desc={
                        <>
                            Filters for work authorization or required degrees. This is where auto-rejection happens.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Search & Discovery"
                    desc={
                        <>
                            Recruiters use keywords to find people in the database. If you are not found, you are not seen.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
            </div>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Where the &apos;75%&apos; myth comes from</h2>
            <p className="text-muted-foreground leading-relaxed">
                The claim that &quot;75% of resumes are never seen&quot; is a misunderstanding. It&apos;s not that a robot deleted them.
                It&apos;s that <strong>recruiters are busy</strong>. When applicant volume spikes, a human might only have time to open a fraction.
                The bottleneck is human time, not AI malice.
            </p>
        </ResearchArticle>
    );
}
