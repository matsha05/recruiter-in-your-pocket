import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { SkillsPromiseRealityDiagram } from "@/components/research/diagrams/SkillsPromiseRealityDiagram";

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
                lastUpdated: "July 2026",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "Policy versus practice",
                stat: "Fewer than 1 in 700 hires",
                statDescription: (
                    <>
                        A 2024 Harvard Business School and Burning Glass Institute analysis estimated that removing degree requirements created incremental opportunity for fewer than one in 700 annual hires.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "HBS + Burning Glass Institute (2024)",
                    href: "https://www.hbs.edu/ris/Publication%2520Files/Skills-Based%2520Hiring_80b90afa-f6b5-4de9-b7f8-5d8232ce20e2.pdf"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">Policy vs practice</h2>
                    <p className="research-body mb-6">
                        Skills-first is a direction, not a guarantee. The gap between stated policy and actual hiring shows why evidence still matters.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <SkillsPromiseRealityDiagram />
                </>
            }
            productTieIn={{
                title: "How this shows up in your report",
                items: [
                    {
                        title: "Evidence-first bullets",
                        description: "We connect important skills to the real projects, decisions, scope, and outcomes on the page."
                    },
                    {
                        title: "Skills alignment",
                        description: "We help you use the employer's language where it accurately describes your experience."
                    }
                ]
            }}
            relatedArticles={[
                { title: "What Applicant Tracking Systems Do", href: "/research/ats-myths", tag: "Systems" },
                { title: "LinkedIn Visibility", href: "/research/linkedin-visibility", tag: "LinkedIn" },
                { title: "Quantifying Impact", href: "/research/quantifying-impact", tag: "Writing" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Skills-Based Hiring: The Long Road from Pronouncements to Practice",
                    publisher: "Harvard Business School and Burning Glass Institute",
                    year: "2024",
                    href: "https://www.hbs.edu/ris/Publication%2520Files/Skills-Based%2520Hiring_80b90afa-f6b5-4de9-b7f8-5d8232ce20e2.pdf"
                },
                {
                    id: "source-2",
                    title: "Skills-Based Hiring: The Big Picture",
                    publisher: "LinkedIn Economic Graph",
                    year: "2025",
                    href: "https://economicgraph.linkedin.com/content/dam/me/economicgraph/en-us/PDF/skills-based-hiring-march-2025.pdf"
                }
            ]}
            faq={[
                {
                    question: "Is skills-first hiring a guarantee?",
                    answer: "No. It expands pools, but adoption varies by company and role."
                },
                {
                    question: "How should I write for skills-first hiring?",
                    answer: "Use the job post's skill language when it accurately describes your experience, then connect it to real work."
                },
                {
                    question: "What is the risk of over-optimizing?",
                    answer: "If the resume reads like a skill list without evidence, it can look generic."
                }
            ]}
        >
            <h2 className="research-h2">What this means for candidates</h2>
            <p className="research-body mb-6">
                Skills-first does not remove competition or old filters. LinkedIn documents growing use of skills language on its platform, while the HBS analysis shows that changed postings have not consistently translated into changed hires.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Use the job's vocabulary"
                    desc="Use the employer's wording when it accurately describes your experience."
                />
                <ArticleInsight
                    title="Show the skill"
                    desc="Connect the skill to a real project, decision, result, or useful measure of scope."
                />
            </div>

            <h2 className="research-h2">Where skills-first is strongest</h2>
            <p className="research-body mb-6">
                The HBS report found that nearly all measured hiring change came from 37% of the firms that removed degree requirements. About 45% showed no meaningful hiring change, and roughly one-fifth made short-term gains that later reversed.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">How to translate skills into proof</h2>
            <p className="research-body mb-6">
                Treat &quot;skills-first&quot; as permission to make relevant ability unmistakable, not as proof that credentials no longer matter. Connect important skills to projects, scope, and outcomes a reviewer can inspect.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Pair important skills with a project, decision, or result.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Anchor skills in the context of a real project.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Use the job description&apos;s wording only when it accurately describes your experience.</li>
            </ul>

            <h2 className="research-h2">What has actually changed</h2>
            <p className="research-body mb-6">
                The promise is a broader talent pool. In practice, many employers that removed degree language did not materially change who they hired. Candidates still need clear evidence of relevant work and role alignment.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>The HBS analysis studied 11,300 employer-and-occupation combinations at large US firms with observable hiring before and after degree requirements changed.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>LinkedIn&apos;s findings describe activity on its own platform and are not independent causal evidence.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Adoption varies by employer, occupation, and market; a changed job ad does not guarantee a changed hiring decision.</li>
            </ul>
        </ResearchArticle>
    );
}
