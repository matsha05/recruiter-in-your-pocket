import { pageMetadata } from "@/lib/seo/metadata";
import { ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { AnswerArticle, ArticleBridge } from "@/components/research/AnswerArticle";
import { ResearchLink } from "@/components/research/ResearchLink";
import { GapPivotDiagram } from "@/components/research/diagrams/GapPivotDiagram";

const PATH = "/research/gaps-and-pivots";

export const metadata = pageMetadata({
    path: PATH,
    title: "Should I explain the gap on my resume?",
    description: "What field experiments found about employment gaps, career changes, and frequent moves, and what actually helped the resumes that had them.",
    type: "article",
});

export default function GapsAndPivotsPage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    In the largest test, no. A line explaining a caregiving gap did no better than leaving it unexplained.
                    Listing years in each job instead of dates did help, beating even resumes with no gap.
                </>
            }
            answerSource={{
                text: <>From a preregistered UK experiment with 9,022 employers (Kristal et al., Nature Human Behaviour, 2023).</>,
                href: "https://doi.org/10.1038/s41562-022-01485-6",
            }}
            painNote="You can stop drafting the apology."
            nextQuestions={["career-breaks", "who-you-are", "referral-advantage"]}
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
        >
            <h2 className="research-h2">An old gap matters much less than a current one</h2>
            <p className="research-body mb-6">
                In a Swedish experiment with 8,466 applications, a year out of work between two past jobs made no measurable difference to callbacks. Current time out of work mattered more, mainly for lower-skilled jobs.
                <Citation id="source-4">4</Citation>
                {" "}In that study, a gap that later work had closed didn&apos;t count against the applicant.
            </p>

            <h2 className="research-h2">Show the experience, not the calendar</h2>
            <p className="research-body mb-6">
                The UK experiment tested two common fixes for a caregiving gap. Explaining it in a line did no better than leaving it unexplained. Listing how many years the applicant spent in each job, instead of start and end dates, raised callbacks above even resumes with no gap at all, by about 8%. The authors trace this to the experience standing out, not to novelty.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">A stopgap job can read like a step down</h2>
            <p className="research-body mb-6">
                In a US experiment with 2,420 applications, men whose recent job was well below their skill level got callbacks 4.7% of the time, about the same as a year unemployed (4.2%), against 10.4% for full-time work at their level. Women took the same penalty for underemployment, though not for part-time work. Temp agency work wasn&apos;t significantly penalized for either.
                <Citation id="source-5">5</Citation>
                {" "}If the stopgap paid less, the next question is what to say when a recruiter asks what you make now, and <ResearchLink to="salary-history-bans">the studies found that disclosing can help and hurt</ResearchLink>.
            </p>

            <h2 className="research-h2">Frequent moves hurt in some fields, not others</h2>
            <p className="research-body mb-6">
                A Swiss experiment sent paired applications for administrative jobs. One previous employer got callbacks 23.2% of the time; four employers over the same span got 16.8%. A second round found 18.2% against 12.2%. HR professionals read the frequent moves as a sign of work attitude.
                <Citation id="source-6">6</Citation>
            </p>
            <p className="research-body mb-6">
                A 2025 US study sent 3,878 applications for five mid-level jobs. Overall, four employers in eight years got callbacks 9.7% of the time against 10.5% for one employer, not a significant difference. That average hides a split. In HR, financial reporting, marketing, and IT jobs, frequent movers got about a third fewer callbacks than stable ones. The exception was software testing, where the stable history was the one that lost out. Tech companies as a group didn&apos;t favor movers; if anything, they leaned toward stable histories.
                <Citation id="source-7">7</Citation>
            </p>

            <h2 className="research-h2">How to tell the story</h2>
            <p className="research-body mb-6">
                <strong>Our take:</strong> every gap, pivot, or short stint raises a question. Answer it on the page before the reader answers it for you. <ResearchLink to="who-you-are">Once a recruiter decides who you are, everything after that gets read through it</ResearchLink>.
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
                    desc={<>If you&rsquo;re out of work now, show what you&rsquo;ve done recently: a project, a course you finished, contract work. Keep the public profile current too: <ResearchLink to="social-screening">having no social profile at all cost candidates more than posts suggesting mental-health problems</ResearchLink>.</>}
                />
            </div>

            <p className="research-body mb-6">
                <strong>Our advice on dates:</strong> show the years in each role. That&apos;s honest, and it helped in the largest test. Hiding dates altogether tends to raise the question you&apos;re trying to answer, and applications and background checks will ask for them anyway. Be ready to <ResearchLink to="career-breaks">tell the story behind the gap in a sentence or two</ResearchLink> when someone asks.
            </p>

            <ArticleBridge question="What question does your resume leave open?">
                If a gap or a pivot is the question your resume leaves open, the write-up says so in plain words, and the gap gets a card of its own: an honest dated line with the blank for what you were doing, never a story invented for you.
            </ArticleBridge>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>These are audit studies: fictitious resumes and callbacks, not hires.</li>
                <li>The industry-switch figure comes from an unpublished paper with small groups past six months.</li>
                <li>The studies span the UK, the US, Sweden, and Switzerland, and results differed by field and skill level.</li>
                <li>The UK experiment changed the resume and cover letter together, and tested caregiving gaps for mothers.</li>
            </ul>
        </AnswerArticle>
    );
}
