import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { ReferralFunnelDiagram } from "@/components/research/diagrams/ReferralFunnelDiagram";
import { ReferralCalculator } from "@/components/research/diagrams/ReferralCalculator";
import { ReferralQuantifiedDiagram } from "@/components/research/diagrams/ReferralQuantifiedDiagram";

export const metadata: Metadata = {
    title: "The Referral Advantage | Hiring Research",
    description: "What a field experiment found about the information referrals carry, and what it did not test about screening.",
};

export default function ReferralAdvantagePage() {
    return (
        <ResearchArticle
            header={{
                tag: "Job search strategy",
                title: "What a referral changes",
                description: "A field experiment found that referrals added information about workers' performance. It did not measure their chance of getting an interview.",
                lastUpdated: "July 2026",
                readTime: "5 min read"
            }}
            keyFinding={{
                subtitle: "What the experiments found",
                stat: "+11 points on-time · +20 points continued",
                statDescription: (
                    <>
                        In a 1,266-person study spanning referrers, referred workers, and non-referred workers, referred workers were 11 percentage points more likely to submit work on time and 20 points more likely to continue the job.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Pallais & Sands, three field experiments",
                    href: "https://www.nber.org/papers/w21357"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">The referral advantage, compared</h2>
                    <p className="research-body mb-6">
                        In this online labor market, referrals carried information about worker performance and persistence that profiles did not reveal. The study did not measure a universal interview-rate lift.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <ReferralFunnelDiagram figureNumber={1} />
                </>
            }
            productTieIn={{
                title: "What to include with a referral request",
                items: [
                    {
                        title: "The role and your relevant experience",
                        description: "Send the job link and your resume. Explain which part of your experience fits the role."
                    },
                    {
                        title: "Context the referrer can confirm",
                        description: "Mention work you did together so they can add a firsthand example, if they are comfortable recommending you."
                    }
                ]
            }}
            relatedArticles={[
                { title: "What Makes a LinkedIn Profile Easier to Find", href: "/research/linkedin-visibility", tag: "Sourcing" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" },
                { title: "Skills-First Hiring: Promise vs Reality", href: "/research/skills-first-promise-reality", tag: "Trends" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Why the Referential Treatment? Evidence from Field Experiments on Referrals",
                    publisher: "NBER working paper; later published in the Journal of Political Economy",
                    year: "2015; published 2016",
                    href: "https://www.nber.org/papers/w21357"
                }
            ]}
            faq={[
                {
                    question: "Do referrals guarantee an interview?",
                    answer: "No. Fit, the employer's process, the relationship, and what the referrer can honestly say all matter."
                },
                {
                    question: "Should I ask for a referral before applying?",
                    answer: "Ask someone who knows your work whether they are comfortable referring you, and check the employer's process before applying. This study did not test the best timing for a referral request."
                },
                {
                    question: "What should I send with a referral request?",
                    answer: "A clear resume and a short, role-specific pitch that makes it easy for the referrer to vouch for you."
                }
            ]}
        >
            <h2 className="research-h2">What the experiments actually measured</h2>
            <p className="research-body mb-6">
                The study did not establish one universal callback multiplier. It found that referrals carried information about performance and persistence that employers could not see in worker profiles alone.
                <Citation id="source-1">1</Citation>
            </p>
            <ReferralQuantifiedDiagram figureNumber={2} />

            <h2 className="research-h2">What referrals added in this study</h2>
            <p className="research-body mb-6">
                In these experiments, referred workers outperformed comparable non-referred workers and were more likely to stay. The information was strongest when the referrer performed well and had a strong tie to the referred worker.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                <strong>Our interpretation:</strong> someone who has worked with you may be able to explain strengths that your resume does not capture. Whether that changes a screening decision depends on the employer and what the referrer can honestly say.
            </p>

            <h2 className="research-h2">Key findings</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    title="Better follow-through"
                    desc={
                        <>
                            Referred workers were about 11 percentage points more likely to submit their work and do it on time.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Greater persistence"
                    desc={
                        <>
                            Referred workers were 20 percentage points more likely to continue the job.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Information beyond the profile"
                    desc={
                        <>
                            Performance and continuation differences remained among workers with similar observable profiles.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="The relationship mattered"
                    desc={
                        <>
                            Referrals from high-performing workers and people with stronger ties carried more information about worker quality.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
            </div>

            <h2 className="research-h2">See the math</h2>
            <p className="research-body mb-6">
                This calculator is scenario math, not an estimate from the Pallais and Sands experiments. Change the assumptions to see how a hypothetical lift would affect a search; do not treat the default as a forecast.
            </p>
            <ReferralCalculator figureNumber={3} />

            <h2 className="research-h2">How to build referral opportunities</h2>
            <p className="research-body mb-6">
                <strong>Before you need a job:</strong> Build real working relationships. Someone who knows how you work can add more useful context than a stranger responding to a cold ask.
            </p>
            <p className="research-body mb-6">
                <strong>When you&apos;re looking:</strong> Be specific about what you want. &quot;I&apos;m looking for
                a Senior PM role at a growth-stage fintech&quot; helps someone recognize a relevant opening. Add a job link when you have one.
            </p>
            <p className="research-body">
                <strong>Make it easy:</strong> When asking for a referral, include your resume and a
                short explanation of why the role fits your experience. Give them room to decline.
            </p>

            <h2 className="research-h2">What a useful referral adds</h2>
            <p className="research-body mb-6">
                A useful referral can explain what you did together and how you worked. For example: &quot;We worked on the finance-system migration together. She led the data cleanup, which helped our team shorten the month-end close.&quot; Use only details the referrer can confirm.
            </p>
        </ResearchArticle>
    );
}
