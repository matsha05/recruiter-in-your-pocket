import { pageMetadata } from "@/lib/seo/metadata";
import { Citation } from "@/components/research/ResearchArticle";
import { AnswerArticle, ArticleBridge } from "@/components/research/AnswerArticle";
import { ResearchLink } from "@/components/research/ResearchLink";
import { ErrorImpactDiagram } from "@/components/research/diagrams/ErrorImpactDiagram";
import { InferenceLadderDiagram } from "@/components/research/diagrams/InferenceLadderDiagram";

const PATH = "/research/spelling-errors-impact";

export const metadata = pageMetadata({
    path: PATH,
    title: "Will one typo on my resume cost me the interview?",
    description: "What a 2020 experiment with 445 recruiters in Belgium found about spelling errors and hypothetical interview ratings, and why one typo isn't a reason to panic.",
    type: "article",
});

export default function SpellingErrorsPage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    Don&rsquo;t panic over one. Five spelling errors cost 1.85 points on a 0&ndash;10 interview rating in one experiment.
                    A single typo wasn&rsquo;t tested.
                </>
            }
            answerSource={{
                text: <>Five errors: −1.85 on a 0–10 interview rating, from an experiment with 445 hiring professionals (Sterkens et al., PLOS ONE, 2023).</>,
                href: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0283280",
            }}
            nextQuestions={["writing-quality-hire-probability", "how-recruiters-read", "resume-length-myths"]}
            visualization={
                <>
                    <h2 className="research-h2">What the experiment actually tested</h2>
                    <p className="research-body mb-6">
                        In April 2020, 445 recruiters in Flanders, Belgium, rated Dutch-language resumes from recent graduates with zero, two, or five spelling errors, across eight occupations. Both error conditions lowered the hypothetical interview rating, with a larger penalty at five errors.
                        <Citation id="source-1">1</Citation>
                    </p>
                    <ErrorImpactDiagram figureNumber={1} />
                </>
            }
            sources={[
                {
                    id: "source-1",
                    title: "Costly mistakes: Why and when spelling errors in resumes jeopardise interview chances",
                    publisher: "Sterkens, Caers, De Couck, Van Driessche, Geamanu & Baert. PLOS ONE",
                    year: "2023",
                    href: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0283280"
                }
            ]}
        >
            <h2 className="research-h2">The penalty grows when errors become a pattern</h2>
            <p className="research-body mb-6">
                The two-error penalty was about the same across applicants, jobs, and recruiters. The five-error penalty varied: it was larger among recruiters who care more about language, and smaller for jobs that require more education and for applicants who listed volunteer work. A larger penalty for jobs with heavy writing demands was borderline.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                Recruiters also rated applicants with repeated errors lower on interpersonal skills, conscientiousness, and mental ability.
                <Citation id="source-1">1</Citation>
            </p>

            <div className="not-prose my-10">
                <InferenceLadderDiagram figureNumber={2} />
            </div>

            <h2 className="research-h2">What this does and does not justify</h2>
            <p className="research-body mb-6">
                It justifies a careful spelling pass. It does not justify pretending one typo always ends the process, extending a Dutch-language result from Belgium to every language or labor market, or treating error-free writing as proof of job performance.
                <Citation id="source-1">1</Citation>
                {" "}It also can&apos;t say whether spelling matters more than content: the study kept the content the same and changed only the spelling. What it shows is that repeated errors cost points even when the experience on the page is identical. It fits what a much larger experiment found when only the wording changed: <ResearchLink to="writing-quality-hire-probability">grammar fixes on short freelance profiles lifted hires from 3.1% to 3.3%</ResearchLink>.
            </p>

            <h2 className="research-h2">What to fix first</h2>
            <p className="research-body mb-6">
                <strong>Our advice:</strong> the study tested spelling only, and the section a recruiter weighs is Experience: in the strongest eye-tracking study, <ResearchLink to="how-recruiters-read">recruiters who spent longer on Experience were more likely to move a resume forward</ResearchLink>. Fix what that section says, then run these checks.
            </p>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>Spelling and grammar consistency.</li>
                <li>Date alignment and spacing.</li>
                <li>Repeated tense shifts inside a single role.</li>
                <li>Punctuation, read in the final file.</li>
            </ul>

            <ArticleBridge question="What’s worth fixing before the typos?">
                Your report isn&apos;t a spell-checker. It cards the lines a recruiter trips on, in the order they hit them. Run a spell-check last, after you&apos;ve worked through the cards.
            </ArticleBridge>
        </AnswerArticle>
    );
}
