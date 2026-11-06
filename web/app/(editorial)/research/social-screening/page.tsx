import { pageMetadata } from "@/lib/seo/metadata";
import { ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { AnswerArticle, ArticleBridge } from "@/components/research/AnswerArticle";
import { ResearchLink } from "@/components/research/ResearchLink";
import { SocialScreeningDiagram } from "@/components/research/diagrams/SocialScreeningDiagram";

const PATH = "/research/social-screening";

export const metadata = pageMetadata({
    path: PATH,
    title: "Will employers judge me by my social media?",
    description: "Social media content changed candidate ratings in one experiment. What the study didn't test, and why a review questions the fairness of social screening.",
    type: "article",
});

export default function SocialScreeningPage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    In one experiment, posts changed how candidates were rated. Unappealing posts cut ratings the most, and having no social profile at all cost more than posts suggesting mental-health problems.
                    Nobody showed those ratings predict how you&rsquo;d do the job.
                </>
            }
            answerSource={{
                text: <>From a screening experiment with 1,500 US online evaluators and 500 people with hiring experience (Baker, Grimm &amp; Ofek-Shanny). It&rsquo;s a working paper, not yet peer reviewed.</>,
                href: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4295354",
                linkLabel: "Read the paper",
            }}
            painNote="Deleting everything isn’t as safe as it feels."
            nextQuestions={["linkedin-visibility", "who-you-are", "referral-advantage"]}
            visualization={
                <>
                    <h2 className="research-h2">What a public profile can and cannot show</h2>
                    <p className="research-body mb-6">
                        The evidence supports a real effect on judgment. It does not support treating a public feed as a reliable personality test or a proven measure of future performance.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </p>
                    <SocialScreeningDiagram />
                </>
            }
            sources={[
                {
                    id: "source-1",
                    title: "To Be or Not to Be on Social Media: How Social Media Content Impacts Recruitment",
                    publisher: "Baker, Grimm & Ofek-Shanny. SSRN working paper, not yet peer reviewed",
                    year: "2022; revised 2024",
                    href: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4295354"
                },
                {
                    id: "source-2",
                    title: "Social Media Screening and Procedural Justice: Towards Fairer Use of Social Media in Selection",
                    publisher: "Vosen. Employee Responsibilities and Rights Journal 33(4), via PubMed Central",
                    year: "2021",
                    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8055055/"
                }
            ]}
        >
            <h2 className="research-h2">What the experiment actually showed</h2>
            <p className="research-body mb-6">
                Evaluators rated candidates for an office manager job in hospitality while the researchers varied what the candidate&apos;s social media showed. On a 0–10 scale, the general pool marked down unappealing content by 1.94 points, having no profile at all by 0.88, signs of mental-health problems by 0.68, and a two-year unemployment gap by 0.29. People with hiring experience showed the same order.
                <Citation id="source-1">1</Citation>
                {" "}A gap cost the least here, and <ResearchLink to="gaps-and-pivots">in the largest test of ways to handle one, explaining it did no better than leaving it unexplained</ResearchLink>.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="What was observed"
                    desc={
                        <>
                            Public social cues changed candidate ratings in the experimental setting.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="What was not tested"
                    desc={
                        <>
                            The study did not establish that those ratings predicted later job performance.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
            </div>

            <h2 className="research-h2">Why social screening can be unreliable</h2>
            <p className="research-body mb-6">
                A 2021 literature review by Eva Vosen concluded that social-media screening creates privacy, discrimination, and accuracy concerns when employers lack clear, consistent procedures.
                <Citation id="source-2">2</Citation>
            </p>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>A public post may be incomplete, old, decontextualized, or unrelated to the job.</li>
                <li>Profiles can expose protected characteristics before a structured review.</li>
                <li>Different reviewers may interpret the same content differently.</li>
            </ul>

            <h2 className="research-h2">What is worth doing</h2>
            <p className="research-body mb-6">
                <strong>Our advice:</strong> check the professional information you publish and decide what to keep private. The research does not identify a personal profile that every recruiter will interpret favorably. What a recruiter is trying to do with any of it is <ResearchLink to="who-you-are">say who you are in one line</ResearchLink>, so the public version and the resume should tell the same story.
            </p>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>Reconcile titles, dates, credentials, and public work links. <ResearchLink to="linkedin-visibility">Recruiters search the titles and skills in your headline and experience</ResearchLink>, so the public version should agree with the resume.</li>
                <li>Use privacy settings intentionally on personal accounts.</li>
                <li>Keep public work samples current when they are part of your candidacy.</li>
                <li>Link a portfolio when it shows work evidence your resume can&apos;t show on its own.</li>
            </ul>

            <ArticleBridge question="What does the page you control say?">
                Your report reads only the resume you send. It doesn&apos;t look up or score your social accounts, and hobbies, politics, and lifestyle don&apos;t go into your score.
            </ArticleBridge>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>The experiment is a working paper that hasn&apos;t been peer reviewed. It used one hospitality role and designed profile cues; it is not every hiring market. We read a July 2024 version.</li>
                <li>The experiment measured candidate ratings, not later performance.</li>
                <li>Employer practice varies. This article does not establish legal guidance for any jurisdiction.</li>
            </ul>
        </AnswerArticle>
    );
}
