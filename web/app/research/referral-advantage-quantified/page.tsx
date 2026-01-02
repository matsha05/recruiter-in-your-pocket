import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { ReferralCalculator } from "@/components/research/diagrams/ReferralCalculator";
import { ReferralQuantifiedDiagram } from "@/components/research/diagrams/ReferralQuantifiedDiagram";

export const metadata: Metadata = {
    title: "Referral Advantage, Quantified | Hiring Research",
    description: "How referrals reduce uncertainty and shift hiring odds.",
};

export default function ReferralAdvantageQuantifiedPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Networking",
                title: "Referral advantage, quantified",
                description: "Referrals act as information channels that reduce uncertainty for employers.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The Mechanism",
                stat: "Uncertainty Reduction",
                statDescription: (
                    <>Field experiments show referrals change hiring outcomes by providing better information. <Citation id="source-1">1</Citation></>
                ),
                source: {
                    text: "NBER field experiments",
                    href: "https://www.nber.org/system/files/working_papers/w21357/w21357.pdf"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">Information channel</h2>
                    <p className="research-body mb-6">
                        Referrals add context, which changes how screening is interpreted.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <ReferralQuantifiedDiagram />
                </>
            }
            productTieIn={{
                title: "How RIYP uses this",
                items: [
                    {
                        title: "Shareable resume",
                        description: "We shape your resume to be easy for a referrer to explain."
                    },
                    {
                        title: "Referral math",
                        description: "We model how small increases in referral rate compound across the funnel."
                    }
                ]
            }}
            relatedArticles={[
                { title: "The Referral Advantage", href: "/research/referral-advantage", tag: "Research" },
                { title: "LinkedIn vs. Resume", href: "/research/linkedin-vs-resume", tag: "Sourcing" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Behavior" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Why the Referential Treatment? Evidence from Field Experiments in Hiring",
                    publisher: "NBER Working Paper",
                    year: "2015",
                    href: "https://www.nber.org/system/files/working_papers/w21357/w21357.pdf"
                }
            ]}
            faq={[
                {
                    question: "Is the calculator using real rates?",
                    answer: "No. It uses your inputs so you can test different scenarios without assuming defaults."
                },
                {
                    question: "Why do referrals change outcomes?",
                    answer: "Referrals add information and reduce uncertainty for employers."
                },
                {
                    question: "Is it worth asking for referrals?",
                    answer: "Yes, when the request is specific and grounded in real relationships."
                }
            ]}
        >
            <h2 className="research-h2">See the math</h2>
            <ReferralCalculator />

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Information advantage"
                    desc="Recruiter lens: a referrer reduces ambiguity about fit."
                />
                <ArticleInsight
                    title="Process advantage"
                    desc="Referrals often shift the starting position in the funnel."
                />
            </div>

            <h2 className="research-h2">Definition: uncertainty reduction</h2>
            <p className="research-body mb-6">
                Referrals reduce uncertainty by adding a trusted signal that the resume cannot provide on its own.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">What makes a referral credible</h2>
            <p className="research-body mb-6">
                Recruiter lens: referrals work when they add information the resume does not carry, not when they repeat it.
                The field evidence suggests the mechanism is information advantage.
                <Citation id="source-1">1</Citation>
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Specific context on how the candidate performed in a real environment.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Clear relevance to the role and team scope.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>A relationship that signals credibility, not a weak connection.</li>
            </ul>

            <h2 className="research-h2">Where referrals do not help</h2>
            <p className="research-body mb-6">
                Recruiter lens: referrals do not fix missing evidence. They only increase the chance your evidence is seen.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Weak or generic resumes still fail at the review stage.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Misaligned role fit is not solved by warm introductions.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>High bar teams still apply rigorous screens after referral.</li>
            </ul>

            <h2 className="research-h2">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Field experiments cover specific settings and may not generalize to every industry.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Referral quality varies widely and is not captured by a single metric.</li>
            </ul>
        </ResearchArticle>
    );
}
