import { pageMetadata } from "@/lib/seo/metadata";
import { ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { AnswerArticle, ArticleBridge } from "@/components/research/AnswerArticle";
import { ResearchLink } from "@/components/research/ResearchLink";
import { StoryReadDiagram } from "@/components/research/diagrams/StoryReadDiagram";

const PATH = "/research/who-you-are";

export const metadata = pageMetadata({
    path: PATH,
    title: "What does my resume say about who I am?",
    description: "Early impressions carry through to offers, coherent careers get hired more, and specifics beat summaries. What the research says about your resume's story.",
    type: "article",
});

export default function WhoYouArePage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    Whatever a stranger can say in one line. In mock interviews, first impressions predicted the final ratings and, later, real internship offers.
                    That study was about interviews, not resumes.
                </>
            }
            answerSource={{
                text: <>From a study of accounting students&rsquo; mock interviews and later internship offers (Barrick, Swider &amp; Stewart, Journal of Applied Psychology, 2010).</>,
                href: "https://doi.org/10.1037/a0019918",
            }}
            painNote="A strong career can still read like a list of unrelated jobs."
            nextQuestions={["star-method", "quantifying-impact", "how-recruiters-read", "gaps-and-pivots"]}
            visualization={
                <>
                    <h2 className="research-h2">What a recruiter is trying to do</h2>
                    <p className="research-body mb-6">
                        A recruiter isn&apos;t only checking boxes. They&apos;re trying to understand you well enough to picture you in the job and explain you to a hiring manager in a sentence. If they can&apos;t, the resume is hard to move forward, however strong the experience behind it.
                    </p>
                    <StoryReadDiagram figureNumber={1} />
                </>
            }
            sources={[
                {
                    id: "source-1",
                    title: "Initial evaluations in the interview: Relationships with subsequent interviewer evaluations and employment offers",
                    publisher: "Barrick, Swider & Stewart. Journal of Applied Psychology 95(6)",
                    year: "2010",
                    href: "https://doi.org/10.1037/a0019918"
                },
                {
                    id: "source-2",
                    title: "Dilettante or Renaissance Person? How the Order of Job Experiences Affects Hiring in an External Labor Market",
                    publisher: "Leung. American Sociological Review 79(1)",
                    year: "2014",
                    href: "https://doi.org/10.1177/0003122413518638"
                },
                {
                    id: "source-3",
                    title: "Inefficient Hiring in Entry-Level Labor Markets",
                    publisher: "Pallais. American Economic Review 104(11)",
                    year: "2014",
                    href: "https://doi.org/10.1257/aer.104.11.3565"
                },
                {
                    id: "source-4",
                    title: "Hiring as Cultural Matching: The Case of Elite Professional Service Firms",
                    publisher: "Rivera. American Sociological Review 77(6)",
                    year: "2012",
                    href: "https://doi.org/10.1177/0003122412463213"
                },
                {
                    id: "source-5",
                    title: "Duration Dependence and Labor Market Conditions: Evidence from a Field Experiment",
                    publisher: "Kroft, Lange & Notowidigdo. Quarterly Journal of Economics 128(3)",
                    year: "2013",
                    href: "https://www.nber.org/papers/w18387"
                }
            ]}
        >
            <h2 className="research-h2">The first read sticks</h2>
            <p className="research-body mb-6">
                In one study, accounting students had mock structured interviews before applying for real internships. Interviewers rated them during the first few minutes of small talk, before the formal questions began. Candidates who made a better first impression got higher final ratings from the same interviewer (a correlation of .42) and more real internship offers (.22). Those are moderate links, not destiny. Early judgments of competence also predicted ratings from different interviewers, more weakly.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                The resume is usually what a recruiter reads first, and our experience is that it works the same way. The eye-tracking evidence points the same direction: <ResearchLink to="how-recruiters-read">recruiters who spent longer on Experience were more likely to move a resume forward</ResearchLink>. Once a recruiter decides who you are, everything after that gets read through it.
            </p>

            <h2 className="research-h2">A clear thread beats a scattered list</h2>
            <p className="research-body mb-6">
                A study of a large freelance marketplace looked at how the order of someone&apos;s past jobs affected whether they were hired. Employers favored people who had moved in steps between related kinds of work over those whose history jumped around or never moved at all. The effect was stronger for complex jobs and less experienced workers, and weaker when the employer had already worked with the person. Someone who knows you doesn&apos;t need the resume to tell the story.
                <Citation id="source-2">2</Citation>
            </p>
            <p className="research-body mb-6">
                The jobs themselves were the evidence. How they connected was the signal. Your resume can make that connection visible, or leave the reader to work it out.
            </p>

            <h2 className="research-h2">Specifics let them picture it</h2>
            <p className="research-body mb-6">
                In a field experiment on an online job site, an economist hired 952 workers for short data-entry jobs and randomly gave some a detailed public evaluation of their work instead of a bare rating. The detail helped the workers who had done well and hurt the ones who hadn&apos;t.
                <Citation id="source-3">3</Citation>
                {" "}Those evaluations were written by an employer, not by the worker, so the lesson carries over to a resume only by analogy. <strong>Our take:</strong> specifics don&apos;t flatter anyone. They let a reader see who is good.
            </p>
            <p className="research-body mb-6">
                Employers also read meaning into what a resume doesn&apos;t show. In an audit study that sent roughly 12,000 fictitious resumes to job openings in 100 US cities, callbacks were about 45% lower for people out of work eight months than for those out one month, roughly 4% against 7%. The authors read this as employers treating the time out as a sign of something they couldn&apos;t see.
                <Citation id="source-5">5</Citation>
                {" "}That study changed how long people had been out of work, not how much their resumes explained. In the largest test of fixes, <ResearchLink to="gaps-and-pivots">listing the years in each job instead of dates raised callbacks above even resumes with no gap</ResearchLink>. <strong>Our take:</strong> the same instinct applies whenever a resume leaves a question open. The reader fills it in, and rarely in your favor.
            </p>

            <h2 className="research-h2">Being relatable is part of the read</h2>
            <p className="research-body mb-6">
                In 120 interviews with evaluators at elite banks, law firms, and consulting firms, more than half said &ldquo;fit&rdquo; was their most important criterion at the interview stage, ahead of analytical thinking and communication. One lawyer described usually opening with &ldquo;Tell me about yourself,&rdquo; and explained: &ldquo;I want to hear your life story.&rdquo;
                <Citation id="source-4">4</Citation>
                {" "}Evaluators look you up as well: <ResearchLink to="social-screening">in one experiment, posts changed candidate ratings, and having no profile at all cost more than an awkward one</ResearchLink>. That can slide into bias toward people like the evaluator. The useful lesson is narrower: a reader who can see how you think and what you care about has something to connect with. A list of duties gives them nothing.
            </p>

            <h2 className="research-h2">What makes a resume tell your story</h2>
            <p className="research-body mb-6">
                <strong>Our take:</strong> after reading a great many resumes, these are the ones that land.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 not-prose mb-6">
                <ArticleInsight
                    title="One line says who you are"
                    desc="“Growth marketer who builds teams.” If the reader can repeat it to a hiring manager, you've done the hard part."
                />
                <ArticleInsight
                    title="Each role adds a chapter"
                    desc="Each job should show what you took on that you hadn't before. Not the same duties under a new logo."
                />
                <ArticleInsight
                    title="They can see the work"
                    desc={<>Name the product, the team, the customer, the problem. Specifics let a stranger picture you doing it, and <ResearchLink to="star-method">a line that names what was yours and what it left behind is the start of an interview answer</ResearchLink>.</>}
                />
                <ArticleInsight
                    title="It points at the next job"
                    desc="Lead with the experience that makes the role you want look like the obvious next step."
                />
            </div>
            <p className="research-body mb-6">
                A summary at the top helps only if it&apos;s specific: one line that names who you are and what you&apos;re best at. A paragraph of adjectives doesn&apos;t. If your career zigzags, find the thread and lead with it. Most zigzags have one: a problem you kept solving, a kind of team you kept building. Say it, so the reader doesn&apos;t have to guess.
            </p>

            <ArticleBridge question="Who does your resume say you are?">
                Your report opens with one sentence on who your resume says you are. If it isn&apos;t who you are, the resume isn&apos;t telling your story yet. When your resume doesn&apos;t make clear what you&apos;d do next, the write-up says so and the report lists the lines to work on.
            </ArticleBridge>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>The career-order and evaluation studies come from online freelance marketplaces, not salaried hiring. We read the career-order study&apos;s published summary; the full paper is paywalled.</li>
                <li>The fit research is qualitative and comes from elite firms. It describes what evaluators do, including where that becomes bias, not what they should do.</li>
            </ul>
        </AnswerArticle>
    );
}
