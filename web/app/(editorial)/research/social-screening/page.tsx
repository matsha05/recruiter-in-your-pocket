import type { Metadata } from "next";
import { ResearchArticle, ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { SocialScreeningDiagram } from "@/components/research/diagrams/SocialScreeningDiagram";

export const metadata: Metadata = {
    title: "How Social Media Cues Changed Candidate Ratings | Hiring Research",
    description: "What one screening experiment and a systematic review found about candidate ratings, validity, and fairness.",
};

export default function SocialScreeningPage() {
    return (
        <ResearchArticle
            header={{
                tag: "Social screening",
                title: "How public social cues changed candidate ratings",
                description: "Social-media content affected ratings in one hiring experiment. That does not mean the ratings predicted job performance.",
                lastUpdated: "July 2026",
                readTime: "5 min read"
            }}
            keyFinding={{
                subtitle: "The useful finding",
                stat: "Social content changed candidate ratings",
                statDescription: (
                    <>
                        In a 2024 screening experiment, social-media cues changed candidate ratings across a broad evaluator pool and a second pool of experienced recruiters. The study did not test later job performance.
                        <Citation id="source-1">1</Citation>
                    </>
                ),
                source: {
                    text: "Baker, Grimm & Ofek-Shanny (2024)",
                    href: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4295354"
                },
                sampleSize: "1,500 general evaluators + 500 experienced recruiters"
            }}
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
            productTieIn={{
                title: "How this shows up in your report",
                items: [
                    {
                        title: "The submitted document only",
                        description: "The resume report evaluates the document you submit. It does not search or score personal social accounts."
                    },
                    {
                        title: "No personality inference",
                        description: "We do not turn hobbies, politics, or lifestyle cues into a candidate score."
                    }
                ]
            }}
            relatedArticles={[
                { title: "What Makes a LinkedIn Profile Easier to Find", href: "/research/linkedin-visibility", tag: "LinkedIn" },
                { title: "What Hiring Studies Show About Discrimination", href: "/research/hiring-discrimination-meta-analysis", tag: "Bias" },
                { title: "What a Referral Changes", href: "/research/referral-advantage", tag: "Context" }
            ]}
            sources={[
                {
                    id: "source-1",
                    title: "To Be or Not to Be on Social Media: How Social Media Content Impacts Recruitment",
                    publisher: "SSRN working paper",
                    year: "2024",
                    href: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4295354"
                },
                {
                    id: "source-2",
                    title: "Social Media Screening and Procedural Justice: Towards Fairer Use of Social Media in Selection",
                    publisher: "Employee Responsibilities and Rights Journal via PubMed Central",
                    year: "2021",
                    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8055055/"
                }
            ]}
            faq={[
                {
                    question: "Do recruiters check social media beyond LinkedIn?",
                    answer: "Some employers do. The evidence here shows that public social cues can affect ratings, but practice varies and the validity of those judgments is a separate question."
                },
                {
                    question: "Should I link a portfolio?",
                    answer: "Link it when it gives the reviewer useful work evidence that the resume cannot show on its own."
                },
                {
                    question: "What should I check on my public profiles?",
                    answer: "Check that titles, dates, credentials, and work links are accurate and consistent with your resume. Review the privacy settings on personal accounts and decide what you want to share."
                }
            ]}
        >
            <h2 className="research-h2">What the experiment actually showed</h2>
            <p className="research-body mb-6">
                Evaluators reviewed candidates for a hospitality role while the researchers varied the social-media information available. Hashtags and liked pages changed candidate ratings. The result persisted in the experienced-recruiter pool.
                <Citation id="source-1">1</Citation>
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
                A 2021 systematic review concluded that social-media screening creates privacy, discrimination, and accuracy concerns when employers lack clear, consistent procedures.
                <Citation id="source-2">2</Citation>
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>A public post may be incomplete, old, decontextualized, or unrelated to the job.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Profiles can expose protected characteristics before a structured review.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Different reviewers may interpret the same content differently.</li>
            </ul>

            <h2 className="research-h2">What is worth doing</h2>
            <p className="research-body mb-6">
                <strong>Our advice:</strong> check the professional information you publish and decide what to keep private. The research does not identify a personal profile that every recruiter will interpret favorably.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Reconcile titles, dates, credentials, and public work links.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Use privacy settings intentionally on personal accounts.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Keep public work samples current when they are part of your candidacy.</li>
            </ul>

            <h2 className="research-h2">Limitations</h2>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>The 2024 experiment used one hospitality role and designed profile cues; it is not every hiring market.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>The experiment measured candidate ratings, not later performance.</li>
                <li className="flex gap-2"><span className="text-muted-foreground/50">•</span>Employer practice varies. This article does not establish legal guidance for any jurisdiction.</li>
            </ul>
        </ResearchArticle>
    );
}
