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
                stat: "Anchor Shift",
                statDescription: (
                    <>
                        Salary history bans measurably change wage outcomes by weakening past-pay anchors.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Hansen & McNichols (NBER working paper)",
                    href: "https://www.nber.org/system/files/working_papers/w27054/w27054.pdf"
                }
            }}
            visualization={
                <>
                    <h2 className="font-display text-2xl font-medium text-foreground mb-4">Information asymmetry</h2>
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
                    href: "https://www.nber.org/system/files/working_papers/w27054/w27054.pdf"
                }
            ]}
            faq={[
                {
                    question: "Do salary history bans help everyone equally?",
                    answer: "The evidence shows wage effects, but the magnitude can vary by role, market, and demographic group."
                },
                {
                    question: "Should I disclose salary history if asked?",
                    answer: "If it is legal to refuse, it is usually better to anchor to market range and role scope."
                },
                {
                    question: "What should I say instead?",
                    answer: "Use a role-based range and explain the scope and market data that support it."
                }
            ]}
        >
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Why early disclosure weakens leverage</h2>
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

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">When to share numbers</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Recruiter lens: share numbers only when you can anchor to role scope or market data, not past pay.
                If asked early, redirect to the responsibilities and the range for similar roles.
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Definition: salary anchoring</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Salary anchoring happens when early numbers frame the negotiation and pull outcomes toward the initial figure. Salary history bans weaken this effect.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Legal requirements vary by jurisdiction. This is not legal advice.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>The cited evidence focuses on wage effects, not every negotiation context.</li>
            </ul>
        </ResearchArticle>
    );
}
