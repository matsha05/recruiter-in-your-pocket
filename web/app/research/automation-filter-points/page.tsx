import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { AutomationPipeline } from "@/components/research/diagrams/AutomationPipeline";

export const metadata: Metadata = {
    title: "Where Automation Filters You Out | Hiring Research",
    description: "Automation enters before the resume is read. This is where it happens.",
};

export default function AutomationFilterPointsPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Hiring systems",
                title: "Where automation actually filters you out",
                description: "Automation touches exposure, eligibility, and ranking - not just parsing.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The Pipeline",
                stat: "Multiple Touchpoints",
                statDescription: (
                    <>
                        Hiring algorithms influence who sees a job, who is surfaced, and who is screened.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Upturn - Help Wanted",
                    href: "https://www.upturn.org/work/help-wanted/"
                }
            }}
            visualization={
                <>
                    <h2 className="font-display text-2xl font-medium text-foreground mb-4">Automation touchpoints</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Automation starts before the application. Exposure and ranking shape who gets reviewed at all.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <AutomationPipeline />
                </>
            }
            productTieIn={{
                title: "How RIYP responds",
                items: [
                    {
                        title: "Structured signal",
                        description: "We format experience so parsers and ranking tools can read it cleanly."
                    },
                    {
                        title: "Human clarity",
                        description: "We optimize for the recruiter who sees the output of the system."
                    }
                ]
            }}
            relatedArticles={[
                { title: "ATS: How They Actually Work", href: "/research/ats-myths", tag: "ATS" },
                { title: "Hiring Algorithms and Bias", href: "/research/automation-and-bias", tag: "Research" },
                { title: "Discrimination in Hiring", href: "/research/hiring-discrimination-meta-analysis", tag: "Equity" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Help Wanted: An Examination of Hiring Algorithms, Equity, and Bias",
                    publisher: "Upturn",
                    year: "2018",
                    href: "https://www.upturn.org/work/help-wanted/"
                },
                {
                    id: "source-2",
                    title: "An Auditing Imperative for Automated Hiring Systems",
                    publisher: "Harvard Journal of Law & Technology",
                    year: "2021",
                    href: "https://jolt.law.harvard.edu/assets/articlePDFs/v34/5.-Ajunwa-An-Auditing-Imperative-for-Automated-Hiring-Systems.pdf"
                }
            ]}
            faq={[
                {
                    question: "Is automation only used at the resume stage?",
                    answer: "No. Automation can affect exposure, eligibility, and ranking before a resume is even reviewed."
                },
                {
                    question: "How can I reduce automation risk?",
                    answer: "Use clear role titles, standard section headers, and consistent dates to improve legibility."
                },
                {
                    question: "Does formatting matter for algorithms?",
                    answer: "Yes. Parsers fail on non-standard layouts, which can reduce visibility."
                }
            ]}
        >
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Why this matters</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                If automation controls exposure and ranking, then the job is to make sure your resume is legible to both systems and humans.
                <Citation id="source-1">1</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Exposure risk"
                    desc="Recruiter lens: you cannot impress someone who never sees the resume."
                />
                <ArticleInsight
                    title="Ranking risk"
                    desc="Automation can shape order of review, which changes who gets attention." 
                />
            </div>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Where automation shows up</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Automation affects the funnel before you are reviewed. These touchpoints shape who gets seen first.
                <Citation id="source-1">1</Citation>
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Exposure: who is shown the role in the first place.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Eligibility: rules or screens that auto-filter applications.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Ranking: ordering of candidates for recruiter review.</li>
            </ul>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Practical checks</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Recruiter lens: the goal is to remove parser friction and present readable evidence.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Use standard section headers like Experience and Education.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Keep dates in a consistent format.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Avoid layout tricks that break parsing.</li>
            </ul>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Definition: automation touchpoints</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Automation touchpoints are the stages where systems filter, rank, or route candidates. Each touchpoint can amplify bias or noise.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Automation practices vary widely and are often undisclosed.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Some teams rely heavily on humans, while others automate early screens.</li>
            </ul>
        </ResearchArticle>
    );
}
