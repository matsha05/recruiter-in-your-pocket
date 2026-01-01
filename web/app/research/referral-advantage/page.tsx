import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { ReferralFunnelDiagram } from "@/components/research/diagrams/ReferralFunnelDiagram";
import { ReferralCalculator } from "@/components/research/diagrams/ReferralCalculator";

export const metadata: Metadata = {
    title: "The Referral Advantage | Hiring Research",
    description: "How referrals change hiring outcomes and where they create leverage.",
};

export default function ReferralAdvantagePage() {
    return (
        <ResearchArticle
            header={{
                tag: "Job search strategy",
                title: "The Referral Advantage",
                description: "How referrals change hiring outcomes and where they create leverage.",
                lastUpdated: "December 2025",
                readTime: "5 min read"
            }}
            keyFinding={{
                subtitle: "The Numbers",
                stat: "Referral Lift",
                statDescription: (
                    <>
                        Referred candidates are significantly more likely to be hired than applicants from job boards.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "NBER: Why the Referential Treatment (Pallais & Glass)",
                    href: "https://www.nber.org/papers/w21357"
                }
            }}
            visualization={
                <>
                    <h2 className="font-display text-2xl font-medium text-foreground mb-4">The referral advantage, compared</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Interview success rates vary by application source.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <ReferralFunnelDiagram />
                </>
            }
            productTieIn={{
                title: "How Recruiter in Your Pocket uses this",
                items: [
                    {
                        title: "Resume as Conversation Starter",
                        description: "A strong resume gives your referrer something concrete to advocate with."
                    },
                    {
                        title: "Shareability",
                        description: "We help you create a resume that&apos;s easy to forward and explain."
                    }
                ]
            }}
            relatedArticles={[
                { title: "LinkedIn vs. Resume", href: "/research/linkedin-vs-resume", tag: "Sourcing" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" },
                { title: "Skills-Based Hiring", href: "/research/skills-based-hiring", tag: "Trends" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Why the Referential Treatment? Evidence from Field Experiments in Hiring",
                    publisher: "National Bureau of Economic Research",
                    year: "2015",
                    href: "https://www.nber.org/papers/w21357"
                }
            ]}
        >
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Why referrals work</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Referrals work because they solve the employer&apos;s core problem: risk. Hiring is expensive
                and uncertain. A referral from a trusted employee reduces both. The referrer is
                vouching with their own reputation.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                For the candidate, a referral increases the chance your resume is read with context and intent.
                It changes the starting position in the funnel.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-6 mt-12">Key findings</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    title="Higher Interview Rates"
                    desc={
                        <>
                            Referred candidates interview at higher rates than cold applicants.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Higher Hire Rates"
                    desc={
                        <>
                            Referred candidates are more likely to be hired than cold applicants.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Lower Uncertainty"
                    desc="Recruiter lens: referrals reduce ambiguity because someone vouches for fit."
                />
                <ArticleInsight
                    title="Context Travels"
                    desc="Recruiter lens: context from the referrer helps interpret a resume faster."
                />
            </div>

            <h2 className="font-display text-2xl font-medium text-foreground mb-6 mt-12">See the math</h2>
            <ReferralCalculator />

            <h2 className="font-display text-2xl font-medium text-foreground mb-4 mt-12">How to build referral opportunities</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                <strong>Before you need a job:</strong> Build relationships with people in your industry.
                Attend events. Be helpful on LinkedIn. The best referrals come from genuine relationships,
                not cold asks.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                <strong>When you&apos;re looking:</strong> Be specific about what you want. &quot;I&apos;m looking for
                a Senior PM role at a growth-stage fintech&quot; is actionable. &quot;Let me know if you hear
                of anything&quot; is not.
            </p>
            <p className="text-muted-foreground leading-relaxed">
                <strong>Make it easy:</strong> When asking for a referral, include your resume and a
                2-sentence pitch. Your referrer shouldn&apos;t have to write your case for you.
            </p>
        </ResearchArticle>
    );
}
