import { pageMetadata } from "@/lib/seo/metadata";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { ReferralHiringShareDiagram } from "@/components/research/diagrams/ReferralHiringShareDiagram";
import { ReferralOfferOddsDiagram } from "@/components/research/diagrams/ReferralOfferOddsDiagram";
import { ReferralQuantifiedDiagram } from "@/components/research/diagrams/ReferralQuantifiedDiagram";

const PATH = "/research/referral-advantage";

export const metadata = pageMetadata({
    path: PATH,
    title: "Do job referrals really help? What hiring data shows",
    description: "Referrals are a sliver of applications and a large share of hires. What the studies and hiring data show, and what a referral still can't do for you.",
    type: "article",
});

export default function ReferralAdvantagePage() {
    return (
        <ResearchArticle
            path={PATH}
            header={{
                tag: "Referrals",
                title: "What a referral changes",
                description: "A referral gets your resume read by someone who is already leaning in. Across studies and hiring data, that shows up as far better odds at every stage.",
                readTime: "7 min read"
            }}
            keyFinding={{
                subtitle: "What the hiring data shows",
                stat: "40% vs. 3%",
                statDescription: (
                    <>
                        Across more than 38 million applications in one recruiting-software company&apos;s data, 40% of referred applications reached an interview. Of applications sent in cold, 3% did.
                        <Citation id="source-2">2</Citation>
                    </>
                ),
                source: {
                    text: "Ashby (recruiting software vendor), customer data 2021 to 2024",
                    href: "https://www.ashbyhq.com/talent-trends-report/reports/referrals"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">A sliver of applications, a big share of hires</h2>
                    <p className="research-body mb-6">
                        Economists at the New York Fed followed 62,127 applications to jobs posted from 2006 to 2010 at one US financial services company with 2,000 to 5,000 employees. Employee referrals were 6% of the applications and 29% of the hires. Job boards went the other way: 60% of applications, 24% of hires.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <ReferralHiringShareDiagram figureNumber={1} />
                    <p className="research-body mb-6">
                        After accounting for the job and the applicant pool, referred applications were 7.3 percentage points more likely to lead to an interview than job-board applications. Once interviewed, referred candidates were 14 points more likely to get an offer.
                        <Citation id="source-1">1</Citation>
                    </p>
                </>
            }
            productTieIn={{
                title: "Before you send it to your referrer",
                items: [
                    {
                        title: "Read the Verdict first",
                        description: "A referral buys you a real read. The Verdict sums up what your resume says first, so check it before someone puts their name next to yours."
                    },
                    {
                        title: "Fix the Critical Miss",
                        description: "Your referrer can vouch for you. They can't fix your resume. The Critical Miss is the one thing to fix first, so fix it before you send it."
                    }
                ]
            }}
            relatedArticles={[
                { title: "What recruiters notice in the first pass", href: "/research/how-recruiters-read", tag: "Perception" },
                { title: "Show what changed and your part in it", href: "/research/quantifying-impact", tag: "Impact" },
                { title: "What makes a LinkedIn profile easier to find", href: "/research/linkedin-visibility", tag: "Referrals" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Do Informal Referrals Lead to Better Matches? Evidence from a Firm's Employee Referral System",
                    publisher: "Brown, Setren & Topa. Journal of Labor Economics 34(1); earlier as New York Fed Staff Report 568",
                    year: "2016",
                    href: "https://doi.org/10.1086/682338"
                },
                {
                    id: "source-2",
                    title: "Are referred candidates more likely to get hired?",
                    publisher: "Ashby Talent Trends Report (vendor data). 38M+ applications across 93,000 jobs",
                    year: "2025",
                    href: "https://www.ashbyhq.com/talent-trends-report/reports/referrals"
                },
                {
                    id: "source-3",
                    title: "The Value of Hiring through Employee Referrals",
                    publisher: "Burks, Cowgill, Hoffman & Housman. Quarterly Journal of Economics 130(2)",
                    year: "2015",
                    href: "https://doi.org/10.1093/qje/qjv010"
                },
                {
                    id: "source-4",
                    title: "Why the Referential Treatment? Evidence from Field Experiments on Referrals",
                    publisher: "Pallais & Sands. Journal of Political Economy 124(6); earlier as NBER Working Paper 21357",
                    year: "2016",
                    href: "https://www.nber.org/papers/w21357"
                }
            ]}
            faq={[
                {
                    question: "Does a referral guarantee an interview?",
                    answer: "No. In the hiring data above, most referred candidates still didn't reach an interview. A referral gets you a real look. The resume has to earn the next step."
                },
                {
                    question: "Is a referral from someone I barely know worth asking for?",
                    answer: "It's worth something, because it usually gets you out of the pile. It's worth much more from someone who has seen your work and will say so."
                },
                {
                    question: "What should I send the person referring me?",
                    answer: "The job link, your resume, and two or three sentences on why you fit the role. Write it so they can paste it straight into the referral form."
                }
            ]}
        >
            <h2 className="research-h2">The gap grew as hiring slowed</h2>
            <p className="research-body mb-6">
                Ashby, a recruiting software company, tracked offer rates by source from late 2021 to late 2024, a stretch when hiring cooled, especially in tech. Both rates fell. Referred applications went from a 12.1% offer rate to 7.3%, roughly 1 in 8 to 1 in 14. Cold applications went from 0.7% to 0.2%, roughly 1 in 140 to 1 in 500.
                <Citation id="source-2">2</Citation>
            </p>
            <ReferralOfferOddsDiagram figureNumber={2} />
            <p className="research-body mb-6">
                By our arithmetic from those rates, a referral&apos;s edge grew from about 17 times the cold rate to somewhere around 30 to 50 times. Ashby rounds the late cold rate to 0.2%, so the second figure can&apos;t be pinned down more closely. <strong>Our take:</strong> that matches a slow market from the recruiter&apos;s side. There are so many applications per role that a referral is how you get out of the pile.
            </p>
            <p className="research-body mb-6">
                The edge isn&apos;t only about referred people looking stronger on paper. Across nine large firms in call centers, trucking, and high tech, referred applicants were more likely to be hired and to accept offers, even though the two groups had similar skill characteristics.
                <Citation id="source-3">3</Citation>
            </p>

            <h2 className="research-h2">What a referral changes on the recruiter&apos;s desk</h2>
            <p className="research-body mb-6">
                <strong>Our take:</strong> this section is Matt Shaw&apos;s experience from years of receiving referrals as a recruiter, not a finding from the studies above.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    title="A person reads it"
                    desc="A referral gets pulled out of the pile and read by someone. Cold applications don't always get that."
                />
                <ArticleInsight
                    title="Borderline gets a call"
                    desc="A resume that sits right on the line often gets a screening call when it's referred. Cold, the same resume usually gets a no."
                />
                <ArticleInsight
                    title="Who refers you matters"
                    desc="“I worked with her, she's excellent” from a trusted teammate carries real weight. A referral click from someone you met once carries much less."
                />
                <ArticleInsight
                    title="The resume still decides"
                    desc="Once it's open, it gets the same first read as everyone else's. A referral gets you a hearing. It doesn't pass the read for you."
                />
            </div>

            <h2 className="research-h2">Why employers lean on them</h2>
            <p className="research-body mb-6">
                Referrals tell employers things a resume can&apos;t. In field experiments on an online job site, referred workers did better work and were more likely to want to stay on than workers with similar profiles. The effect was strongest when the referrer was a strong performer who knew the person well.
                <Citation id="source-4">4</Citation>
            </p>
            <ReferralQuantifiedDiagram figureNumber={3} />
            <p className="research-body mb-6">
                The larger studies agree on staying power. Referred hires were less likely to quit across the nine firms, and somewhat less likely to leave the company the New York Fed studied, though that result was weaker.
                <Citation id="source-3">3</Citation>
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">How to get a referral worth having</h2>
            <p className="research-body mb-6">
                <strong>Ask people who&apos;ve seen your work.</strong> Former managers, teammates, and clients can say what you did. That&apos;s the kind of referral that changes a decision.
            </p>
            <p className="research-body mb-6">
                <strong>Be specific.</strong> &ldquo;I&apos;m looking for a senior PM role at a growth-stage fintech&rdquo; lets someone spot the opening for you. &ldquo;Let me know if you hear of anything&rdquo; doesn&apos;t.
            </p>
            <p className="research-body mb-6">
                <strong>Write the blurb for them.</strong> Send the job link, your resume, and a few sentences they can paste in, like: &ldquo;We worked on the finance-system migration together. She led the data cleanup that shortened our month-end close.&rdquo; Stick to things they saw firsthand, and make it easy for them to say no.
            </p>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>The New York Fed study covers one financial services company. The nine-firm study covers call centers, trucking, and high tech.</li>
                <li>Ashby&apos;s figures are vendor data from companies that use its software, which the report doesn&apos;t describe. They show what happened, not what caused it: people who get referred may differ in other ways.</li>
                <li>The field experiments ran on an online job site, not in corporate hiring.</li>
            </ul>
        </ResearchArticle>
    );
}
