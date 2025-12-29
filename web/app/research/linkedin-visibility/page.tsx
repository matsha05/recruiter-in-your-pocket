import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight } from "@/components/research/ResearchArticle";
import { Search, Eye, Zap, TrendingUp, Users, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
    title: "LinkedIn Profile Visibility Research | Hiring Research",
    description: "Research-backed insights on how keywords, headlines, and profile completeness affect recruiter search results on LinkedIn.",
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
                icon: <Search className="w-4 h-4" />,
                subtitle: "The Key Finding",
                stat: "7 Hires Every Minute",
                statDescription: "LinkedIn sees 7 people hired every minute, with over 9,000 members applying for jobs every minute. An unoptimized profile means you're invisible in this massive talent marketplace.",
                source: {
                    text: "LinkedIn Newsroom (Official, 2024)",
                    href: "https://news.linkedin.com/about-us#Statistics"
                },
                sampleSize: "Based on LinkedIn's official platform data"
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">What Drives LinkedIn Visibility</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        LinkedIn&apos;s search algorithm weighs certain profile elements more heavily than others. The headline is the single most important factor for appearing in recruiter searches.
                    </p>

                    {/* Impact Chart */}
                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Research-Backed Impact</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <div className="w-24 text-sm text-muted-foreground">Headline</div>
                                <div className="flex-1 bg-secondary/30 rounded-full h-6 overflow-hidden">
                                    <div className="bg-brand h-full rounded-full" style={{ width: '95%' }} />
                                </div>
                                <div className="text-sm font-medium w-24 text-right">30-300% ↑</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-24 text-sm text-muted-foreground">Photo</div>
                                <div className="flex-1 bg-secondary/30 rounded-full h-6 overflow-hidden">
                                    <div className="bg-brand/80 h-full rounded-full" style={{ width: '85%' }} />
                                </div>
                                <div className="text-sm font-medium w-24 text-right">21x more views</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-24 text-sm text-muted-foreground">Keywords</div>
                                <div className="flex-1 bg-secondary/30 rounded-full h-6 overflow-hidden">
                                    <div className="bg-brand/70 h-full rounded-full" style={{ width: '75%' }} />
                                </div>
                                <div className="text-sm font-medium w-24 text-right">3x search ↑</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-24 text-sm text-muted-foreground">Completeness</div>
                                <div className="flex-1 bg-secondary/30 rounded-full h-6 overflow-hidden">
                                    <div className="bg-brand/60 h-full rounded-full" style={{ width: '60%' }} />
                                </div>
                                <div className="text-sm font-medium w-24 text-right">Higher ranking</div>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                            Sources: <a href="https://news.linkedin.com/about-us#Statistics" target="_blank" rel="noopener" className="underline hover:text-foreground">LinkedIn Newsroom</a>, <a href="https://blog.hootsuite.com/linkedin-statistics-business/" target="_blank" rel="noopener" className="underline hover:text-foreground">Hootsuite</a>, <a href="https://www.pewresearch.org/internet/fact-sheet/social-media/" target="_blank" rel="noopener" className="underline hover:text-foreground">Pew Research</a>
                        </p>
                    </div>
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
                        description: "We evaluate photo, banner, and headline—the three elements that drive the 3-second judgment."
                    }
                ]
            }}
            relatedArticles={[
                { title: "How Recruiters Read Resumes", href: "/research/how-recruiters-read", tag: "Eye-tracking" },
                { title: "How People Scan Documents", href: "/research/how-people-scan", tag: "Psychology" },
                { title: "LinkedIn vs Resume", href: "/research/linkedin-vs-resume", tag: "Comparison" }
            ]}
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Why Headlines Matter Most</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                LinkedIn&apos;s algorithm places significant emphasis on keywords in your headline—often more than any other section.
                This is because recruiters almost always start their searches with job titles and skills,
                and LinkedIn prioritizes exact matches in headlines over matches elsewhere in the profile.
            </p>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-6 mt-12">Key Research Findings</h2>
            <p className="text-xs text-muted-foreground mb-4">Statistics from <a href="https://news.linkedin.com/about-us#Statistics" target="_blank" rel="noopener" className="underline hover:text-brand">LinkedIn Newsroom</a>, <a href="https://blog.hootsuite.com/linkedin-statistics-business/" target="_blank" rel="noopener" className="underline hover:text-brand">Hootsuite</a>, and <a href="https://www.pewresearch.org/internet/fact-sheet/social-media/" target="_blank" rel="noopener" className="underline hover:text-brand">Pew Research</a>.</p>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    icon={<Search className="w-4 h-4" />}
                    title="1 Billion Members"
                    desc="LinkedIn has 1 billion members worldwide—the world's largest professional network."
                />
                <ArticleInsight
                    icon={<Eye className="w-4 h-4" />}
                    title="32% of US Adults Use LinkedIn"
                    desc="Per Pew Research, nearly a third of American adults are on the platform."
                />
                <ArticleInsight
                    icon={<Zap className="w-4 h-4" />}
                    title="9,000+ Job Applications/Minute"
                    desc="Over 9,000 LinkedIn members apply for jobs every minute."
                />
                <ArticleInsight
                    icon={<Users className="w-4 h-4" />}
                    title="67 Million Companies"
                    desc="More than 67 million companies have LinkedIn presence."
                />
            </div>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-4 mt-12">What Good Headlines Look Like</h2>
            <div className="grid sm:grid-cols-2 gap-6 not-prose mt-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-success">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-wider">Do This</span>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="bg-success/5 border border-success/20 rounded px-3 py-2">
                            Senior PM | B2B SaaS | $4M→$12M ARR | ex-Stripe
                        </li>
                        <li className="bg-success/5 border border-success/20 rounded px-3 py-2">
                            Data Scientist | ML/AI | Python, SQL | Healthcare Tech
                        </li>
                        <li className="bg-success/5 border border-success/20 rounded px-3 py-2">
                            Engineering Manager | 15+ Engineers | Fintech Scale-ups
                        </li>
                    </ul>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-destructive">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-wider">Not This</span>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="bg-destructive/5 border border-destructive/20 rounded px-3 py-2 line-through opacity-60">
                            Product Manager at TechCorp | Building Great Products
                        </li>
                        <li className="bg-destructive/5 border border-destructive/20 rounded px-3 py-2 line-through opacity-60">
                            Passionate data scientist seeking new opportunities
                        </li>
                        <li className="bg-destructive/5 border border-destructive/20 rounded px-3 py-2 line-through opacity-60">
                            Looking for my next challenge in tech
                        </li>
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
