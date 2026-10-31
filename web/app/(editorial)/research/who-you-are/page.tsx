import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { StoryReadDiagram } from "@/components/research/diagrams/StoryReadDiagram";

export const metadata: Metadata = {
    title: "Can a recruiter tell who you are?",
    description: "Early impressions carry through to offers, coherent careers get hired more, and specifics beat summaries. What the research says about the story your resume tells.",
};

export default function WhoYouArePage() {
    return (
        <ResearchArticle
            header={{
                tag: "Story",
                title: "Can a recruiter tell who you are?",
                description: "The best resumes let a stranger say who you are in one line and picture you doing the job. The research says that early read matters more than most people think.",
                lastUpdated: "October 2026",
                readTime: "6 min read"
            }}
            keyFinding={{
                subtitle: "What the research found",
                stat: "The first read carried through",
                statDescription: (
                    <>
                        In structured internship interviews, early judgments of a candidate&apos;s competence predicted the final ratings and the offers, including ratings from a different interviewer.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Barrick, Swider & Stewart, Journal of Applied Psychology",
                    href: "https://doi.org/10.1037/a0019918"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">What a recruiter is trying to do</h2>
                    <p className="research-body mb-6">
                        A recruiter isn&apos;t only checking boxes. They&apos;re trying to understand you well enough to picture you in the job and explain you to a hiring manager in a sentence. If they can&apos;t, the resume is hard to move forward, however strong the experience behind it.
                    </p>
                    <StoryReadDiagram figureNumber={1} />
                </>
            }
            productTieIn={{
                title: "Where this shows up in your report",
                items: [
                    {
                        title: "The Verdict",
                        description: "The Verdict is the one-line read a recruiter forms about you. If it isn't who you are, the resume isn't telling your story yet."
                    },
                    {
                        title: "The Critical Miss",
                        description: "When the thing holding you back is that a recruiter can't tell what you'd do next, the Critical Miss says so and points to the fix."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Tell the story behind the line", href: "/research/star-method", tag: "Story" },
                { title: "Show what changed and your part in it", href: "/research/quantifying-impact", tag: "Impact" },
                { title: "What recruiters notice in the first pass", href: "/research/how-recruiters-read", tag: "Perception" }
            ]}
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
            faq={[
                {
                    question: "Do I need a summary at the top?",
                    answer: "Only if it says something specific. One line that names who you are and what you're best at helps. A paragraph of adjectives doesn't."
                },
                {
                    question: "What if my career zigzags?",
                    answer: "Find the thread and lead with it. Most zigzags have one: a problem you kept solving, a kind of team you kept building. Say it, so the reader doesn't have to guess."
                },
                {
                    question: "Should I explain a gap?",
                    answer: "A short, plain line is usually enough. Readers tend to assume the worst about a gap they can't explain."
                }
            ]}
        >
            <h2 className="research-h2">The first read sticks</h2>
            <p className="research-body mb-6">
                In one study of structured interviews for internships, interviewers rated candidates during the first few minutes of small talk, before the formal questions began. Candidates who made a better first impression got higher final ratings and more internship offers. The links were moderate (correlations of .42 and .22), not destiny. Early judgments of competence predicted later ratings even from a different interviewer.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                That study was about interviews, not resumes. But the resume is usually the first read, and our experience is that it works the same way. Once a recruiter decides who you are, everything after that gets read through it.
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
                In a field experiment on an online job site, an economist hired 952 new workers and randomly gave some a detailed public evaluation of their work instead of a bare rating. Afterward, workers with detailed evaluations earned more and asked for higher wages. The detail helped strong performers and hurt weak ones.
                <Citation id="source-3">3</Citation>
                {" "}Specifics didn&apos;t flatter anyone. They let employers see who was good.
            </p>
            <p className="research-body mb-6">
                Missing detail costs you too. In an audit study that sent roughly 12,000 fictitious resumes to job openings in 100 US cities, callbacks were about 45% lower for people out of work eight months than for those out one month, roughly 4% against 7%. The authors read this as employers treating the gap as a sign of something they couldn&apos;t see.
                <Citation id="source-5">5</Citation>
                {" "}When the resume doesn&apos;t say, the reader fills it in, and rarely in your favor.
            </p>

            <h2 className="research-h2">Being relatable is part of the read</h2>
            <p className="research-body mb-6">
                In 120 interviews with evaluators at elite banks, law firms, and consulting firms, more than half said &ldquo;fit&rdquo; was their most important criterion at the interview stage, ahead of analytical thinking and communication. One lawyer opened every interview the same way: &ldquo;I want to hear your life story.&rdquo;
                <Citation id="source-4">4</Citation>
                {" "}That can slide into bias toward people like the evaluator. The useful lesson is narrower: a reader who can see how you think and what you care about has something to connect with. A list of duties gives them nothing.
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
                    desc="Name the product, the team, the customer, the problem. Specifics let a stranger picture you doing it."
                />
                <ArticleInsight
                    title="It points at the next job"
                    desc="Lead with the experience that makes the role you want look like the obvious next step."
                />
            </div>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>The first-impression study measured interviews, not resume screening.</li>
                <li>The career-order and evaluation studies come from online freelance marketplaces, not salaried hiring. We read the career-order study&apos;s published summary; the full paper is paywalled.</li>
                <li>The fit research is qualitative and comes from elite firms. It describes what evaluators do, including where that becomes bias, not what they should do.</li>
            </ul>
        </ResearchArticle>
    );
}
