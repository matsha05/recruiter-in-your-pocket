import { pageMetadata } from "@/lib/seo/metadata";
import { ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { AnswerArticle, ArticleBridge } from "@/components/research/AnswerArticle";
import { ResearchLink } from "@/components/research/ResearchLink";
import Link from "next/link";
import { comparison } from "@/components/compare/comparisons";

const PATH = "/research/human-vs-algorithm";

export const metadata = pageMetadata({
    path: PATH,
    title: "When AI weighs in on my resume, do recruiters listen?",
    description: "In a resume-screening experiment, recruiters said they trusted human advice more, but the algorithm's advice influenced their choices more.",
    type: "article",
});

export default function HumanVsAlgorithmPage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    More than they say. Recruiters rated human advice as more trustworthy, yet an algorithm&rsquo;s pick for the less-suitable resume still pulled their ratings toward it.
                    The same advice from a human expert didn&rsquo;t.
                </>
            }
            answerSource={{
                text: <>From an experiment with 694 French recruitment professionals recruited through an online panel (Lacroux &amp; Martin-Lacroux, Frontiers in Psychology, 2022).</>,
                href: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.895997/full",
            }}
            nextQuestions={["ats-myths", "automation-and-bias", "how-recruiters-read"]}
            visualization={
                <>
                    <h2 className="research-h2">What people said versus what they did</h2>
                    <p className="research-body mb-6">
                        Recruiters reviewed two resume summaries for an HR manager role, with no recommendation or one from a human expert or a fictional algorithmic system. Some recommendations favored the less-suitable resume.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 not-prose">
                        <ArticleInsight
                            title="What they reported"
                            desc="Human recommendations were rated as more trustworthy, including when the recommendation was inconsistent."
                        />
                        <ArticleInsight
                            title="What changed their choices"
                            desc="Compared with the control group, the inconsistent algorithmic recommendation influenced evaluations; the inconsistent human recommendation did not."
                        />
                    </div>
                </>
            }
            sources={[
                {
                    id: "source-1",
                    title: "Should I Trust the Artificial Intelligence to Recruit? Recruiters' Perceptions and Behavior When Faced With Algorithm-Based Recommendation Systems During Resume Screening",
                    publisher: "Frontiers in Psychology",
                    year: "2022",
                    href: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.895997/full"
                }
            ]}
        >
            <h2 className="research-h2">The result was not simple algorithm aversion</h2>
            <p className="research-body mb-6">
                The gap between what recruiters said and what they did matters. Stated skepticism is not the same as resistance in the moment. A tool can look less trustworthy and still change a decision, and that includes <Link href={comparison("rezi").path} className="focus-ring riyp-link">a builder&rsquo;s live score that rates your resume as you type</Link>.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                A resume tool should explain its recommendations so you can check them. Trusting a tool less does not necessarily protect you from following a weak suggestion. Most hiring software offers no such explanation: one review found that <ResearchLink to="automation-and-bias">the tools rarely make the final decision but often automate rejections along the way</ResearchLink>.
            </p>

            <h2 className="research-h2">What this means in practice</h2>
            <p className="research-body mb-6">
                <strong>Our advice:</strong> compare a suggested change with the original resume and the job you want. Keep it only if it makes your experience clearer without adding facts or overstating your contribution. Treat a match score the same way: <ResearchLink to="ats-myths">applicant tracking systems pull your text into fields, and automatic rejection runs on application questions, not on your resume</ResearchLink>.
            </p>
            <p className="research-body mb-6">
                Make your evidence easy to inspect, too: clear role context, specific ownership, supportable outcomes, and no claims you can&apos;t defend. That is the part of the page a reader weighs: <ResearchLink to="how-recruiters-read">recruiters who spent longer on Experience were more likely to move a resume forward</ResearchLink>.
            </p>

            <ArticleBridge question="Can you check the advice you’re given?">
                Your report&apos;s band sums up the written findings. Read those first: the band on its own can&apos;t tell you what to change. Every fix points to a line on your resume, so you can compare it with what you actually did before you take it.
            </ArticleBridge>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>The authors reported small effects and cautioned that the task was subjective and hard to separate from participants&apos; own judgments.</li>
                <li>One simulated task, judged by a French online panel. It doesn&apos;t establish how every recruiter or production system behaves.</li>
            </ul>
        </AnswerArticle>
    );
}
