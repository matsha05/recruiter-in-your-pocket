import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { SalaryLeverage } from "@/components/research/diagrams/SalaryLeverage";

export const metadata: Metadata = {
    title: "Salary Anchors: Avoid Self-Discounting | Hiring Research",
    description: "Why early disclosure anchors compensation and how to avoid it.",
};

export default function SalaryAnchorsPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Negotiation",
                title: "Salary anchors: avoid self-discounting early",
                description: "Salary history bans show how early anchors change outcomes.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The Mechanism",
                stat: "Anchor Effect",
                statDescription: (
                    <>Salary history bans shift wage outcomes by reducing reliance on past pay. <Citation id="source-1">1</Citation></>
                ),
                source: {
                    text: "NBER working paper on salary history bans",
                    href: "https://www.nber.org/system/files/working_papers/w27054/w27054.pdf"
                }
            }}
            visualization={
                <>
                    <h2 className="font-display text-2xl font-medium text-foreground mb-4">Anchor shift</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        When history is removed, employers anchor to the role, not the person.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <SalaryLeverage />
                </>
            }
            productTieIn={{
                title: "How RIYP responds",
                items: [
                    {
                        title: "Scripted responses",
                        description: "We provide language that pivots to market value."
                    },
                    {
                        title: "Range framing",
                        description: "We help you anchor to role scope, not salary history."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Salary History Bans", href: "/research/salary-history-bans", tag: "Research" },
                { title: "Quantifying Impact", href: "/research/quantifying-impact", tag: "Writing" },
                { title: "Skills-Based Hiring", href: "/research/skills-based-hiring", tag: "Trends" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Salary History Bans and Wage Outcomes",
                    publisher: "NBER Working Paper",
                    year: "2020",
                    href: "https://www.nber.org/system/files/working_papers/w27054/w27054.pdf"
                }
            ]}
            faq={[
                {
                    question: "Is anchoring always bad?",
                    answer: "Anchoring is powerful. It can help if you set the anchor, but it hurts when you accept a low anchor early."
                },
                {
                    question: "What if the recruiter insists on history?",
                    answer: "Redirect to role scope and market range if allowed by law."
                },
                {
                    question: "Does this apply outside the US?",
                    answer: "The mechanism is general, but legal constraints vary by region."
                }
            ]}
        >
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">What to say instead</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Recruiter lens: the best answer is to anchor to market range and role scope, not your current pay.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Short script"
                    desc="I am focused on roles in the market range for this scope and level." 
                />
                <ArticleInsight
                    title="Avoid the trap"
                    desc="Do not volunteer history unless required by law." 
                />
            </div>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">How anchors form</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                The first concrete number tends to frame the negotiation. Salary history bans reduce this effect by removing the first anchor.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Recruiter lens: these are the anchor behaviors we see most often in early screens.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Early numbers narrow the range of later discussion.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Anchors persist even when both sides know the market rate.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>The cleanest move is to anchor to scope and market value.</li>
            </ul>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Handling forms and screens</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Recruiter lens: if a form requires a number, use a range tied to the role level rather than your current pay.
                If the form allows a blank or a note, state that you are open to market-aligned ranges.
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Definition: salary anchoring</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Anchoring is the tendency for early numbers to shape final outcomes. Salary history bans reduce this effect by removing early anchors.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Legal requirements vary by location. This is not legal advice.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Role level, market conditions, and company policy still shape outcomes.</li>
            </ul>
        </ResearchArticle>
    );
}
