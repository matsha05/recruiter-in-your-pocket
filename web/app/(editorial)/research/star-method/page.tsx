import { pageMetadata } from "@/lib/seo/metadata";
import { ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { AnswerArticle, ArticleBridge } from "@/components/research/AnswerArticle";
import { ResearchLink } from "@/components/research/ResearchLink";
import { StarStructureDiagram } from "@/components/research/diagrams/StarStructureDiagram";

const PATH = "/research/star-method";

export const metadata = pageMetadata({
    path: PATH,
    title: "How to use the STAR method on a resume (with an example)",
    description: "See a customer support resume bullet before and after a STAR rewrite. Then use the same bullet to prepare for an interview, including what you learned.",
    type: "article",
});

export default function StarMethodPage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    Start with what you did and what changed. Add just enough context for someone outside your team to follow the bullet.
                </>
            }
            answerSource={{
                text: <>Our advice, illustrated with a fictional customer support role.</>,
            }}
            nextQuestions={["quantifying-impact", "how-recruiters-read", "referral-advantage", "who-you-are"]}
            visualizationLabel="Before-and-after resume bullet"
            visualization={
                <>
                    <h2 className="research-h2">One resume bullet, before and after</h2>
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
                    <p className="research-body">
                        The first line gives you a department. The second tells you which problems this person handled, what they wrote, and who uses it. That last detail is a result you can describe without a number.
                    </p>
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
                },
                {
                    id: "source-3",
                    title: "Before your interview",
                    publisher: "University of Edinburgh Careers Service",
                    href: "https://careers.ed.ac.uk/interviews-and-assessment-centres/before-your-interview"
                },
                {
                    id: "source-4",
                    title: "Interview tips for all roles",
                    publisher: "Microsoft Careers",
                    href: "https://careers.microsoft.com/v2/global/en/hiring-tips/interview-tips"
                }
            ]}
        >
            <h2 className="research-h2">The four parts of a work story</h2>
            <p className="research-body mb-6">
                STAR stands for situation, task, action, and result. In the example, customer support gives you the situation, billing escalations were the responsibility, writing the guide was the action, and the team using it is the result.
            </p>
            <StarStructureDiagram />
            <p className="research-body mb-6">
                Try it on one of your own bullets. If your job title already tells the reader where you worked, spend the space on <ResearchLink to="quantifying-impact">what changed and how you know</ResearchLink>. Use a number when you can back it up.
            </p>
            <p className="research-body mb-6">
                Read the finished line aloud and check it for errors. In one large experiment, <ResearchLink to="writing-quality-hire-probability">grammar fixes alone lifted hires by about 8%</ResearchLink>.
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
            <h2 className="research-h2">When CARL helps in an interview</h2>
            <p className="research-body mb-6">
                CARL stands for context, action, result, and learning. The University of Edinburgh teaches both STAR and CARL for interview answers.
                <Citation id="source-3">3</Citation>
                {" "}Microsoft asks candidates to reflect on what they learned as part of its STAR(R) approach.
                <Citation id="source-4">4</Citation>
            </p>
            <p className="research-body mb-6">
                Say an interviewer picks up on the troubleshooting guide and asks, “What would you do differently?” Start with what happened the first time someone tried to use it. If their questions led you to change the guide, explain what you changed and why. That’s the learning in CARL.
            </p>

            <h2 className="research-h2">Check the story before you tell it</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>Can someone tell what you did, apart from what the team did?</li>
                <li>Have you said why you chose that approach?</li>
                <li>Can you describe the outcome accurately, including what didn&apos;t work?</li>
            </ul>

            <ArticleBridge question="Does each line show what was yours?">
                When a line hides your part or the result, it gets a card that asks for them. Filling it gives you the headline of a story you can tell, and the score weighs how easy it is to follow what you did.
            </ArticleBridge>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>The research is about how employers run interviews, not about resumes.</li>
                <li>No study cited here tests whether STAR-shaped resume lines get more interviews.</li>
            </ul>
        </AnswerArticle>
    );
}
