import { pageMetadata } from "@/lib/seo/metadata";
import { ArticleInsight, Citation } from "@/components/research/ResearchArticle";
import { AnswerArticle, ArticleBridge } from "@/components/research/AnswerArticle";
import { ResearchLink } from "@/components/research/ResearchLink";
import { RecruiterSearchDiagram } from "@/components/research/diagrams/RecruiterSearchDiagram";

const PATH = "/research/linkedin-visibility";

export const metadata = pageMetadata({
    path: PATH,
    title: "Why can’t recruiters find me on LinkedIn?",
    description: "What LinkedIn documents about recruiter search, which profile fields candidates can control, and what the platform does not disclose.",
    type: "article",
});

export default function LinkedInVisibilityPage() {
    return (
        <AnswerArticle
            path={PATH}
            answer={
                <>
                    They search titles, skills and the words in your profile. LinkedIn&rsquo;s Skills filter uses the skills you list and those in your headline, titles and experience.
                    It doesn&rsquo;t publish how it ranks the results.
                </>
            }
            answerSource={{
                text: <>From LinkedIn&rsquo;s own Recruiter help pages, which describe its product rather than hiring outcomes.</>,
                href: "https://www.linkedin.com/help/recruiter/answer/a596630",
                linkLabel: "Read LinkedIn’s page",
            }}
            nextQuestions={["how-recruiters-read", "ats-myths", "social-screening"]}
            visualization={
                <>
                    <h2 className="research-h2">What affects LinkedIn visibility</h2>
                    <p className="research-body mb-6">
                        LinkedIn Recruiter&apos;s filters include job title, skills, company, location, seniority, and years of experience.
                        <Citation id="source-1">1</Citation>
                        <Citation id="source-2">2</Citation>
                    </p>
                </>
            }
            sources={[
                {
                    id: "source-1",
                    title: "Skills filter in Recruiter and Recruiter Lite",
                    publisher: "LinkedIn Recruiter Help (last updated about 2024; checked November 2026)",
                    year: "2024",
                    href: "https://www.linkedin.com/help/recruiter/answer/a596630"
                },
                {
                    id: "source-2",
                    title: "Recruiter and Recruiter Lite search filters and definitions",
                    publisher: "LinkedIn Recruiter Help (checked November 2026)",
                    year: "2026",
                    href: "https://www.linkedin.com/help/recruiter/answer/a408731"
                }
            ]}
        >
            <h2 className="research-h2">Where skill evidence can come from</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                <ArticleInsight
                    title="Skills you list"
                    desc={
                        <>
                            Standardized skills in the Skills section, sometimes connected to experience, education, or endorsements.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Skills in your profile text"
                    desc={
                        <>
                            Skill terms in your headline, summary, titles, experience descriptions, certificates, and courses.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Skills inferred from experience"
                    desc={
                        <>
                            LinkedIn says it may infer related skills from direct experience. For example, it may treat Tableau experience as evidence of data visualization.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
                <ArticleInsight
                    title="Resume skills, when shared"
                    desc={
                        <>
                            For members who share resume details for discoverability, Recruiter can surface skills found in that resume.
                            <Citation id="source-1">1</Citation>
                        </>
                    }
                />
            </div>

            <h2 className="research-h2">What a useful headline looks like</h2>
            <div className="grid md:grid-cols-2 gap-8 not-prose mt-6">
                <div className="space-y-3">
                    <div className="text-sm font-semibold text-[hsl(var(--pen))]">Easy to search for</div>
                    <ul className="divide-y divide-line border-t border-line text-base text-foreground">
                        <li className="py-2.5">Senior product manager · B2B SaaS · onboarding and retention</li>
                        <li className="py-2.5">Data scientist · forecasting · Python and SQL · healthcare</li>
                        <li className="py-2.5">Engineering manager · platform teams · fintech infrastructure</li>
                    </ul>
                </div>
                <div className="space-y-3">
                    <div className="text-sm font-semibold text-muted-foreground">Hard to search for</div>
                    <ul className="divide-y divide-line border-t border-line text-base text-muted-foreground">
                        <li className="py-2.5">Product leader building great products</li>
                        <li className="py-2.5">Passionate problem-solver seeking new opportunities</li>
                        <li className="py-2.5">Looking for my next challenge in tech</li>
                    </ul>
                </div>
            </div>

            <div className="not-prose my-10">
                <RecruiterSearchDiagram figureNumber={1} />
            </div>

            <h2 className="research-h2">What LinkedIn does not tell us</h2>
            <p className="research-body mb-4">
                The documentation explains usable inputs. It does not reveal a universal recipe for ranking first.
            </p>
            <ul className="space-y-2 text-muted-foreground text-sm mb-6">
                <li className="flex gap-2">
                    <span className="text-muted-foreground/50">•</span>
                    LinkedIn does not publicly disclose exact ranking weights or its complete search-scoring logic.
                </li>
                <li className="flex gap-2">
                    <span className="text-muted-foreground/50">•</span>
                    Recruiters choose different filters and search strategies across roles, industries, and markets.
                </li>
                <li className="flex gap-2">
                    <span className="text-muted-foreground/50">•</span>
                    A discoverable profile can earn consideration. It cannot guarantee ranking, outreach, or an interview.
                </li>
                <li className="flex gap-2">
                    <span className="text-muted-foreground/50">•</span>
                    <span>What you post is read too. <ResearchLink to="social-screening">In one experiment, unappealing posts cut candidate ratings by almost two points, and having no profile at all cost more than posts suggesting mental-health problems</ResearchLink>.</span>
                </li>
            </ul>

            <h2 className="research-h2">The practical rule</h2>
            <p className="research-body mb-6">
                Check your title and Skills section, then explain where you used those skills in your experience descriptions. Use the terms that fit your actual work. Repeating a keyword everywhere does not explain what you know how to do.
                <Citation id="source-1">1</Citation>
                <Citation id="source-2">2</Citation>
            </p>
            <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-muted-foreground">
                <li><strong>Name the role plainly.</strong> Use the title a recruiter would reasonably search for. If your official title is unusual, add a truthful, recognizable description beside it. The same plain title helps on the resume, where <ResearchLink to="who-you-are">a recruiter is trying to say who you are in one line</ResearchLink>.</li>
                <li><strong>Put skills in context.</strong> List the important skills, then connect them to the work in your headline, About section, or experience descriptions where they naturally belong. <ResearchLink to="skills-first-promise-reality">A listed skill is a claim; the project behind it is what lets a reader assess it</ResearchLink>.</li>
                <li><strong>Explain where you used the skill.</strong> A search term can help someone find your profile. A relevant project or responsibility helps them evaluate your experience.</li>
            </ul>

            <ArticleBridge question="Does your resume name the role plainly?">
                Your report reads your resume, not your LinkedIn profile. It cards each line a recruiter trips on, in the order they hit it, and asks for what&apos;s missing instead of inventing it. Fix the resume, then carry the same plain language over to your profile.
            </ArticleBridge>
        </AnswerArticle>
    );
}
