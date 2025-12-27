import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight } from "@/components/research/ResearchArticle";
import { SalaryLeverage } from "@/components/research/diagrams/SalaryLeverage";
import { DollarSign, Mic } from "lucide-react";

export const metadata: Metadata = {
    title: "Salary history bans and negotiation leverage | Hiring Research",
    description: "Why 'just be honest about your current pay' can be a trap, and what the research says about leverage.",
};

export default function SalaryHistoryPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Negotiation",
                title: "Salary history bans: Just being honest is a trap",
                description: "Research-grade justification for our negotiation scripts. Why revealing early costs you leverage.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                icon: <DollarSign className="w-4 h-4" />,
                subtitle: "The Leverage Shift",
                stat: "+8% Pay Increase",
                statDescription: "Candidates who do not disclose salary history (in ban states) see higher wage growth.",
                source: {
                    text: "Hansen & McNichols (2020), NBER",
                    href: "https://www.nber.org/papers/w27054"
                }
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Information Asymmetry</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        When employers cannot anchor to your past pay, they must anchor to the <strong>market value</strong> of the role.
                    </p>
                    <SalaryLeverage />
                </>
            }
            productTieIn={{
                title: "What this changes in RIYP",
                items: [
                    {
                        title: "Negotiation Scripts",
                        description: "We provide scripts that explicitly avoid volunteering salary history, backed by this data."
                    },
                    {
                        title: "Premium Trust Wedge",
                        description: "We protect your value by teaching you how to answer the &apos;what are you making now?&apos; question."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Skills-Based Hiring", href: "/research/skills-based-hiring", tag: "Trends" },
                { title: "The Referral Advantage", href: "/research/referral-advantage", tag: "Strategy" },
                { title: "Quantifying Impact", href: "/research/quantifying-impact", tag: "Writing" }
            ]}
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Why &apos;just be honest&apos; fails</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Many candidates feel compelled to answer truthfuly about their current salary out of politeness or honesty.
                Research shows this permanently anchors the negotiation to your <em>past</em> value, not your <em>future</em> value.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                In states with Salary History Bans, employers are forced to price the job, not the person. Our advice mimics this dynamic even in states where it isn&apos;t law yet.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    icon={<Mic className="w-4 h-4" />}
                    title="The Script"
                    desc="Respond with: &apos;I&apos;m focusing on roles in the [Market Range] range, which seems aligned with this level of responsibility.&apos;"
                />
            </div>
        </ResearchArticle>
    );
}
