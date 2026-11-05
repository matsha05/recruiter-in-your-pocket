import { pageMetadata } from "@/lib/seo/metadata";
import { Citation } from "@/components/research/ResearchArticle";
import { AnswerArticle, ArticleBridge } from "@/components/research/AnswerArticle";
import { ResearchLink } from "@/components/research/ResearchLink";
import { AutomationPipeline } from "@/components/research/diagrams/AutomationPipeline";

const PATH = "/research/automation-and-bias";

export const metadata = pageMetadata({
    path: PATH,
    title: "Where can software screen me out of a job?",
    description: "Software can shape which job ads you see, whether your application is eligible, and how it reaches a reviewer. Here's where bias can enter along the way.",
    type: "article",
});

export default function AutomationBiasPage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    Earlier than you&rsquo;d think: which job ads you see, whether you&rsquo;re eligible, and how you reach a person.
                    One review of hiring tools found they rarely make the final decision but often automate rejections along the way.
                </>
            }
            answerSource={{
                text: <>From Upturn&rsquo;s review of hiring tools across sourcing, screening, interviewing, and selection (Bogen &amp; Rieke, 2018).</>,
                href: "https://www.upturn.org/work/help-wanted/",
                linkLabel: "Read the report",
            }}
            painNote="You can do everything right and still never reach a person."
            nextQuestions={["ats-myths", "human-vs-algorithm", "hiring-discrimination-meta-analysis"]}
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
        >
            <h2 className="research-h2">One hiring process, several decision points</h2>
            <p className="research-body mb-6">
                The Upturn report follows four stages of hiring: sourcing (including job ads), screening, interviewing, and selection. Its authors found that tools rarely make the final hiring decision but often automate rejections along the way. Someone who never sees a job ad may never learn about the opportunity. When a person does decide, software still has a say: in one experiment, <ResearchLink to="human-vs-algorithm">an algorithm&rsquo;s recommendation swayed recruiters who said they trusted it less than a human expert</ResearchLink>.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                Once you have an opportunity to apply, check that your file contains readable text and clear sections. That addresses a possible parsing problem, not the broader risks documented in the report, and even then <ResearchLink to="ats-myths">a failed parse doesn&rsquo;t make the resume disappear: someone enters the details by hand</ResearchLink>.
                <Citation id="source-2">2</Citation>
            </p>
            <p className="research-body mb-6">
                <strong>Our advice:</strong> make your relevant experience explicit, too. You can&apos;t fix bias in the tools, but you can keep an avoidable parsing problem from becoming another one.
            </p>

            <ArticleBridge question="What can you control?">
                Your report reads the resume you submit and flags what&apos;s missing or unclear. It can&apos;t see an employer&apos;s job ads or screening tools, and it doesn&apos;t guess at their settings.
            </ArticleBridge>

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
            <p className="research-body mb-6">
                The gaps have a human baseline. In US field experiments with human screeners, <ResearchLink to="hiring-discrimination-meta-analysis">white applicants got 36% more callbacks than equally qualified Black applicants</ResearchLink>, with no decline from 1989 to 2015.
            </p>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>The Upturn report is from 2018. It describes where risk can enter, not how large the effect is.</li>
                <li>The newer studies test AI models in simulations. They aren&apos;t audits of a real employer&apos;s hiring tools.</li>
                <li>Hiring tools have changed since then, and most vendors don&apos;t publish how theirs work.</li>
            </ul>
        </AnswerArticle>
    );
}
