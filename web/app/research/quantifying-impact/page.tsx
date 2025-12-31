import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight } from "@/components/research/ResearchArticle";
import { ImpactFormulaDiagram } from "@/components/research/diagrams/ImpactFormulaDiagram";
import { TrendingUp, Hash, Target, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
    title: "Quantifying Impact: The Laszlo Bock Formula | Hiring Research",
    description: "Google's former SVP of People Operations on why numbers matter—and how to find them when you think you don't have any.",
};

export default function QuantifyingImpactPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Resume writing",
                title: "Quantifying Impact: The Laszlo Bock Formula",
                description: "Laszlo Bock, Google's former SVP of People Operations, popularized a formula for resume bullets that hiring managers love. Here's the research behind it.",
                lastUpdated: "December 2025",
                readTime: "5 min read"
            }}
            keyFinding={{
                icon: <TrendingUp className="w-4 h-4" />,
                subtitle: "The Formula",
                stat: "X → Y → Z",
                statDescription: "Accomplished [X] as measured by [Y], by doing [Z]. Start with impact, prove it, then explain how.",
                source: {
                    text: "Laszlo Bock, Work Rules! (2015)",
                    href: "https://www.amazon.com/Work-Rules-Insights-Inside-Transform/dp/1455554790"
                }
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">The formula visualized</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Lead with the result, prove it with a metric, then explain your method.
                    </p>
                    <ImpactFormulaDiagram />
                </>
            }
            productTieIn={{
                title: "How Recruiter in Your Pocket uses this",
                items: [
                    {
                        title: "Impact Detection",
                        description: "We identify bullets that lack measurable outcomes and suggest where numbers could go."
                    },
                    {
                        title: "Before/After Rewrites",
                        description: "We show you how to transform vague responsibilities into quantified accomplishments."
                    }
                ]
            }}
            relatedArticles={[
                { title: "The STAR Method", href: "/research/star-method", tag: "Format" },
                { title: "Resume Length Myths", href: "/research/resume-length-myths", tag: "Structure" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" }
            ]}
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Why numbers work</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Numbers do three things that words cannot: they prove scale, enable comparison, and signal
                that you track your own performance. &quot;Improved customer satisfaction&quot; is a claim.
                &quot;Increased NPS from 42 to 67&quot; is evidence.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Bock&apos;s insight was that most candidates undersell themselves by describing responsibilities
                instead of results. The formula forces you to lead with the outcome, not the activity.
            </p>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-6 mt-12">Finding numbers when you think you don&apos;t have any</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    icon={<Hash className="w-4 h-4" />}
                    title="Time"
                    desc="Reduced processing time by 30%. Cut onboarding from 2 weeks to 3 days."
                />
                <ArticleInsight
                    icon={<TrendingUp className="w-4 h-4" />}
                    title="Money"
                    desc="Saved $50K annually. Generated $200K in new revenue. Reduced costs by 15%."
                />
                <ArticleInsight
                    icon={<Target className="w-4 h-4" />}
                    title="Scale"
                    desc="Managed a team of 12. Handled 500+ customer tickets monthly. Launched in 8 markets."
                />
                <ArticleInsight
                    icon={<Lightbulb className="w-4 h-4" />}
                    title="Frequency"
                    desc="First time in company history. Implemented process used by 200+ employees."
                />
            </div>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-4 mt-12">The before and after</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                <strong>Before:</strong> &quot;Responsible for managing social media accounts and creating content.&quot;
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                <strong>After:</strong> &quot;Grew Instagram following from 5K to 45K in 8 months by creating a
                data-driven content calendar that increased engagement rate from 2% to 8%.&quot;
            </p>
            <p className="text-muted-foreground leading-relaxed">
                Same job. Completely different impression. The second version answers the question every
                recruiter is asking: &quot;What will this person do for us?&quot;
            </p>
        </ResearchArticle>
    );
}
