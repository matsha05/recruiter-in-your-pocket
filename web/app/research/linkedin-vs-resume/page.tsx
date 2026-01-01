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
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Two tools, different jobs</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        LinkedIn is your public identity. Your resume is your evidence file.
                        They&apos;re equally important—and interviewers scan both.
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
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Why both matter equally</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                This is how recruiting works at many companies. If someone doesn&apos;t have a LinkedIn,
                recruiters may hesitate to reach out—there&apos;s no quick way to verify who they are. Your profile is how they find you;
                your resume is how they evaluate you. Both get scanned during interviews.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                LinkedIn increases the likelihood of being contacted. Your resume gets you through the evaluation.
                One without the other leaves gaps.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-6 mt-12">What each does best</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    title="LinkedIn: Identity"
                    desc={
                        <>
                            Verifies you exist, shows your network, lets recruiters find and reach you.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Resume: Substance"
                    desc={
                        <>
                            Shows depth of experience, specific accomplishments, tailored per role.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="LinkedIn: Searchable"
                    desc={
                        <>
                            Keywords, skills, headline — what makes you show up in recruiter searches.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Resume: Scannable"
                    desc={
                        <>
                            Seconds to make an impression. Structure and formatting win here.
                        </>
                    }
                />
            </div>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-4 mt-12">Practical takeaways</h2>
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
