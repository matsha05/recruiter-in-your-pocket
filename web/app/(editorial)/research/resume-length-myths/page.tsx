import { pageMetadata } from "@/lib/seo/metadata";
import { Citation } from "@/components/research/ResearchArticle";
import { AnswerArticle, ArticleBridge } from "@/components/research/AnswerArticle";
import { PageTwoGateDiagram } from "@/components/research/diagrams/PageTwoGateDiagram";

const PATH = "/research/resume-length-myths";

export const metadata = pageMetadata({
    path: PATH,
    title: "Does my resume really have to fit on one page?",
    description: "One study favored two-page resumes for entry-level accountants. It doesn't settle the best length for every role. What it does and doesn't say.",
    type: "article",
});

export default function ResumeLengthPage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    No. In one national study, recruiters at major accounting firms ranked two-page versions of strong entry-level resumes above one-page versions.
                    It&rsquo;s one narrow, dated test, so the useful rule is simpler: use a second page when it adds experience that matters for the role.
                </>
            }
            answerSource={{
                text: <>From a 2001 study that mailed resumes to 570 CPA recruiters (Blackburn-Brockman &amp; Belanger). We could read only its abstract.</>,
                href: "https://journals.sagepub.com/doi/abs/10.1177/002194360103800104",
                linkLabel: "Read the abstract",
            }}
            painNote="If you’ve shrunk the margins to make it fit, this one’s for you."
            nextQuestions={["how-recruiters-read", "star-method", "quantifying-impact"]}
            visualization={
                <>
                    <h2 className="research-h2">When to use a second page</h2>
                    <p className="research-body mb-6">
                        Put your most relevant experience on page one. Consider a second page when it adds useful work, projects, or qualifications that would otherwise be cut. This is editing advice, not a finding tested across every role.
                    </p>
                    <PageTwoGateDiagram />
                </>
            }
            sources={[
                {
                    id: "source-1",
                    title: "One Page or Two?: A National Study of CPA Recruiters' Preferences for Resume Length",
                    publisher: "The Journal of Business Communication",
                    year: "2001",
                    href: "https://journals.sagepub.com/doi/abs/10.1177/002194360103800104"
                }
            ]}
        >
            <h2 className="research-h2">What the study actually tested</h2>
            <p className="research-body mb-6">
                Researchers created one-page and two-page versions of resumes for four fictitious, highly qualified graduating accounting students. They mailed mixed sets to 570 personnel recruiters at major accounting firms and asked respondents to rank the candidates as if they were hiring for entry-level roles.
                <Citation id="source-1">1</Citation>
            </p>
            <p className="research-body mb-6">
                The two-page versions ranked more favorably. That is useful because it contradicts the claim that a second page is automatically harmful. It does not establish that two pages are better in every market.
                <Citation id="source-1">1</Citation>
            </p>

            <h2 className="research-h2">What it does not settle</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>The study covered entry-level accounting candidates, not every role or career stage.</li>
                <li>Recruiters ranked supplied resumes. The study did not measure real callbacks, interviews, or hires.</li>
                <li>The study was published in 2001, 25 years ago, when the firms were still the &ldquo;Big Six&rdquo; and before today&apos;s digital application workflow.</li>
            </ul>

            <h2 className="research-h2">A better editing rule</h2>
            <p className="research-body mb-6">
                <strong>Our take:</strong> use the shortest version that preserves the evidence a reviewer needs. Put the experience and results most relevant to the role on page one. Use page two for additional work only when it adds useful scope, depth, or context.
            </p>
            <p className="research-body">
                Every line should pass a simpler test: &quot;Does this help a reviewer understand my fit for this role?&quot;
            </p>

            <h2 className="research-h2">Make the important details easy to find</h2>
            <p className="research-body mb-6">
                If page two repeats earlier points, combine them. If an older role does not help explain your qualifications for this job, shorten it. Check that your recent responsibilities and strongest results remain easy to find.
            </p>

            <ArticleBridge question="Which lines are earning their space?">
                Your report reads for relevance, scope, ownership, and results. Page count isn&apos;t a shortcut in your score. It reads your text, not your PDF&apos;s layout, so open the final file at 100% and check the density yourself.
            </ArticleBridge>

            <h2 className="research-h2">Limitations</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li>This is a peer-reviewed study, but its setting is narrow and dated.</li>
                <li>Packets went to 570 recruiters. We could read only the abstract, which doesn&apos;t say how many replied; the full paper is paywalled.</li>
                <li>Use the finding to reject a rigid one-page rule, not to replace it with a rigid two-page rule.</li>
            </ul>
        </AnswerArticle>
    );
}
