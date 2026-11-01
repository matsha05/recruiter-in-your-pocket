import { pageMetadata } from "@/lib/seo/metadata";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { MetaTimeline } from "@/components/research/diagrams/MetaTimeline";

const PATH = "/research/hiring-discrimination-meta-analysis";

export const metadata = pageMetadata({
    path: PATH,
    title: "Racial discrimination in hiring: what field experiments show",
    description: "A review of US hiring experiments found persistent racial discrimination against applicants with comparable qualifications. What a resume can and can't control.",
    type: "article",
});

export default function DiscriminationMetaPage() {
    return (
        <ResearchArticle
            path={PATH}
            header={{
                tag: "Industry analysis",
                title: "Discrimination in hiring hasn't gone away",
                description: "A review of US hiring experiments found persistent racial discrimination, even when applicants had comparable qualifications.",
                readTime: "5 min read"
            }}
            keyFinding={{
                subtitle: "The trend",
                stat: "36% more callbacks",
                statDescription: (
                    <>
                        In 24 US field experiments from 1989 to 2015, white applicants got 36% more callbacks than equally qualified Black applicants, with no significant decline over that time. The gap for Latino applicants was 24%, with modest evidence of decline.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Quillian, Pager, Hexel & Midtbøen (2017)",
                    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5642692/"
                }
            }}
            visualization={
                <>
                    <h2 className="research-h2">What a better resume cannot fix</h2>
                    <p className="research-body mb-6">
                        These experiments sent comparable resumes, or trained testers matched to apply in person. The gap came from how applicants were treated, not from what their applications said. Our read: a better resume can&apos;t close it.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <MetaTimeline />
                </>
            }
            productTieIn={{
                title: "What your report can and can't tell you",
                items: [
                    {
                        title: "It can't explain a rejection",
                        description: "No resume report can tell you why you were turned down, or whether bias played a part."
                    },
                    {
                        title: "It can clear up avoidable doubt",
                        description: "Your Critical Miss is the one thing to fix first on the page. Fixing it won't close a gap that lives in the hiring process itself."
                    }
                ]
            }}
            relatedArticles={[
                { title: "Where automation enters hiring", href: "/research/automation-and-bias", tag: "Systems" },
                { title: "What recruiters trust and what they follow", href: "/research/human-vs-algorithm", tag: "Trust" },
                { title: "What a referral changes", href: "/research/referral-advantage", tag: "Strategy" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "Meta-analysis of field experiments shows no change in racial discrimination in hiring over time",
                    publisher: "Proceedings of the National Academy of Sciences",
                    year: "2017",
                    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5642692/"
                },
                {
                    id: "source-2",
                    title: "Help Wanted: An Examination of Hiring Algorithms, Equity, and Bias",
                    publisher: "Upturn",
                    year: "2018",
                    href: "https://www.upturn.org/work/help-wanted/"
                },
                {
                    id: "source-3",
                    title: "Systemic Discrimination Among Large U.S. Employers",
                    publisher: "Kline, Rose & Walters. Quarterly Journal of Economics 137(4)",
                    year: "2022",
                    href: "https://doi.org/10.1093/qje/qjac024"
                },
                {
                    id: "source-4",
                    title: "Trends in racial and ethnic discrimination in hiring in six Western countries",
                    publisher: "Quillian & Lee. Proceedings of the National Academy of Sciences 120(6)",
                    year: "2023",
                    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9963383/"
                }
            ]}
            faq={[
                {
                    question: "Does a better resume eliminate discrimination?",
                    answer: "No. Clearer writing can help someone understand your experience. It cannot remove discrimination from hiring decisions."
                },
                {
                    question: "Why include this in a resume product?",
                    answer: "Useful guidance has to name its limits. That helps candidates focus on what they can change without turning every rejection into self-blame."
                },
                {
                    question: "What can I control?",
                    answer: "You can make your experience clear, consistent, specific, and easy to verify."
                }
            ]}
        >
            <h2 className="research-h2">What a rejection cannot tell you</h2>
            <p className="research-body mb-6">
                A rejection does not, by itself, tell you what was wrong with your resume. These experiments found different treatment of applicants with comparable qualifications.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                Our report can identify details that are missing or hard to understand. It cannot explain a particular employer&apos;s decision or assign responsibility for a rejection to the candidate.
            </p>
            <p className="research-body mb-6">
                The Upturn report describes additional risks when automated tools affect advertising, screening, and ranking. Those are risks employers and platform operators need to address; resume edits are not a remedy.
                <Citation id="source-2">2</Citation>
            </p>

            <h2 className="research-h2">What newer studies found</h2>
            <p className="research-body mb-6">
                The meta-analysis stops in 2015. Between 2019 and 2021, economists sent 83,643 fictitious applications to entry-level jobs at 108 of the largest US employers. Applications with distinctively Black names were 2.1 percentage points less likely to hear back within 30 days, 23.0% against 25.1%. That study measured any contact from the employer, not callbacks, so its gap isn&apos;t directly comparable to the 36%.
                <Citation id="source-3">3</Citation>
            </p>
            <p className="research-body mb-6">
                A 2023 update of the meta-analysis, adding US studies through 2019, again found little change in the United States.
                <Citation id="source-4">4</Citation>
            </p>

            <h2 className="research-h2">Focus on what you can change</h2>
            <p className="research-body mb-6">
                You can improve how clearly your resume shows your experience. You cannot remove bias from the hiring process. Good advice should help with the first without pretending it solves the second.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Resume quality is only one factor"
                    desc="We can help you present your experience clearly. We won't pretend every hiring outcome is under your control."
                />
            </div>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>These are US field experiments, pooling resume audits with in-person audits. Most measured callbacks, the first response, not who got hired.</li>
                <li>The meta-analysis ends in 2015. The newer studies above use different measures, so their numbers don&apos;t line up exactly with it.</li>
                <li>Callback gaps for other groups and other countries need their own evidence.</li>
            </ul>
        </ResearchArticle>
    );
}
