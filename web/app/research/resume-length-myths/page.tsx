import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight } from "@/components/research/ResearchArticle";

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
                stat: "2 Pages",
                statDescription: (
                    <>
                        Recruiters in one study rated two-page resumes higher than one-page for experienced candidates.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "ResumeGo Hiring Manager Study (2019)",
                    href: "https://www.resumego.net/research/how-long-should-a-resume-be/"
                }
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Experience dictates length</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
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
                    title: "How Long Should a Resume Be? (Hiring Manager Study)",
                    publisher: "ResumeGo",
                    year: "2019",
                    href: "https://www.resumego.net/research/how-long-should-a-resume-be/"
                }
            ]}
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Where the one-page rule came from</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                The one-page rule is a legacy heuristic from a different hiring era.
                Brevity was favored when format and handling mattered more than clarity.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Today, resumes are digital. They&apos;re scrolled, not flipped. The constraint that created
                the rule no longer exists—but the rule persists.
            </p>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-6 mt-12">What research shows</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    title="Experience Matters"
                    desc={
                        <>
                            Entry-level: one page is ideal. 10+ years experience: two pages is often rated higher by recruiters.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Relevance Over Length"
                    desc={
                        <>
                            A focused one-page resume beats a padded two-page resume. Extra space must earn its place.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="The Real Limit"
                    desc={
                        <>
                            Two pages is the practical max. Three-page resumes are consistently rated lower in studies.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Scanability"
                    desc={
                        <>
                            Length matters less than structure. Clear sections and visual hierarchy beat cramped formatting.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
            </div>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-4 mt-12">The right answer</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                <strong>Use the space you need—but not more.</strong> If you have 15 years of relevant experience,
                cramming it into one page sacrifices readability. If you have 2 years of experience, padding
                to two pages signals weak content.
            </p>
            <p className="text-muted-foreground leading-relaxed">
                The goal is density of relevant signal, not arbitrary page counts. Every line should pass
                the test: &quot;Does this make me more likely to get an interview for this role?&quot;
            </p>
        </ResearchArticle>
    );
}
