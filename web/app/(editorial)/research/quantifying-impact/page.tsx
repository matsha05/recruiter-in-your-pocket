import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { ImpactFormulaDiagram } from "@/components/research/diagrams/ImpactFormulaDiagram";
import { ResumeQualityDiagram } from "@/components/research/diagrams/ResumeQualityDiagram";

export const metadata: Metadata = {
    title: "Show what changed and your part in it",
    description: "Recruiters judge what you can do from what your resume shows you did. What the research supports about showing results, and a practical way to write them.",
};

export default function QuantifyingImpactPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Resume writing",
                title: "Show what changed and your part in it",
                description: "Recruiters judge what you can do by what your resume shows you did. Here's what the research supports, and a practical way to write it.",
                lastUpdated: "October 2026",
                readTime: "7 min read"
            }}
            keyFinding={{
                label: "Practitioner guidance",
                subtitle: "Practitioner guidance",
                stat: "X → Y → Z",
                statDescription: (
                    <>
                        Accomplished [X] as measured by [Y], by doing [Z]. Name the result, explain how you measured it, and describe what you did.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Laszlo Bock (Google) resume formula",
                    href: "https://www.linkedin.com/pulse/20140929001534-24454816-my-personal-formula-for-a-better-resume"
                }
            }}
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
            productTieIn={{
                title: "Where this shows up in your report",
                items: [
                    {
                        title: "Often the Critical Miss",
                        description: "When a line says what you did but not what changed, it often becomes the Critical Miss."
                    },
                    {
                        title: "No made-up numbers",
                        description: "We'll ask for the result or the scale. We won't invent one for you."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Tell the story behind the line", href: "/research/star-method", tag: "Story" },
                { title: "There is no universal one-page rule", href: "/research/resume-length-myths", tag: "Structure" },
                { title: "What recruiters notice in the first pass", href: "/research/how-recruiters-read", tag: "Research" }
            ]}
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
                    publisher: "van Inwegen, Munyikwa & Horton. NBER Working Paper 30886",
                    year: "2023",
                    href: "https://www.nber.org/papers/w30886"
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
                    publisher: "Bertrand & Mullainathan. American Economic Review 94(4)",
                    year: "2004",
                    href: "https://www.nber.org/papers/w9873"
                }
            ]}
            faq={[
                {
                    question: "What if I do not have numbers?",
                    answer: "Describe what changed or what you were responsible for. For example, name the process you documented, the decision you made, or the teams you supported. You do not need a number in every bullet."
                },
                {
                    question: "Is the XYZ formula the only format?",
                    answer: "No. It is one way to make the result, action, and context visible. Any clear, accurate format can work."
                },
                {
                    question: "Does this matter for every role?",
                    answer: "Most roles produce outcomes, but not every useful result has a clean number. Use a metric when it adds honest context."
                }
            ]}
        >
            <h2 className="research-h2">What the research supports</h2>
            <p className="research-body mb-6">
                No study we know of isolates a quantified bullet against a duty-style one. What the research does show is how recruiters use what&apos;s on the page.
            </p>
            <p className="research-body mb-6">
                <strong>They infer what you can do from what you did.</strong> In a study of 216 recruiters at campus hiring events, ratings of work experience, which included &ldquo;demonstrated personal accomplishments,&rdquo; predicted hiring recommendations. They worked mostly through how well recruiters thought the person fit the job.
                <Citation id="source-3">3</Citation>
            </p>
            <p className="research-body mb-6">
                <strong>They guess at your character, and the guesses count.</strong> When 244 recruiters screened real resumes, their sense of how conscientious each applicant was became the strongest predictor of employability ratings, even though those guesses barely matched the applicants&apos; measured personality.
                <Citation id="source-4">4</Citation>
                {" "}Concrete evidence of finished work is the best way to give that guess something real to go on.
            </p>
            <p className="research-body mb-6">
                <strong>Substance moved callbacks in the field.</strong> In a classic audit study, resumes with more experience, skills, and honors got more callbacks than weaker ones. But only for applicants with white-sounding names.
                <Citation id="source-5">5</Citation>
            </p>
            <ResumeQualityDiagram figureNumber={2} />
            <p className="research-body mb-6">
                <strong>Clearer writing led to more hires.</strong> In a randomized experiment with 194,700 jobseekers on an online work platform, writing assistance raised the hire rate from about 3.1% to 3.3%, roughly 8% more hires.
                <Citation id="source-2">2</Citation>
                {" "}That tested grammar and style help, not adding results, but it shows that how clearly a resume reads changes outcomes.
            </p>

            <h2 className="research-h2">Why numbers work</h2>
            <p className="research-body mb-6">
                A number shows scale and gives the reader something to compare, as long as it&apos;s accurate and means something. &quot;Improved customer satisfaction&quot; asks the reader to take your word for it. A before-and-after measure lets them check.
            </p>
            <p className="research-body mb-6">
                Bock&apos;s point: say what changed, not what you were responsible for. The formula puts the outcome first and the activity second.
                <Citation id="source-1">1</Citation>
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
                    desc="No clean number? Name what you built and who relied on it. That's evidence too."
                />
            </div>

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
                A number without context can still mislead. &quot;Cut time by 40%&quot; leaves the reader asking: time spent on what, compared with when, and what did you change? Include those details when you can verify them.
            </p>

            <h2 className="research-h2">What the evidence does not prove</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>Bock&apos;s X–Y–Z formula is experienced practitioner guidance, not a controlled trial.</li>
                <li>No study cited here tests quantified bullets directly. The audit study varied overall resume strength, and the writing experiment varied clarity.</li>
                <li>The recruiter studies are correlational, and the writing experiment ran on an online work platform.</li>
                <li>Neither source justifies inventing a metric or forcing a number into every bullet.</li>
            </ul>
        </ResearchArticle>
    );
}
