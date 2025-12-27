import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight } from "@/components/research/ResearchArticle";
import { ResumeLengthChart } from "@/components/research/diagrams/ResumeLengthChart";
import { FileText, Clock, Target, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
    title: "Resume Length: What Research Says | Hiring Research",
    description: "The one-page resume rule is oversimplified. Here's what research actually shows about optimal resume length.",
};

export default function ResumeLengthPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Resume structure",
                title: "Resume Length: What Research Actually Says",
                description: "The 'one-page rule' is career advice passed down like folklore. Research shows the answer is more nuanced.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                icon: <FileText className="w-4 h-4" />,
                subtitle: "The Reality",
                stat: "2 Pages",
                statDescription: "Recruiters in one study rated two-page resumes higher than one-page for experienced candidates.",
                source: {
                    text: "ResumeGo Hiring Manager Study (2019)",
                    href: "https://www.resumego.net/research/resume-length/"
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
                title: "How this shapes our tool",
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
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Where the one-page rule came from</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                The one-page resume rule originated when resumes were physically printed and sorted by hand.
                Recruiters managed stacks of paper. Brevity was literally easier to hold.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Today, resumes are digital. They&apos;re scrolled, not flipped. The constraint that created
                the rule no longer exists—but the rule persists.
            </p>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-6 mt-12">What research shows</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    icon={<Clock className="w-4 h-4" />}
                    title="Experience Matters"
                    desc="Entry-level: one page is ideal. 10+ years experience: two pages is often rated higher by recruiters."
                />
                <ArticleInsight
                    icon={<Target className="w-4 h-4" />}
                    title="Relevance Over Length"
                    desc="A focused one-page resume beats a padded two-page resume. Extra space must earn its place."
                />
                <ArticleInsight
                    icon={<FileText className="w-4 h-4" />}
                    title="The Real Limit"
                    desc="Two pages is the practical max. Three-page resumes are consistently rated lower in studies."
                />
                <ArticleInsight
                    icon={<TrendingUp className="w-4 h-4" />}
                    title="Scanability"
                    desc="Length matters less than structure. Clear sections and visual hierarchy beat cramped formatting."
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
