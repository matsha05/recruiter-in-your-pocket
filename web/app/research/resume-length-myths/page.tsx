import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { ResumeLengthChart } from "@/components/research/diagrams/ResumeLengthChart";

export const metadata: Metadata = {
    title: "Resume Length: What Research Says | Hiring Research",
    description: "A closer look at resume length, experience level, and clarity.",
};

export default function ResumeLengthPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Resume structure",
                title: "Resume Length: What Research Actually Says",
                description: "Why resume length depends on experience, relevance, and clarity.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The Reality",
                stat: "Page-1 Gate",
                statDescription: (
                    <>
                        TheLadders reports that attention on page 2 depends on how compelling page 1 is.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "TheLadders Eye-Tracking Study (2018)",
                    href: "https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">Experience dictates length</h2>
                    <p className="research-body mb-6">
                        Optimal resume length depends on how much relevant experience you have to communicate.
                    </p>
                    <ResumeLengthChart />
                </>
            }
            productTieIn={{
                title: "How Recruiter in Your Pocket uses this",
                items: [
                    {
                        title: "Content Over Counting",
                        description: "We analyze the quality of each bullet, not how many pages you use."
                    },
                    {
                        title: "Density Warnings",
                        description: "We flag when content is too sparse or too cramped—both hurt readability."
                    }
                ]
            }}
            relatedArticles={[
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" },
                { title: "The STAR Method", href: "/research/star-method", tag: "Format" },
                { title: "Quantifying Impact", href: "/research/quantifying-impact", tag: "Writing" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "TheLadders Eye-Tracking Study (2018 Update)",
                    publisher: "TheLadders",
                    year: "2018",
                    href: "https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf"
                },
                {
                    id: "source-2",
                    title: "TheLadders Eye-Tracking Study",
                    publisher: "TheLadders",
                    year: "2012",
                    href: "https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf"
                },
                {
                    id: "source-3",
                    title: "How Long Should a Resume Be? (Hiring Manager Study)",
                    publisher: "ResumeGo",
                    year: "2019",
                    href: "https://www.resumego.net/research/how-long-should-a-resume-be/"
                }
            ]}
            faq={[
                {
                    question: "Is one page still the safest option?",
                    answer: "One page is often enough for early-career candidates. The more important rule is signal density and scanability."
                },
                {
                    question: "When is two pages acceptable?",
                    answer: "When page 1 is clear and page 2 adds relevant, non-repetitive evidence."
                },
                {
                    question: "Are multi-column resumes risky?",
                    answer: "Yes. They can reduce scanability and confuse parsers. A single column is the safest baseline."
                }
            ]}
        >
            <h2 className="research-h2">Where the one-page rule came from</h2>
            <p className="research-body mb-6">
                The one-page rule is a legacy heuristic from a different hiring era.
                Brevity was favored when format and handling mattered more than clarity.
            </p>
            <p className="research-body mb-6">
                Today, resumes are digital. They&apos;re scrolled, not flipped. The constraint that created
                the rule no longer exists—but the rule persists.
            </p>

            <h2 className="research-h2">What research shows</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    title="Page 2 Is Earned"
                    desc={
                        <>
                            TheLadders found that page 2 attention is driven by how compelling page 1 is.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Relevance Over Length"
                    desc={
                        <>
                            Recruiter lens: a focused one-page resume beats a padded two-page resume. Extra space must earn its place.
                        </>
                    }
                />
                <ArticleInsight
                    title="Scanability"
                    desc={
                        <>
                            Length matters less than structure. Clear sections and visual hierarchy reduce scan cost.
                            <Citation id="source-1">1</Citation>
                            <Citation id="source-2">2</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Field Note"
                    desc={
                        <>
                            ResumeGo suggests some hiring managers prefer two pages for experienced candidates. Treat this as a vendor study, not a universal rule.
                            <Citation id="source-3">3</Citation>
                        </>
                    }
                />
            </div>

            <h2 className="research-h2">The right answer</h2>
            <p className="research-body mb-6">
                <strong>Use the space you need—but not more.</strong> If you have 15 years of relevant experience,
                cramming it into one page sacrifices readability. If you have 2 years of experience, padding
                to two pages signals weak content.
            </p>
            <p className="research-body">
                The goal is density of relevant signal, not arbitrary page counts. Every line should pass
                the test: &quot;Does this make me more likely to get an interview for this role?&quot;
            </p>

            <h2 className="research-h2">Definition: scan cost</h2>
            <p className="research-body mb-6">
                Scan cost is the effort required to extract signal from a resume. Longer does not always mean worse,
                but dense formatting increases scan cost and reduces attention.
                <Citation id="source-1">1</Citation>
            </p>
        </ResearchArticle>
    );
}
