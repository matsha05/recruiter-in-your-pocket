import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { LinkedInResumeFlow } from "@/components/research/diagrams/LinkedInResumeFlow";

export const metadata: Metadata = {
    title: "LinkedIn vs. Resume: What Gets Seen | Hiring Research",
    description: "Research on how recruiters use LinkedIn profiles vs. resumes at different stages of the hiring process.",
};

export default function LinkedInVsResumePage() {
    return (
        <ResearchArticle
            header={{
                tag: "Sourcing research",
                title: "LinkedIn vs. Resume: What Gets Seen",
                description: "How LinkedIn and resumes serve different roles across the hiring process.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The Pattern",
                stat: "77%",
                statDescription: (
                    <>
                        of recruiters use LinkedIn to find candidates; 87% use it to vet them before reaching out.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Jobvite Recruiter Nation Report (2023)",
                    href: "https://web.jobvite.com/rs/328-BQS-080/images/2023-Employ-Recruiter-Nation-Report-Moving-Forward-in-Uncertainty.pdf"
                }
            }}
            visualization={
                <>
                    <h2 className="font-display text-2xl font-medium text-foreground mb-4">Two tools, different jobs</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Recruiter lens: LinkedIn is your public identity. Your resume is your evidence file.
                        They are both used, but at different moments.
                    </p>
                    <LinkedInResumeFlow />
                </>
            }
            productTieIn={{
                title: "How Recruiter in Your Pocket uses this",
                items: [
                    {
                        title: "Resume-First Focus",
                        description: "We analyze your resume because that's what determines if you get the interview."
                    },
                    {
                        title: "Consistency Checks",
                        description: "We flag language that might conflict with typical LinkedIn profile formatting."
                    }
                ]
            }}
            relatedArticles={[
                { title: "The Referral Advantage", href: "/research/referral-advantage", tag: "Networking" },
                { title: "How Recruiters Read", href: "/research/how-recruiters-read", tag: "Research" },
                { title: "Skills-Based Hiring", href: "/research/skills-based-hiring", tag: "Trends" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Recruiter Nation Report: Moving Forward in Uncertainty",
                    publisher: "Jobvite",
                    year: "2023",
                    href: "https://web.jobvite.com/rs/328-BQS-080/images/2023-Employ-Recruiter-Nation-Report-Moving-Forward-in-Uncertainty.pdf"
                }
            ]}
        >
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Why both matter equally</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Jobvite reports that recruiters use LinkedIn to source and vet candidates before outreach.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Recruiter lens: LinkedIn affects discoverability and validation, while the resume carries evidence for evaluation.
                One without the other leaves gaps.
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-6 mt-12">What each does best</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    title="LinkedIn: Identity"
                    desc="Recruiter lens: verifies identity, shows network context, and makes you reachable."
                />
                <ArticleInsight
                    title="Resume: Substance"
                    desc="Recruiter lens: shows depth of experience, accomplishments, and role fit."
                />
                <ArticleInsight
                    title="LinkedIn: Searchable"
                    desc="Recruiter lens: keywords, skills, and headline are what surface you in searches."
                />
                <ArticleInsight
                    title="Resume: Scannable"
                    desc="Recruiter lens: you have seconds to make an impression, so structure and formatting win."
                />
            </div>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4 mt-12">Practical takeaways</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                <strong>Keep them aligned.</strong> Interviewers check both. Mismatched dates,
                titles, or company names raise questions.
            </p>
            <p className="text-muted-foreground leading-relaxed">
                <strong>Different purposes, same story.</strong> Your LinkedIn can be broader (career overview).
                Your resume should be sharper (specific role fit). But they should tell the same story.
            </p>
        </ResearchArticle>
    );
}
