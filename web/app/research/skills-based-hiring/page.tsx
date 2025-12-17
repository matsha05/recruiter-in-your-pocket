import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight } from "@/components/research/ResearchArticle";
import { SkillsShiftDiagram } from "@/components/research/diagrams/SkillsShiftDiagram";
import { Briefcase, Award, GraduationCap, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
    title: "The Skills-Based Hiring Shift | Hiring Research",
    description: "Major employers are dropping degree requirements and hiring for skills. What this means for your resume.",
};

export default function SkillsBasedHiringPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Industry trends",
                title: "The Skills-Based Hiring Shift",
                description: "Google, Apple, IBM, and others have removed degree requirements for many roles. Here's what's actually changing—and what it means for you.",
                lastUpdated: "December 2025",
                readTime: "5 min read"
            }}
            keyFinding={{
                icon: <Briefcase className="w-4 h-4" />,
                subtitle: "The Trend",
                stat: "45%",
                statDescription: "of companies surveyed by LinkedIn plan to prioritize skills over degrees by 2025.",
                source: {
                    text: "LinkedIn Future of Recruiting Report (2023)",
                    href: "https://business.linkedin.com/talent-solutions/global-talent-trends"
                }
            }}
            visualization={
                <>
                    <h2 className="font-serif text-2xl font-medium text-foreground mb-4">The paradigm shift</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Traditional hiring filters are giving way to evidence-based assessment.
                    </p>
                    <SkillsShiftDiagram />
                </>
            }
            productTieIn={{
                title: "How this shapes our tool",
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
        >
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">What's actually changing</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                The shift to skills-based hiring isn't just PR. Driven by talent shortages and research showing
                degrees don't predict job performance, major employers are removing "bachelor's required" from
                job postings.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
                This doesn't mean credentials don't matter—it means how you communicate skills matters more.
                A degree proves you completed a program. Your resume needs to prove you can do the work.
            </p>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-6 mt-12">What this means for resumes</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    icon={<Award className="w-4 h-4" />}
                    title="Show, Don't Tell"
                    desc="Listing 'project management' as a skill isn't enough. Show a project you managed and the outcome."
                />
                <ArticleInsight
                    icon={<GraduationCap className="w-4 h-4" />}
                    title="Education Moves Down"
                    desc="For experienced candidates, education should be at the bottom. Experience proves capability."
                />
                <ArticleInsight
                    icon={<Briefcase className="w-4 h-4" />}
                    title="Portfolio Signals"
                    desc="Links to work samples, GitHub repos, or case studies provide evidence that degrees cannot."
                />
                <ArticleInsight
                    icon={<TrendingUp className="w-4 h-4" />}
                    title="Certifications Rise"
                    desc="Industry certifications (AWS, PMP, Google Analytics) are increasingly valued as skill proof."
                />
            </div>

            <h2 className="font-serif text-2xl font-medium text-foreground mb-4 mt-12">Practical application</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                <strong>Lead with what you've done, not where you went.</strong> Start bullets with actions
                and results. "Led migration to AWS, reducing infrastructure costs by 40%" beats
                "Experienced in cloud computing."
            </p>
            <p className="text-muted-foreground leading-relaxed">
                <strong>Match the job posting's skill language.</strong> If they ask for "stakeholder management,"
                use that phrase—not synonyms. Skills-based hiring often means skills-based searching.
            </p>
        </ResearchArticle>
    );
}
