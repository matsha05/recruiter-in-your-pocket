import { pageMetadata } from "@/lib/seo/metadata";
import { ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { AnswerArticle, ArticleBridge } from "@/components/research/AnswerArticle";
import { ResearchLink } from "@/components/research/ResearchLink";
import { SignalClarityDiagram } from "@/components/research/diagrams/SignalClarityDiagram";

const PATH = "/research/writing-quality-hire-probability";

export const metadata = pageMetadata({
    path: PATH,
    title: "Can better writing actually get me hired?",
    description: "What a large field experiment found when freelancers got spelling and grammar suggestions on their profiles, and what it can't tell you about a resume.",
    type: "article",
});

// Figures: Wiles, Munyikwa & Horton, NBER w30886 (revised October 2023), Table 1 (sample flow,
// 70-word mean profile, 18.3% from the US, UK, Canada or Australia), Table 4 (control hire rate
// 3.093%, treatment +0.247 points) and Section 4.4 (95% CI 3%–13%). The Management Science
// version (2025) reports the same 8% in its abstract; its full text is paywalled.
export default function WritingQualityHireProbabilityPage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    It helped in one big experiment. New freelancers whose profile text was checked by a grammar tool were hired 8% more often in their first 28 days: 3.3% against 3.1%.
                    Only the writing changed, not anyone&rsquo;s experience.
                </>
            }
            answerSource={{
                text: <>From a randomized experiment on a freelance marketplace: 480,948 jobseekers randomized, 194,700 profiles analyzed (Wiles, Munyikwa &amp; Horton, Management Science, 2025).</>,
                href: "https://doi.org/10.1287/mnsc.2024.04528",
            }}
            painNote="Good work can lose to a clumsy sentence."
            nextQuestions={["how-recruiters-read", "quantifying-impact", "spelling-errors-impact"]}
            visualization={
                <>
                    <h2 className="research-h2">What changed, and what did not</h2>
                    <p className="research-body mb-6">
                        The tool changed the writing, not anyone&apos;s experience. The researchers&apos; model offers an explanation: clearer writing can help employers recognize ability that was already there.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <SignalClarityDiagram />
                </>
            }
            sources={[
                {
                    id: "source-1",
                    title: "Algorithmic Writing Assistance on Jobseekers’ Resumes Increases Hires",
                    publisher: "Wiles, Munyikwa & Horton. Management Science 71(12); earlier as NBER Working Paper 30886",
                    year: "2025",
                    href: "https://doi.org/10.1287/mnsc.2024.04528"
                }
            ]}
        >
            <h2 className="research-h2">What the experiment tested</h2>
            <p className="research-body mb-6">
                In June and July 2021, a large online freelance marketplace randomly gave about half of its new jobseekers a writing tool inside the profile box. It underlined errors and suggested fixes for spelling, grammar, punctuation, and word choice. It wasn&apos;t generative: it couldn&apos;t be prompted, and it couldn&apos;t write anything for them.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                The profile served as the resume, and it was short: about 70 words on average. More than 80% of the jobseekers were based outside the US, the UK, Canada, and Australia.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">What the experiment found</h2>
            <p className="research-body mb-6">
                In the control group, 3.1% of jobseekers were hired within their first 28 days. With the tool, 3.3% were. That&apos;s an 8% relative increase, with a 95% confidence interval of 3% to 13%. Treated jobseekers didn&apos;t send more applications, and the study found no evidence that employers were less satisfied with them, which argues against the idea that better writing merely disguised weaker candidates. The direction matches a recruiter experiment that varied only the spelling: <ResearchLink to="spelling-errors-impact">five spelling errors cost 1.85 points on a 0&ndash;10 interview rating</ResearchLink>.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                Of the 480,948 jobseekers randomized, the analysis covers the 194,700 whose profiles were submitted, approved by the platform, and not empty. The tool didn&apos;t change who submitted a profile or who was approved.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">What the tool helped employers see</h2>
            <p className="research-body mb-6">
                The researchers think clearer writing helped employers see ability that was already there. That&apos;s their best explanation, not something they measured directly.
                <Citation id="source-1">1</Citation>
            </p>

            <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
                <ArticleInsight
                    title="Relevant experience is easier to understand"
                    desc={
                        <>
                            Better writing can help an employer recognize ability that the profile was obscuring.
                            <Citation id="source-1">1</Citation>
                            {" "}On a full resume that ability lives in Experience, <ResearchLink to="how-recruiters-read">the section where longer looks went with moving a resume forward</ResearchLink>.
                        </>
                    }
                />
                <ArticleInsight
                    title="Clearer writing still needs accurate facts"
                    desc="Our advice: use wording that explains your actual experience. Don't add an achievement just because it makes a sentence sound stronger."
                />
            </div>
            <p className="research-body mb-6">
                <strong>Our advice:</strong> start with the most useful detail, <ResearchLink to="quantifying-impact">what changed, how you measured it, and what you did to get there</ResearchLink>, and cut phrases that repeat the role title or leave your responsibility unclear.
            </p>

            <ArticleBridge question="Which line buries what you did?">
                When a line buries what you did or what changed, the report quotes it and asks for the missing detail. We ask for the number or the scope. We don&apos;t make one up.
            </ArticleBridge>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>The setting is narrow: one freelance platform, short profiles, mostly non-native English writers, and hires within 28 days. Treat the 8% as evidence that writing matters, not as a promise for a full resume in salaried hiring.</li>
                <li>The absolute change is small, about a quarter of a percentage point.</li>
                <li>It can&apos;t tell you whether letting AI rewrite your resume helps: the tool only suggested corrections to what each person wrote. If you use a tool that writes for you, check every line against what you actually did.</li>
                <li>Two of the authors received funding from the platform where the experiment ran. None received funding from the company that made the writing tool.</li>
            </ul>
        </AnswerArticle>
    );
}
