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
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">What Drives LinkedIn Visibility</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        LinkedIn&apos;s search algorithm considers multiple profile elements. Headlines are the most visible place to align titles and keywords for recruiter searches.
                    </p>

                    {/* Impact Chart */}
                    <figure className="border-t border-border/40 pt-6 space-y-4">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                            Visibility drivers
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-28 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Headline</div>
                                <div className="flex-1">
                                    <div className="h-1.5 bg-border/40">
                                        <div className="h-full bg-brand" style={{ width: "95%" }} />
                                    </div>
                                </div>
                                <div className="w-28 text-xs text-muted-foreground text-right">Highest impact</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-28 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Photo</div>
                                <div className="flex-1">
                                    <div className="h-1.5 bg-border/40">
                                        <div className="h-full bg-foreground/20" style={{ width: "85%" }} />
                                    </div>
                                </div>
                                <div className="w-28 text-xs text-muted-foreground text-right">High impact</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-28 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Keywords</div>
                                <div className="flex-1">
                                    <div className="h-1.5 bg-border/40">
                                        <div className="h-full bg-foreground/20" style={{ width: "75%" }} />
                                    </div>
                                </div>
                                <div className="w-28 text-xs text-muted-foreground text-right">Moderate impact</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-28 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Completeness</div>
                                <div className="flex-1">
                                    <div className="h-1.5 bg-border/40">
                                        <div className="h-full bg-foreground/20" style={{ width: "60%" }} />
                                    </div>
                                </div>
                                <div className="w-28 text-xs text-muted-foreground text-right">Foundational</div>
                            </div>
                        </div>
                        <figcaption className="text-xs text-muted-foreground">
                            Fig. 1 — Relative emphasis inferred from LinkedIn reporting and cited industry research.
                            <Citation id="source-1">1</Citation>
                            <Citation id="source-2">2</Citation>
                            <Citation id="source-3">3</Citation>
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
                        description: "Based on keyword analysis—not made-up statistics—we show which terms could improve discoverability."
                    },
                    {
                        title: "First Impression Section",
                        description: "We evaluate photo, banner, and headline—the three elements that shape first impressions."
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
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Why Headlines Matter Most</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                LinkedIn&apos;s algorithm places significant emphasis on keywords in your headline—often more than any other section.
                This is because recruiters almost always start their searches with job titles and skills,
                and LinkedIn prioritizes exact matches in headlines over matches elsewhere in the profile.
                <Citation id="source-2">2</Citation>
            </p>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-6 mt-12">Key Research Findings</h2>
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
                            LinkedIn has 1 billion members worldwide—the world&apos;s largest professional network.
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
                            Over 9,000 LinkedIn members apply for jobs every minute.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="67 Million Companies"
                    desc={
                        <>
                            More than 67 million companies have LinkedIn presence.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
            </div>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-4 mt-12">What Good Headlines Look Like</h2>
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

            <h2 className="font-serif text-2xl font-medium text-foreground mb-4 mt-12">Important Limitations</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
                Be aware of what we know and don&apos;t know:
            </p>
            <ul className="space-y-2 text-muted-foreground text-sm mb-6">
                <li className="flex gap-2">
                    <span className="text-muted-foreground/50">•</span>
                    LinkedIn does not publicly disclose its exact search algorithm—findings are inferred from observed behavior.
                </li>
                <li className="flex gap-2">
                    <span className="text-muted-foreground/50">•</span>
                    Statistics vary widely across sources (30% to 300% view increase) depending on baseline optimization.
                </li>
                <li className="flex gap-2">
                    <span className="text-muted-foreground/50">•</span>
                    Recruiter search behavior varies by industry, geography, and role type.
                </li>
                <li className="flex gap-2">
                    <span className="text-muted-foreground/50">•</span>
                    Studies are primarily based on self-reported data, not controlled experiments.
                </li>
            </ul>
        </ResearchArticle>
    );
}
