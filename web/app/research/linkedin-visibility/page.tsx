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
                stat: "7 Hires Every Minute",
                statDescription: (
                    <>
                        LinkedIn sees 7 people hired every minute, with over 9,000 members applying for jobs every minute.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "LinkedIn Newsroom (Official, 2024)",
                    href: "https://news.linkedin.com/about-us#Statistics"
                },
                sampleSize: (
                    <>
                        Based on LinkedIn&apos;s official platform data
                        <Citation id="source-1">1</Citation>
                    </>
                )
            }}
            visualization={
                <>
                    <h2 className="font-display text-2xl font-medium text-foreground mb-4">What Drives LinkedIn Visibility</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Recruiter lens: visibility starts with the fields recruiters see first and search against most often. LinkedIn does not publish exact weights,
                        so we treat this as an ordinal model rather than a quantitative one.
                    </p>

                    <figure className="border-t border-border/40 pt-6 space-y-4">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                            Visibility drivers (ordinal)
                        </div>
                        <ol className="space-y-4">
                            {[
                                {
                                    title: "Headline keywords",
                                    description: "Highest-visibility field for titles and core skills.",
                                    rank: "Primary"
                                },
                                {
                                    title: "Profile photo",
                                    description: "Visual trust signal that shapes first impressions.",
                                    rank: "High"
                                },
                                {
                                    title: "Keywords in experience",
                                    description: "Supporting terms that help search and matching.",
                                    rank: "Supporting"
                                },
                                {
                                    title: "Completeness",
                                    description: "Foundational hygiene that prevents filtering friction.",
                                    rank: "Foundational"
                                }
                            ].map((item) => (
                                <li key={item.title} className="flex items-start justify-between gap-6">
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-foreground">{item.title}</div>
                                        <div className="text-xs text-muted-foreground">{item.description}</div>
                                    </div>
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                                        {item.rank}
                                    </span>
                                </li>
                            ))}
                        </ol>
                        <figcaption className="text-xs text-muted-foreground">
                            Fig. 1 - Recruiter lens ordering of profile fields based on field prominence and published guidance. Not a quantitative weighting.
                        </figcaption>
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
                    title: "LinkedIn Statistics for Business",
                    publisher: "Hootsuite",
                    year: "2024",
                    href: "https://blog.hootsuite.com/linkedin-statistics-business/"
                },
                {
                    id: "source-3",
                    title: "Social Media Fact Sheet",
                    publisher: "Pew Research Center",
                    year: "2024",
                    href: "https://www.pewresearch.org/internet/fact-sheet/social-media/"
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
                Statistics sourced from LinkedIn Newsroom, Hootsuite, and Pew Research.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
                <Citation id="source-3">3</Citation>
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
                            <Citation id="source-3">3</Citation>
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
        </ResearchArticle>
    );
}
