import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { SkillsShiftDiagram } from "@/components/research/diagrams/SkillsShiftDiagram";

export const metadata: Metadata = {
    title: "Skills-First Hiring: Promise vs Reality | Hiring Research",
    description: "What skills-first hiring expands, and where adoption still lags.",
};

export default function SkillsFirstPromiseRealityPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Industry trends",
                title: "Skills-first hiring: promise vs reality",
                description: "Skills-first expands talent pools, but adoption is uneven across employers.",
                lastUpdated: "December 2025",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The Tension",
                stat: "Expansion, Not Assurance",
                statDescription: (
                    <>
                        LinkedIn reports skills-first approaches expand the talent pool, while other research shows adoption gaps.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-3">3</Citation>
                    </>
                ),
                source: {
                    text: "LinkedIn Economic Graph (2025)",
                    href: "https://economicgraph.linkedin.com/content/dam/me/economicgraph/en-us/PDF/skills-based-hiring-march-2025.pdf"
                }
            }}
            visualization={
                <>
                    <h2 className="font-display text-2xl font-medium text-foreground mb-4">Policy vs practice</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                        Skills-first is a direction, not a guarantee. The gap between stated policy and actual hiring shows why evidence still matters.
                        <Citation id="source-3">3</Citation>
                    </p>
                    <SkillsShiftDiagram />
                </>
            }
            productTieIn={{
                title: "How RIYP responds",
                items: [
                    {
                        title: "Evidence-first bullets",
                        description: "We push candidates to prove skills with outcomes, not just lists."
                    },
                    {
                        title: "Skills alignment",
                        description: "We map resume language to job-posting skill terms so you show up in skills-first searches."
                    }
                ]
            }}
            relatedArticles={[
                { title: "The Skills-Based Hiring Shift", href: "/research/skills-based-hiring", tag: "Trends" },
                { title: "LinkedIn Visibility", href: "/research/linkedin-visibility", tag: "LinkedIn" },
                { title: "Quantifying Impact", href: "/research/quantifying-impact", tag: "Writing" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Skills-Based Hiring: The Big Picture",
                    publisher: "LinkedIn Economic Graph",
                    year: "2025",
                    href: "https://economicgraph.linkedin.com/content/dam/me/economicgraph/en-us/PDF/skills-based-hiring-march-2025.pdf"
                },
                {
                    id: "source-2",
                    title: "Future of Recruiting 2024",
                    publisher: "LinkedIn Talent Solutions",
                    year: "2024",
                    href: "https://business.linkedin.com/content/dam/me/business/en-us/talent-solutions/resources/pdfs/future-of-recruiting-2024.pdf"
                },
                {
                    id: "source-3",
                    title: "Companies aren't keeping commitments to hire non-college grads, study suggests",
                    publisher: "Business Insider",
                    year: "2024",
                    href: "https://www.businessinsider.com/companies-arent-keeping-commitment-hiring-non-college-graduates-study-2024-2"
                }
            ]}
            faq={[
                {
                    question: "Is skills-first hiring a guarantee?",
                    answer: "No. It expands pools, but adoption varies by company and role."
                },
                {
                    question: "How should I write for skills-first hiring?",
                    answer: "Align your resume to the exact skill language in the job post and show outcomes that prove those skills."
                },
                {
                    question: "What is the risk of over-optimizing?",
                    answer: "If the resume reads like a skill list without evidence, it can look generic."
                }
            ]}
        >
            <h2 className="font-display text-2xl font-medium text-foreground mb-4">What this means for candidates</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Skills-first does not remove competition. It raises the bar for evidence. Your resume must show measurable proof that you have those skills.
                <Citation id="source-2">2</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Use the job's vocabulary"
                    desc="Recruiter lens: skills-first searches reward exact terminology."
                />
                <ArticleInsight
                    title="Show the skill"
                    desc="Quantify outcomes so the skill is not just claimed, it is demonstrated."
                />
            </div>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Where skills-first is strongest</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Recruiter lens: skills-first is more common in roles where output is measurable and skills map clearly to outcomes.
                It is weaker in roles where signal is subjective or seniority is hard to compare.
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">How to translate skills into proof</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                Skills-first does not mean skills-only. The strongest resumes connect each skill to a concrete outcome.
                <Citation id="source-1">1</Citation>
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Pair each skill with a measurable result.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Anchor skills in the context of a real project.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Use the same wording as the job description when possible.</li>
            </ul>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Definition: promise vs reality</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
                The promise is a broader talent pool. The reality is that many teams still hire with old filters. Candidates need both skills evidence and clear role alignment.
                <Citation id="source-3">3</Citation>
            </p>

            <h2 className="font-display text-2xl font-medium text-foreground mb-4">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Employer adoption varies by industry, size, and role level.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Surveys capture intent and policy, not every hiring decision.</li>
            </ul>
        </ResearchArticle>
    );
}
