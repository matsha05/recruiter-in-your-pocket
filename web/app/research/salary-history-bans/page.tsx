import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { SalaryLeverage } from "@/components/research/diagrams/SalaryLeverage";

export const metadata: Metadata = {
    title: "Salary history bans and negotiation leverage | Hiring Research",
    description: "How salary history disclosure shapes negotiation leverage and offers.",
};

export default function SalaryHistoryPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Negotiation",
                title: "Salary history bans: How disclosure shifts leverage",
                description: "How early disclosure affects leverage in negotiations and offer outcomes.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The Leverage Shift",
                stat: "+8% Pay Increase",
                statDescription: (
                    <>
                        Candidates who do not disclose salary history (in ban states) see higher wage growth.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
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
                        description: "We provide scripts that avoid volunteering salary history, aligned with this data."
                    },
                    {
                        title: "Negotiation framing",
                        description: "We help you answer the &apos;what are you making now?&apos; question without anchoring low."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Skills-Based Hiring", href: "/research/skills-based-hiring", tag: "Trends" },
                { title: "The Referral Advantage", href: "/research/referral-advantage", tag: "Strategy" },
                { title: "Quantifying Impact", href: "/research/quantifying-impact", tag: "Writing" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Salary History Bans and Wage Outcomes",
                    publisher: "National Bureau of Economic Research",
                    year: "2020",
                    href: "https://www.nber.org/papers/w27054"
                }
            ]}
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Why early disclosure weakens leverage</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Many candidates feel compelled to answer truthfully about their current salary out of politeness or honesty.
                Evidence suggests this anchors the negotiation to your <em>past</em> value, not your <em>future</em> value.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                In states with Salary History Bans, employers are forced to price the job, not the person. Our advice mimics this dynamic even in states where it isn&apos;t law yet.
                <Citation id="source-1">1</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="The Script"
                    desc="Respond with: &apos;I&apos;m focusing on roles in the [Market Range] range, which seems aligned with this level of responsibility.&apos;"
                />
            </div>
        </ResearchArticle>
    );
}
