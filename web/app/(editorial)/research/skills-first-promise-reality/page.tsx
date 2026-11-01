import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { SkillsPromiseRealityDiagram } from "@/components/research/diagrams/SkillsPromiseRealityDiagram";

export const metadata: Metadata = {
    title: "Skills-first hiring: the promise and the practice",
    description: "What skills-first hiring expands, and where adoption still lags.",
    alternates: { canonical: "/research/skills-first-promise-reality" },
};

export default function SkillsFirstPromiseRealityPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Industry trends",
                title: "Skills-first hiring: the promise and the practice",
                description: "Removing a degree requirement does not always change who gets hired. A 2024 analysis found large differences between employers.",
                lastUpdated: "July 2026",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "Policy versus practice",
                stat: "Fewer than 1 in 700 hires",
                statDescription: (
                    <>
                        A 2024 Harvard Business School and Burning Glass Institute analysis estimated that, in 2023, removing degree requirements opened up new opportunity in fewer than one in 700 hires.
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
                    <h2 className="research-h2">Many employers that dropped the degree didn&apos;t change who they hired</h2>
                    <p className="research-body mb-6">
                        The report compared changes in job requirements with changes in hiring. A minority of employers hired meaningfully more workers without degrees. Many changed the job ad and little else, and some gains faded.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <SkillsPromiseRealityDiagram />
                </>
            }
            productTieIn={{
                title: "Where this shows up in your report",
                items: [
                    {
                        title: "Skills with proof",
                        description: "A listed skill is a claim. We look for the project, decision, or result that backs it up."
                    },
                    {
                        title: "Their words, when they're true",
                        description: "Add a job description and we'll help you use the employer's language where it honestly fits."
                    }
                ]
            }}
            relatedArticles={[
                { title: "What applicant tracking systems actually do", href: "/research/ats-myths", tag: "Systems" },
                { title: "What makes a LinkedIn profile easier to find", href: "/research/linkedin-visibility", tag: "LinkedIn" },
                { title: "Show what changed and your part in it", href: "/research/quantifying-impact", tag: "Writing" }
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
                    title: "Skills-Based Hiring: Increasing Access to Opportunity",
                    publisher: "Lara. LinkedIn Economic Graph Research Institute (vendor research)",
                    year: "2025",
                    href: "https://economicgraph.linkedin.com/content/dam/me/economicgraph/en-us/PDF/skills-based-hiring-march-2025.pdf"
                }
            ]}
            faq={[
                {
                    question: "Is skills-first hiring a guarantee?",
                    answer: "No. Removing a degree requirement can make more people eligible, but this report found that many employers did not meaningfully change who they hired."
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
                Skills-first does not remove competition or old filters. A 2025 LinkedIn report modeled how much bigger talent pools would be if employers hired on skills instead of past job titles, a median of 6.1 times bigger. That&apos;s a simulation of who could qualify, not a count of who was hired. The HBS analysis looked at actual hiring and found that changed postings have not consistently translated into changed hires.
                <Citation id="source-2">2</Citation>
                <Citation id="source-1">1</Citation>
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

            <h2 className="research-h2">Show where you used the skill</h2>
            <p className="research-body mb-6">
                A skill list tells the reader what you claim to know. An example of using the skill helps them assess that claim. You can add that context whether or not the employer describes its process as skills-first.
            </p>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>Name the project or responsibility where you used the skill.</li>
                <li>Explain your contribution and include a result when you can verify it.</li>
                <li>Keep required qualifications visible; do not assume the employer has stopped considering them.</li>
            </ul>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>The HBS analysis studied 11,300 employer-and-occupation combinations at large US firms that dropped degree requirements between 2014 and 2023, with hiring observed before and after the change.</li>
                <li>LinkedIn&apos;s report is a model built on its own members&apos; data. It estimates who could qualify for a role, not who was hired, and it isn&apos;t independent research.</li>
                <li>Adoption varies by employer, occupation, and market; a changed job ad does not guarantee a changed hiring decision.</li>
            </ul>
        </ResearchArticle>
    );
}
