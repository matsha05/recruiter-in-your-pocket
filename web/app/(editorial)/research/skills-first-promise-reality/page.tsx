import { pageMetadata } from "@/lib/seo/metadata";
import { ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { AnswerArticle, ArticleBridge } from "@/components/research/AnswerArticle";
import { ResearchLink } from "@/components/research/ResearchLink";
import { SkillsPromiseRealityDiagram } from "@/components/research/diagrams/SkillsPromiseRealityDiagram";

const PATH = "/research/skills-first-promise-reality";

export const metadata = pageMetadata({
    path: PATH,
    title: "Do “no degree required” jobs actually mean it?",
    description: "Removing a degree requirement doesn't always change who gets hired. What a 2024 analysis found across employers, and where skills-first hiring still lags.",
    type: "article",
});

export default function SkillsFirstPromiseRealityPage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    Often not in practice. One analysis estimated that, in 2023, dropping the requirement opened up new opportunity in fewer than one in 700 hires.
                    Many employers changed the job ad and little else.
                </>
            }
            answerSource={{
                text: <>From a Harvard Business School and Burning Glass Institute analysis of large US firms that dropped degree requirements (2024).</>,
                href: "https://www.hbs.edu/ris/Publication%2520Files/Skills-Based%2520Hiring_80b90afa-f6b5-4de9-b7f8-5d8232ce20e2.pdf",
                linkLabel: "Read the report",
            }}
            painNote={"“No degree required” can still mean “degree preferred.”"}
            nextQuestions={["ats-myths", "linkedin-visibility", "quantifying-impact"]}
            visualization={
                <>
                    <h2 className="research-h2">Many employers that dropped the degree didn&apos;t change who they hired</h2>
                    <p className="research-body mb-6">
                        The report compared changes in job requirements with changes in hiring. Nearly all the measured change came from 37% of the firms that dropped degree requirements. About 45% showed no meaningful hiring change, and roughly one-fifth made short-term gains that later reversed.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <SkillsPromiseRealityDiagram />
                </>
            }
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
        >
            <h2 className="research-h2">What this means for candidates</h2>
            <p className="research-body mb-6">
                Skills-first does not remove competition or old filters. A 2025 LinkedIn report modeled how much bigger talent pools would be if employers hired on skills instead of past job titles, a median of 6.1 times bigger. That&apos;s a simulation of who could qualify, not a count of who was hired. The HBS analysis counted who was actually hired.
                <Citation id="source-2">2</Citation>
                <Citation id="source-1">1</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Use the job's vocabulary"
                    desc={<>Use the employer&rsquo;s wording when it accurately describes your experience. The same words work where <ResearchLink to="linkedin-visibility">recruiters search the titles and skills in your headline and experience</ResearchLink>.</>}
                />
                <ArticleInsight
                    title="Show the skill"
                    desc={<>Connect the skill to a real project, decision, result, or useful measure of scope: <ResearchLink to="quantifying-impact">what changed, how you measured it, and what you did to get there</ResearchLink>.</>}
                />
            </div>

            <h2 className="research-h2">Show where you used the skill</h2>
            <p className="research-body mb-6">
                A skill list tells the reader what you claim to know. An example of using the skill helps them assess that claim. You can add that context whether or not the employer describes its process as skills-first. A keyword block doesn&rsquo;t help with the software either: <ResearchLink to="ats-myths">the parser pulls your text into fields, and automatic rejection runs on application questions, not on keyword counts</ResearchLink>.
            </p>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>Name the project or responsibility where you used the skill.</li>
                <li>Explain your contribution and include a result when you can verify it.</li>
                <li>Keep required qualifications visible; do not assume the employer has stopped considering them.</li>
            </ul>

            <ArticleBridge question="Does each skill have a line that backs it up?">
                A listed skill is a claim. Your report looks for the project, decision, or result that backs it up. Add a job description and it&apos;ll help you use the employer&apos;s language where it honestly fits.
            </ArticleBridge>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>The HBS analysis studied 11,300 employer-and-occupation combinations at large US firms that dropped degree requirements between 2014 and 2023, with hiring observed before and after the change.</li>
                <li>LinkedIn&apos;s report is a model built on its own members&apos; data. It estimates who could qualify for a role, not who was hired, and it isn&apos;t independent research.</li>
                <li>Adoption varies by employer, occupation, and market; a changed job ad does not guarantee a changed hiring decision.</li>
            </ul>
        </AnswerArticle>
    );
}
