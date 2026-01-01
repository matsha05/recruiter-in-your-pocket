import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { SkillsShiftDiagram } from "@/components/research/diagrams/SkillsShiftDiagram";

export const metadata: Metadata = {
    title: "The Skills-Based Hiring Shift | Hiring Research",
    description: "The shift toward skills-first hiring and what it means for resumes.",
};

export default function SkillsBasedHiringPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Industry trends",
                title: "The Skills-Based Hiring Shift",
                description: "How skills-first hiring changes what employers look for and how you should signal capability.",
                lastUpdated: "December 2025",
                readTime: "5 min read"
            }}
            keyFinding={{
                subtitle: "The Trend",
                stat: "45%",
                statDescription: (
                    <>
                        of companies surveyed by LinkedIn plan to prioritize skills over degrees by 2025.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "LinkedIn Economic Graph Skills-Based Hiring Report (2024)",
                    href: "https://economicgraph.linkedin.com/research/skills-based-hiring"
                }
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">The paradigm shift</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Traditional hiring filters are giving way to skills-based assessment.
                    </p>
                    <SkillsShiftDiagram />
                </>
            }
            productTieIn={{
                title: "How Recruiter in Your Pocket uses this",
                items: [
                    {
                        title: "Skills Extraction",
                        description: "We identify and emphasize the skills demonstrated in your experience sections."
                    },
                    {
                        title: "Evidence Focus",
                        description: "We help you show skills through accomplishments, not just list them."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Quantifying Impact", href: "/research/quantifying-impact", tag: "Writing" },
                { title: "LinkedIn vs. Resume", href: "/research/linkedin-vs-resume", tag: "Sourcing" },
                { title: "The Referral Advantage", href: "/research/referral-advantage", tag: "Strategy" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Skills-Based Hiring: The Big Picture",
                    publisher: "LinkedIn Economic Graph",
                    year: "2024",
                    href: "https://economicgraph.linkedin.com/research/skills-based-hiring"
                }
            ]}
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">What&apos;s actually changing</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                The shift to skills-based hiring reflects a growing focus on demonstrated capability over credentials.
                Employers are rewriting job requirements to emphasize skills and outcomes.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                This doesn&apos;t mean credentials don&apos;t matter—it means how you communicate skills matters more.
                A degree proves you completed a program. Your resume needs to prove you can do the work.
            </p>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-6 mt-12">What this means for resumes</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    title="Show, Don&apos;t Tell"
                    desc="Listing &apos;project management&apos; as a skill isn&apos;t enough. Show a project you managed and the outcome."
                />
                <ArticleInsight
                    title="Education Moves Down"
                    desc="For experienced candidates, education should be at the bottom. Experience proves capability."
                />
                <ArticleInsight
                    title="Portfolio Signals"
                    desc="Links to work samples, GitHub repos, or case studies provide evidence that degrees cannot."
                />
                <ArticleInsight
                    title="Certifications Rise"
                    desc="Industry certifications (AWS, PMP, Google Analytics) are increasingly valued as skill proof."
                />
            </div>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-4 mt-12">Practical application</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                <strong>Lead with what you&apos;ve done, not where you went.</strong> Start bullets with actions
                and results. &quot;Led migration to AWS, reducing infrastructure costs by 40%&quot; beats
                &quot;Experienced in cloud computing.&quot;
            </p>
            <p className="text-muted-foreground leading-relaxed">
                <strong>Match the job posting&apos;s skill language.</strong> If they ask for &quot;stakeholder management,&quot;
                use that phrase—not synonyms. Skills-based hiring often means skills-based searching.
            </p>
        </ResearchArticle>
    );
}
