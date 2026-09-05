import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { SalaryLeverage } from "@/components/research/diagrams/SalaryLeverage";

export const metadata: Metadata = {
    title: "Salary History Bans: What the Evidence Shows | Hiring Research",
    description: "What salary-history-ban and disclosure studies found, and why there is no universal disclosure script.",
};

export default function SalaryHistoryPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Negotiation",
                title: "Should you share your salary history?",
                description: "Studies of salary history bans and disclosure found different effects. Neither supports one script for every pay conversation.",
                lastUpdated: "July 2026",
                readTime: "5 min read"
            }}
            keyFinding={{
                subtitle: "What the policy study found",
                stat: "About a 1% rise in the gender earnings ratio",
                statDescription: (
                    <>
                        Using difference-in-differences and synthetic-control methods, a 2020 working paper found the gender earnings ratio rose about 1% in states with salary history bans. The study measured population outcomes; it did not isolate a single negotiation mechanism.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Hansen & McNichols (2020), NBER working paper",
                    href: "https://www.nber.org/papers/w27054"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">Choose the reference point you can defend</h2>
                    <p className="research-body mb-6">
                        General negotiation experiments show that first offers can pull final settlements toward the opening number. That supports preparing a role-based range, but it does not prove that withholding salary history always improves an individual outcome.
                        <Citation id="source-3">3</Citation>
                    </p>
                    <SalaryLeverage />
                </>
            }
            productTieIn={{
                title: "How to prepare for the conversation",
                items: [
                    {
                        title: "Bring your market evidence",
                        description: "Compare the responsibilities, level, location, and available salary ranges before choosing your target. Check how recent and relevant each comparison is."
                    },
                    {
                        title: "No universal disclosure rule",
                        description: "The studies do not establish that every candidate should disclose or refuse. Check the rules where the job is based and decide what information you want to share."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Skills-First Hiring: Promise vs Reality", href: "/research/skills-first-promise-reality", tag: "Trends" },
                { title: "The Referral Advantage", href: "/research/referral-advantage", tag: "Strategy" },
                { title: "Quantifying Impact", href: "/research/quantifying-impact", tag: "Writing" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Information and the Persistence of the Gender Wage Gap: Early Evidence from California's Salary History Ban",
                    publisher: "National Bureau of Economic Research",
                    year: "2020",
                    href: "https://www.nber.org/papers/w27054"
                },
                {
                    id: "source-2",
                    title: "Salary History and Employer Demand: Evidence from a Two-Sided Audit",
                    publisher: "National Bureau of Economic Research",
                    year: "2021; revised 2023",
                    href: "https://www.nber.org/papers/w29460"
                },
                {
                    id: "source-3",
                    title: "First offers as anchors: The role of perspective-taking and negotiator focus",
                    publisher: "Journal of Personality and Social Psychology (via PubMed)",
                    year: "2001",
                    href: "https://pubmed.ncbi.nlm.nih.gov/11642352/"
                }
            ]}
            faq={[
                {
                    question: "Do salary history bans help everyone equally?",
                    answer: "No policy average is a promise for one candidate. Outcomes depend on the market, employer, role, and individual circumstances."
                },
                {
                    question: "Should I disclose salary history if asked?",
                    answer: "There is no universal answer. Check local law, know your target, and decide with the specific stage and leverage in mind."
                },
                {
                    question: "What should I say instead?",
                    answer: "A useful redirect is: ‘Could you share the budgeted range for the role? I’m evaluating the scope, level, and total package.’ If you give a target, explain the role and market evidence behind it."
                }
            ]}
        >
            <h2 className="research-h2">What salary history bans actually changed</h2>
            <p className="research-body mb-6">
                Hansen and McNichols studied the early effects of statewide salary history bans. They found the gender earnings ratio increased by about 1% in states with bans, with the gains concentrated in several subgroups. Their design estimates the net policy effect; it does not show that every employer switched cleanly from past pay to market pricing.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">Disclosure can help and hurt</h2>
            <p className="research-body mb-6">
                A separate field experiment used hundreds of recruiters and more than 2,000 fictional applications. Employers made negative inferences about candidates who did not disclose. For men and other higher-paid candidates, disclosure produced higher salary offers but also fewer callbacks after accounting for salary. Those results do not identify one choice that improves both outcomes for everyone.
                <Citation id="source-2">2</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="A clean redirect"
                    desc="‘Could you share the budgeted range? I’m evaluating the scope, level, and total package.’"
                />
                <ArticleInsight
                    title="If you name a target"
                    desc="Tie it to the role: responsibilities, level, location, market data, and the full compensation mix."
                />
            </div>

            <h2 className="research-h2">What candidates can control</h2>
            <p className="research-body mb-6">
                Know the local rule, ask for the employer&apos;s range, and prepare your own walk-away point before the conversation. Never invent a current salary. If you choose not to disclose, be ready to redirect calmly; if you do disclose, understand what signal the number may send in that market.
            </p>

            <h2 className="research-h2">Why the first number matters</h2>
            <p className="research-body mb-6">
                Across three general negotiation experiments, the party making the first offer obtained a better outcome, and first offers strongly predicted final settlements. Those experiments were not salary-history-ban studies, so use them for the narrower lesson: prepare the reference point you want to discuss and the evidence behind it.
                <Citation id="source-3">3</Citation>
            </p>

            <h2 className="research-h2">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Legal requirements vary by jurisdiction. This is not legal advice.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>The two salary-history studies are NBER working papers, not guarantees about an individual negotiation.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>The negotiation experiments tested first offers generally, not salary-history disclosure specifically.</li>
            </ul>
        </ResearchArticle>
    );
}
