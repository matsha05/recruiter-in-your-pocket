import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight } from "@/components/research/ResearchArticle";
import { TrustChoiceGrid } from "@/components/research/diagrams/TrustChoiceGrid";
import { User, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
    title: "Recruiters trust humans more than algorithms | Hiring Research",
    description: "New research shows recruiters prefer human judgment, even when inconsistent, over 'black box' algorithms.",
};

export default function HumanVsAlgorithmPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Algorithmic aversion",
                title: "Recruiters trust humans more than algorithms",
                description: "But inconsistent algorithms can still mislead. Why human judgment remains the gold standard in hiring perception.",
                lastUpdated: "December 2024",
                readTime: "4 min read"
            }}
            keyFinding={{
                icon: <User className="w-4 h-4" />,
                subtitle: "The Trust Gap",
                stat: "Humans > Bots",
                statDescription: "Recruiters punish algorithmic errors but forgive human inconsistency.",
                sampleSize: "N=694 recruiters",
                source: {
                    text: "Lacroux & Martin-Lacroux (2022)",
                    href: "https://www.frontiersin.org/articles/10.3389/fpsyg.2022.955462/full"
                }
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">The Trust/Choice Matrix</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Recruiters generally prefer human recommendations. However, when an algorithm is consistent (predictable), it is accepted. When it errs, it is rejected immediately, whereas humans are "forgiven."
                    </p>
                    <TrustChoiceGrid />
                </>
            }
            productTieIn={{
                title: "What this changes in RIYP",
                items: [
                    {
                        title: "We prioritize clarity over 'perfect scores'",
                        description: "Because a human is reading, clarity and signal strength matter more than gaming a specific score."
                    },
                    {
                        title: "Human-grade decision model",
                        description: "We don't pretend to be a magic bot. We model the messy, heuristic-based decision making of real recruiters."
                    }
                ]
            }}
            relatedArticles={[
                { title: "ATS Myths", href: "/research/ats-myths", tag: "Industry" },
                { title: "Automation and Bias", href: "/research/automation-and-bias", tag: "Systems" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" }
            ]}
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Where automation breaks recruiter judgment</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                The study reveals a phenomenon known as "algorithm aversion." Even when algorithms perform well, people are quicker to lose trust in them after a mistake compared to a human making the same mistake.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                For job seekers, this means relying solely on "beating the ATS" is a flawed strategy. The end user is a human who values consistency, narrative, and trust signals that algorithms often miss.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    icon={<ShieldCheck className="w-4 h-4" />}
                    title="Trust is Fragile"
                    desc="One obvious keyword-stuffing attempt can break a recruiter's trust in your entire profile."
                />
            </div>
        </ResearchArticle>
    );
}
