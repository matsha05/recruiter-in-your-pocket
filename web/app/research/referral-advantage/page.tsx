import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight } from "@/components/research/ResearchArticle";
import { ReferralFunnelDiagram } from "@/components/research/diagrams/ReferralFunnelDiagram";
import { ReferralCalculator } from "@/components/research/diagrams/ReferralCalculator";
import { Users, UserPlus, TrendingUp, Zap } from "lucide-react";

export const metadata: Metadata = {
    title: "The Referral Advantage | Hiring Research",
    description: "Research shows referred candidates get interviewed more, hired faster, and stay longer. Here's what the data says.",
};

export default function ReferralAdvantagePage() {
    return (
        <ResearchArticle
            header={{
                tag: "Job search strategy",
                title: "The Referral Advantage",
                description: "Knowing someone at the company isn't just helpful—it's statistically one of the highest-leverage job search activities you can do.",
                lastUpdated: "December 2025",
                readTime: "5 min read"
            }}
            keyFinding={{
                icon: <Users className="w-4 h-4" />,
                subtitle: "The Numbers",
                stat: "5–10x",
                statDescription: "Referred candidates are 5-10x more likely to be hired than applicants from job boards.",
                source: {
                    text: "NBER: Why the Referential Treatment (Pallais & Glass)",
                    href: "https://www.nber.org/papers/w21357"
                }
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">The referral advantage, quantified</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Interview success rates vary dramatically by application source.
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
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Why referrals work</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Referrals work because they solve the employer&apos;s core problem: risk. Hiring is expensive
                and uncertain. A referral from a trusted employee reduces both. The referrer is
                vouching with their own reputation.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                For the candidate, a referral means your resume gets read. In a stack of 500 applications,
                most get 7.4 seconds. A referred resume gets attention, context, and usually a fast track
                to the hiring manager.
            </p>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-6 mt-12">The research</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    icon={<TrendingUp className="w-4 h-4" />}
                    title="Interview Rate"
                    desc="Referred candidates have a 40-60% interview rate vs. 3-5% for cold applications."
                />
                <ArticleInsight
                    icon={<Zap className="w-4 h-4" />}
                    title="Hiring Speed"
                    desc="Referral hires happen 55% faster on average. Less screening, more trust."
                />
                <ArticleInsight
                    icon={<Users className="w-4 h-4" />}
                    title="Retention"
                    desc="Referred employees stay 25% longer. Alignment of expectations from day one."
                />
                <ArticleInsight
                    icon={<UserPlus className="w-4 h-4" />}
                    title="Volume Impact"
                    desc="Referrals account for only 7% of applicants but 40% of hires at many companies."
                />
            </div>

            {/* Interactive Calculator */}
            <h2 className="font-serif text-2xl font-medium text-foreground mb-6 mt-12">See the math</h2>
            <ReferralCalculator />

            <h2 className="font-serif text-2xl font-medium text-foreground mb-4 mt-12">How to build referral opportunities</h2>
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
