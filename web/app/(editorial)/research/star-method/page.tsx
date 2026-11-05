import { pageMetadata } from "@/lib/seo/metadata";
import { ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { AnswerArticle, ArticleBridge } from "@/components/research/AnswerArticle";
import { ResearchLink } from "@/components/research/ResearchLink";
import { StarStructureDiagram } from "@/components/research/diagrams/StarStructureDiagram";

const PATH = "/research/star-method";

export const metadata = pageMetadata({
    path: PATH,
    title: "Is the STAR method worth using on a resume?",
    description: "Situation, task, action, result: how to use STAR on a resume line and in a structured interview without forcing the formula.",
    type: "article",
});

export default function StarMethodPage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    For the story behind a line, yes. Just don&rsquo;t force every bullet into the formula.
                    Structured interviews ask every candidate job-related questions and rate the answers against standards set in advance, and across many studies they&rsquo;ve proved more reliable and more predictive of job performance than unstructured ones.
                </>
            }
            answerSource={{
                text: <>From a review of the structured interview research (Levashina, Hartwell, Morgeson &amp; Campion, Personnel Psychology, 2014). It doesn&rsquo;t test the STAR acronym itself.</>,
                href: "https://apps.it.purdue.edu/sites/Home/DirectoryApi/Files/42d5154c-ccc5-403e-b3ed-edd69e3f6896/Download",
                linkLabel: "Read the review",
            }}
            painNote="Every line you write is a story you may be asked to tell."
            nextQuestions={["quantifying-impact", "how-recruiters-read", "referral-advantage", "who-you-are"]}
            visualization={
                <>
                    <h2 className="research-h2">The four parts of a work story</h2>
                    <p className="research-body mb-6">
                        STAR is a way to organize an example from your own work: what was going on, what was yours to do, what you did, and what happened. It&apos;s a checklist, not a template.
                    </p>
                    <StarStructureDiagram />
                </>
            }
            sources={[
                {
                    id: "source-1",
                    title: "The Structured Employment Interview: Narrative and Quantitative Review of the Research Literature",
                    publisher: "Levashina, Hartwell, Morgeson & Campion. Personnel Psychology",
                    year: "2014",
                    href: "https://apps.it.purdue.edu/sites/Home/DirectoryApi/Files/42d5154c-ccc5-403e-b3ed-edd69e3f6896/Download"
                },
                {
                    id: "source-2",
                    title: "Structured Interviews",
                    publisher: "U.S. Office of Personnel Management",
                    year: "Current guidance",
                    href: "https://www.opm.gov/policy-data-oversight/assessment-and-selection/other-assessment-methods/structured-interviews/"
                }
            ]}
        >
            <h2 className="research-h2">On the resume: the headline</h2>
            <p className="research-body mb-6">
                Don&apos;t force four labeled parts into a bullet. A strong line names what you did, gives just enough context to follow it, and <ResearchLink to="quantifying-impact">says what changed, and how you measured it, when you know</ResearchLink>. The role title usually covers the situation.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
                Fictional examples. Only use details like these if they&apos;re true for you.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 not-prose mb-6">
                <ArticleInsight
                    title="Before"
                    desc="“Worked on the customer support team handling inquiries.”"
                />
                <ArticleInsight
                    title="After"
                    desc="“Handled billing escalations and wrote the troubleshooting guide the team now uses for repeat issues.”"
                />
            </div>
            <p className="research-body mb-6">
                The second line says what was yours and what it left behind. There&apos;s no invented number, and it doesn&apos;t need one. It&apos;s also the start of an interview answer. The wording is worth the care on its own: in one large experiment, <ResearchLink to="writing-quality-hire-probability">grammar fixes alone lifted hires by about 8%</ResearchLink>.
            </p>

            <h2 className="research-h2">In the interview: the story</h2>
            <p className="research-body mb-6">
                In a structured interview, the employer picks the skills that matter for the job and sets the questions and rating standards in advance. Every candidate gets the same test.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
                {" "}Expect two kinds of questions. A recruiter screen often adds a third, what you make now, and <ResearchLink to="salary-history-bans">disclosing it brought higher offers and fewer callbacks in one field experiment</ResearchLink>.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 not-prose mb-6">
                <ArticleInsight
                    title="What did you do?"
                    desc="A behavioral question asks about a real example. Pick one that shows the skill they're asking about."
                />
                <ArticleInsight
                    title="What would you do?"
                    desc="A situational question asks about a hypothetical. Explain your reasoning and what you'd want to know first."
                />
            </div>
            <p className="research-body mb-6">
                <strong>Our advice:</strong> go through the job description and pick a few examples from your resume that match it. For each, note the problem, what was yours, the choices you made, and what happened. In the room, pick the example that answers the question they actually asked. Memorize the facts, not a script, so you have room for follow-ups.
            </p>
            <div className="not-prose mb-6 rounded-inset border border-line bg-card p-5">
                <p className="mb-2 text-sm font-semibold text-muted-foreground">Example prep notes</p>
                <p className="text-foreground">
                    If you&apos;ll talk about a delayed launch, be ready to say what caused the delay, which call was yours, who you brought in, and what happened after you changed the plan.
                </p>
            </div>

            <h2 className="research-h2">Check the story before you tell it</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>Can someone tell what you did, apart from what the team did?</li>
                <li>Have you said why you chose that approach?</li>
                <li>Can you describe the outcome accurately, including what didn&apos;t work?</li>
            </ul>

            <ArticleBridge question="Does each line show what was yours?">
                When a line hides your part or the result, the Critical Miss usually says so first. Fixing it gives you the headline of a story you can tell, and the score weighs how easy it is to follow what you did.
            </ArticleBridge>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>The research is about how employers run interviews. It doesn&apos;t test the STAR acronym itself.</li>
                <li>No study cited here tests whether STAR-shaped resume lines get more interviews.</li>
            </ul>
        </AnswerArticle>
    );
}
