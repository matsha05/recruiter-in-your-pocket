import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";

export const metadata: Metadata = {
    title: "Recruiter Search Behavior: What We Can Cite | Hiring Research",
    description: "What LinkedIn discloses, what surveys report, and what remains unknown.",
};

export default function RecruiterSearchBehaviorPage() {
    return (
        <ResearchArticle
            header={{
                tag: "LinkedIn research",
                title: "Recruiter search behavior: what we can cite, what we cannot",
                description: "LinkedIn does not disclose ranking weights. This page separates evidence from inference.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The Boundary",
                stat: "Known vs Unknown",
                statDescription: (
                    <>LinkedIn publishes platform activity and recruiter usage surveys, but not ranking weights. <Citation id="source-1">1</Citation></>
                ),
                source: {
                    text: "LinkedIn Newsroom + Jobvite surveys",
                    href: "https://news.linkedin.com/about-us#Statistics"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">Evidence boundary</h2>
                    <p className="research-body mb-6">
                        We separate what is published from what is inferred.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </p>
                    <figure className="riyp-figure">
                        <div className="riyp-figure-frame p-6">
                            <div className="grid md:grid-cols-2 gap-6 text-sm">
                                <div>
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Published</div>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li>Platform scale and activity</li>
                                        <li>Recruiter usage surveys</li>
                                        <li>Skills-first sourcing outcomes</li>
                                    </ul>
                                </div>
                                <div>
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Not disclosed</div>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li>Exact ranking weights</li>
                                        <li>Search scoring algorithm</li>
                                        <li>Full visibility model</li>
                                    </ul>
                                </div>
                            </div>
                            <figcaption className="mt-4 text-xs text-muted-foreground">
                                Fig. 1 - Evidence boundary for LinkedIn search behavior.
                            </figcaption>
                        </div>
                    </figure>
                </>
            }
            productTieIn={{
                title: "How RIYP uses this",
                items: [
                    {
                        title: "Evidence-first guidance",
                        description: "We avoid claims about ranking weights and focus on what is published."
                    },
                    {
                        title: "Keyword alignment",
                        description: "We optimize for skills and titles because recruiters search those fields."
                    }
                ]
            }}
            relatedArticles={[
                { title: "LinkedIn Visibility", href: "/research/linkedin-visibility", tag: "LinkedIn" },
                { title: "LinkedIn vs. Resume", href: "/research/linkedin-vs-resume", tag: "Sourcing" },
                { title: "Social Screening", href: "/research/social-screening", tag: "Research" }
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
                    title: "Recruiter Nation Report",
                    publisher: "Jobvite",
                    year: "2016",
                    href: "https://www.jobvite.com/wp-content/uploads/2016/09/RecruiterNation2016.pdf"
                },
                {
                    id: "source-3",
                    title: "Future of Recruiting 2024",
                    publisher: "LinkedIn Talent Solutions",
                    year: "2024",
                    href: "https://business.linkedin.com/content/dam/me/business/en-us/talent-solutions/resources/pdfs/future-of-recruiting-2024.pdf"
                }
            ]}
            faq={[
                {
                    question: "Do we know how LinkedIn ranks profiles?",
                    answer: "No. LinkedIn does not publish ranking weights. We focus on published behaviors instead."
                },
                {
                    question: "What should I optimize?",
                    answer: "Headlines, skills, and experience keywords that match your target role."
                },
                {
                    question: "Why include limitations?",
                    answer: "Because credibility is part of the product. We do not claim what cannot be proven."
                }
            ]}
        >
            <h2 className="research-h2">What you should optimize</h2>
            <p className="research-body mb-6">
                Recruiter lens: optimize what recruiters search - role titles, skills, and keywords that match the job description.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Stay evidence-based"
                    desc="If a claim cannot be cited, we label it as Recruiter lens." 
                />
                <ArticleInsight
                    title="Focus on search inputs"
                    desc="Headline, skills, and experience keywords are the primary searchable fields."
                />
            </div>

            <h2 className="research-h2">Definition: search inputs</h2>
            <p className="research-body mb-6">
                Search inputs are the fields recruiters can query and filter by. These include titles, skills, and role keywords.
                <Citation id="source-3">3</Citation>
            </p>
        </ResearchArticle>
    );
}
