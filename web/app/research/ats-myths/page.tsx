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
                stat: "Workflow, not Autonomy",
                statDescription: (
                    <>
                        ATS platforms primarily store, filter, and surface candidates. Automated rejection is usually limited to explicit eligibility rules,
                        with humans making final decisions.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </>
                ),
                source: {
                    text: "Hunkenschroer & Luetge (2022) Ethics of AI Recruiting",
                    href: "https://link.springer.com/article/10.1007/s10551-022-05049-6"
                }
            }}
            visualization={
                <>
                    <h2 className="font-display text-2xl font-medium text-foreground mb-4">Visualizing the Bottleneck</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        The funnel shows where eligibility rules and recruiter capacity narrow review. The ATS organizes candidates; humans decide what gets read.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
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
                },
                {
                    id: "source-2",
                    title: "An Auditing Imperative for Automated Hiring Systems",
                    publisher: "Harvard Journal of Law & Technology",
                    year: "2021",
                    href: "https://jolt.law.harvard.edu/assets/articlePDFs/v34/5.-Ajunwa-An-Auditing-Imperative-for-Automated-Hiring-Systems.pdf"
                }
            ]}
        >
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">What an ATS actually does</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Most ATS systems function as workflow engines. They store candidate data, support filtering, and enable recruiters to search.
                They are fundamentally different from the popular image of a robot auto-deleting resumes.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose not-prose my-8">
                <ArticleInsight
                    title="Eligibility Filters"
                    desc={
                        <>
                            Explicit eligibility rules like work authorization or required credentials can filter candidates before review.
                            <Citation id="source-1">1</Citation>
                            <Citation id="source-2">2</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Search & Discovery"
                    desc={
                        <>
                            Recruiters use filters and keyword search to surface candidates from the database.
                            <Citation id="source-1">1</Citation>
                            <Citation id="source-2">2</Citation>
                        </>
                    }
                />
            </div>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Why the auto-reject myth persists</h2>
            <p className="text-muted-foreground leading-relaxed">
                ATS workflows can feel opaque, so candidates assume resumes are automatically rejected. The evidence we have shows ATS platforms
                are primarily workflow systems with varying levels of automation. Human review still matters.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>
        </ResearchArticle>
    );
}
