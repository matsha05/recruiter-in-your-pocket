import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { LinkedInVisibilityDiagram } from "@/components/research/diagrams/LinkedInVisibilityDiagram";
import { RecruiterSearchDiagram } from "@/components/research/diagrams/RecruiterSearchDiagram";

export const metadata: Metadata = {
    title: "LinkedIn Profile Visibility Research | Hiring Research",
    description: "What LinkedIn documents about recruiter search, which profile fields candidates can control, and what the platform does not disclose.",
};

export default function LinkedInVisibilityPage() {
    return (
        <ResearchArticle
            header={{
                tag: "LinkedIn discovery",
                title: "What makes a LinkedIn profile easier to find",
                description: "LinkedIn explains which profile fields its recruiter tools can search, but does not publish the ranking weights.",
                lastUpdated: "July 2026",
                readTime: "4 min read",
                sourceSummary: "2 current LinkedIn Recruiter help records"
            }}
            keyFinding={{
                subtitle: "What the platform confirms",
                stat: "Profile language feeds recruiter search",
                statDescription: (
                    <>
                        LinkedIn says its Skills filter uses explicit skills plus skill evidence drawn from headlines, titles, summaries, experience descriptions, and, in some cases, shared resumes.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "LinkedIn Recruiter Help",
                    href: "https://www.linkedin.com/help/recruiter/answer/a596630"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">What affects LinkedIn visibility</h2>
                    <p className="research-body mb-6">
                        Recruiters can search for titles and skills. Use language that accurately describes your experience so your profile can match those searches.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </p>
                    <LinkedInVisibilityDiagram figureNumber={1} />
                </>
            }
            productTieIn={{
                title: "What to change on your profile",
                items: [
                    {
                        title: "Name the role plainly",
                        description: "Use the title a recruiter would reasonably search for. If your official title is unusual, add a truthful, recognizable description beside it."
                    },
                    {
                        title: "Put skills in context",
                        description: "List the important skills, then connect them to the work in your headline, About section, or experience descriptions where they naturally belong."
                    },
                    {
                        title: "Explain where you used the skill",
                        description: "A search term can help someone find your profile. A relevant project or responsibility helps them evaluate your experience."
                    }
                ]
            }}
            relatedArticles={[
                { title: "How Recruiters Read Resumes", href: "/research/how-recruiters-read", tag: "Eye-tracking" },
                { title: "What Applicant Tracking Systems Do", href: "/research/ats-myths", tag: "Systems" },
                { title: "What Recruiters Look For Beyond the Resume", href: "/research/social-screening", tag: "Profiles" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Skills filter in Recruiter and Recruiter Lite",
                    publisher: "LinkedIn Recruiter Help",
                    year: "2025",
                    href: "https://www.linkedin.com/help/recruiter/answer/a596630"
                },
                {
                    id: "source-2",
                    title: "Recruiter and Recruiter Lite search filters and definitions",
                    publisher: "LinkedIn Recruiter Help",
                    year: "2026",
                    href: "https://www.linkedin.com/help/recruiter/answer/a408731"
                }
            ]}
            faq={[
                {
                    question: "Does LinkedIn publish its ranking algorithm?",
                    answer: "No. LinkedIn does not disclose exact ranking weights. This page focuses on published behaviors and outcomes."
                },
                {
                    question: "What part of my profile matters most for search?",
                    answer: "LinkedIn confirms that recruiters can filter by titles and skills, and that skill evidence can come from several profile sections. It does not publish a universal weighting for those fields."
                },
                {
                    question: "Should I repeat the same keyword everywhere?",
                    answer: "No. Use the correct role and skill language where it naturally belongs, then support it with actual experience. Keyword repetition without evidence is not a credible profile."
                }
            ]}
        >
            <h2 className="research-h2">Start with the fields recruiters can actually search</h2>
            <p className="research-body mb-6">
                LinkedIn Recruiter includes filters for job title, skills, company, location, seniority, years of experience, and other criteria. Its Skills filter can use skills you list directly and skills inferred from profile text, including your headline, titles, summary, and experience descriptions.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>

            <h2 className="research-h2">Where skill evidence can come from</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    title="Skills you list"
                    desc={
                        <>
                            Standardized skills in the Skills section, sometimes connected to experience, education, or endorsements.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Skills in your profile text"
                    desc={
                        <>
                            Skill terms in your headline, summary, titles, experience descriptions, certificates, and courses.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Skills inferred from experience"
                    desc={
                        <>
                            LinkedIn says it may infer related skills from direct experience. For example, it may treat Tableau experience as evidence of data visualization.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Resume skills, when shared"
                    desc={
                        <>
                            For members who share resume details for discoverability, Recruiter can surface skills found in that resume.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
            </div>

            <h2 className="research-h2">What a useful headline looks like</h2>
            <div className="grid md:grid-cols-2 gap-8 not-prose mt-6">
                <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">Do this</div>
                    <ul className="border-t border-border/30 divide-y divide-border/30 text-sm text-muted-foreground">
                        <li className="py-2">Senior product manager · B2B SaaS · onboarding and retention</li>
                        <li className="py-2">Data scientist · forecasting · Python and SQL · healthcare</li>
                        <li className="py-2">Engineering manager · platform teams · fintech infrastructure</li>
                    </ul>
                </div>
                <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase riyp-track-010 text-muted-foreground">Not this</div>
                    <ul className="border-t border-border/30 divide-y divide-border/30 text-sm text-muted-foreground">
                        <li className="py-2 line-through">Product leader building great products</li>
                        <li className="py-2 line-through">Passionate problem-solver seeking new opportunities</li>
                        <li className="py-2 line-through">Looking for my next challenge in tech</li>
                    </ul>
                </div>
            </div>

            <div className="not-prose my-10">
                <RecruiterSearchDiagram figureNumber={2} />
            </div>

            <h2 className="research-h2">What LinkedIn does not tell us</h2>
            <p className="research-body mb-4">
                The documentation explains usable inputs. It does not reveal a universal recipe for ranking first.
            </p>
            <ul className="space-y-2 text-muted-foreground text-sm mb-6">
                <li className="flex gap-2">
                    <span className="text-muted-foreground/50">•</span>
                    LinkedIn does not publicly disclose exact ranking weights or its complete search-scoring logic.
                </li>
                <li className="flex gap-2">
                    <span className="text-muted-foreground/50">•</span>
                    LinkedIn&apos;s documentation describes its own products. It is not independent research on hiring outcomes.
                </li>
                <li className="flex gap-2">
                    <span className="text-muted-foreground/50">•</span>
                    Recruiters choose different filters and search strategies across roles, industries, and markets.
                </li>
                <li className="flex gap-2">
                    <span className="text-muted-foreground/50">•</span>
                    A discoverable profile can earn consideration. It cannot guarantee ranking, outreach, or an interview.
                </li>
            </ul>

            <h2 className="research-h2">The practical rule</h2>
            <p className="research-body mb-6">
                Check your title and Skills section, then explain where you used those skills in your experience descriptions. Use the terms that fit your actual work. Repeating a keyword everywhere does not explain what you know how to do.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>
        </ResearchArticle>
    );
}
