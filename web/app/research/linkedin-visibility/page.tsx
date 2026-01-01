import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";

export const metadata: Metadata = {
    title: "LinkedIn Profile Visibility Research | Hiring Research",
    description: "Insights on how keywords, headlines, and profile completeness affect recruiter search results on LinkedIn.",
};

export default function LinkedInVisibilityPage() {
    return (
        <ResearchArticle
            header={{
                tag: "LinkedIn Optimization",
                title: "LinkedIn Profile Visibility",
                description: "What actually affects whether recruiters find your LinkedIn profile? This page synthesizes research on keywords, headlines, and profile optimization from verified industry sources.",
                lastUpdated: "December 2025",
                readTime: "5 min read"
            }}
            keyFinding={{
                subtitle: "The Key Finding",
                stat: "Skills-First Search",
                statDescription: (
                    <>
                        LinkedIn reports that skills-first sourcing leads to higher InMail acceptance rates.
                        <Citation id="source-2">2</Citation>
                    </>
                ),
                source: {
                    text: "LinkedIn Talent Blog",
                    href: "https://www.linkedin.com/business/talent/blog/talent-acquisition/recruiters-who-focus-on-skills-see-better-inmail-rates"
                }
            }}
            visualization={
                <>
                    <h2 className="font-display text-2xl font-medium text-foreground mb-4">What Drives LinkedIn Visibility</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Recruiter lens: visibility starts with the fields recruiters see first and search against most often. LinkedIn does not publish exact weights,
                        so we treat this as an ordinal model rather than a quantitative one.
                    </p>

                    <figure className="riyp-figure">
                        <div className="riyp-figure-frame p-6 space-y-4">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                                Inputs vs measurable outputs
                            </div>
                            <div className="grid md:grid-cols-2 gap-6 text-sm">
                                <div className="space-y-3">
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                                        Inputs you control
                                    </div>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li>Headline keywords and role titles</li>
                                        <li>Skills and endorsements</li>
                                        <li>Experience keywords and role alignment</li>
                                    </ul>
                                </div>
                                <div className="space-y-3">
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                                        Outputs LinkedIn reports
                                    </div>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li>Higher InMail acceptance with skills-first sourcing</li>
                                        <li>Recruiter search behavior centered on skills and titles</li>
                                    </ul>
                                </div>
                            </div>
                            <figcaption className="text-xs text-muted-foreground">
                                Fig. 1 - Visibility inputs versus LinkedIn-reported sourcing outcomes. Not a ranking model.
                            </figcaption>
                        </div>
                    </figure>
                </>
            }
            productTieIn={{
                title: "How this shapes our LinkedIn analysis",
                items: [
                    {
                        title: "Headline Analysis",
                        description: "We identify missing keywords recruiters actually search for and suggest specific rewrites."
                    },
                    {
                        title: "Search Visibility Score",
                        description: "Based on keyword analysis, not made-up statistics, we show which terms could improve discoverability."
                    },
                    {
                        title: "First Impression Section",
                        description: "We evaluate photo, banner, and headline, the three elements that shape first impressions."
                    }
                ]
            }}
            relatedArticles={[
                { title: "How Recruiters Read Resumes", href: "/research/how-recruiters-read", tag: "Eye-tracking" },
                { title: "How People Scan Documents", href: "/research/how-people-scan", tag: "Psychology" },
                { title: "LinkedIn vs Resume", href: "/research/linkedin-vs-resume", tag: "Comparison" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "LinkedIn Newsroom Statistics",
                    publisher: "LinkedIn",
                    year: "2024",
                    href: "https://news.linkedin.com/about-us#Statistics"
                },
                {
                    id: "source-2",
                    title: "Recruiters Who Focus on Skills See Better InMail Rates",
                    publisher: "LinkedIn Talent Blog",
                    year: "2024",
                    href: "https://www.linkedin.com/business/talent/blog/talent-acquisition/recruiters-who-focus-on-skills-see-better-inmail-rates"
                },
                {
                    id: "source-3",
                    title: "Future of Recruiting 2024",
                    publisher: "LinkedIn Talent Solutions",
                    year: "2024",
                    href: "https://business.linkedin.com/content/dam/me/business/en-us/talent-solutions/resources/pdfs/future-of-recruiting-2024.pdf"
                },
                {
                    id: "source-4",
                    title: "Social Media Fact Sheet",
                    publisher: "Pew Research Center",
                    year: "2024",
                    href: "https://www.pewresearch.org/internet/fact-sheet/social-media/"
                }
            ]}
            faq={[
                {
                    question: "Does LinkedIn publish its ranking algorithm?",
                    answer: "No. LinkedIn does not disclose exact ranking weights. This page focuses on published behaviors and outcomes."
                },
                {
                    question: "What part of my profile matters most for search?",
                    answer: "Recruiter lens: headline keywords and skills are the most consistent search inputs."
                },
                {
                    question: "Should I optimize for InMail response?",
                    answer: "Yes. Skills-first sourcing is linked to higher InMail acceptance, which makes skills and titles critical."
                }
            ]}
        >
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Why Headlines Matter Most</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Recruiter lens: the headline is the most visible field in search results, so it is the cleanest place to align role titles and skill keywords.
                Recruiter searches often start with job titles and skill terms, which makes headline phrasing a practical match point.
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-6 mt-12">Key Research Findings</h2>
            <p className="text-xs text-muted-foreground mb-4">
                Statistics sourced from LinkedIn Newsroom, LinkedIn Talent Solutions, and Pew Research.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
                <Citation id="source-3">3</Citation>
                <Citation id="source-4">4</Citation>
            </p>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    title="1 Billion Members"
                    desc={
                        <>
                            LinkedIn reports over 1 billion members worldwide.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="32% of US Adults Use LinkedIn"
                    desc={
                        <>
                            Per Pew Research, nearly a third of American adults are on the platform.
                            <Citation id="source-4">4</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="9,000+ Job Applications/Minute"
                    desc={
                        <>
                            LinkedIn reports more than 9,000 job applications per minute.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="67 Million Companies"
                    desc={
                        <>
                            LinkedIn reports more than 67 million companies on the platform.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Skills-First InMail Lift"
                    desc={
                        <>
                            LinkedIn reports higher InMail acceptance for skills-first sourcing approaches.
                            <Citation id="source-2">2</Citation>
                        </>
                    }
                />
            </div>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4 mt-12">What Good Headlines Look Like</h2>
            <div className="grid md:grid-cols-2 gap-8 not-prose mt-6">
                <div className="space-y-3">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Do This</div>
                    <ul className="border-t border-border/30 divide-y divide-border/30 text-sm text-muted-foreground">
                        <li className="py-2">Senior PM | B2B SaaS | $4M→$12M ARR | ex-Stripe</li>
                        <li className="py-2">Data Scientist | ML/AI | Python, SQL | Healthcare Tech</li>
                        <li className="py-2">Engineering Manager | 15+ Engineers | Fintech Scale-ups</li>
                    </ul>
                </div>
                <div className="space-y-3">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Not This</div>
                    <ul className="border-t border-border/30 divide-y divide-border/30 text-sm text-muted-foreground">
                        <li className="py-2 line-through">Product Manager at TechCorp | Building Great Products</li>
                        <li className="py-2 line-through">Passionate data scientist seeking new opportunities</li>
                        <li className="py-2 line-through">Looking for my next challenge in tech</li>
                    </ul>
                </div>
            </div>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4 mt-12">Important Limitations</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
                Be aware of what we know and don&apos;t know:
            </p>
            <ul className="space-y-2 text-muted-foreground text-sm mb-6">
                <li className="flex gap-2">
                    <span className="text-muted-foreground/50">•</span>
                    LinkedIn does not publicly disclose its exact search algorithm. Findings are inferred from observed behavior.
                </li>
                <li className="flex gap-2">
                    <span className="text-muted-foreground/50">•</span>
                    Reported view increases vary widely across sources and baselines.
                </li>
                <li className="flex gap-2">
                    <span className="text-muted-foreground/50">•</span>
                    Recruiter search behavior likely varies by industry, geography, and role type.
                </li>
                <li className="flex gap-2">
                    <span className="text-muted-foreground/50">•</span>
                    Studies are primarily based on self-reported data, not controlled experiments.
                </li>
            </ul>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Definition: visibility inputs</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Visibility inputs are the fields recruiters can search and filter by. LinkedIn reports outcomes tied to skills-first searches,
                but not the weighting of each field.
                <Citation id="source-2">2</Citation>
            </p>
        </ResearchArticle>
    );
}
