import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { SocialScreeningDiagram } from "@/components/research/diagrams/SocialScreeningDiagram";

export const metadata: Metadata = {
    title: "Social Screening: What Recruiters Look For Online | Hiring Research",
    description: "How recruiters use LinkedIn and other social platforms during vetting.",
};

export default function SocialScreeningPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Social screening",
                title: "Social screening: what recruiters look for online",
                description: "Recruiters use social channels for discovery and validation - with LinkedIn at the center.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The Pattern",
                stat: "LinkedIn Dominates",
                statDescription: (
                    <>
                        Recruiter surveys consistently report LinkedIn as the primary network for sourcing and vetting.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </>
                ),
                source: {
                    text: "Recruiter Nation surveys",
                    href: "https://www.jobvite.com/wp-content/uploads/2016/09/RecruiterNation2016.pdf"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">Platform by purpose</h2>
                    <p className="research-body mb-6">
                        Different platforms serve different stages of evaluation.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <SocialScreeningDiagram />
                </>
            }
            productTieIn={{
                title: "How RIYP responds",
                items: [
                    {
                        title: "LinkedIn alignment",
                        description: "We flag inconsistencies between resume and LinkedIn narratives."
                    },
                    {
                        title: "Evidence focus",
                        description: "We treat the resume as the proof file that supports social presence."
                    }
                ]
            }}
            relatedArticles={[
                { title: "LinkedIn vs. Resume", href: "/research/linkedin-vs-resume", tag: "Comparison" },
                { title: "LinkedIn Visibility", href: "/research/linkedin-visibility", tag: "LinkedIn" },
                { title: "Recruiter Search Behavior", href: "/research/recruiter-search-behavior", tag: "Research" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Recruiter Nation Report",
                    publisher: "Jobvite",
                    year: "2016",
                    href: "https://www.jobvite.com/wp-content/uploads/2016/09/RecruiterNation2016.pdf"
                },
                {
                    id: "source-2",
                    title: "Recruiter Nation Survey",
                    publisher: "Jobvite",
                    year: "2018",
                    href: "https://web.jobvite.com/rs/328-BQS-080/images/2023-01-2018RecruiterNationSurvey.pdf"
                }
            ]}
            faq={[
                {
                    question: "Do recruiters check social media beyond LinkedIn?",
                    answer: "Surveys suggest they do, but LinkedIn remains the primary source for professional vetting."
                },
                {
                    question: "Should I link a portfolio?",
                    answer: "Yes, when it shows evidence of your work. It strengthens the resume and LinkedIn narrative."
                },
                {
                    question: "What is the biggest mistake?",
                    answer: "Inconsistency between LinkedIn and the resume. It signals risk."
                }
            ]}
        >
            <h2 className="research-h2">What to prioritize</h2>
            <p className="research-body mb-6">
                Recruiter lens: LinkedIn must match your resume. The fastest way to lose trust is inconsistent titles or dates.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Consistency"
                    desc="Make sure your LinkedIn and resume tell the same story."
                />
                <ArticleInsight
                    title="Reachability"
                    desc="Keep headline and skills aligned with your target role so you show up in searches."
                />
            </div>

            <h2 className="research-h2">What recruiters look for</h2>
            <p className="research-body mb-6">
                Recruiter lens: social screening is about credibility and consistency, not personality.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Matching titles, dates, and scope across resume and LinkedIn.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Evidence of work through posts, projects, or portfolio links.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Signals of professionalism in public content.</li>
            </ul>

            <h2 className="research-h2">How to harden your online footprint</h2>
            <p className="research-body mb-6">
                Recruiter lens: every surface should tell the same story about role level and impact.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Align profile headline with your target role and keywords.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Use the same role titles and dates everywhere.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Link to a portfolio or work samples when relevant.</li>
            </ul>

            <h2 className="research-h2">Definition: social screening</h2>
            <p className="research-body mb-6">
                Social screening is the use of online profiles to validate identity, evaluate professionalism, and confirm role fit.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Survey data reflects recruiter self-reporting, not controlled experiments.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Platforms used can vary by geography and industry.</li>
            </ul>
        </ResearchArticle>
    );
}
