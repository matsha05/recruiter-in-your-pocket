import { pageMetadata } from "@/lib/seo/metadata";
import { ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { AnswerArticle, ArticleBridge } from "@/components/research/AnswerArticle";
import { ResearchLink } from "@/components/research/ResearchLink";
import { ImpactFormulaDiagram } from "@/components/research/diagrams/ImpactFormulaDiagram";
import { ResumeQualityDiagram } from "@/components/research/diagrams/ResumeQualityDiagram";

const PATH = "/research/quantifying-impact";

export const metadata = pageMetadata({
    path: PATH,
    title: "How do I write resume bullets that show results?",
    description: "Recruiters judge what you can do from what your resume shows you did. What the research supports about showing results, and a practical way to write them.",
    type: "article",
});

export default function QuantifyingImpactPage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    Say what changed, how you measured it, and what you did to get there. That&rsquo;s practitioner guidance, not a tested rule: no study we know of pits a quantified bullet against a duty-style one.
                    What research does show is that recruiters infer what you can do from what you did.
                </>
            }
            answerSource={{
                text: <>The formula is Laszlo Bock&rsquo;s (Google): accomplished [X] as measured by [Y], by doing [Z].</>,
                href: "https://www.linkedin.com/pulse/20140929001534-24454816-my-personal-formula-for-a-better-resume",
                linkLabel: "Read his post",
            }}
            painNote="You did good work. The line just doesn’t say what changed."
            nextQuestions={["star-method", "resume-length-myths", "how-recruiters-read"]}
            visualization={
                <>
                    <h2 className="research-h2">The formula visualized</h2>
                    <p className="research-body mb-6">
                        Lead with the result, give it context with a metric or concrete detail, then explain your method.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <ImpactFormulaDiagram />
                </>
            }
            sources={[
                {
                    id: "source-1",
                    title: "My personal formula for a better resume",
                    publisher: "Laszlo Bock on LinkedIn (practitioner guidance)",
                    year: "2014",
                    href: "https://www.linkedin.com/pulse/20140929001534-24454816-my-personal-formula-for-a-better-resume"
                },
                {
                    id: "source-2",
                    title: "Algorithmic Writing Assistance on Jobseekers' Resumes Increases Hires",
                    publisher: "Wiles, Munyikwa & Horton. Management Science 71(12); earlier as NBER Working Paper 30886",
                    year: "2025",
                    href: "https://doi.org/10.1287/mnsc.2024.04528"
                },
                {
                    id: "source-3",
                    title: "The Effects of Applicant Résumé Contents on Recruiters' Hiring Recommendations",
                    publisher: "Tsai, Chi, Huang & Hsu. Applied Psychology 60(2)",
                    year: "2011",
                    href: "https://doi.org/10.1111/j.1464-0597.2010.00434.x"
                },
                {
                    id: "source-4",
                    title: "Recruiters' Inferences of Applicant Personality Based on Resume Screening",
                    publisher: "Cole, Feild, Giles & Harris. Journal of Business and Psychology 24",
                    year: "2009",
                    href: "https://doi.org/10.1007/s10869-008-9086-9"
                },
                {
                    id: "source-5",
                    title: "Are Emily and Greg More Employable than Lakisha and Jamal?",
                    publisher: "Bertrand & Mullainathan. American Economic Review 94(4); fieldwork 2001–02",
                    year: "2004",
                    href: "https://doi.org/10.1257/0002828042002561"
                }
            ]}
        >
            <h2 className="research-h2">What the research supports</h2>
            <p className="research-body mb-6">
                No study we know of isolates a quantified bullet against a duty-style one. What the research does show is how recruiters use what&apos;s on the page.
            </p>
            <p className="research-body mb-6">
                <strong>They infer what you can do from what you did.</strong> In a study of more than 200 recruiters at campus hiring events in Taiwan, ratings of work experience, which included &ldquo;demonstrated personal accomplishments,&rdquo; predicted hiring recommendations. They worked through how well recruiters thought the person fit both the job and the company.
                <Citation id="source-3">3</Citation>
            </p>
            <p className="research-body mb-6">
                <strong>They guess at your character, and the guesses count.</strong> When 244 recruiters screened real resumes, their sense of how conscientious each applicant was carried the most weight of any trait in their employability ratings, even though those guesses didn&apos;t match the applicants&apos; measured conscientiousness.
                <Citation id="source-4">4</Citation>
                {" "}<strong>Our take:</strong> concrete evidence of finished work gives that guess something real to go on.
            </p>
            <p className="research-body mb-6">
                <strong>Substance moved callbacks in the field.</strong> In a classic audit study, resumes with more experience, skills, and honors got more callbacks than weaker ones when the name sounded white: 10.8% against 8.5%. For Black-sounding names the gain was small and not statistically significant: 6.7% against 6.2%.
                <Citation id="source-5">5</Citation>
            </p>
            <ResumeQualityDiagram figureNumber={2} />
            <p className="research-body mb-6">
                <strong>Clearer writing led to more hires.</strong> In a randomized experiment on a freelance platform, <ResearchLink to="writing-quality-hire-probability">spelling and grammar suggestions on new jobseekers&rsquo; profiles raised the hire rate from about 3.1% to 3.3%</ResearchLink>, roughly 8% more hires. Of the 480,948 people randomized, the analysis covers the 194,700 whose profiles were approved and not empty.
                <Citation id="source-2">2</Citation>
                {" "}It tested help with wording on short profiles, not adding results, but it shows that how clearly a profile reads can change outcomes.
            </p>

            <h2 className="research-h2">Why numbers work</h2>
            <p className="research-body mb-6">
                A number shows scale and gives the reader something to compare, as long as it&apos;s accurate and means something. It also gives the Experience section something to hold a reader: <ResearchLink to="how-recruiters-read">recruiters who spent longer there were more likely to move a resume forward</ResearchLink>. &quot;Improved customer satisfaction&quot; asks the reader to take your word for it. A before-and-after measure lets them check.
            </p>
            <p className="research-body mb-6">
                Bock&apos;s point: say what changed, not what you were responsible for. The formula puts the outcome first and the activity second.
                <Citation id="source-1">1</Citation>
                {" "}It&apos;s one way to make the result, the action, and the context visible. Any clear, accurate format can work.
            </p>

            <h2 className="research-h2">Finding numbers when you think you don&apos;t have any</h2>
            <p className="research-body mb-6">
                Start with questions, not a target number. The answers are usually in your calendar, your tickets, or your team&apos;s reports.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    title="Time"
                    desc="How long did it take before you changed it, and after?"
                />
                <ArticleInsight
                    title="Money"
                    desc="What did your work save, earn, or protect?"
                />
                <ArticleInsight
                    title="Scale"
                    desc="How many people, customers, requests, or markets did it reach?"
                />
                <ArticleInsight
                    title="Scope without a metric"
                    desc={<>No clean number? Name what you built and who relied on it. That&rsquo;s evidence too: <ResearchLink to="skills-first-promise-reality">a listed skill is a claim, and the project behind it is what lets a reader assess it</ResearchLink>.</>}
                />
            </div>
            <p className="research-body mb-6">
                You don&apos;t need a number in every bullet. Not every useful result has a clean one, so use a metric when it adds honest context. Without one, name the process you documented, the decision you made, or the teams you supported.
            </p>

            <h2 className="research-h2">An illustrative before and after</h2>
            <p className="research-body mb-6">
                The facts below belong to a made-up example. Yours have to be ones you can back up.
            </p>
            <p className="research-body mb-6">
                <strong>Before:</strong> &quot;Responsible for managing social media accounts and creating content.&quot;
            </p>
            <p className="research-body mb-6">
                <strong>After:</strong> &quot;Grew the Instagram following from 5K to 45K in eight months with a weekly content calendar built on what people actually engaged with.&quot;
            </p>
            <p className="research-body">
                Same job. The second version tells the reader what changed and how you did it.
            </p>

            <h2 className="research-h2">Give the reader the context behind the result</h2>
            <p className="research-body mb-6">
                A number without context can still mislead. &quot;Cut time by 40%&quot; leaves the reader asking: time spent on what, compared with when, and what did you change? Include those details when you can verify them. They&rsquo;re also <ResearchLink to="star-method">the headline of a story you can tell in the interview</ResearchLink>.
            </p>

            <ArticleBridge question="Which of your lines stop before the result?">
                When a line says what you did but not what changed, it often becomes the Critical Miss. We&apos;ll ask for the result or the scale. We won&apos;t invent one for you.
            </ArticleBridge>

            <h2 className="research-h2">What the evidence does not prove</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>Bock&apos;s X–Y–Z formula is experienced practitioner guidance, not a controlled trial.</li>
                <li>No study cited here tests quantified bullets directly. The audit study varied overall resume strength, and the writing experiment varied clarity.</li>
                <li>The recruiter studies are correlational, and the writing experiment ran on an online work platform.</li>
                <li>Neither source justifies inventing a metric or forcing a number into every bullet.</li>
            </ul>
        </AnswerArticle>
    );
}
