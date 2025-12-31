import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight } from "@/components/research/ResearchArticle";
import { MetaTimeline } from "@/components/research/diagrams/MetaTimeline";
import { Users, Scale } from "lucide-react";

export const metadata: Metadata = {
    title: "Meta-analysis: discrimination in hiring | Hiring Research",
    description: "A 25-year view on hiring discrimination trends and what resumes can and cannot control.",
};

export default function DiscriminationMetaPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Industry Analysis",
                title: "Discrimination in hiring has not magically disappeared",
                description: "A meta-analysis gives us a principled way to talk about what resumes can and cannot control, without sounding naïve or cynical.",
                lastUpdated: "December 2025",
                readTime: "5 min read"
            }}
            keyFinding={{
                icon: <Users className="w-4 h-4" />,
                subtitle: "The Trend",
                stat: "No Change",
                statDescription: "Hiring discrimination against African Americans has not declined in 25 years of field experiments.",
                source: {
                    text: "Quillian, Pager, Hexel, Midtbøen (2017)",
                    href: "https://pubmed.ncbi.nlm.nih.gov/28696300/"
                }
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">The Persistence of Bias</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        This chart aggregates data from 24 field experiments containing 54,000+ applications submitted to real jobs.
                    </p>
                    <MetaTimeline />
                </>
            }
            productTieIn={{
                title: "What this changes in RIYP",
                items: [
                    {
                        title: "Set Expectations",
                        description: "We are honest that a 'perfect' resume cannot fix systemic bias. We focus on what you CAN control."
                    },
                    {
                        title: "Reduce Self-Blame",
                        description: "Sometimes rejection is not about your skills or your resume. It's the market."
                    },
                    {
                        title: "Focus on Controllables",
                        description: "We optimized signal strength so you don't give them any *other* excuse to say no."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Automation and Bias", href: "/research/automation-and-bias", tag: "Systems" },
                { title: "Human vs. Algorithm", href: "/research/human-vs-algorithm", tag: "Trust" },
                { title: "The Referral Advantage", href: "/research/referral-advantage", tag: "Strategy" }
            ]}
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">The resume is necessary, not sufficient</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                This research is sobering. It reminds us that &quot;optimizing keywords&quot; is a trivial concern compared to the structural barriers many candidates face.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                However, it also clarifies our mission: to ensure that <strong>poor communication</strong> is never the reason you are rejected. We clear the noise so your merit has the best possible chance to shine through, while acknowledging the reality of the system you are navigating.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    icon={<Scale className="w-4 h-4" />}
                    title="Structural vs. Individual"
                    desc="We distinguish between fixing your resume (individual) and fixing the funnel (structural). We help you max out the former."
                />
            </div>
        </ResearchArticle>
    );
}
