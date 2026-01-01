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
                stat: "Selection Procedure",
                statDescription: (
                    <>
                        Automated hiring tools are treated as selection procedures, which triggers requirements around job-relatedness and adverse impact.
                        Automation varies widely and often complements human review rather than replacing it.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                        <Citation id="source-3">3</Citation>
                    </>
                ),
                source: {
                    text: "EEOC guidance on software, algorithms, and AI",
                    href: "https://data.aclum.org/storage/2025/01/EOCC_www_eeoc_gov_laws_guidance_select-issues-assessing-adverse-impact-software-algorithms-and-artificial.pdf"
                }
            }}
            visualization={
                <>
                    <h2 className="font-display text-2xl font-medium text-foreground mb-4">Decision Rights Map</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        ATS platforms store and route information, while screening logic and human review can both shape outcomes.
                        This map shows where automation is possible, not guaranteed.
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
                    title: "Select Issues: Assessing Adverse Impact in Software, Algorithms, and AI Used in Employment Selection Procedures",
                    publisher: "EEOC",
                    year: "2023",
                    href: "https://data.aclum.org/storage/2025/01/EOCC_www_eeoc_gov_laws_guidance_select-issues-assessing-adverse-impact-software-algorithms-and-artificial.pdf"
                },
                {
                    id: "source-2",
                    title: "An Auditing Imperative for Automated Hiring Systems",
                    publisher: "Harvard Journal of Law & Technology",
                    year: "2021",
                    href: "https://jolt.law.harvard.edu/assets/articlePDFs/v34/5.-Ajunwa-An-Auditing-Imperative-for-Automated-Hiring-Systems.pdf"
                },
                {
                    id: "source-3",
                    title: "Data-Driven Discrimination at Work",
                    publisher: "North Carolina Journal of Law & Technology",
                    year: "2017",
                    href: "https://scholarship.law.unc.edu/cgi/viewcontent.cgi?article=1001&context=aidr_collection"
                },
                {
                    id: "source-4",
                    title: "The Ethics of AI in Recruiting",
                    publisher: "Journal of Business Ethics",
                    year: "2022",
                    href: "https://d-nb.info/125914027X/34"
                }
            ]}
            faq={[
                {
                    question: "Do ATS systems automatically reject resumes?",
                    answer: "Automation varies. Some tools apply eligibility rules, but many systems are primarily workflow engines with humans making final choices."
                },
                {
                    question: "Is keyword stuffing useful?",
                    answer: "No. Over-optimized keyword blocks can reduce clarity for humans and can be flagged by screening logic."
                },
                {
                    question: "What is the best ATS-safe format?",
                    answer: "A single-column layout with clear headings, consistent dates, and standard section names is the safest baseline."
                }
            ]}
        >
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">What an ATS actually does</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Most ATS systems function as workflow engines. They store candidate data, support filtering, and enable recruiters to search.
                Automation can sit on top of this workflow, but it is not uniform across employers or tools.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
                <Citation id="source-4">4</Citation>
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
                are primarily workflow systems with varying levels of automation. Human review still matters, but the rules and models used can
                shape who gets seen first.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
                <Citation id="source-3">3</Citation>
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4 mt-12">Definition: selection procedures</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                A selection procedure is any tool or process that influences who advances in hiring. Under EEOC guidance, software and algorithms can
                fall under this definition, which raises obligations around job-relatedness and adverse impact.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Practical takeaways</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Use standard section headers so both parsers and humans can navigate quickly.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Write role titles and core skills in plain language, not internal jargon.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Avoid graphics or tables that disrupt parsing and readability.</li>
            </ul>
        </ResearchArticle>
    );
}
