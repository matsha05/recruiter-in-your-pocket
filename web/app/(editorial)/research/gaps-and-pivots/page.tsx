import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { GapPivotDiagram } from "@/components/research/diagrams/GapPivotDiagram";

export const metadata: Metadata = {
    title: "Gaps, pivots, and short stints",
    description: "What field experiments found about employment gaps, career changes, and frequent moves, and what actually helped the resumes that had them.",
};

export default function GapsAndPivotsPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Story",
                title: "Gaps, pivots, and short stints",
                description: "When a resume leaves a question open, recruiters tend to answer it themselves. The research shows which questions cost the most, and what helped.",
                lastUpdated: "October 2026",
                readTime: "7 min read"
            }}
            keyFinding={{
                subtitle: "What the largest experiment found",
                stat: "Explaining the gap didn't help",
                statDescription: (
                    <>
                        In a preregistered UK experiment with 9,022 employers, a line explaining a caregiving gap did no better than leaving it unexplained. Listing years in each job instead of dates did help: it beat even resumes with no gap by about 8%.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Kristal et al., Nature Human Behaviour, 2023",
                    href: "https://doi.org/10.1038/s41562-022-01485-6"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">A current gap and a career change both cost callbacks</h2>
                    <p className="research-body mb-6">
                        One US experiment sent about 3,360 fictitious resumes to 600 job ads, varying how long the applicant had been out of work and whether their experience matched the industry. Experience from a different industry roughly halved the response. Past six months out of work, even matching experience stopped helping.
                        <Citation id="source-2">2</Citation>
                    </p>
                    <GapPivotDiagram figureNumber={1} />
                    <p className="research-body mb-6">
                        A larger US study found the same shape. With roughly 12,000 resumes, callbacks at eight months out of work were about 45% lower than at one month.
                        <Citation id="source-3">3</Citation>
                    </p>
                </>
            }
            productTieIn={{
                title: "Where this shows up in your report",
                items: [
                    {
                        title: "The Verdict",
                        description: "If a gap or a pivot is the first thing a recruiter wonders about, the Verdict will say so in plain words."
                    },
                    {
                        title: "The Critical Miss",
                        description: "When the open question is costing you more than any single line, it becomes the Critical Miss, with a fix that keeps your facts intact."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Can a recruiter tell who you are?", href: "/research/who-you-are", tag: "Story" },
                { title: "What a referral changes", href: "/research/referral-advantage", tag: "Referrals" },
                { title: "Show what changed and your part in it", href: "/research/quantifying-impact", tag: "Impact" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Reducing discrimination against job seekers with and without employment gaps",
                    publisher: "Kristal, Nicks, Gloor & Hauser. Nature Human Behaviour 7",
                    year: "2023",
                    href: "https://doi.org/10.1038/s41562-022-01485-6"
                },
                {
                    id: "source-2",
                    title: "The Jobless Trap",
                    publisher: "Ghayad. Job market paper, Northeastern University (not peer reviewed)",
                    year: "2013",
                    href: "https://static.wixstatic.com/ugd/576e9a_f6cf3b6661e44621ad26547112f66691.pdf"
                },
                {
                    id: "source-3",
                    title: "Duration Dependence and Labor Market Conditions: Evidence from a Field Experiment",
                    publisher: "Kroft, Lange & Notowidigdo. Quarterly Journal of Economics 128(3)",
                    year: "2013",
                    href: "https://www.nber.org/papers/w18387"
                },
                {
                    id: "source-4",
                    title: "Do Employers Use Unemployment as a Sorting Criterion When Hiring? Evidence from a Field Experiment",
                    publisher: "Eriksson & Rooth. American Economic Review 104(3); earlier as IZA DP 6235",
                    year: "2014",
                    href: "https://doi.org/10.1257/aer.104.3.1014"
                },
                {
                    id: "source-5",
                    title: "Penalized or Protected? Gender and the Consequences of Nonstandard and Mismatched Employment Histories",
                    publisher: "Pedulla. American Sociological Review 81(2)",
                    year: "2016",
                    href: "https://doi.org/10.1177/0003122416630982"
                },
                {
                    id: "source-6",
                    title: "Job History, Work Attitude, and Employability",
                    publisher: "Cohn, Maréchal, Schneider & Weber. University of Zurich working paper 210",
                    year: "2015",
                    href: "https://doi.org/10.5167/uzh-115782"
                },
                {
                    id: "source-7",
                    title: "Do Employers Care about Past Mobility? A Field Experiment Examining Hiring Preferences in Technology and Non-Technology Jobs",
                    publisher: "Hollister, Denier & St-Denis. Sociological Science 12",
                    year: "2025",
                    href: "https://doi.org/10.15195/v12.a11"
                }
            ]}
            faq={[
                {
                    question: "Should I hide the dates on my resume?",
                    answer: "Showing years in each role is honest and helped in the largest test. Hiding dates altogether tends to raise the question you're trying to answer, and applications and background checks will ask for them anyway."
                },
                {
                    question: "Should I explain a caregiving gap?",
                    answer: "In the largest test, an explanation line didn't help or hurt. Lead with your experience. Be ready to explain the gap in a sentence when someone asks."
                },
                {
                    question: "I've had a lot of short jobs. What now?",
                    answer: "Group contract or agency work under one heading, and make each move read as a step: more scope, a new skill, a better team."
                }
            ]}
        >
            <h2 className="research-h2">An old gap matters much less than a current one</h2>
            <p className="research-body mb-6">
                In a Swedish experiment with 8,466 applications, a year out of work between two past jobs made no measurable difference to callbacks. Current time out of work mattered more, mainly for lower-skilled jobs.
                <Citation id="source-4">4</Citation>
                {" "}Once later work has closed a gap, it mostly stops counting against you.
            </p>

            <h2 className="research-h2">Show the experience, not the calendar</h2>
            <p className="research-body mb-6">
                The UK experiment tested two common fixes for a caregiving gap. Explaining it in a line did no better than leaving it unexplained. Listing how many years the applicant spent in each job, instead of start and end dates, raised callbacks above even resumes with no gap at all. The authors trace this to the experience standing out, not to novelty.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">A stopgap job can read like a step down</h2>
            <p className="research-body mb-6">
                In a US experiment with 2,420 applications, men whose recent job was well below their skill level got callbacks 4.7% of the time, about the same as a year unemployed (4.2%), against 10.4% for full-time work at their level. Women took the same penalty for underemployment, though not for part-time work. Temp agency work wasn&apos;t significantly penalized for either.
                <Citation id="source-5">5</Citation>
            </p>

            <h2 className="research-h2">Frequent moves hurt in some fields, not others</h2>
            <p className="research-body mb-6">
                A Swiss experiment sent paired applications for administrative jobs. One previous employer got callbacks 23.2% of the time; four employers over the same span got 16.8%. A second round found 18.2% against 12.2%. HR professionals read the frequent moves as a sign of work attitude.
                <Citation id="source-6">6</Citation>
            </p>
            <p className="research-body mb-6">
                A 2025 US study with 3,878 applications found no penalty overall for four employers in eight years: 9.7% against 10.5% for a stable history. The penalty showed up in non-tech jobs. Software employers didn&apos;t mind the moves.
                <Citation id="source-7">7</Citation>
            </p>

            <h2 className="research-h2">How to tell the story</h2>
            <p className="research-body mb-6">
                <strong>Our take:</strong> every gap, pivot, or short stint raises a question. Answer it on the page before the reader answers it for you.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 not-prose mb-6">
                <ArticleInsight
                    title="Lead with experience"
                    desc="Put the years and the work where they're seen first. Let the dates sit quietly beside them."
                />
                <ArticleInsight
                    title="Name the bridge in a pivot"
                    desc="Open with the skills and results that carry into the new field, in that field's words."
                />
                <ArticleInsight
                    title="Give each move a reason"
                    desc="More scope, a new skill, a team you wanted to join. Group contract work under one heading."
                />
                <ArticleInsight
                    title="Keep it current"
                    desc="If you're out of work now, show what you've done recently: a project, a course you finished, contract work."
                />
            </div>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>These are audit studies: fictitious resumes and callbacks, not hires.</li>
                <li>The industry-switch figure comes from an unpublished paper with small groups past six months.</li>
                <li>The studies span the UK, the US, Sweden, and Switzerland, and results differed by field and skill level.</li>
                <li>The UK experiment changed the resume and cover letter together, and tested caregiving gaps for mothers.</li>
            </ul>
        </ResearchArticle>
    );
}
