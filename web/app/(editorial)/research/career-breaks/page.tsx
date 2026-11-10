import { pageMetadata } from "@/lib/seo/metadata";
import { Citation } from "@/components/research/ResearchArticle";
import { AnswerArticle, ArticleBridge } from "@/components/research/AnswerArticle";
import { ResearchLink } from "@/components/research/ResearchLink";
import { CareerBreakMoves, ResumeStrip, Spoken } from "@/components/research/CareerBreakMoves";

const PATH = "/research/career-breaks";

export const metadata = pageMetadata({
    path: PATH,
    title: "How do I explain a career break?",
    description: "What field experiments found about naming the reason for a career break, what to write and say about it, and where the evidence runs out.",
    type: "article",
});

// Matt asked for this page on Nov 6, 2026, when the report's gap advice was settled: honest options, "sabbatical"
// only for chosen time off. The studies found naming caregiving doesn't earn callbacks, so the page says that and
// keeps the advice honest and brief (Matt's call the same day). The interview part is our take: "the truth about
// it, what they kept sharp." Each move carries its own evidence in the margin; the body holds the naming studies.
export default function CareerBreaksPage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    Briefly, and only with what&rsquo;s true. Naming caregiving did no better than silence in the UK, and worse than a layoff in the US.
                    Keep the line plain and save the story for the interview.
                </>
            }
            answerSource={{
                text: <>From a preregistered UK experiment with 9,022 employers (Kristal et al., 2023) and a US audit of 3,407 applications (Weisshaar, 2018).</>,
                href: "https://doi.org/10.1038/s41562-022-01485-6",
            }}
            nextQuestions={["gaps-and-pivots", "asking-for-a-referral", "referral-advantage", "who-you-are"]}
            visualizationLabel="Three moves for a career break"
            visualization={
                <CareerBreakMoves
                    moves={[
                        {
                            title: "The line you write",
                            example: (
                                <ResumeStrip
                                    line={{ dates: "May 2024 – Present", entry: "Caregiving for a family member; finished a supply chain course" }}
                                    below={{ dates: "Mar 2019 – May 2024", entry: "Operations Manager, Miami Valley Distribution" }}
                                />
                            ),
                            body: (
                                <>
                                    Leave your last job&rsquo;s end date as it is. Then give the break its own line with what you did, in a few plain words: caregiving, a career break and what you did in it, study, or freelance work if it was real.
                                    Call it a sabbatical only if you chose the time off. A job search isn&rsquo;t a sabbatical, and neither is a layoff.
                                </>
                            ),
                            note: (
                                <>
                                    One change did raise callbacks in the UK test: listing years in each job instead of dates.
                                    <Citation id="source-3">3</Citation>
                                    {" "}Applications still ask for the dates.
                                </>
                            ),
                        },
                        {
                            title: "The sentences you say",
                            example: (
                                <Spoken>
                                    &ldquo;I took two years off to care for my dad, and that&rsquo;s settled now. I finished a supply chain course while I was out. This job is inbound scheduling across three sites, which is what I ran before, and I want it back.&rdquo;
                                </Spoken>
                            ),
                            body: (
                                <>
                                    The truth in a sentence, what you kept sharp, then why this job. No apology, and no more detail than you want to give.
                                    A health reason can stay private: &ldquo;I took time off for a health matter, and it&rsquo;s resolved&rdquo; is enough.
                                </>
                            ),
                            note: (
                                <>
                                    Our take, from fifteen years in hiring: tell the truth about it, and what you kept sharp. In one study, HR professionals read a long gap as low motivation more than anything else, so end on why you want this job.
                                    <Citation id="source-1">1</Citation>
                                </>
                            ),
                        },
                        {
                            title: "The person who vouches",
                            example: (
                                <Spoken>
                                    &ldquo;I worked with Dana for five years. She ran inbound scheduling for three warehouses. If she&rsquo;s looking, she&rsquo;s worth a call.&rdquo;
                                </Spoken>
                            ),
                            body: (
                                <>
                                    When nothing on the resume explains a long break, a former manager or teammate who saw your work can. Start with them, and start early.
                                </>
                            ),
                            note: (
                                <>
                                    <ResearchLink to="referral-advantage">Referred applicants got interviews far more often</ResearchLink> in one recruiting platform&rsquo;s data. For laid-off workers, contacts helped most early in the search.
                                    <Citation id="source-2">2</Citation>
                                </>
                            ),
                        },
                    ]}
                />
            }
            sources={[
                {
                    id: "source-1",
                    title: "Why Are Employers Put Off by Long Spells of Unemployment?",
                    publisher: "Van Belle, Di Stasio, Caers, De Couck & Baert. European Sociological Review 34(6); earlier as IZA DP 10876",
                    year: "2018",
                    href: "https://doi.org/10.1093/esr/jcy039",
                },
                {
                    id: "source-2",
                    title: "People I Know: Job Search and Social Networks",
                    publisher: "Cingano & Rosolia. Journal of Labor Economics 30(2)",
                    year: "2012",
                    href: "https://doi.org/10.1086/663357",
                },
                {
                    id: "source-3",
                    title: "Reducing discrimination against job seekers with and without employment gaps",
                    publisher: "Kristal, Nicks, Gloor & Hauser. Nature Human Behaviour 7",
                    year: "2023",
                    href: "https://doi.org/10.1038/s41562-022-01485-6",
                },
                {
                    id: "source-4",
                    title: "From Opt Out to Blocked Out: The Challenges for Labor Market Re-entry after Family-Related Employment Lapses",
                    publisher: "Weisshaar. American Sociological Review 83(1)",
                    year: "2018",
                    href: "https://doi.org/10.1177/0003122417752355",
                },
                {
                    id: "source-5",
                    title: "Sick and tell: A field experiment analyzing the effects of an illness-related employment gap on the callback rate",
                    publisher: "Namingit, Blankenau & Schwab. Journal of Economic Behavior & Organization 185",
                    year: "2021",
                    href: "https://doi.org/10.1016/j.jebo.2020.09.033",
                },
                {
                    id: "source-6",
                    title: "First depressed, then discriminated against?",
                    publisher: "Baert, De Visschere, Schoors, Vandenberghe & Omey. Social Science & Medicine 170",
                    year: "2016",
                    href: "https://doi.org/10.1016/j.socscimed.2016.06.033",
                },
                {
                    id: "source-7",
                    title: "The mark of mental health problems. A field experiment on hiring discrimination before and during COVID-19",
                    publisher: "Bjørnshagen. Social Science & Medicine 283",
                    year: "2021",
                    href: "https://doi.org/10.1016/j.socscimed.2021.114181",
                },
            ]}
        >
            <ArticleBridge question="What does the dates line on your resume say?">
                If your resume leaves time unaccounted for, the report lists it under Lines that need work, with the last date as you wrote it and a blank for what you did. It won&rsquo;t fill the blank in for you.
            </ArticleBridge>

            <h2 className="research-h2">What the tests found about naming the reason</h2>
            <p className="research-body mb-6">
                The UK experiment sent versions of one fictitious mother&apos;s application to 9,022 employers. With a gap of two and a half years, &ldquo;Left to become a full-time mother and look after my children&rdquo; got the same callbacks as the gap left unexplained.
                <Citation id="source-3">3</Citation>
            </p>
            <p className="research-body mb-6">
                A US audit sent 3,407 applications for professional jobs in 50 cities, each from a parent with an 18-month gap or none. &ldquo;Left to take care of my children&rdquo; got interview requests 4.9% of the time for mothers and 5.4% for fathers. &ldquo;Laid off due to downsizing&rdquo; got 9.7% and 8.8%, and no gap about 15%. The study had no unexplained gap to compare, so it can&apos;t say whether leaving the reason off would have done better.
                <Citation id="source-4">4</Citation>
            </p>
            <p className="research-body mb-6">
                Health reasons went both ways. In a US audit, &ldquo;I had a medical issue. It is now taken care of&rdquo; did a little better than no explanation.
                <Citation id="source-5">5</Citation>
                {" "}In Belgium, naming depression did no better or worse than saying nothing.
                <Citation id="source-6">6</Citation>
                {" "}In Norway, a year out for &ldquo;mental health challenges&rdquo; drew interview invitations 20.7% of the time, against 28.5% for a year of travel.
                <Citation id="source-7">7</Citation>
            </p>
            <p className="research-body mb-6">
                <strong>Our take:</strong> a few true words do the job. If the reason is health, &ldquo;Career break&rdquo; is true and enough. If you&rsquo;d rather say more, and it&rsquo;s behind you, say it&rsquo;s resolved. Spend the rest of the space on the work you did before the break and since.
            </p>

            <h2 className="research-h2">Leave off a stopgap job far below your level</h2>
            <p className="research-body mb-6">
                In one US experiment, <ResearchLink to="gaps-and-pivots">a recent job well below the applicant&apos;s skill level drew about as few callbacks as a year out of work</ResearchLink>. <strong>Our advice:</strong> list a course, a project, or freelance work in your field, and leave off work that reads like a step down. An application that asks for every job still gets the full list.
            </p>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>These are audit studies: fictitious applications, measured by callbacks, not hires.</li>
                <li>The UK caregiving test used one mother and one wording. The US test had no unexplained gap to compare.</li>
                <li>We found no study of what to say about a break in an interview, or of &ldquo;sabbatical,&rdquo; travel, or a gap year as labels. Those parts are our take.</li>
                <li>No study has tested whether a referral makes up for a gap. The contacts study followed workers laid off when their plants closed, not people returning from a break.</li>
                <li>The studies span the UK, the US, Belgium, Norway, and Italy, and different kinds of jobs.</li>
            </ul>
        </AnswerArticle>
    );
}
