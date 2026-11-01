import { pageMetadata } from "@/lib/seo/metadata";
import { ResearchArticle, Citation } from "@/components/research/ResearchArticle";
import { AutomationPipeline } from "@/components/research/diagrams/AutomationPipeline";

const PATH = "/research/automation-and-bias";

export const metadata = pageMetadata({
    path: PATH,
    title: "Where automation and bias enter the hiring process",
    description: "Software can shape which job ads you see, whether your application is eligible, and how it reaches a reviewer. Here's where bias can enter along the way.",
    type: "article",
});

export default function AutomationBiasPage() {
    return (
        <ResearchArticle
            path={PATH}
            header={{
                tag: "Automation",
                title: "Where automation enters hiring",
                description: "Different tools can affect which job ads you see, whether your application is eligible, and how it reaches a reviewer.",
                readTime: "4 min read"
            }}
            keyFinding={{
                subtitle: "The system",
                stat: "Bias can enter at several stages",
                statDescription: (
                    <>
                        The cited report maps risks across four stages of hiring: sourcing, screening, interviewing, and selection. A decision made early in the funnel can shape who remains available for later review; the report does not estimate one universal effect size.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Bogen & Rieke (2018), Upturn 'Help Wanted'",
                    href: "https://www.upturn.org/work/help-wanted/"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">Four stages where tools can act</h2>
                    <p className="research-body mb-6">
                        Automated decisions can happen before you apply, including when a platform chooses who will see a job ad.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <AutomationPipeline />
                </>
            }
            productTieIn={{
                title: "What your report can and can't see",
                items: [
                    {
                        title: "The page you give us",
                        description: "We read the resume you submit and flag what's missing or unclear. We can't see an employer's job ads or screening tools."
                    },
                    {
                        title: "Research, not rumor",
                        description: "When we talk about filters, we stick to what's been published. Private platforms don't share their settings, so we don't guess at them."
                    }
                ]
            }}
            relatedArticles={[
                { title: "What applicant tracking systems actually do", href: "/research/ats-myths", tag: "Industry" },
                { title: "What recruiters trust and what they follow", href: "/research/human-vs-algorithm", tag: "Trust" },
                { title: "Discrimination in hiring hasn't gone away", href: "/research/hiring-discrimination-meta-analysis", tag: "Research" }
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
                    title: "Unsuccessful resume parse",
                    publisher: "Greenhouse Support",
                    year: "2026",
                    href: "https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse"
                },
                {
                    id: "source-3",
                    title: "Gender, Race, and Intersectional Bias in Resume Screening via Language Model Retrieval",
                    publisher: "Wilson & Caliskan. AAAI/ACM Conference on AI, Ethics, and Society; corrected on arXiv in 2026",
                    year: "2024",
                    href: "https://arxiv.org/abs/2407.20371"
                },
                {
                    id: "source-4",
                    title: "Measuring gender and racial biases in large language models: Intersectional evidence from automated resume evaluation",
                    publisher: "An, Huang, Lin & Tai. PNAS Nexus 4(3)",
                    year: "2025",
                    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11937954/"
                }
            ]}
            faq={[
                {
                    question: "Where does bias enter the hiring funnel?",
                    answer: "Bias can enter at ad delivery, eligibility screening, ranking, assessment, and human review. An early decision can change who is available for every later stage."
                },
                {
                    question: "Can a resume fix algorithmic bias?",
                    answer: "No. Making a resume easier to read does not remove bias from the tools or decisions an employer uses."
                },
                {
                    question: "What should candidates do?",
                    answer: "Candidates cannot fix systemic bias. They can keep the file readable and make relevant experience explicit so avoidable parsing failures do not become another problem."
                }
            ]}
        >
            <h2 className="research-h2">One hiring process, several decision points</h2>
            <p className="research-body mb-6">
                The Upturn report follows four stages of hiring: sourcing (including job ads), screening, interviewing, and selection. Its authors found that tools rarely make the final hiring decision but often automate rejections along the way. Someone who never sees a job ad may never learn about the opportunity.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                Once you have an opportunity to apply, check that your file contains readable text and clear sections. That addresses a possible parsing problem, not the broader risks documented in the report.
                <Citation id="source-2">2</Citation>
            </p>

            <h2 className="research-h2">When the system changes who gets seen</h2>
            <p className="research-body mb-6">
                A system that decides who sees a job ad or appears in a search can change who receives attention. Candidates left out may still find another route to the employer, but the initial decision can limit their opportunity.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">What newer studies found</h2>
            <p className="research-body mb-6">
                Newer studies test the AI models that screening tools can be built on. In a 2024 simulation, text-matching models ranked about 500 resumes against job descriptions with names swapped in. Resumes with white names were significantly preferred in 85% of tests and those with Black names in 9%. In 2026 the authors corrected their separate gender results after finding a bug in their code; the race results stand.
                <Citation id="source-3">3</Citation>
            </p>
            <p className="research-body mb-6">
                A 2025 study asked five large language models to score about 361,000 resumes with randomized names. They gave women higher scores and Black men lower ones, gaps the authors estimate could shift hiring odds by about 1 to 3 percentage points at some cutoffs.
                <Citation id="source-4">4</Citation>
            </p>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>The Upturn report is from 2018. It describes where risk can enter, not how large the effect is.</li>
                <li>The newer studies test AI models in simulations. They aren&apos;t audits of a real employer&apos;s hiring tools.</li>
                <li>Hiring tools have changed since then, and most vendors don&apos;t publish how theirs work.</li>
            </ul>
        </ResearchArticle>
    );
}
